import { NextResponse } from "next/server";
import { db } from "@/db";
import { agents, states, edges } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Get agent
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get states
    const statesData = await db
      .select()
      .from(states)
      .where(eq(states.agentId, id));

    // Get edges
    const edgesData = await db
      .select()
      .from(edges)
      .where(eq(edges.agentId, id));

    // Convert to ReactFlow format
    const nodes = statesData.map((state) => ({
      id: state.id.toString(),
      type: "state",
      position: state.position as { x: number; y: number },
      data: {
        label: state.name,
        prompt: state.prompt,
        isStart: state.isStart,
        isEnd: state.isEnd,
      },
    }));

    const flowEdges = edgesData.map((edge) => ({
      id: `e${edge.sourceId}-${edge.targetId}`,
      source: edge.sourceId.toString(),
      target: edge.targetId.toString(),
      type: "custom",
      data: {
        condition: edge.condition,
      },
    }));

    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      globalPrompt: agent.globalPrompt,
      nodes,
      edges: flowEdges,
    });
  } catch (error) {
    console.error("Error fetching agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Delete edges first (foreign key constraint)
    await db.delete(edges).where(eq(edges.agentId, id));

    // Delete states
    await db.delete(states).where(eq(states.agentId, id));

    // Delete agent
    await db.delete(agents).where(eq(agents.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}
