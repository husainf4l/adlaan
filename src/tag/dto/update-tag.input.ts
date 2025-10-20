import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateTagInput } from './create-tag.input';

@InputType({ description: 'Input for updating a tag' })
export class UpdateTagInput extends PartialType(CreateTagInput) {}
