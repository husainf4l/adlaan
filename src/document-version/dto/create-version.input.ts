import { InputType, Field } from '@nestjs/graphql';

@InputType({ description: 'Input for creating a document version' })
export class CreateVersionInput {
  @Field({ nullable: true, description: 'Description of changes in this version' })
  changeDescription?: string;
}
