# Canvas LLM Builder V2

A drag-and-drop state-based LLM builder where users can visually create AI agents with different conversational states. Design and test stateful AI agents with customizable transitions.

## Features

- **Visual State Builder**: Drag-and-drop interface to create agent states
- **Global & State-Specific Prompts**: Configure comprehensive agent instructions
- **Dynamic Transitions**: Intent-based state transitions between conversation nodes
- **Live Test Mode**: Test your agent directly with real-time state visualization
- **Persistent Storage**: Save/load agent configurations from PostgreSQL

## Technology Stack

- **Frontend**: Next.js with TypeScript
- **Canvas**: ReactFlow for drag-and-drop functionality
- **State Management**: Zustand
- **Database**: PostgreSQL with Drizzle ORM
- **LLM Integration**: OpenAI API (gpt-4o)

## Project Setup

```bash
# Create Next.js app with Typescript
npx create-next-app@latest canvas-llm-builder-v2 --typescript

√ Would you like to use ESLint? ... [No] / Yes
√ Would you like to use Tailwind CSS? ... [No] / Yes
√ Would you like your code inside a `src/` directory? ... No / [Yes]
√ Would you like to use App Router? (recommended) ... No / [Yes]
√ Would you like to use Turbopack for `next dev`? ... [No] / Yes
√ Would you like to customize the import alias (`@/*` by default)? ... [No] / Yes

cd canvas-llm-builder-v2

# Install dependencies
npm install reactflow zustand @vercel/postgres drizzle-orm drizzle-kit openai
npm install -D @types/node typescript
```

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/canvas-llm-builder-v2.git
cd canvas-llm-builder-v2
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env.local file:

```bash
POSTGRES_URL="postgres://username:password@localhost:5432/canvas_llm_v2"
OPENAI_API_KEY="your-openai-api-key"
```

4. Create the database:

```sql
CREATE DATABASE canvas_llm_v2;
```

5. Run database migrations:

```bash
npx drizzle-kit push:pg
```

6. Start the development server:

```bash
npm run dev
```

7. Open http://localhost:3000 in your browser
