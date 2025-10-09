"""
Session Management Implementation Guide
=======================================

This document explains the session management system with PostgreSQL + LangGraph checkpointing.

## Overview

The system implements persistent conversation memory using:
- PostgreSQL for data storage
- SQLAlchemy 2.0 for async ORM
- LangGraph checkpointing for state management
- Alembic for database migrations

## Architecture

```
┌─────────────────────────────────────────────┐
│         FastAPI Application                  │
├─────────────────────────────────────────────┤
│  - Chat endpoints with thread_id            │
│  - Conversation CRUD operations             │
│  - Session-aware responses                  │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      LangGraph Agent + Checkpointer         │
├─────────────────────────────────────────────┤
│  - PostgresCheckpointSaver                  │
│  - Automatic state persistence              │
│  - Conversation continuity                  │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│         PostgreSQL Database                  │
├─────────────────────────────────────────────┤
│  Tables:                                    │
│  - users                                    │
│  - conversations (thread_id indexed)        │
│  - messages (conversation history)          │
│  - checkpoints (LangGraph state)            │
│  - documents (generated files)              │
│  - audit_logs (compliance)                  │
└─────────────────────────────────────────────┘
```

## Database Models

### 1. User
- Stores user accounts
- Links to conversations

### 2. Conversation
- Maps to LangGraph thread_id
- Tracks conversation metadata
- Links messages and checkpoints

### 3. Message
- Individual messages in conversations
- Links to checkpoints for state tracking

### 4. Checkpoint
- LangGraph state snapshots
- Enables conversation memory
- Supports branching and replay

### 5. Document
- Generated legal documents
- Version control
- Citation tracking

### 6. AuditLog
- Compliance tracking
- Security auditing

## Setup Instructions

### 1. Install Dependencies

Already included in requirements.txt:
- sqlalchemy==2.0.43
- asyncpg==0.30.0
- alembic==1.16.5
- langgraph==0.6.8

### 2. Configure Database

Update `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adlaanagent
DB_USER=husain
DB_PASSWORD=tt55oo77
```

### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE adlaanagent;

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE adlaanagent TO husain;
```

### 4. Run Migrations

```bash
# Create initial migration
.\.venv\Scripts\python.exe -m alembic revision --autogenerate -m "Initial schema with session management"

# Apply migrations
.\.venv\Scripts\python.exe -m alembic upgrade head
```

### 5. Initialize Database (Alternative)

For development, you can also initialize directly:
```python
from core.database import init_db
import asyncio

asyncio.run(init_db())
```

## Usage Examples

### Basic Conversation with Memory

```python
from agent.agent import Agent

# Create agent with checkpointing enabled
agent = Agent(use_checkpointing=True)

# Start a conversation
thread_id = "user-123-session-456"

# First message
response1 = agent.run(
    "I need to draft an NDA",
    thread_id=thread_id
)

# Second message (has context from first)
response2 = agent.run(
    "Make it for California jurisdiction",
    thread_id=thread_id
)

# Third message (remembers both previous)
response3 = agent.run(
    "Add a 2-year term",
    thread_id=thread_id
)
```

### Get Conversation History

```python
# Retrieve history
history = await agent.aget_history(thread_id, limit=10)
for checkpoint in history:
    print(checkpoint["messages"])
```

### API Integration

```python
from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from models.database import Conversation, Message
from agent.agent import Agent

app = FastAPI()
agent = Agent(use_checkpointing=True)

@app.post("/api/v1/chat")
async def chat(
    message: str,
    thread_id: str,
    db: AsyncSession = Depends(get_db)
):
    # Get or create conversation
    conversation = await db.get(Conversation, thread_id=thread_id)
    if not conversation:
        conversation = Conversation(thread_id=thread_id)
        db.add(conversation)
        await db.flush()
    
    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=message
    )
    db.add(user_msg)
    
    # Get response from agent (automatically uses checkpointing)
    response = agent.run(message, thread_id=thread_id)
    
    # Save assistant messages
    for item in response:
        assistant_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=item["content"],
            message_type=item["type"]
        )
        db.add(assistant_msg)
    
    await db.commit()
    return {"response": response}
```

## Key Features

### 1. Automatic State Persistence
LangGraph automatically saves state after each node execution

### 2. Conversation Continuity
Use the same thread_id to maintain context across requests

### 3. Branching Support
Each checkpoint can have multiple children for exploring alternatives

### 4. Efficient Querying
Indexed queries for fast checkpoint retrieval

### 5. Metadata Tracking
Store jurisdiction, document type, etc. with conversations

## Best Practices

### 1. Thread ID Management
```python
# Generate unique thread IDs per user session
import uuid
thread_id = f"user-{user_id}-{uuid.uuid4()}"
```

### 2. Cleanup Old Checkpoints
```python
# Implement periodic cleanup for old conversations
from datetime import datetime, timedelta
from sqlalchemy import delete

cutoff = datetime.utcnow() - timedelta(days=90)
stmt = delete(Checkpoint).where(Checkpoint.created_at < cutoff)
await session.execute(stmt)
```

### 3. Error Handling
```python
try:
    response = agent.run(message, thread_id=thread_id)
except Exception as e:
    # Fall back to no checkpointing
    agent_no_checkpoint = Agent(use_checkpointing=False)
    response = agent_no_checkpoint.run(message)
```

### 4. Monitoring
```python
# Track checkpoint storage growth
from sqlalchemy import func

checkpoint_count = await session.scalar(
    select(func.count(Checkpoint.id))
)
print(f"Total checkpoints: {checkpoint_count}")
```

## Migration Commands

```bash
# Create new migration
.\.venv\Scripts\python.exe -m alembic revision --autogenerate -m "description"

# Apply migrations
.\.venv\Scripts\python.exe -m alembic upgrade head

# Rollback one migration
.\.venv\Scripts\python.exe -m alembic downgrade -1

# Show current version
.\.venv\Scripts\python.exe -m alembic current

# Show migration history
.\.venv\Scripts\python.exe -m alembic history
```

## Troubleshooting

### Issue: "relation does not exist"
**Solution**: Run migrations
```bash
.\.venv\Scripts\python.exe -m alembic upgrade head
```

### Issue: Checkpoint not persisting
**Solution**: Check DATABASE_URL in .env and database connection

### Issue: Slow queries
**Solution**: Ensure indexes are created (check models/database.py)

### Issue: Out of memory
**Solution**: Implement checkpoint cleanup for old conversations

## Performance Tips

1. **Connection Pooling**: Already configured with pool_size=20
2. **Indexes**: All critical columns are indexed
3. **Batch Operations**: Use bulk inserts for multiple messages
4. **Lazy Loading**: Use selectinload for relationships when needed
5. **Cleanup**: Regularly archive old conversations

## Security Considerations

1. **Password Hashing**: Use bcrypt for user passwords
2. **SQL Injection**: SQLAlchemy ORM prevents this automatically
3. **Access Control**: Implement user-level permissions
4. **Audit Logging**: Use AuditLog model for compliance
5. **Encryption**: Consider encrypting sensitive conversation data

## Next Steps

1. Add authentication endpoints
2. Implement conversation archiving
3. Add full-text search on messages
4. Create admin dashboard for monitoring
5. Set up backup and recovery procedures

## Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [FastAPI + SQLAlchemy](https://fastapi.tiangolo.com/tutorial/sql-databases/)
