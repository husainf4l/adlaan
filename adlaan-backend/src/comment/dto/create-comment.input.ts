import { InputType, Field, Int } from '@nestjs/graphql';

@InputType({ description: 'Input for creating a comment' })
export class CreateCommentInput {
  @Field({ description: 'Comment text' })
  content: string;

  @Field(() => Int, { nullable: true, description: 'Parent comment ID for replies' })
  parentId?: number;

  @Field(() => Int, { nullable: true, description: 'Character position for inline comments' })
  position?: number;

  @Field(() => [String], { nullable: true, description: 'User IDs to mention (@mentions)' })
  mentions?: string[];

  @Field({ nullable: true, description: 'Quoted text from document for context' })
  quotedText?: string;
}
