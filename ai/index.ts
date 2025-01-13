"use server"
import { GoogleGenerativeAI } from "@google/generative-ai";
const api_key = process.env.GEMINI_API_SECRET;

console.log("google api key",api_key);

const genAI = new GoogleGenerativeAI(api_key);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const prompt = "Explain how AI works";

export const generateAiResponse = async (prompt: string) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
}