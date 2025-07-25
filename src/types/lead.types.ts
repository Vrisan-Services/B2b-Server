export interface IRemarkEntry {
  text: string;
  date: Date;
}

export interface ILead {
    id: string;
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    company: string;
    type: 'Architecture' | 'Interior';
    value: string;
    source: string;
    status: 'Converted' | 'Fresh'|'Follow-up'|'Lost' ;
    remarks: IRemarkEntry[];
    city: string;
    state: string;
    createdAt: Date | any; // Allow Firestore Timestamp
    userId: string;
    architexFetchedAt?: Date | null; // Date when fetched from Architex
}

export interface ICreateLeadDTO {
    name: string;
    email:string;
    phone: string;
    alternatePhone?: string;
    company: string;
    type: 'Architecture' | 'Interior';
    value: string;
    source: string;
    status: 'Converted' | 'Fresh'|'Follow-up'|'Lost';
    remarks: IRemarkEntry[];
    city: string;
    state: string;
    createdAt: Date;
    userId: string;
    architexFetchedAt?: Date | null; // Date when fetched from Architex
}

export interface IUpdateLeadDTO {
    name?: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    company?: string;
    type?: 'Architecture' | 'Interior';
    value?: string;
    source?: string;
    status?: 'Converted' | 'Fresh'|'Follow-up'|'Lost';
    remarks?: IRemarkEntry[];
    city?: string;
    state?: string;
} 