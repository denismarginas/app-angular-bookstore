export interface UserAddress {
  address_line: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export type UserRole = 'Customer' | 'Admin';

export const USER_ROLES: UserRole[] = ['Customer', 'Admin'];

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: UserRole;
  address: UserAddress;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}
