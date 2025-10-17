import Message from "../models/message.model.js";

export async function postMessage(req, res) {
  console.log("postMessage", req.body);
  res.json({ message: "post message placeholder" });
}

export async function getMessages(req, res) {
  console.log("getMessages for group", req.params.groupId);
  res.json({ message: "get messages placeholder" });
}
