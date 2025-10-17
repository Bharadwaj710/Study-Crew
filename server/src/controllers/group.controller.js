import Group from "../models/group.model.js";

export async function createGroup(req, res) {
  console.log("createGroup", req.body);
  res.json({ message: "create group placeholder" });
}

export async function getGroup(req, res) {
  console.log("getGroup", req.params.id);
  res.json({ message: "get group placeholder" });
}
