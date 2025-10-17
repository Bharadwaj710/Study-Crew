import Progress from "../models/progress.model.js";

export async function addProgress(req, res) {
  console.log("addProgress", req.body);
  res.json({ message: "add progress placeholder" });
}

export async function getProgress(req, res) {
  console.log("getProgress for user", req.params.userId);
  res.json({ message: "get progress placeholder" });
}
