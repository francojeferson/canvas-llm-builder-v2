import { create } from "zustand";
import { Node, Edge } from "reactflow";

interface AgentState {
  id: number | null;
  name: string;
  globalPrompt: string;
  nodes: Node[];
  edges: Edge[];
  currentTestState: string | null;
  conversation: { role: "user" | "assistant"; content: string }[];

  setName: (name: string) => void;
  setGlobalPrompt: (prompt: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (id: string) => void;
  saveAgent: () => Promise<void>;
  loadAgent: (id: number) => Promise<void>;
  startTest: () => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  resetTest: () => void;
  transitionState: (newState: string) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  id: null,
  name: "New Agent",
  globalPrompt: "",
  nodes: [],
  edges: [],
  currentTestState: null,
  conversation: [],

  setName: (name) => set({ name }),
  setGlobalPrompt: (globalPrompt) => set({ globalPrompt }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, edge],
    })),

  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    })),

  saveAgent: async () => {
    const { id, name, globalPrompt, nodes, edges } = get();

    const response = await fetch("/api/agents", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, globalPrompt, nodes, edges }),
    });

    const data = await response.json();
    set({ id: data.id });
  },

  loadAgent: async (id) => {
    const response = await fetch(`/api/agents/${id}`);
    const data = await response.json();

    set({
      id: data.id,
      name: data.name,
      globalPrompt: data.globalPrompt,
      nodes: data.nodes,
      edges: data.edges,
    });
  },

  startTest: () => {
    const startNode = get().nodes.find((node) => node.data.isStart);
    if (startNode) {
      set({
        currentTestState: startNode.id,
        conversation: [],
      });
    }
  },

  addMessage: (role, content) =>
    set((state) => ({
      conversation: [...state.conversation, { role, content }],
    })),

  resetTest: () =>
    set({
      currentTestState: null,
      conversation: [],
    }),

  transitionState: (newState) => set({ currentTestState: newState }),
}));
