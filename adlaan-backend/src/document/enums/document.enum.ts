export enum DocumentType {
  CONTRACT = 'contract',
  NDA = 'nda',
  MOTION = 'motion',
  BRIEF = 'brief',
  LEASE = 'lease',
  MEMO = 'memo',
  LETTER = 'letter',
  AGREEMENT = 'agreement',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  WILL = 'will',
  COMPLAINT = 'complaint',
  ANSWER = 'answer',
  DISCOVERY = 'discovery',
  AFFIDAVIT = 'affidavit',
  SUMMONS = 'summons',
  ORDER = 'order',
  JUDGMENT = 'judgment',
  OTHER = 'other',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  SIGNED = 'signed',
  FILED = 'filed',
  ARCHIVED = 'archived',
}
