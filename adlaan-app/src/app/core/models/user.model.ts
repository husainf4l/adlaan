/**
 * User model representing authenticated user data
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  phoneNumber?: string | null;
  twoFactorEnabled?: boolean;
  companyId?: string | null;
  company?: any | null;
}