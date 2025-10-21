"""
Backend integration service for communicating with the Nest.js GraphQL API.
Handles all communication between the agent and the backend system.
"""
import aiohttp
import asyncio
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass

from src.services.base import AsyncService
from src.core.exceptions import BackendConnectionError, ValidationError
from src.schemas import AgentType, TaskStatus, TaskResponse


@dataclass
class AgentTask:
    """Agent task data class."""
    id: int
    agent_type: AgentType
    status: TaskStatus
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    case_id: Optional[int] = None
    document_id: Optional[int] = None
    created_by: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class BackendIntegrationService(AsyncService[Dict[str, Any]]):
    """Service for integrating with the Nest.js GraphQL backend."""
    
    def __init__(self):
        super().__init__()
        self.session: Optional[aiohttp.ClientSession] = None
        self.backend_url = self.settings.backend_url
        self.auth_token = self.settings.backend_auth_token
        self.graphql_url = self.settings.backend_graphql_url
    
    async def initialize(self) -> None:
        """Initialize the HTTP session."""
        await super().initialize()
        if not self.session:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=30),
                headers=self._get_headers()
            )
    
    async def cleanup(self) -> None:
        """Cleanup the HTTP session."""
        if self.session:
            await self.session.close()
            self.session = None
        await super().cleanup()
    
    async def _perform_health_check(self) -> None:
        """Check backend health."""
        if not self.session:
            await self.initialize()
        
        try:
            query = "query { __typename }"
            await self._graphql_request(query)
        except Exception as e:
            raise BackendConnectionError(f"Backend health check failed: {str(e)}")
    
    async def _get_health_details(self) -> Dict[str, Any]:
        """Get backend health details."""
        return {
            "backend_url": self.backend_url,
            "graphql_endpoint": self.graphql_url,
            "session_status": "active" if self.session else "inactive"
        }
    
    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for requests."""
        return {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.auth_token}",
            "User-Agent": f"Adlaan-Agent/{self.settings.app_version}"
        }
    
    async def _graphql_request(self, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make a GraphQL request to the backend."""
        if not self.session:
            await self.initialize()
        
        payload = {
            "query": query,
            "variables": variables or {}
        }
        
        try:
            async with self.session.post(self.graphql_url, json=payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise BackendConnectionError(
                        f"GraphQL request failed with status {response.status}: {error_text}"
                    )
                
                result = await response.json()
                
                if "errors" in result:
                    error_messages = [error.get("message", "Unknown error") for error in result["errors"]]
                    raise BackendConnectionError(f"GraphQL errors: {', '.join(error_messages)}")
                
                return result.get("data", {})
        
        except aiohttp.ClientError as e:
            raise BackendConnectionError(f"HTTP request failed: {str(e)}")
    
    async def process(self, input_data: Dict[str, Any]) -> Any:
        """Process a generic GraphQL request."""
        query = input_data.get("query")
        variables = input_data.get("variables", {})
        
        if not query:
            raise ValidationError("GraphQL query is required")
        
        return await self._graphql_request(query, variables)
    
    async def create_agent_task(
        self,
        agent_type: AgentType,
        task_input: Dict[str, Any],
        user_id: int,
        case_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AgentTask:
        """Create a new agent task in the backend."""
        query = """
        mutation CreateAgentTask($input: CreateAgentTaskInput!) {
            createAgentTask(input: $input) {
                id
                type
                status
                input
                caseId
                createdBy
                createdAt
                metadata
            }
        }
        """
        
        variables = {
            'input': {
                'type': agent_type.value,
                'input': json.dumps(task_input),
                'caseId': case_id,
                'createdBy': user_id,
                'metadata': metadata or {}
            }
        }
        
        try:
            result = await self._graphql_request(query, variables)
            task_data = result.get('createAgentTask', {})
            
            return AgentTask(
                id=task_data.get('id'),
                agent_type=AgentType(task_data.get('type')),
                status=TaskStatus(task_data.get('status')),
                input_data=json.loads(task_data.get('input', '{}')),
                metadata=task_data.get('metadata', {}),
                case_id=task_data.get('caseId'),
                created_by=task_data.get('createdBy'),
                created_at=datetime.fromisoformat(task_data.get('createdAt', '').replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(task_data.get('updatedAt', '').replace('Z', '+00:00'))
            )
        except Exception as e:
            self.logger.error(f"Failed to create agent task: {e}")
            raise BackendConnectionError(f"Failed to create agent task: {str(e)}")
    
    async def update_task_status(
        self,
        task_id: int,
        status: TaskStatus,
        output_data: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        progress: Optional[int] = None
    ) -> bool:
        """Update the status of an agent task."""
        query = """
        mutation UpdateAgentTask($id: Int!, $input: UpdateAgentTaskInput!) {
            updateAgentTask(id: $id, input: $input) {
                id
                status
                output
                updatedAt
                completedAt
            }
        }
        """
        
        update_data = {
            'status': status.value
        }
        
        if output_data is not None:
            update_data['output'] = json.dumps(output_data)
        
        if error_message is not None:
            update_data['errorMessage'] = error_message
        
        if progress is not None:
            update_data['progress'] = progress
        
        variables = {
            'id': task_id,
            'input': update_data
        }
        
        try:
            await self._graphql_request(query, variables)
            return True
        except Exception as e:
            self.logger.error(f"Failed to update task status: {e}")
            return False
    
    async def get_agent_task(self, task_id: int) -> Optional[AgentTask]:
        """Get an agent task by ID."""
        query = """
        query GetAgentTask($id: Int!) {
            agentTask(id: $id) {
                id
                type
                status
                input
                output
                errorMessage
                metadata
                caseId
                documentId
                createdBy
                createdAt
                updatedAt
                completedAt
            }
        }
        """
        
        variables = {'id': task_id}
        
        try:
            result = await self._graphql_request(query, variables)
            task_data = result.get('agentTask')
            
            if not task_data:
                return None
            
            return AgentTask(
                id=task_data.get('id'),
                agent_type=AgentType(task_data.get('type')),
                status=TaskStatus(task_data.get('status')),
                input_data=json.loads(task_data.get('input', '{}')),
                output_data=json.loads(task_data.get('output', '{}')) if task_data.get('output') else None,
                error_message=task_data.get('errorMessage'),
                metadata=task_data.get('metadata', {}),
                case_id=task_data.get('caseId'),
                document_id=task_data.get('documentId'),
                created_by=task_data.get('createdBy'),
                created_at=datetime.fromisoformat(task_data.get('createdAt', '').replace('Z', '+00:00')),
                updated_at=datetime.fromisoformat(task_data.get('updatedAt', '').replace('Z', '+00:00')),
                completed_at=datetime.fromisoformat(task_data.get('completedAt', '').replace('Z', '+00:00')) if task_data.get('completedAt') else None
            )
        except Exception as e:
            self.logger.error(f"Failed to get agent task: {e}")
            return None
    
    async def create_document(
        self,
        title: str,
        content: str,
        document_type: str,
        case_id: Optional[int] = None,
        user_id: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[int]:
        """Create a document in the backend."""
        query = """
        mutation CreateDocument($input: CreateDocumentInput!) {
            createDocument(input: $input) {
                id
                title
                documentType
                createdAt
            }
        }
        """
        
        variables = {
            'input': {
                'title': title,
                'content': content,
                'documentType': document_type,
                'caseId': case_id,
                'createdBy': user_id,
                'metadata': metadata or {}
            }
        }
        
        try:
            result = await self._graphql_request(query, variables)
            document_data = result.get('createDocument', {})
            return document_data.get('id')
        except Exception as e:
            self.logger.error(f"Failed to create document: {e}")
            return None
    
    async def get_user_tasks(
        self,
        user_id: int,
        agent_type: Optional[AgentType] = None,
        status: Optional[TaskStatus] = None,
        limit: Optional[int] = None
    ) -> List[AgentTask]:
        """Get tasks for a user."""
        query = """
        query GetUserTasks($userId: Int!, $agentType: AgentType, $status: TaskStatus, $limit: Int) {
            userAgentTasks(userId: $userId, agentType: $agentType, status: $status, limit: $limit) {
                id
                type
                status
                input
                output
                errorMessage
                metadata
                caseId
                documentId
                createdAt
                updatedAt
                completedAt
            }
        }
        """
        
        variables = {
            'userId': user_id,
            'agentType': agent_type.value if agent_type else None,
            'status': status.value if status else None,
            'limit': limit
        }
        
        try:
            result = await self._graphql_request(query, variables)
            tasks_data = result.get('userAgentTasks', [])
            
            tasks = []
            for task_data in tasks_data:
                tasks.append(AgentTask(
                    id=task_data.get('id'),
                    agent_type=AgentType(task_data.get('type')),
                    status=TaskStatus(task_data.get('status')),
                    input_data=json.loads(task_data.get('input', '{}')),
                    output_data=json.loads(task_data.get('output', '{}')) if task_data.get('output') else None,
                    error_message=task_data.get('errorMessage'),
                    metadata=task_data.get('metadata', {}),
                    case_id=task_data.get('caseId'),
                    document_id=task_data.get('documentId'),
                    created_at=datetime.fromisoformat(task_data.get('createdAt', '').replace('Z', '+00:00')),
                    updated_at=datetime.fromisoformat(task_data.get('updatedAt', '').replace('Z', '+00:00')),
                    completed_at=datetime.fromisoformat(task_data.get('completedAt', '').replace('Z', '+00:00')) if task_data.get('completedAt') else None
                ))
            
            return tasks
        except Exception as e:
            self.logger.error(f"Failed to get user tasks: {e}")
            return []