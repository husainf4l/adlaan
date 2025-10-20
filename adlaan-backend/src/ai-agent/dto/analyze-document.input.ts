import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt } from 'class-validator';

@InputType()
export class AnalyzeDocumentInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  documentId: number;

  @Field(() => String, { nullable: true })
  analysisType?: string; // 'summary', 'full_analysis', 'legal_review', etc.
}