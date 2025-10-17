import User from "../models/user.model.js";

export async function register(req, res) {
  console.log("Register called", req.body);
  // placeholder: create user
  res.json({ message: "register placeholder" });
}

export async function login(req, res) {
  console.log("Login called", req.body);
  res.json({ message: "login placeholder" });
}
