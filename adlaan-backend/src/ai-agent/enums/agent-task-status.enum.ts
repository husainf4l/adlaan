import { registerEnumType } from '@nestjs/graphql';

export enum AgentTaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(AgentTaskStatus, {
  name: 'AgentTaskStatus',
  description: 'Status of AI agent tasks',
});