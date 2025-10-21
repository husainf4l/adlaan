#!/usr/bin/env python3
"""
Mock backend service to handle GraphQL requests for agent testing.
This simulates the Nest.js backend that the agents expect to connect to.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

app = FastAPI(title="Mock Backend Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8005", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store tasks in memory
tasks_db = {}

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Mock Backend Service", "status": "running"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "mock-backend"}

@app.post("/graphql")
async def graphql_handler(request: Request):
    """Handle GraphQL requests."""
    try:
        body = await request.json()
        query = body.get("query", "")
        variables = body.get("variables", {})
        
        print(f"📨 GraphQL Request: {query[:100]}...")
        print(f"📋 Variables: {variables}")
        
        # Handle different GraphQL operations
        if "__typename" in query:
            # Health check query
            return JSONResponse({"data": {"__typename": "Query"}})
        
        elif "createAgentTask" in query:
            # Create agent task mutation
            task_input = variables.get("input", {})
            task_id = len(tasks_db) + 1
            
            current_time = datetime.utcnow().isoformat() + "Z"
            
            task = {
                "id": task_id,
                "type": task_input.get("type", "legal_document_generator"),
                "status": "pending",
                "input": task_input.get("input", "{}"),
                "caseId": task_input.get("caseId"),
                "createdBy": task_input.get("createdBy", 1),
                "metadata": task_input.get("metadata", {}),
                "createdAt": current_time,
                "updatedAt": current_time,
                "completedAt": None
            }
            
            tasks_db[task_id] = task
            
            print(f"✅ Created task {task_id} for agent {task['type']}")
            
            return JSONResponse({
                "data": {
                    "createAgentTask": task
                }
            })
        
        elif "updateAgentTask" in query:
            # Update agent task mutation
            task_id = variables.get("id")
            update_data = variables.get("input", {})
            
            if task_id in tasks_db:
                task = tasks_db[task_id]
                task.update(update_data)
                task["updatedAt"] = datetime.utcnow().isoformat() + "Z"
                
                if update_data.get("status") == "completed":
                    task["completedAt"] = datetime.utcnow().isoformat() + "Z"
                
                print(f"✅ Updated task {task_id}: {update_data}")
                
                return JSONResponse({
                    "data": {
                        "updateAgentTask": task
                    }
                })
            else:
                return JSONResponse({
                    "errors": [{"message": f"Task {task_id} not found"}]
                })
        
        elif "getAgentTask" in query or "agentTask" in query:
            # Get agent task query
            task_id = variables.get("id")
            
            if task_id in tasks_db:
                print(f"📋 Retrieved task {task_id}")
                return JSONResponse({
                    "data": {
                        "agentTask": tasks_db[task_id]
                    }
                })
            else:
                print(f"❌ Task {task_id} not found")
                return JSONResponse({
                    "data": {
                        "agentTask": None
                    }
                })
        
        else:
            # Default response for unknown queries
            print(f"⚠️ Unknown GraphQL query: {query}")
            return JSONResponse({
                "data": {},
                "errors": [{"message": "Unknown query"}]
            })
    
    except Exception as e:
        print(f"❌ GraphQL Error: {e}")
        return JSONResponse({
            "errors": [{"message": str(e)}]
        }, status_code=500)

@app.get("/tasks")
async def list_tasks():
    """List all tasks for debugging."""
    return {"tasks": list(tasks_db.values())}

@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    """Get specific task for debugging."""
    return tasks_db.get(task_id, {"error": "Task not found"})

if __name__ == "__main__":
    print("🚀 Starting Mock Backend Service on port 3001")
    print("📡 GraphQL endpoint: http://localhost:3001/graphql")
    print("🏥 Health endpoint: http://localhost:3001/health")
    print("📋 Tasks list: http://localhost:3001/tasks")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=3001,
        log_level="info"
    )