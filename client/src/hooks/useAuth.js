import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Simple hook to consume AuthContext
export default function useAuth() {
  return useContext(AuthContext);
}
