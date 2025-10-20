"""
Enhanced Agent Service that integrates with the Nest.js backend.
This service handles legal document generation and connects to the GraphQL API.
"""
import asyncio
import json
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

from integration.backend_service import (
    BackendIntegrationService, 
    AgentType, 
    TaskStatus,
    create_legal_document_task,
    update_task_progress
)
from agent.agent import Agent

logger = logging.getLogger(__name__)

class EnhancedAgentService:
    """Enhanced agent service that integrates with the Nest.js backend."""
    
    def __init__(self, agent: Agent = None):
        self.agent = agent or Agent(use_checkpointing=False)
        self.backend_service = BackendIntegrationService()
        self.active_tasks: Dict[int, asyncio.Task] = {}
    
    async def generate_legal_document(
        self,
        document_type: str,
        title: str,
        parameters: Dict[str, Any],
        user_id: int,
        case_id: Optional[int] = None,
        thread_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a legal document and integrate with backend."""
        try:
            # Create task in backend
            async with self.backend_service as service:
                agent_task = await service.create_agent_task(
                    agent_type=AgentType.LEGAL_DOCUMENT_GENERATOR,
                    task_input={
                        'documentType': document_type,
                        'title': title,
                        'parameters': parameters,
                        'caseId': case_id,
                        'threadId': thread_id
                    },
                    user_id=user_id,
                    case_id=case_id,
                    metadata={
                        'documentType': document_type,
                        'title': title,
                        'agentVersion': '1.0.0',
                        'timestamp': datetime.utcnow().isoformat()
                    }
                )
            
            if not agent_task:
                raise Exception("Failed to create agent task")
            
            # Start processing task asynchronously
            task = asyncio.create_task(
                self._process_document_generation(agent_task.id, document_type, title, parameters, user_id, case_id, thread_id)
            )
            self.active_tasks[agent_task.id] = task
            
            return {
                'taskId': agent_task.id,
                'status': 'processing',
                'message': f'Document generation started for: {title}',
                'documentType': document_type
            }
            
        except Exception as e:
            logger.error(f"Failed to start document generation: {e}")
            return {
                'error': str(e),
                'status': 'failed',
                'message': 'Failed to start document generation'
            }
    
    async def _process_document_generation(
        self,
        task_id: int,
        document_type: str,
        title: str,
        parameters: Dict[str, Any],
        user_id: int,
        case_id: Optional[int] = None,
        thread_id: Optional[str] = None
    ):
        """Process document generation in background."""
        try:
            # Update task status to processing
            await update_task_progress(task_id, TaskStatus.PROCESSING)
            
            # Generate prompt for the agent
            prompt = self._create_document_prompt(document_type, title, parameters)
            
            # Use existing agent to generate document
            if not thread_id:
                thread_id = str(uuid.uuid4())
            
            config = {"configurable": {"thread_id": thread_id}}
            
            # Stream the response from agent
            response_items = []
            async for chunk in self.agent.graph.astream_events(
                {"messages": [("user", prompt)]},
                config=config,
                version="v2"
            ):
                if chunk["event"] == "on_chat_model_stream":
                    token = chunk["data"]["chunk"]
                    if hasattr(token, 'content') and token.content:
                        # Collect tokens for final response
                        pass
                elif chunk["event"] == "on_chain_end":
                    if "structured_response" in chunk["data"].get("output", {}):
                        response_items = chunk["data"]["output"]["structured_response"]
                        break
            
            # Extract document content from response
            document_content = self._extract_document_content(response_items)
            
            if not document_content:
                raise Exception("No document content generated")
            
            # Create document in backend
            async with self.backend_service as service:
                document_id = await service.create_document(
                    title=title,
                    content=document_content,
                    document_type=document_type,
                    case_id=case_id,
                    user_id=user_id,
                    metadata={
                        'generatedBy': 'AdlaanAgent',
                        'documentType': document_type,
                        'parameters': parameters,
                        'agentVersion': '1.0.0',
                        'generatedAt': datetime.utcnow().isoformat()
                    }
                )
            
            if document_id:
                # Update task as completed with document link
                await update_task_progress(
                    task_id, 
                    TaskStatus.COMPLETED,
                    output=json.dumps({
                        'documentId': document_id,
                        'title': title,
                        'content': document_content[:500] + '...' if len(document_content) > 500 else document_content,
                        'generatedAt': datetime.utcnow().isoformat()
                    })
                )
                
                logger.info(f"Document generation completed. Task: {task_id}, Document: {document_id}")
            else:
                raise Exception("Failed to save document to backend")
            
        except Exception as e:
            logger.error(f"Document generation failed for task {task_id}: {e}")
            await update_task_progress(
                task_id, 
                TaskStatus.FAILED,
                error=str(e)
            )
        finally:
            # Clean up active task
            if task_id in self.active_tasks:
                del self.active_tasks[task_id]
    
    def _create_document_prompt(self, document_type: str, title: str, parameters: Dict[str, Any]) -> str:
        """Create a prompt for document generation."""
        base_prompt = f"""Please create a {document_type} with the title "{title}".

Document Requirements:
"""
        
        for key, value in parameters.items():
            base_prompt += f"- {key.replace('_', ' ').title()}: {value}\n"
        
        base_prompt += f"""
Please generate a professional, legally sound {document_type} that includes:
1. Proper legal formatting and structure
2. All necessary clauses and provisions
3. Clear and precise language
4. Appropriate legal terminology

The document should be comprehensive and ready for use. Format it as a complete legal document.
"""
        return base_prompt
    
    def _extract_document_content(self, response_items: List[Dict[str, Any]]) -> Optional[str]:
        """Extract document content from agent response."""
        document_content = ""
        
        for item in response_items:
            if item.get("type") == "doc":
                document_content += item.get("content", "")
            elif item.get("type") == "message" and "document" in item.get("content", "").lower():
                # Sometimes the document is in a message
                content = item.get("content", "")
                if len(content) > 100:  # Likely contains document content
                    document_content += content
        
        return document_content.strip() if document_content else None
    
    async def analyze_document(
        self,
        document_id: int,
        analysis_type: str,
        user_id: int,
        case_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Analyze a document using the agent."""
        try:
            # Create task in backend
            async with self.backend_service as service:
                agent_task = await service.create_agent_task(
                    agent_type=AgentType.DOCUMENT_ANALYZER,
                    task_input={
                        'documentId': document_id,
                        'analysisType': analysis_type,
                        'caseId': case_id
                    },
                    user_id=user_id,
                    case_id=case_id,
                    metadata={
                        'analysisType': analysis_type,
                        'agentVersion': '1.0.0',
                        'timestamp': datetime.utcnow().isoformat()
                    }
                )
            
            if not agent_task:
                raise Exception("Failed to create analysis task")
            
            # Start processing task asynchronously
            task = asyncio.create_task(
                self._process_document_analysis(agent_task.id, document_id, analysis_type, user_id, case_id)
            )
            self.active_tasks[agent_task.id] = task
            
            return {
                'taskId': agent_task.id,
                'status': 'processing',
                'message': f'Document analysis started: {analysis_type}',
                'analysisType': analysis_type
            }
            
        except Exception as e:
            logger.error(f"Failed to start document analysis: {e}")
            return {
                'error': str(e),
                'status': 'failed',
                'message': 'Failed to start document analysis'
            }
    
    async def _process_document_analysis(
        self,
        task_id: int,
        document_id: int,
        analysis_type: str,
        user_id: int,
        case_id: Optional[int] = None
    ):
        """Process document analysis in background."""
        try:
            # Update task status to processing
            await update_task_progress(task_id, TaskStatus.PROCESSING)
            
            # Get document content from backend (this would need a query to fetch document)
            # For now, create a general analysis prompt
            prompt = f"""Please perform a {analysis_type} analysis of the document with ID {document_id}.

Provide a comprehensive analysis including:
1. Key points and highlights
2. Legal implications
3. Potential issues or concerns
4. Recommendations
5. Summary

Please structure your analysis clearly and provide actionable insights."""
            
            # Use agent to analyze
            thread_id = str(uuid.uuid4())
            config = {"configurable": {"thread_id": thread_id}}
            
            response_items = []
            async for chunk in self.agent.graph.astream_events(
                {"messages": [("user", prompt)]},
                config=config,
                version="v2"
            ):
                if chunk["event"] == "on_chain_end":
                    if "structured_response" in chunk["data"].get("output", {}):
                        response_items = chunk["data"]["output"]["structured_response"]
                        break
            
            # Extract analysis from response
            analysis_content = ""
            for item in response_items:
                if item.get("type") == "message":
                    analysis_content += item.get("content", "") + "\n"
            
            if not analysis_content:
                raise Exception("No analysis content generated")
            
            # Update task as completed
            await update_task_progress(
                task_id, 
                TaskStatus.COMPLETED,
                output=json.dumps({
                    'analysisType': analysis_type,
                    'content': analysis_content,
                    'documentId': document_id,
                    'analyzedAt': datetime.utcnow().isoformat()
                })
            )
            
            logger.info(f"Document analysis completed. Task: {task_id}, Document: {document_id}")
            
        except Exception as e:
            logger.error(f"Document analysis failed for task {task_id}: {e}")
            await update_task_progress(
                task_id, 
                TaskStatus.FAILED,
                error=str(e)
            )
        finally:
            # Clean up active task
            if task_id in self.active_tasks:
                del self.active_tasks[task_id]
    
    async def get_task_status(self, task_id: int) -> Optional[Dict[str, Any]]:
        """Get the status of a task."""
        try:
            async with self.backend_service as service:
                task = await service.get_agent_task(task_id)
                
                if not task:
                    return None
                
                return {
                    'taskId': task.id,
                    'type': task.type.value if task.type else None,
                    'status': task.status.value if task.status else None,
                    'output': task.output,
                    'error': task.error_message,
                    'metadata': task.metadata,
                    'createdAt': task.created_at.isoformat() if task.created_at else None,
                    'completedAt': task.completed_at.isoformat() if task.completed_at else None
                }
        except Exception as e:
            logger.error(f"Failed to get task status: {e}")
            return None
    
    async def get_user_tasks(self, user_id: int, agent_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all tasks for a user."""
        try:
            agent_type_enum = None
            if agent_type:
                try:
                    agent_type_enum = AgentType(agent_type)
                except ValueError:
                    logger.warning(f"Invalid agent type: {agent_type}")
            
            async with self.backend_service as service:
                tasks = await service.get_user_tasks(user_id, agent_type_enum)
                
                return [
                    {
                        'taskId': task.id,
                        'type': task.type.value if task.type else None,
                        'status': task.status.value if task.status else None,
                        'output': task.output,
                        'error': task.error_message,
                        'metadata': task.metadata,
                        'caseId': task.case_id,
                        'documentId': task.document_id,
                        'createdAt': task.created_at.isoformat() if task.created_at else None,
                        'completedAt': task.completed_at.isoformat() if task.completed_at else None
                    }
                    for task in tasks
                ]
        except Exception as e:
            logger.error(f"Failed to get user tasks: {e}")
            return []
    
    async def health_check(self) -> Dict[str, Any]:
        """Check the health of the service and backend connection."""
        try:
            async with self.backend_service as service:
                backend_healthy = await service.health_check()
            
            return {
                'status': 'healthy' if backend_healthy else 'degraded',
                'agent': 'ready' if self.agent else 'not_loaded',
                'backend': 'connected' if backend_healthy else 'disconnected',
                'activeTasks': len(self.active_tasks),
                'timestamp': datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

# Global instance
enhanced_agent_service = None

def get_enhanced_agent_service(agent: Agent = None) -> EnhancedAgentService:
    """Get or create the enhanced agent service instance."""
    global enhanced_agent_service
    if enhanced_agent_service is None:
        enhanced_agent_service = EnhancedAgentService(agent)
    return enhanced_agent_service