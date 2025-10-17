import React from "react";
import GroupCard from "../components/GroupCard";

export default function Dashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold">Dashboard</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <GroupCard />
        <GroupCard />
      </div>
    </div>
  );
}
