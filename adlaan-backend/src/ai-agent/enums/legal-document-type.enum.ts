import { registerEnumType } from '@nestjs/graphql';

export enum LegalDocumentType {
  CONTRACT = 'CONTRACT',
  AGREEMENT = 'AGREEMENT',
  LEASE = 'LEASE',
  POWER_OF_ATTORNEY = 'POWER_OF_ATTORNEY',
  WILL = 'WILL',
  COMPLAINT = 'COMPLAINT',
  MOTION = 'MOTION',
  BRIEF = 'BRIEF',
  AFFIDAVIT = 'AFFIDAVIT',
  SUBPOENA = 'SUBPOENA',
  SETTLEMENT = 'SETTLEMENT',
  OTHER = 'OTHER',
}

registerEnumType(LegalDocumentType, {
  name: 'LegalDocumentType',
  description: 'Types of legal documents that can be generated',
});