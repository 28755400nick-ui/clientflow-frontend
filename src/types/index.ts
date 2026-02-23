export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ClientFilters {
  name?: string;
  phone?: string;
  page?: number;
  per_page?: number;
}

export interface ValidationErrors {
  [field: string]: string[];
}

export interface ApiError {
  message: string;
  errors?: ValidationErrors;
}
