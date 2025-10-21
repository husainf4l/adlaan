#!/usr/bin/env python3
"""Simple test server to verify PDF download functionality."""

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import os

app = FastAPI()

# Mount templates directory
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def home():
    """Serve the local development interface."""
    return FileResponse("templates/local_dev_interface.html")

@app.get("/local")
async def local_interface():
    """Serve the local development interface."""
    return FileResponse("templates/local_dev_interface.html")

if __name__ == "__main__":
    import uvicorn
    print("Starting test server for PDF functionality...")
    print("Open http://localhost:8006/local to test the PDF download feature")
    uvicorn.run(app, host="0.0.0.0", port=8006)