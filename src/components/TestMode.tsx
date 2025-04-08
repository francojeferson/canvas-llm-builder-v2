import { useState } from "react";
import { useAgentStore } from "@/store/agentStore";

export default function TestMode() {
  const {
    globalPrompt,
    nodes,
    edges,
    currentTestState,
    conversation,
    addMessage,
    startTest,
    resetTest,
    transitionState,
  } = useAgentStore();

  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTest = () => {
    startTest();
  };

  const handleResetTest = () => {
    resetTest();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !currentTestState) return;

    // Add user message
    addMessage("user", userInput);
    setUserInput("");
    setIsLoading(true);

    try {
      // Get current state data
      const currentNode = nodes.find((node) => node.id === currentTestState);
      if (!currentNode) throw new Error("Current state not found");

      // Prepare the API call
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalPrompt,
          statePrompt: currentNode.data.prompt,
          conversation: [...conversation, { role: "user", content: userInput }],
          currentState: currentNode.data.label,
          possibleTransitions: edges
            .filter((edge) => edge.source === currentTestState)
            .map((edge) => ({
              targetId: edge.target,
              targetName: nodes.find((n) => n.id === edge.target)?.data.label,
              condition: edge.data?.condition,
            })),
        }),
      });

      const data = await response.json();

      // Add AI response
      addMessage("assistant", data.response);

      // Handle state transition if needed
      if (data.nextState) {
        const targetNode = nodes.find(
          (node) =>
            node.data.label.toLowerCase() === data.nextState.toLowerCase()
        );

        if (targetNode) {
          transitionState(targetNode.id);
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);
      addMessage(
        "assistant",
        "Sorry, there was an error processing your request."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="test-mode">
      <div className="controls">
        <button onClick={handleStartTest} disabled={currentTestState !== null}>
          Start Test
        </button>
        <button onClick={handleResetTest} disabled={currentTestState === null}>
          Reset Test
        </button>
      </div>

      {currentTestState && (
        <div className="current-state">
          Current State:{" "}
          {nodes.find((n) => n.id === currentTestState)?.data.label}
        </div>
      )}

      <div className="conversation">
        {conversation.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <strong>{msg.role === "user" ? "You" : "Agent"}:</strong>{" "}
            {msg.content}
          </div>
        ))}

        {isLoading && <div className="loading">Agent is thinking...</div>}
      </div>

      {currentTestState && (
        <form onSubmit={handleSubmit}>
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !userInput.trim()}>
            Send
          </button>
        </form>
      )}
    </div>
  );
}
