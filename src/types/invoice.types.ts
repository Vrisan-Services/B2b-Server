export interface Invoice {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: Date;
  leadId?: string;
  meta?: Record<string, any>;
} 