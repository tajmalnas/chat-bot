"use server"
import { createClient } from "@/utils/supabase/server"
import { use } from "react";


export const createConversation = async (userid:any) => {
  const conversationId = Math.floor(Math.random() * 1000000);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversation")
    .insert([
      {
        id:conversationId,
        user_id: userid, // Attach the user ID
        first_question_id: 1, // Set dynamically if needed
      },
    ])
    .select();

    if(data){
      // console.log("Conversations:",data)
      const firstMessage:any = await sendFirsMessage(userid,data[0].id)
      // console.log("First message:",firstMessage.data)
      // console.log("First message ID:",firstMessage.data[0].message_id)
      const response = await updateLastQuestionId(firstMessage?.data[0].message_id,data[0]?.id);
      // console.log("Last question updated:",response.data)

      const res = await supabase.
      from('conversation')
      .update({first_id:firstMessage?.data[0].message_id})
      .eq('id', data[0].id)
      .select();
      // console.log("First question updated:",res)
    }
    return data;
}


export const getConversations = async (userid:any) =>{
    const supabase = createClient()    
    let res = await supabase
    .from('conversation')
    .select("*")
    .eq('user_id', userid)

    // console.log("User ID:",userid)

    return res;
}

export const getConversationById = async (conversation_id:any) => {
    const supabase = createClient()    
    let res = await supabase
    .from('messages')
    .select("*")
    .eq('conversation_id', conversation_id);
    // console.log("Conversation ID:",res)
    return res;
}

export const getAllMessagesForConversation = async (conversation_id:any) => {
  const supabase = createClient();

  // Step 1: Get the first message ID for the conversation
  const { data: conversationData, error: convError } = await supabase
    .from('conversation')
    .select('first_id')
    .eq('id', conversation_id)
    .single();

  if (convError) {
    // console.error('Error fetching conversation:', convError);
    return [];
  }

  const firstMessageId = conversationData.first_id;

  // Step 2: Get all messages for the conversation
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversation_id);

  if (msgError) {
    console.error('Error fetching messages:', msgError);
    return [];
  }

  // Step 3: Organize messages into a map by message_id
  const messageMap = new Map();

  messages.forEach((message:any) => {
    messageMap.set(message.message_id, { ...message, children: [] });
  });

  // console.log("Message map:", messageMap);

  // Step 4: Build the parent-child relationships
  const rootMessages:any = [];

  messages.forEach((message) => {
    if (message.message_parent_id) {
      // If this message has a parent, add it as a child to the parent
      const parent = messageMap.get(message.message_parent_id);
      if (parent) {
        parent.children.push(messageMap.get(message.message_id));
      } else {
        // console.warn(`Parent message not found for message_id: ${message.message_id}`);
      }
    } else {
      // If no parent, it's a root message
      rootMessages.push(messageMap.get(message.message_id));
    }
  });

  // Step 5: Recursively build the tree structure
  const buildTree = (message:any) => {
    if (message.children.length > 0) {
      message.children = message.children.map((child:any) => buildTree(child));
    }
    return message;
  };

  const tree = rootMessages.map((rootMessage:any) => buildTree(rootMessage));

  // Step 6: Return the tree of messages
  // console.log("Tree of messages:", tree);
  return tree;
};



const sendFirsMessage = async (userid:any,conversation_id:any) => {
    const supabase = createClient()   
    
    let lastQuestionId = await getLastId(conversation_id);
    
    let res:any = await supabase
    .from('messages')
    .insert([
      {  
        role: 'assistant', 
        message_content: 'Hello! How can I assist you today?',  // The question content
        user_id: userid,                   // The user ID
        conversation_id: conversation_id,    // The conversation ID
        message_parent_id: null,
        message_childs_id: [],
      }
    ])
    .select();
    
    const response = await updateChildId(lastQuestionId,res.data[0].message_id);
    // console.log("First message sent:",res.data)
    return res;
}

const updateLastQuestionId =async (message_id:any,conversation_id:any) => {
    const supabase = createClient()    
    let res = await supabase
    .from('conversation')
    .update({last_id:message_id})
    .eq('id', conversation_id)
    .select();

    // console.log("Last question updated:",res)
    return res;
}

const getLastId = async (id:any) => {
    const supabase = createClient()    
    let res:any = await supabase
    .from('conversation')
    .select("*")
    .eq('id', id)
    .select();

    console.log("Last ID:",res.data)
    return res.data[0].last_id;
}

export const sendQuestion = async (userid:any,conversation_id:any,question_content:any,last_message_id:any) => {
    const supabase = createClient() 
    
    // let lastQuestionId = await getLastId(conversation_id);
    // console.log("lastQuestionId",last_message_id)

    const { data, error }:any = await supabase
     .from('messages')
     .insert([
       {  
         role: 'user', 
         message_content: question_content,  // The question content
         user_id: userid,                   // The user ID
         conversation_id: conversation_id,    // The conversation ID
         message_parent_id: last_message_id,
         message_childs_id: [],
       }
     ])
     .select();

    if (error) {
      // console.error("Error sending question:", error);
    } else {
      // console.log("Question sent successfully:", data);
    }
    updateChildId(last_message_id,data[0].message_id);
    updateLastQuestionId(data[0].message_id,conversation_id);
    
    return data;
}

export const sendAnswer = async (userid:any,conversation_id:any,answer_content:any,last_message_id:any) => {
    const supabase = createClient() 
    // let lastQuestionId = await getLastId(conversation_id);
    // console.log("lastQuestionId",last_message_id)

    const { data, error }:any = await supabase
     .from('messages')
     .insert([
       {  
         role: 'assistant', 
         message_content: answer_content,  // The question content
         user_id: userid,                   // The user ID
         conversation_id: conversation_id,    // The conversation ID
         message_parent_id: last_message_id, // The parent message ID
         message_childs_id: [], // The child message IDs
       }
     ])
     .select();

    if (error) {
      // console.error("Error sending answer:", error);
    }
    else {
      // console.log("Answer sent successfully:", data);
    }
    updateChildId(last_message_id,data[0].message_id);
    updateLastQuestionId(data[0]?.message_id,conversation_id);

    return data;
}

const updateChildId = async (message_id:any,child_id:any) => {
  const supabase = createClient();
  const { data: messageData, error: fetchError } = await supabase
  .from('messages')
  .select('message_childs_id')
  .eq('message_id', message_id)
  .single();

  // Check for errors
  if (fetchError) {
    console.error("fetch error",fetchError);
    return;
  }

  console.log("Message data:",messageData)

  // Step 2: Append the new child_id to the current array
  const updatedChildIds = [...messageData.message_childs_id, child_id];

  console.log("Updated child ID:",updatedChildIds)

  // Step 3: Update the record with the new array
  const { data, error } = await supabase
    .from('messages')
    .update({ message_childs_id: updatedChildIds })
    .eq('message_id', message_id)
    .select();

    console.log("Child ID updated:",data)
  // Check for errors
  if (error) {
    console.error("last child not updated",error);
  } else {
    console.log('Message updated successfully');
  }
}

export const createEditMessage = async (message_parent_id:any,new_content:any,userid:any,conversation_id:any) => {
  const supabase = createClient();
  const { data, error } = await supabase
  .from('messages')
  .insert([
    {
      message_content: new_content,
      role: 'user',
      message_parent_id: message_parent_id,
      message_childs_id: [],
      user_id:userid,
      conversation_id:conversation_id
    }
  ])
  .select();

  if(data){
    console.log("updated Message created:",data)
  }
  return data;
}

export const EditMessage = async(conversation_id:any,message_id:any,new_content:any,user_id:any) => {
  console.log("hi buddy how are you")
  console.log("message_id",message_id)
  console.log("new_content",new_content)
  console.log("user_id",user_id)
  console.log("conversation_id",conversation_id)
  const supabase = createClient();  
  const res:any = await supabase
  .from('messages')
  .select("*")
  .eq('message_id', message_id)
  .select();

  console.log("res:",res)
  const data = res.data;

  if(data){
    const parent_id = data[0].message_parent_id;
    console.log("Parent ID:",parent_id)
    const resp:any = await createEditMessage(parent_id,new_content,user_id,conversation_id);
    console.log("Message updated:",resp[0].message_id)
    updateChildId(parent_id,resp[0].message_id);
  }
  return res;
}

export const getFirstId = async (conversation_id:any) => {
  const supabase = createClient()    
  let res:any = await supabase
  .from('conversation')
  .select("*")
  .eq('id', conversation_id)
  .select();

  console.log("First ID:",res.data)
  return res.data;
}

