import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCommentInput } from './create-comment.input';

@InputType({ description: 'Input for updating a comment' })
export class UpdateCommentInput extends PartialType(CreateCommentInput) {}
