import { registerEnumType } from '@nestjs/graphql';

export enum AgentType {
  LEGAL_DOCUMENT_GENERATOR = 'LEGAL_DOCUMENT_GENERATOR',
  DOCUMENT_ANALYZER = 'DOCUMENT_ANALYZER',
  DOCUMENT_CLASSIFIER = 'DOCUMENT_CLASSIFIER',
}

registerEnumType(AgentType, {
  name: 'AgentType',
  description: 'Types of AI agents available in the system',
});