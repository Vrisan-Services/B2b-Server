export interface WaitlistData {
  fullName: string;
  companyName: string;
  role: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  state?: string;
  projectSize: string;
  annualProjectVolume?: string;
  projectTypes: string[];
  designSupportNeeded: string[];
  additionalNotes?: string;
} 