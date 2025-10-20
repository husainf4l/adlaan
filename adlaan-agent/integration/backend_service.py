"""
Integration service to connect the Adlaan FastAPI Agent with the Nest.js GraphQL backend.
This service handles communication between the agent microservice and the main backend.
"""
import aiohttp
import asyncio
import json
import os
from typing import Dict, Any, Optional, List
from enum import Enum
from datetime import datetime
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentType(Enum):
    LEGAL_DOCUMENT_GENERATOR = "LEGAL_DOCUMENT_GENERATOR"
    DOCUMENT_ANALYZER = "DOCUMENT_ANALYZER"
    DOCUMENT_CLASSIFIER = "DOCUMENT_CLASSIFIER"

class TaskStatus(Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

@dataclass
class AgentTask:
    id: Optional[int] = None
    type: Optional[AgentType] = None
    status: Optional[TaskStatus] = None
    input: Optional[str] = None
    output: Optional[str] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    case_id: Optional[int] = None
    document_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class BackendIntegrationService:
    """Service to integrate with the Nest.js GraphQL backend."""
    
    def __init__(self, backend_url: str = None, auth_token: str = None):
        self.backend_url = backend_url or os.getenv('BACKEND_URL', 'http://localhost:3000')
        self.graphql_endpoint = os.getenv('GRAPHQL_ENDPOINT', '/graphql')
        self.graphql_url = f"{self.backend_url}{self.graphql_endpoint}"
        self.auth_token = auth_token or os.getenv('BACKEND_AUTH_TOKEN')
        self.session: Optional[aiohttp.ClientSession] = None
        self.timeout = int(os.getenv('REQUEST_TIMEOUT', '30'))
        
        logger.info(f"Backend Integration initialized: {self.graphql_url}")
        if self.auth_token:
            logger.info("✅ Backend auth token configured")
        else:
            logger.warning("⚠️ No backend auth token configured")
        
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for requests."""
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': f'Adlaan-Agent/{os.getenv("SERVICE_VERSION", "2.0-beta")}',
            'X-Service-Name': os.getenv('SERVICE_NAME', 'adlaan-agent')
        }
        if self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'
        return headers
    
    async def _graphql_request(self, query: str, variables: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make a GraphQL request to the backend."""
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        payload = {
            'query': query,
            'variables': variables or {}
        }
        
        try:
            async with self.session.post(
                self.graphql_url,
                json=payload,
                headers=self._get_headers(),
                timeout=aiohttp.ClientTimeout(total=self.timeout)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    if 'errors' in result:
                        logger.error(f"GraphQL errors: {result['errors']}")
                        raise Exception(f"GraphQL error: {result['errors'][0]['message']}")
                    return result.get('data', {})
                else:
                    error_text = await response.text()
                    logger.error(f"HTTP {response.status}: {error_text}")
                    raise Exception(f"HTTP {response.status}: {error_text}")
        except aiohttp.ClientError as e:
            logger.error(f"Request failed: {e}")
            raise Exception(f"Request failed: {e}")
    
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
                type=AgentType(task_data.get('type')),
                status=TaskStatus(task_data.get('status')),
                input=task_data.get('input'),
                case_id=task_data.get('caseId'),
                created_by=task_data.get('createdBy'),
                created_at=datetime.fromisoformat(task_data.get('createdAt', '').replace('Z', '+00:00')),
                metadata=task_data.get('metadata', {})
            )
        except Exception as e:
            logger.error(f"Failed to create agent task: {e}")
            raise
    
    async def update_task_status(
        self,
        task_id: int,
        status: TaskStatus,
        output: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> bool:
        """Update the status of an agent task."""
        query = """
        mutation UpdateAgentTask($id: Int!, $input: UpdateAgentTaskInput!) {
            updateAgentTask(id: $id, input: $input) {
                id
                status
                output
                errorMessage
                completedAt
            }
        }
        """
        
        update_data = {'status': status.value}
        if output:
            update_data['output'] = output
        if error_message:
            update_data['errorMessage'] = error_message
        if status in [TaskStatus.COMPLETED, TaskStatus.FAILED]:
            update_data['completedAt'] = datetime.utcnow().isoformat()
        
        variables = {
            'id': task_id,
            'input': update_data
        }
        
        try:
            await self._graphql_request(query, variables)
            return True
        except Exception as e:
            logger.error(f"Failed to update task status: {e}")
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
                type=AgentType(task_data.get('type')),
                status=TaskStatus(task_data.get('status')),
                input=task_data.get('input'),
                output=task_data.get('output'),
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
            logger.error(f"Failed to get agent task: {e}")
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
                content
                documentType
                caseId
                createdById
            }
        }
        """
        
        variables = {
            'input': {
                'title': title,
                'content': content,
                'documentType': document_type,
                'caseId': case_id,
                'createdById': user_id,
                'isAiGenerated': True,
                'aiMetadata': metadata or {}
            }
        }
        
        try:
            result = await self._graphql_request(query, variables)
            document_data = result.get('createDocument', {})
            return document_data.get('id')
        except Exception as e:
            logger.error(f"Failed to create document: {e}")
            return None
    
    async def link_task_to_document(self, task_id: int, document_id: int) -> bool:
        """Link an agent task to a created document."""
        return await self.update_task_status(
            task_id, 
            TaskStatus.COMPLETED,
            output=json.dumps({'documentId': document_id})
        )
    
    async def get_user_tasks(self, user_id: int, agent_type: Optional[AgentType] = None) -> List[AgentTask]:
        """Get all tasks for a user, optionally filtered by agent type."""
        query = """
        query GetUserTasks($userId: Int!, $agentType: AgentType) {
            userAgentTasks(userId: $userId, agentType: $agentType) {
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
            'agentType': agent_type.value if agent_type else None
        }
        
        try:
            result = await self._graphql_request(query, variables)
            tasks_data = result.get('userAgentTasks', [])
            
            tasks = []
            for task_data in tasks_data:
                tasks.append(AgentTask(
                    id=task_data.get('id'),
                    type=AgentType(task_data.get('type')),
                    status=TaskStatus(task_data.get('status')),
                    input=task_data.get('input'),
                    output=task_data.get('output'),
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
            logger.error(f"Failed to get user tasks: {e}")
            return []

    async def health_check(self) -> bool:
        """Check if the backend is reachable."""
        query = """
        query HealthCheck {
            __typename
        }
        """
        
        try:
            await self._graphql_request(query)
            return True
        except Exception as e:
            logger.error(f"Backend health check failed: {e}")
            return False

# Global instance
backend_service = BackendIntegrationService()

# Utility functions for easy access
async def create_legal_document_task(
    document_type: str,
    title: str,
    parameters: Dict[str, Any],
    user_id: int,
    case_id: Optional[int] = None
) -> Optional[AgentTask]:
    """Convenience function to create a legal document generation task."""
    async with BackendIntegrationService() as service:
        return await service.create_agent_task(
            agent_type=AgentType.LEGAL_DOCUMENT_GENERATOR,
            task_input={
                'documentType': document_type,
                'title': title,
                'parameters': parameters,
                'caseId': case_id
            },
            user_id=user_id,
            case_id=case_id,
            metadata={
                'documentType': document_type,
                'title': title,
                'agentVersion': '1.0.0'
            }
        )

async def create_document_analysis_task(
    document_id: int,
    analysis_type: str,
    user_id: int,
    case_id: Optional[int] = None
) -> Optional[AgentTask]:
    """Convenience function to create a document analysis task."""
    async with BackendIntegrationService() as service:
        return await service.create_agent_task(
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
                'agentVersion': '1.0.0'
            }
        )

async def update_task_progress(
    task_id: int,
    status: TaskStatus,
    output: Optional[str] = None,
    error: Optional[str] = None
) -> bool:
    """Update task progress."""
    async with BackendIntegrationService() as service:
        return await service.update_task_status(task_id, status, output, error)