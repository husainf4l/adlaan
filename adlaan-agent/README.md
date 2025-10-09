# Adlaan Legal Agent

**Version: v1.0-alpha**

AI-powered legal document creation and consultation system built with FastAPI and LangGraph.

## Features

- 🤖 **Legal AI Agent**: Intelligent legal assistant powered by LangGraph and OpenAI GPT-4
- 📄 **Document Generation**: Create legal documents, contracts, and agreements
- 💬 **Real-time Chat**: Streaming conversation interface with modern UI
- 🗄️ **Database Integration**: PostgreSQL with async support for data persistence
- 🎨 **Modern UI**: Beautiful web interface with real-time updates and responsive design
- 🔧 **Modular Architecture**: Well-organized code structure with nodes and tools
- ⚡ **Latest Dependencies**: All packages updated to latest versions (October 2025)

## Tech Stack

- **Backend**: FastAPI 0.118.2, Uvicorn 0.37.0
- **AI/ML**: LangGraph 0.6.8, LangChain 0.3.27, OpenAI GPT-4
- **Database**: PostgreSQL, SQLAlchemy 2.0.43, AsyncPG 0.30.0
- **Frontend**: HTML5, Tailwind CSS, HTMX, JavaScript

## Project Structure

```
adlaan-agent/
├── .venv/                    # Virtual environment
├── agent/                    # AI Agent components
│   ├── __init__.py
│   ├── agent.py              # Main legal agent
│   ├── nodes/                # Agent processing nodes
│   │   ├── __init__.py
│   │   └── legal_agent.py    # Legal processing node
│   └── tools/                # Legal tools and utilities
│       ├── __init__.py
│       └── legal_tools.py    # Legal analysis tools
├── core/                     # Core application components
│   ├── __init__.py
│   └── database.py           # Database configuration
├── models/                   # Database models
│   ├── __init__.py
│   └── database.py           # SQLAlchemy models
├── app/                      # FastAPI application structure
├── main.py                   # Main FastAPI application
├── templates/                # Jinja2 templates
│   └── debug.html            # Web interface
├── static/                   # Static files (CSS, JS)
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables
└── .env.example             # Environment template
```

## Setup

1. **Virtual Environment** (already created):
   ```bash
   .\.venv\Scripts\Activate.ps1  # Windows PowerShell
   ```

2. **Install Dependencies** (already installed):
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment Variables**:
   - Your `.env` file already contains your OpenAI API key
   - The agents will use this automatically

## Usage

### 1. Test the Agents Directly

Run the test suite to see both agents in action:
```bash
python agent/test_agents.py
```

### 2. Run FastAPI with Agent Integration

Start the API server with agent endpoints:
```bash
python agent/api_integration.py
```

Or use the VS Code task: "Run FastAPI App"

### 3. Use the Simple FastAPI App

Run the basic FastAPI app:
```bash
python main.py
```

## API Endpoints

When running `agent/api_integration.py`:

- **GET /**: Welcome message
- **GET /health**: Health check
- **GET /agents**: List available agents
- **POST /chat**: Chat with agents
  ```json
  {
    "message": "Hello!",
    "agent_type": "simple"  // or "advanced"
  }
  ```

## Agents

### Legal Agent (`agent.py`)
- AI-powered legal document creation and consultation
- LangGraph workflow with structured response handling
- Supports both message and document generation
- PostgreSQL database integration

### Advanced Agent (`advanced_agent.py`)
- Enhanced with tools and conditional routing
- Weather tool (mock implementation)
- Calculator tool
- More complex graph with tool nodes

## Development

- **Auto-reload**: Both FastAPI apps support auto-reload
- **VS Code Tasks**: Use Ctrl+Shift+P → "Tasks: Run Task"
- **Interactive Docs**: Visit http://localhost:8005/docs when running the API

## Next Steps

1. Replace the mock weather tool with a real API
2. Add more sophisticated tools
3. Implement memory/persistence
4. Add authentication to the API
5. Deploy to production

Enjoy building with LangGraph! 🚀