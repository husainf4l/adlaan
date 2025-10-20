import { InputType, Field } from '@nestjs/graphql';

@InputType({ description: 'Input to create a new company' })
export class CreateCompanyInput {
  @Field({ description: 'Company name' })
  name: string;

  @Field({ nullable: true, description: 'Company description' })
  description?: string;

  @Field({ nullable: true, description: 'Company address' })
  address?: string;

  @Field({ nullable: true, description: 'Company phone number' })
  phone?: string;

  @Field({ nullable: true, description: 'Company email address' })
  email?: string;

  @Field({ nullable: true, description: 'Company website URL' })
  website?: string;
}
