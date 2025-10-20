import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCompanyInput } from './create-company.input';

@InputType({ description: 'Input to update an existing company' })
export class UpdateCompanyInput extends PartialType(CreateCompanyInput) {
  @Field({ nullable: true, description: 'Company name' })
  name?: string;
}
