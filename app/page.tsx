"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import ChatContainer from "@/components/ChatContainer";
import InputField from "@/components/InputField";
// import { supabase } from "@/lib/supabase";
// import { getConversations } from "../lib/conversations";
import { createClient } from "@/utils/supabase/client";
import { createConversation, EditMessage, getAllMessagesForConversation, getConversationById, getConversations, getFirstId, sendAnswer, sendQuestion } from "@/lib/conversations";
import { generateAiResponse } from "@/ai";
import { findLeftmostChild, transformToIdTree } from "@/lib/helper";

interface Conversation {
  id: number;
  title: string;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 1, title: "Conversation 1" },
  ]);
  const [activeConversation, setActiveConversation] = useState<number>(1);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>("");
  const [lastMessageId, setLastMessageId] = useState<string>("");

  const handleSend = async () => {
    if (input.trim()) {
      console.log("activeConversation", activeConversation);
      
      // Send the user's question
      const res = await sendQuestion(localStorage.getItem("userid"), activeConversation, input, lastMessageId);
      setInput("");
  
      // Fetch updated messages after sending the question
      const messages = await getAllMessagesForConversation(activeConversation);
      setMessages(messages);
  
      // Find the leftmost child and update lastMessageId
      const resp1: any = findLeftmostChild(transformToIdTree(messages)[0], lastMessageId);
      const newLastMessageId = resp1.id; // Store the new ID in a variable
      setLastMessageId(newLastMessageId); // Schedule the state update
  
      // Generate AI response
      const answer = await generateAiResponse(input);
      console.log("answer", answer);
  
      // Send the AI's answer using the newLastMessageId
      const res1 = await sendAnswer(localStorage.getItem("userid"), activeConversation, answer, newLastMessageId);
      console.log("answer send successfully", res1);
  
      // Fetch updated messages after sending the answer
      const messages1 = await getAllMessagesForConversation(activeConversation);
  
      // Find the leftmost child again and update lastMessageId
      const resp = findLeftmostChild(transformToIdTree(messages1)[0], newLastMessageId);
      console.log("The Left most child", resp);
      setLastMessageId(resp.id); // Schedule the state update
  
      console.log("The message tree", transformToIdTree(messages1));
      setMessages(messages1);
    }
  };

  const handleNewConversation = async () => {
    try{
      const conversationId = Math.floor(Math.random() * 1000000); // Generates a number between 0 and 999999
      console.log(conversationId);
      
      const data:any = await createConversation(localStorage.getItem("userid"));
  
      const newConversation = data[0];
  
      setConversations([
        ...conversations,
        { id: newConversation.id, title: `Conversation ${newConversation.id}` },
      ]);
      setActiveConversation(newConversation.id);

      const messages = await getAllMessagesForConversation(newConversation.id)
      console.log("messages : ",messages)
      // setMessages([{ sender: "bot", text: "Hello! This is a new conversation." }]);
      setMessages(messages)
      console.log("last message id",messages[messages.length-1].message_id)
      setLastMessageId(messages[messages.length-1].message_id)

  
      // console.log("New conversation created:", newConversation);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    console.log(conversations)
  };

  const selectConversation = async (conversation_id:any) => {
    setActiveConversation(conversation_id)
    console.log("conversation_id",conversation_id)
    const firstMessageId:any = await getFirstId(conversation_id)
    console.log("first message id",firstMessageId[0].first_id)
    const messages= await getAllMessagesForConversation(conversation_id)


    console.log("messages tree",messages)
    const resp = findLeftmostChild(transformToIdTree(messages)[0],firstMessageId[0].first_id)
    console.log("first message id",firstMessageId[0].first_id)
    console.log("last message id to this first message",resp)
    setLastMessageId(resp.id)
    console.log("messages : ",messages)
    setMessages(messages)
  }
   
  const getConversation = async () => {
    const userid = localStorage.getItem("userid")
    console.log("userid")
    const conversations:any = await getConversations(userid)    
    setConversations(conversations?.data)
  }

  const onUpdateMessage = async (messageId: string, newContent: string) => {
    const userid = localStorage.getItem("userid")
    const res = await EditMessage(activeConversation,messageId,newContent,userid);
    console.log("Message updated successfully", res);
    const messages:any = await getAllMessagesForConversation(activeConversation);
    console.log("messages",messages)
    setMessages(messages);
  };

  useEffect(()=>{
    getConversation()
    selectConversation(activeConversation)
  },[activeConversation])
  
  return (
    <main className="flex min-h-screen bg-gray-100">
     <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
        handleNewConversation={handleNewConversation}
      />
      <div className="flex flex-col h-screen w-full flex-grow">
        <ChatHeader />
        <ChatContainer messagesTree={messages} onUpdateMessage={onUpdateMessage} />
        <InputField input={input} setInput={setInput} handleSend={handleSend} />
      </div>
    </main>
  );
}
