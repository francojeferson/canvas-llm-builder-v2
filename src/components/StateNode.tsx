import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { useAgentStore } from "@/store/agentStore";

function StateNode({ id, data }: NodeProps) {
  const { updateNode, currentTestState } = useAgentStore();

  const isActive = currentTestState === id;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateNode(id, { [e.target.name]: e.target.value });
  };

  const toggleStartState = () => {
    updateNode(id, { isStart: !data.isStart });
  };

  const toggleEndState = () => {
    updateNode(id, { isEnd: !data.isEnd });
  };

  return (
    <div
      className={`state-node ${isActive ? "active" : ""}`}
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "5px",
        background: data.isStart
          ? "#e6f7ff"
          : data.isEnd
          ? "#fff1f0"
          : isActive
          ? "#f6ffed"
          : "white",
        boxShadow: isActive ? "0 0 10px #52c41a" : "none",
      }}
    >
      <Handle type="target" position={Position.Top} />

      <div>
        <input
          name="label"
          value={data.label || ""}
          onChange={handleChange}
          placeholder="State Name"
          className="nodrag"
        />
      </div>

      <div>
        <textarea
          name="prompt"
          value={data.prompt || ""}
          onChange={handleChange}
          placeholder="State-specific prompt"
          className="nodrag"
          rows={3}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={data.isStart || false}
            onChange={toggleStartState}
            className="nodrag"
          />
          Start State
        </label>

        <label>
          <input
            type="checkbox"
            checked={data.isEnd || false}
            onChange={toggleEndState}
            className="nodrag"
          />
          End State
        </label>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(StateNode);
