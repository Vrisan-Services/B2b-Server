// User related types
export interface Address {
  id: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSignupData {
  userId: string;
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

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  ifsc: string;
}

export interface UserData {
  id: string;
  userId: string;
  orgName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  addresses: Address[];
  gstVerified?: boolean;
  emailVerified:boolean
  isSubscribed:boolean
  isCrmSubscribed?: boolean;
  planInfo?: any;
  CRMplanInfo?: any;
  logo?: string;
  bankDetails?: BankDetails;
  createdAt: Date;
  updatedAt: Date;
}

// Address related types
export interface AddAddressData {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface UpdateAddressData extends Partial<AddAddressData> {
  id: string;
}

export interface UpdateProfileData {
  orgName?: string;
  contactPerson?: string;
  designation?: string;
  phone?: string;
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