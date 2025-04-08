"use client";

import { useState } from "react";
import Canvas from "@/components/Canvas";
import TestMode from "@/components/TestMode";
import { useAgentStore } from "@/store/agentStore";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"builder" | "test">("builder");
  const { name, globalPrompt, setName, setGlobalPrompt, saveAgent } =
    useAgentStore();

  return (
    <main className="container">
      <h1>Canvas LLM Builder</h1>

      <div className="agent-config">
        <div>
          <label htmlFor="agent-name">Agent Name:</label>
          <input
            id="agent-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter agent name"
          />
        </div>

        <div>
          <label htmlFor="global-prompt">Global Prompt:</label>
          <textarea
            id="global-prompt"
            value={globalPrompt}
            onChange={(e) => setGlobalPrompt(e.target.value)}
            placeholder="Enter global instructions for the agent"
            rows={4}
          />
        </div>

        <button onClick={() => saveAgent()}>Save Agent</button>
      </div>

      <div className="tabs">
        <button
          className={activeTab === "builder" ? "active" : ""}
          onClick={() => setActiveTab("builder")}
        >
          Builder
        </button>
        <button
          className={activeTab === "test" ? "active" : ""}
          onClick={() => setActiveTab("test")}
        >
          Test Mode
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "builder" ? <Canvas /> : <TestMode />}
      </div>
    </main>
  );
}
