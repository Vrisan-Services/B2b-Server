import { ILead, ICreateLeadDTO, IUpdateLeadDTO } from '../types/lead.types';
import { db } from '../config/firebase';

const LEADS_COLLECTION = 'leads';
const USERS_COLLECTION = 'users';

export const createLead = async (data: ICreateLeadDTO): Promise<ILead> => {
    try {
        const userRef = db.collection(USERS_COLLECTION).doc(data.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        const leadRef = db.collection(LEADS_COLLECTION).doc();
        const now = new Date();
        
        const leadData = {
            id: leadRef.id,
            ...data,
            createdAt: now,
        };

        await leadRef.set(leadData);

        return leadData as ILead;
    } catch (error) {
        console.error('Error in createLead service:', error);
        throw new Error(`Failed to create lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const createMultipleLeads = async (leads: Omit<ICreateLeadDTO, 'userId'>[], userId: string): Promise<ILead[]> => {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        // Fetch all existing leads for the user
        const allUserLeadsSnapshot = await db.collection(LEADS_COLLECTION)
            .where('userId', '==', userId)
            .get();
        const existingLeadEmails = new Set(allUserLeadsSnapshot.docs.map(doc => doc.data().email));

        const batch = db.batch();
        const createdLeads: ILead[] = [];

        leads.forEach(leadData => {
            if (!existingLeadEmails.has(leadData.email)) {
                const leadRef = db.collection(LEADS_COLLECTION).doc();
                const now = new Date();
                const newLead = {
                    id: leadRef.id,
                    ...leadData,
                    userId,
                    createdAt: now,
                };
                batch.set(leadRef, newLead);
                createdLeads.push(newLead as ILead);
            }
        });

        if (createdLeads.length > 0) {
            await batch.commit();
        }
        // Fetch and return all leads for the user from the db
        return await getLeadsByUserId(userId);
    } catch (error) {
        console.error('Error in createMultipleLeads service:', error);
        throw new Error(`Failed to create leads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}; 

export const getLeadsByUserId = async (userId: string): Promise<ILead[]> => {
    const leadsSnapshot = await db.collection(LEADS_COLLECTION)
        .where('userId', '==', userId)
        .get();
    
    return leadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as ILead[];
};

export const updateLeadById = async (leadId: string, userId: string, data: Partial<IUpdateLeadDTO>): Promise<ILead> => {
    try {
        const userRef = db.collection(USERS_COLLECTION).doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        const leadRef = db.collection(LEADS_COLLECTION).doc(leadId);
        const leadDoc = await leadRef.get();

        if (!leadDoc.exists) {
            throw new Error('Lead not found');
        }
        
        const leadData = leadDoc.data() as ILead;
        if (leadData.userId !== userId) {
            throw new Error('Unauthorized to update this lead');
        }

        await leadRef.update(data);

        const updatedLeadDoc = await leadRef.get();
        return updatedLeadDoc.data() as ILead;

    } catch (error) {
        console.error('Error in updateLeadById service:', error);
        throw new Error(`Failed to update lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const getDashboardStats = async (userId: string) => {
    const leadsSnapshot = await db.collection(LEADS_COLLECTION)
        .where('userId', '==', userId)
        .get();
    const leads = leadsSnapshot.docs.map(doc => doc.data() as ILead);

    // Revenue: sum of value for converted leads
    const revenue = leads
        .filter(lead => lead.status === 'Converted')
        .reduce((sum, lead) => {
            // Remove non-numeric chars and parse value
            const numericValue = Number((lead.value || '').replace(/[^\d]/g, ''));
            return sum + (isNaN(numericValue) ? 0 : numericValue);
        }, 0);

    // Customers: count of unique emails
    const customers = new Set(leads.map(lead => lead.email)).size;

    // Quotation Sent: count of leads with status 'Converted'
    const quotationSent = leads.filter(lead => lead.status === 'Converted').length;

    return {
        revenue,
        customers,
        quotationSent
    };
};