import { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { useAgentStore } from "@/store/agentStore";
import StateNode from "./StateNode";
import EdgeOptions from "./EdgeOptions";

const nodeTypes = {
  state: StateNode,
};

const edgeTypes = {
  custom: EdgeOptions,
};

export default function Canvas() {
  const { nodes, edges, setNodes, setEdges, addNode, currentTestState } =
    useAgentStore();

  const [reactNodes, setReactNodes, onNodesChange] = useNodesState(nodes);
  const [reactEdges, setReactEdges, onEdgesChange] = useEdgesState(edges);

  // Sync ReactFlow state with our store
  useEffect(() => {
    setNodes(reactNodes);
  }, [reactNodes, setNodes]);

  useEffect(() => {
    setEdges(reactEdges);
  }, [reactEdges, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        type: "custom",
        data: { condition: "" },
      };
      setReactEdges((eds) => addEdge(newEdge, eds));
    },
    [setReactEdges]
  );

  const handleAddState = () => {
    const newNode: Node = {
      id: `state-${Date.now()}`,
      type: "state",
      position: { x: 250, y: 250 },
      data: {
        label: "New State",
        prompt: "",
        isStart: false,
        isEnd: false,
      },
    };

    addNode(newNode);
  };

  return (
    <div style={{ width: "100%", height: "80vh" }}>
      <button onClick={handleAddState}>Add State</button>
      <ReactFlow
        nodes={reactNodes}
        edges={reactEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
