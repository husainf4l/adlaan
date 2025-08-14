# Adlaan Contract Agent

A streaming LangGraph-based contract analysis agent built with FastAPI and Google Generative AI.

## Features

- **🔄 Real-time Streaming**: Progressive contract analysis with live updates
- **📋 Contract Analysis**: Structure analysis, metadata extraction, compliance checking
- **🧩 Modular Architecture**: Clean separation of tools, nodes, and core components
- **⚡ Latest LangGraph**: Built with LangGraph 0.6.5 (August 2025)
- **🔧 Best Practices**: Follows LangGraph recommended patterns and structure

## Architecture

```
agent/
├── core/           # Core infrastructure
│   ├── config.py   # Configuration management
│   ├── llm.py      # LLM initialization
│   └── state.py    # State management
├── tools/          # External tools & integrations
│   ├── contract_analysis.py  # Analysis tools
│   ├── database.py           # Database tools
│   └── registry.py           # Tool registry
├── nodes/          # Workflow nodes
│   ├── streaming.py          # Streaming nodes
│   └── registry.py           # Node registry
└── graph.py        # Main workflow definition
```

## Quick Start

1. **Environment Setup**:

```bash
# Create and activate virtual environment
./scripts/setup_env.sh
source .venv/bin/activate
```

2. **Configure Environment**:
   Create `.env` file with your Google API key:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

3. **Start the Server**:

```bash
# Using VS Code task
Run Task → "Run Adlaan FastAPI"

# Or manually
./scripts/run_dev.sh
```

4. **Test Streaming Endpoint**:

```bash
# Get endpoint info
curl http://localhost:8000/api/agent/contract/streem

# Stream contract analysis
curl -X POST http://localhost:8000/api/agent/contract/streem \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Please analyze this contract",
    "contract_text": "Sample contract text here..."
  }'
```

## API Endpoints

### GET `/api/agent/contract/streem`

Returns streaming agent metadata and capabilities.

### POST `/api/agent/contract/streem`

Streams real-time contract analysis updates.

**Request Body**:

```json
{
  "message": "Please analyze this contract",
  "contract_text": "Contract content...",
  "session_id": "optional-session-id"
}
```

**Response**: Server-Sent Events (SSE) stream with JSON chunks:

```json
{
  "type": "stream_chunk",
  "node": "stream_analysis",
  "chunk_id": 1,
  "content": "📄 Analyzing contract structure...",
  "is_final": false,
  "processing_status": "processing"
}
```

## Development

### Project Structure

- `main.py` - FastAPI application with streaming endpoints
- `agent/` - LangGraph agent implementation
- `scripts/` - Development and deployment scripts
- `test_setup.py` - Environment validation script

### Available Tools

- **analyze_contract_structure**: Examines contract organization
- **extract_contract_metadata**: Finds parties, dates, amounts
- **validate_contract_compliance**: Checks regulatory compliance
- **search_contract_database**: Finds similar contracts
- **get_contract_templates**: Retrieves contract templates

### Configuration

All configuration is managed through `agent/core/config.py` and environment variables:

- `GOOGLE_API_KEY` - Required Google AI API key
- `AGENT_MODEL_NAME` - Model name (default: gemini-1.5-flash)
- `AGENT_TEMPERATURE` - Model temperature (default: 0.1)
- `AGENT_STREAMING` - Enable streaming (default: true)

## Testing

```bash
# Test environment setup
python test_setup.py

# Run example usage
python example_usage.py
```

## Dependencies

- **FastAPI** - Web framework
- **LangGraph 0.6.5** - Workflow orchestration
- **LangChain Google GenAI** - Google AI integration
- **Uvicorn** - ASGI server

See `requirements.txt` for complete dependency list.

## License

MIT License
