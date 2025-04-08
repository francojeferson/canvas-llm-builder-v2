import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents, states, edges } from "@/db/schema";
import { eq } from "drizzle-orm";

interface AgentRequest {
  id?: number;
  name: string;
  globalPrompt: string;
  nodes: Array<{
    id: string;
    data: {
      label: string;
      prompt: string;
      isStart: boolean;
      isEnd: boolean;
    };
    position: {
      x: number;
      y: number;
    };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    data?: {
      condition?: string;
    };
  }>;
}

export async function GET(): Promise<NextResponse> {
  try {
    const allAgents = await db.select().from(agents);
    return NextResponse.json(allAgents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const {
      name,
      globalPrompt,
      nodes,
      edges: flowEdges,
    }: AgentRequest = await request.json();

    // Insert agent
    const [agent] = await db
      .insert(agents)
      .values({
        name,
        globalPrompt,
      })
      .returning();

    // Insert states
    const statePromises = nodes.map((node) =>
      db
        .insert(states)
        .values({
          agentId: agent.id,
          name: node.data.label,
          prompt: node.data.prompt,
          position: node.position,
          isStart: !!node.data.isStart,
          isEnd: !!node.data.isEnd,
        })
        .returning()
    );

    const insertedStates = await Promise.all(statePromises);
    const stateMap = new Map<string, number>();

    // Create mapping from node IDs to DB IDs
    nodes.forEach((node, index) => {
      stateMap.set(node.id, insertedStates[index][0].id);
    });

    // Insert edges
    const edgePromises = flowEdges.map((edge) =>
      db.insert(edges).values({
        agentId: agent.id,
        sourceId: stateMap.get(edge.source) as number,
        targetId: stateMap.get(edge.target) as number,
        condition: edge.data?.condition || "",
      })
    );

    await Promise.all(edgePromises);

    return NextResponse.json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const {
      id,
      name,
      globalPrompt,
      nodes,
      edges: flowEdges,
    }: AgentRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    // Update agent
    await db
      .update(agents)
      .set({
        name,
        globalPrompt,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, id));

    // Delete existing states and edges
    await db.delete(edges).where(eq(edges.agentId, id));
    await db.delete(states).where(eq(states.agentId, id));

    // Insert new states
    const statePromises = nodes.map((node) =>
      db
        .insert(states)
        .values({
          agentId: id,
          name: node.data.label,
          prompt: node.data.prompt,
          position: node.position,
          isStart: !!node.data.isStart,
          isEnd: !!node.data.isEnd,
        })
        .returning()
    );

    const insertedStates = await Promise.all(statePromises);
    const stateMap = new Map<string, number>();

    // Create mapping from node IDs to DB IDs
    nodes.forEach((node, index) => {
      stateMap.set(node.id, insertedStates[index][0].id);
    });

    // Insert new edges
    const edgePromises = flowEdges.map((edge) =>
      db.insert(edges).values({
        agentId: id,
        sourceId: stateMap.get(edge.source) as number,
        targetId: stateMap.get(edge.target) as number,
        condition: edge.data?.condition || "",
      })
    );

    await Promise.all(edgePromises);

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}
