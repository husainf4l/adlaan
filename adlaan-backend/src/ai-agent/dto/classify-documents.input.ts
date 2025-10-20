import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, IsArray } from 'class-validator';

@InputType()
export class ClassifyDocumentsInput {
  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  documentIds?: number[]; // Specific documents to classify

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  caseId?: number; // Classify all documents in a case

  @Field(() => Boolean, { defaultValue: false })
  includeUnclassified?: boolean; // Only classify documents without AI classification

  @Field(() => Boolean, { defaultValue: false })
  forceReclassify?: boolean; // Re-classify already classified documents
}