import Task from "../models/task.model.js";
import Group from "../models/group.model.js";
import User from "../models/user.model.js";

// Create task
export const createTask = async (req, res, io) => {
  try {
    const { groupId } = req.params;
    const {
      title,
      description,
      type,
      unit,
      targetValue,
      assigned,
      deadline,
      color,
    } = req.body;

    if (!title || !assigned || assigned.length === 0) {
      return res
        .status(400)
        .json({ message: "Title and assigned members are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Verify user is member
    if (!group.members.some((m) => m.toString() === req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    // Verify all assigned are members
    for (const userId of assigned) {
      if (!group.members.some((m) => m.toString() === userId)) {
        return res
          .status(400)
          .json({ message: "Assigned user is not a member of this group" });
      }
    }

    const task = new Task({
      title,
      description,
      group: groupId,
      creator: req.user.userId,
      type: type || "binary",
      unit: unit || "",
      targetValue: targetValue || 1,
      color: color || undefined,
      assigned: assigned.map((userId) => ({
        user: userId,
        progressValue: 0,
        completed: false,
      })),
      deadline: deadline ? new Date(deadline) : null,
    });

    await task.save();
    await task.populate("creator", "name avatar");
    await task.populate("assigned.user", "name avatar email");

    // Emit socket event
    if (io) {
      io.to(`group:${groupId}`).emit("task:created", task);
    }

    res
      .status(201)
      .json({ success: true, message: "Task created successfully", task });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all tasks for group
export const getTasks = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.some((m) => m.toString() === req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const tasks = await Task.find({ group: groupId })
      .populate("creator", "name avatar")
      .populate("assigned.user", "name avatar email")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single task
export const getTask = async (req, res) => {
  try {
    const { groupId, taskId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.some((m) => m.toString() === req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const task = await Task.findById(taskId)
      .populate("creator", "name avatar")
      .populate("assigned.user", "name avatar email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update progress
export const updateProgress = async (req, res, io) => {
  try {
    const { groupId, taskId } = req.params;
    const { progressValue, completed } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.some((m) => m.toString() === req.user.userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Find assigned user progress
    const assignedEntry = task.assigned.find(
      (a) => a.user.toString() === req.user.userId
    );
    if (!assignedEntry) {
      return res
        .status(403)
        .json({ message: "You are not assigned to this task" });
    }

    // Update progress
    if (task.type === "measurable" && progressValue !== undefined) {
      assignedEntry.progressValue = progressValue;
    } else if (task.type === "binary" && completed !== undefined) {
      assignedEntry.completed = completed;
    }
    assignedEntry.updatedAt = new Date();

    await task.save();
    await task.populate("creator", "name avatar");
    await task.populate("assigned.user", "name avatar email");

    // Emit socket event
    if (io) {
      io.to(`group:${groupId}`).emit("task:progress", {
        taskId,
        userId: req.user.userId,
        progressValue,
        completed,
        task,
      });
    }

    res.json({ message: "Progress updated", task });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update task (admin only)
export const updateTask = async (req, res, io) => {
  try {
    const { groupId, taskId } = req.params;
    const {
      title,
      description,
      type,
      unit,
      targetValue,
      assigned,
      deadline,
      status,
    } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only creator can update
    if (task.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only task creator can edit" });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (type) task.type = type;
    if (unit !== undefined) task.unit = unit;
    if (targetValue) task.targetValue = targetValue;
    if (status) task.status = status;
    if (deadline) task.deadline = new Date(deadline);

    if (assigned && Array.isArray(assigned)) {
      task.assigned = assigned.map((userId) => ({
        user: userId,
        progressValue: 0,
        completed: false,
      }));
    }

    await task.save();
    await task.populate("creator", "name avatar");
    await task.populate("assigned.user", "name avatar email");

    if (io) {
      io.to(`group:${groupId}`).emit("task:updated", task);
    }

    res.json({ message: "Task updated", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete task (admin only)
export const deleteTask = async (req, res, io) => {
  try {
    const { groupId, taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only creator can delete
    if (task.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only task creator can delete" });
    }

    await Task.findByIdAndDelete(taskId);

    if (io) {
      io.to(`group:${groupId}`).emit("task:deleted", { taskId });
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
