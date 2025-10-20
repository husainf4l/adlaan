import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateClientInput } from './create-client.input';
import { ClientType } from '../enums/client-type.enum';

@InputType({ description: 'Input to update an existing client' })
export class UpdateClientInput extends PartialType(CreateClientInput) {
  @Field({ nullable: true, description: 'Client name or organization name' })
  name?: string;

  @Field(() => ClientType, { nullable: true, description: 'Type of client' })
  type?: ClientType;

  @Field({ nullable: true, description: 'Client email address' })
  email?: string;

  @Field({ nullable: true, description: 'Client phone number' })
  phone?: string;

  @Field({ nullable: true, description: 'Client address' })
  address?: string;

  @Field({ nullable: true, description: 'Contact person name (for organizations)' })
  contactPerson?: string;

  @Field({ nullable: true, description: 'Tax ID or business registration number' })
  taxId?: string;

  @Field({ nullable: true, description: 'Additional notes about the client' })
  notes?: string;
}
