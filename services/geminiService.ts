import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

export const breakDownTask = async (goal: string): Promise<Array<{ title: string; description: string; priority: Priority; estimatedMinutes: number }>> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Break down the following goal/task into smaller, actionable subtasks. Goal: "${goal}". 
      Return a logical sequence of steps. Estimate time in minutes for each.
      Assign a priority based on importance.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Actionable title of the subtask" },
              description: { type: Type.STRING, description: "Brief details about the task" },
              priority: { type: Type.STRING, enum: ["Low", "Medium", "High", "Urgent"] },
              estimatedMinutes: { type: Type.INTEGER, description: "Estimated duration in minutes" }
            },
            required: ["title", "priority", "estimatedMinutes"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error breaking down task:", error);
    throw error;
  }
};

export const suggestPrioritization = async (tasks: string[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: `I have this list of tasks: ${JSON.stringify(tasks)}. 
            Please provide a short, encouraging summary of how I should tackle this day efficiently. 
            Keep it under 50 words.`
        });
        return response.text || "Focus on your high priority tasks first!";
    } catch (e) {
        return "Plan your day by tackling the hardest task first.";
    }
}