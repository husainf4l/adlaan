import { InputType, Field } from '@nestjs/graphql';

@InputType({ description: 'Input for creating a tag' })
export class CreateTagInput {
  @Field({ description: 'Tag name' })
  name: string;

  @Field({ nullable: true, description: 'Tag color in hex format (e.g., #FF5733)' })
  color?: string;

  @Field({ nullable: true, description: 'Tag description' })
  description?: string;
}
