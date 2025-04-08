import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatRequest {
  globalPrompt: string;
  statePrompt: string;
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
  currentState: string;
  possibleTransitions: Array<{
    targetId: string;
    targetName: string;
    condition: string | null;
  }>;
}

interface ChatResponse {
  response: string;
  nextState: string | null;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ChatResponse | { error: string }>> {
  try {
    const {
      globalPrompt,
      statePrompt,
      conversation,
      currentState,
      possibleTransitions,
    }: ChatRequest = await request.json();

    // Construct system prompt
    const systemPrompt = `
      ${globalPrompt}
      
      You are currently in the "${currentState}" state.
      
      State-specific instructions: ${statePrompt}
      
      Available state transitions:
      ${possibleTransitions
        .map(
          (t) => `- ${t.targetName}: ${t.condition || "No condition specified"}`
        )
        .join("\n")}
      
      If the user's input matches any of the transition conditions, you should transition to that state.
      To transition, include [TRANSITION:state_name] at the end of your response.
    `;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversation.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ],
    });

    const response = completion.choices[0].message.content || "";

    // Check for transition command
    const transitionMatch = response.match(/\[TRANSITION:(.+?)\]/);
    const nextState = transitionMatch ? transitionMatch[1].trim() : null;

    // Remove transition command from response
    const cleanResponse = response.replace(/\[TRANSITION:.+?\]/, "").trim();

    return NextResponse.json({
      response: cleanResponse,
      nextState,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
