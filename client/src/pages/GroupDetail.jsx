import React from "react";
import ChatBox from "../components/ChatBox";

export default function GroupDetail() {
  return (
    <div>
      <h2 className="text-xl font-bold">Group Detail</h2>
      <div className="mt-4">
        <ChatBox />
      </div>
    </div>
  );
}
