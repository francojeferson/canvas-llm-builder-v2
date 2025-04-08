import { memo } from "react";
import { EdgeProps, getBezierPath } from "reactflow";
import { useAgentStore } from "@/store/agentStore";

function EdgeOptions({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const { updateEdge } = useAgentStore();

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEdge(id, { condition: e.target.value });
  };

  return (
    <>
      <path id={id} className="react-flow__edge-path" d={edgePath} />
      <foreignObject
        width={150}
        height={40}
        x={(sourceX + targetX) / 2 - 75}
        y={(sourceY + targetY) / 2 - 20}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <input
          value={data?.condition || ""}
          onChange={handleChange}
          placeholder="Transition condition"
          className="nodrag nopan"
          style={{
            width: "100%",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "4px",
          }}
        />
      </foreignObject>
    </>
  );
}

export default memo(EdgeOptions);
