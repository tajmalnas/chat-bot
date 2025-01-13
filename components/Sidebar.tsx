"use client";

import LoginButton from "@/components/LoginLogoutButton";
import UserGreetText from "@/components/UserGreetText";

interface SidebarProps {
  conversations: { id: number; title: string }[];
  activeConversation: number;
  setActiveConversation: (id: number) => void;
  handleNewConversation: () => void;
}

export default function Sidebar({
  conversations,
  activeConversation,
  setActiveConversation,
  handleNewConversation,
}: SidebarProps) {
  return  (
     <aside className="w-1/4 bg-white border-r">
      <div className="p-4 flex flex-col gap-4 border-b">
        <LoginButton />
        <UserGreetText />
      </div>
      <div className="p-4">
        <button
          onClick={handleNewConversation}
          className="w-full px-4 py-2 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + New Conversation
        </button>
        <ul className="space-y-2 h-96 overflow-y-auto">
          {conversations?.length>0 && conversations.map((conv) => (
            <li
              key={conv.id}
              className={`p-2 rounded-lg cursor-pointer ${
                conv.id === activeConversation
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setActiveConversation(conv.id)}
            >
              {conv.id}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
