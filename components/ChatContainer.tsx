"use client";

import React, { useState } from "react";

// Helper function to parse and format text with **bold** syntax
const parseMessageContent = (text: string) => {
  if (!text) return null;

  const lines = text.split("\n"); // Split text into lines by newline character
  return lines.map((line, lineIndex) => {
    if (line.trim().startsWith("* ")) {
      // Render lists
      return (
        <li key={`line-${lineIndex}`}>
          {line
            .slice(2) // Remove "* " from the line
            .split(/(\*\*.*?\*\*)/) // Split bold parts
            .map((part, index) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={`list-item-${lineIndex}-${index}`}>
                  {part.slice(2, -2)}
                </strong>
              ) : (
                part
              )
            )}
        </li>
      );
    } else if (line.trim() === "") {
      // Render empty lines as breaks
      return <br key={`line-${lineIndex}`} />;
    } else {
      // Render normal text with bold formatting
      return (
        <p key={`line-${lineIndex}`}>
          {line.split(/(\*\*.*?\*\*)/).map((part, index) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={`bold-${lineIndex}-${index}`}>
                {part.slice(2, -2)}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }
  });
};

// Helper function to recursively render messages
const renderMessages = (
  messages: any[],
  onUpdateMessage: (messageId: string, newContent: string) => void,
  editingMessageId: string | null,
  setEditingMessageId: React.Dispatch<React.SetStateAction<string | null>>,
  editedContent: string,
  setEditedContent: React.Dispatch<React.SetStateAction<string>>,
  messagesLength: number
) => {
  
  return messages.map((msg) => (
    <React.Fragment key={msg.message_id}>
      {/* Render the current message */}
      <div
        className={`flex ${
          msg.role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div className="flex items-center">
          {msg.role === "user" && (
            <button
              onClick={() => {
                setEditingMessageId(msg.message_id);
                setEditedContent(msg.message_content);
              }}
              className="mr-2 text-blue-500"
              title="Edit Message"
            >
              ✎
            </button>
          )}
          {editingMessageId === msg.message_id ? (
            <div className="flex items-center">
              <input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="border rounded px-2 py-1 mr-2"
              />
              <button
                onClick={() => {
                  onUpdateMessage(msg.message_id, editedContent);
                  setEditingMessageId(null);
                }}
                className="text-green-500 font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => setEditingMessageId(null)}
                className="text-red-500 font-semibold ml-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div
              className={`px-4 py-2 max-w-[80%] rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-500 text-white "
                  : "bg-gray-200 text-black"
              }`}
            >
              {/* <p>{msg.message_id}</p> */}
              {parseMessageContent(msg.message_content)}
              {/* <div>
                {messagesLength}
              </div> */}
            </div>
          )}
        </div>
      </div>

      {/* Recursively render children if they exist */}
      {msg.children && msg.children.length > 0 && (
        <div className="pt-4">
          {renderMessages(
            msg.children,
            onUpdateMessage,
            editingMessageId,
            setEditingMessageId,
            editedContent,
            setEditedContent,
            msg.children.length
          )}
        </div>
      )}
    </React.Fragment>
  ));
};

export default function ChatContainer({
  messagesTree,
  onUpdateMessage,
}: any) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");

  return (
    <div className="flex-grow flex flex-col items-center overflow-y-auto p-4">
      <div className="w-[100%] bg-white shadow-md rounded-lg p-4 space-y-4">
        {/* Render the entire messages tree */}
        {messagesTree && messagesTree.length > 0 ? (
          renderMessages(
            messagesTree,
            onUpdateMessage,
            editingMessageId,
            setEditingMessageId,
            editedContent,
            setEditedContent,
            messagesTree.length
          )
        ) : (
          <p>No messages found.</p>
        )}
      </div>
    </div>
  );
}
