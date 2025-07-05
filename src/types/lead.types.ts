export interface ILead {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    type: 'Architecture' | 'Interior';
    value: string;
    source: string;
    status: 'Converted' | 'Initial';
    remarks: string;
    city: string;
    state: string;
    createdAt: Date | any; // Allow Firestore Timestamp
    userId: string;
}

export interface ICreateLeadDTO {
    name: string;
    email:string;
    phone: string;
    company: string;
    type: 'Architecture' | 'Interior';
    value: string;
    source: string;
    status: 'Converted' | 'Initial';
    remarks: string;
    city: string;
    state: string;
    createdAt: Date;
    userId: string;
}

export interface IUpdateLeadDTO {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    type?: 'Architecture' | 'Interior';
    value?: string;
    source?: string;
    status?: 'Converted' | 'Initial';
    remarks?: string;
    city?: string;
    state?: string;
} 