// User related types
export interface UserSignupData {
  orgName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  password: string;
  gstNumber: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  orgName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface AuthResponse extends ApiResponse {
  data?: {
    user: UserData;
    token: string;
  };
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  code: number;
  message: string;
  errors?: ValidationError[];
} 