import { InputType, Field, Int } from '@nestjs/graphql';
import { CaseStatus, CaseType } from '../enums/case.enum';

@InputType({ description: 'Input to create a new case' })
export class CreateCaseInput {
  @Field({ description: 'Unique case number' })
  caseNumber: string;

  @Field({ description: 'Case title' })
  title: string;

  @Field({ nullable: true, description: 'Case description' })
  description?: string;

  @Field(() => CaseStatus, { 
    description: 'Current status of the case',
    defaultValue: CaseStatus.ACTIVE,
  })
  status: CaseStatus;

  @Field(() => CaseType, { description: 'Type of legal case' })
  caseType: CaseType;

  @Field({ nullable: true, description: 'Court or jurisdiction' })
  court?: string;

  @Field({ nullable: true, description: 'Opposing party name' })
  opposingParty?: string;

  @Field({ nullable: true, description: 'Case filing date' })
  filingDate?: Date;

  @Field({ nullable: true, description: 'Case closing date' })
  closingDate?: Date;

  @Field({ nullable: true, description: 'Additional notes' })
  notes?: string;

  @Field(() => Int, { description: 'Client ID associated with this case' })
  clientId: number;

  @Field(() => [Int], { nullable: true, description: 'User IDs to assign to this case' })
  assignedUserIds?: number[];
}
