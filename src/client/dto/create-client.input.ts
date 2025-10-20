import { InputType, Field } from '@nestjs/graphql';
import { ClientType } from '../enums/client-type.enum';

@InputType({ description: 'Input to create a new client' })
export class CreateClientInput {
  @Field({ description: 'Client name or organization name' })
  name: string;

  @Field(() => ClientType, { 
    description: 'Type of client',
    defaultValue: ClientType.INDIVIDUAL,
  })
  type: ClientType;

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
