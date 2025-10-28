import React from "react";
import CommentList from "./components/CommentList";
import { User } from "./types";

const currentUser: User = {
  id: "me_1",
  name: "Will1609",
  avatarColor: "#2563eb",
  isCurrent: true,
};

export default function App() {
  return (
    <div className="app">
      <CommentList currentUser={currentUser} />
    </div>
  );
}