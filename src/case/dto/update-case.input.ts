import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateCaseInput } from './create-case.input';
import { CaseStatus, CaseType } from '../enums/case.enum';

@InputType({ description: 'Input to update an existing case' })
export class UpdateCaseInput extends PartialType(CreateCaseInput) {
  @Field({ nullable: true, description: 'Unique case number' })
  caseNumber?: string;

  @Field({ nullable: true, description: 'Case title' })
  title?: string;

  @Field({ nullable: true, description: 'Case description' })
  description?: string;

  @Field(() => CaseStatus, { nullable: true, description: 'Current status of the case' })
  status?: CaseStatus;

  @Field(() => CaseType, { nullable: true, description: 'Type of legal case' })
  caseType?: CaseType;

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

  @Field(() => Int, { nullable: true, description: 'Client ID associated with this case' })
  clientId?: number;

  @Field(() => [Int], { nullable: true, description: 'User IDs to assign to this case' })
  assignedUserIds?: number[];
}
