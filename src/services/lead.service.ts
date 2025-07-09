import { ILead, ICreateLeadDTO, IUpdateLeadDTO } from '../types/lead.types';
import { db } from '../config/firebase';

const LEADS_COLLECTION = 'leads';
const USERS_COLLECTION = 'users';

export const createLead = async (data: ICreateLeadDTO): Promise<ILead> => {
    try {
        const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', data.userId).get();
        if (userQuery.empty) {
            throw new Error('User not found');
        }
        const userDoc = userQuery.docs[0];

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
        const userQuery = await db.collection('users').where('userId', '==', userId).get();
        if (userQuery.empty) {
            throw new Error('User not found');
        }
        const userDoc = userQuery.docs[0];

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
                
                const newLead = {
                    id: leadRef.id,
                    ...leadData,
                    userId,
                    createdAt: leadData.createdAt || new Date(),
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
    
    return leadsSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert Firestore timestamp to JavaScript Date
        let createdAt: Date;
        if (data.createdAt instanceof Date) {
            createdAt = data.createdAt;
        } else if (data.createdAt && typeof data.createdAt === 'object' && data.createdAt.toDate) {
            // Firestore Timestamp
            createdAt = data.createdAt.toDate();
        } else if (typeof data.createdAt === 'string') {
            createdAt = new Date(data.createdAt);
        } else if (data.createdAt && typeof data.createdAt === 'object' && data.createdAt._seconds) {
            // Firestore Timestamp object
            createdAt = new Date(data.createdAt._seconds * 1000);
        } else {
            createdAt = new Date();
        }
        
        return {
            id: doc.id,
            ...data,
            createdAt
        };
    }) as ILead[];
};

export const updateLeadById = async (leadId: string, userId: string, data: Partial<IUpdateLeadDTO>): Promise<ILead> => {
    try {
        const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', userId).get();
        if (userQuery.empty) {
            throw new Error('User not found');
        }
        const userDoc = userQuery.docs[0];

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

export const getMonthlyBudgetData = async (userId: string) => {
    try {
        const leadsSnapshot = await db.collection(LEADS_COLLECTION)
            .where('userId', '==', userId)
            .get();
        const leads = leadsSnapshot.docs.map(doc => doc.data() as ILead);

        

        // Initialize monthly budget object
        const monthlyBudget: { [key: string]: number } = {
            'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
            'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
        };

        // Process each lead
        leads.forEach((lead, index) => {
            
            
            // Handle different date formats from Firestore
            let createdAt: Date;
            if (lead.createdAt instanceof Date) {
                createdAt = lead.createdAt;
            } else if (lead.createdAt && typeof lead.createdAt === 'object' && lead.createdAt.toDate) {
                // Firestore Timestamp
                createdAt = lead.createdAt.toDate();
            } else if (typeof lead.createdAt === 'string') {
                createdAt = new Date(lead.createdAt);
            } else if (lead.createdAt && typeof lead.createdAt === 'object' && lead.createdAt._seconds) {
                // Firestore Timestamp object
                createdAt = new Date(lead.createdAt._seconds * 1000);
            } else {
                
                createdAt = new Date();
            }
            
            
            
            const month = createdAt.toLocaleString('en-US', { month: 'short' });
            
            
            // Extract numeric value from the value string (remove ₹ and commas)
            const valueString = lead.value || '';
            
            
            // Remove ₹ symbol, commas, and any other non-numeric characters except decimal point
            const numericValue = Number(valueString.replace(/[^\d.]/g, ''));
            
            
            if (!isNaN(numericValue) && numericValue > 0) {
                monthlyBudget[month] += numericValue;
                 
            } else {
                
            }
        });

        

        // Convert to array format for chart
        const chartData = Object.entries(monthlyBudget).map(([month, budget]) => ({
            month,
            budget
        }));

        
        return chartData;
    } catch (error) {
        console.error('Error in getMonthlyBudgetData service:', error);
        throw new Error(`Failed to get monthly budget data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const getCustomerGrowthData = async (userId: string) => {
    try {
        const leadsSnapshot = await db.collection(LEADS_COLLECTION)
            .where('userId', '==', userId)
            .get();
        const leads = leadsSnapshot.docs.map(doc => doc.data() as ILead);

        

        // Initialize monthly customer count object
        const monthlyCustomers: { [key: string]: number } = {
            'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
            'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
        };

        // Track unique customers by month
        const customersByMonth: { [key: string]: Set<string> } = {
            'Jan': new Set(), 'Feb': new Set(), 'Mar': new Set(), 'Apr': new Set(), 
            'May': new Set(), 'Jun': new Set(), 'Jul': new Set(), 'Aug': new Set(), 
            'Sep': new Set(), 'Oct': new Set(), 'Nov': new Set(), 'Dec': new Set()
        };

        // Process each lead
        leads.forEach((lead, index) => {
            
            
            // Handle different date formats from Firestore
            let createdAt: Date;
            if (lead.createdAt instanceof Date) {
                createdAt = lead.createdAt;
            } else if (lead.createdAt && typeof lead.createdAt === 'object' && lead.createdAt.toDate) {
                // Firestore Timestamp
                createdAt = lead.createdAt.toDate();
            } else if (typeof lead.createdAt === 'string') {
                createdAt = new Date(lead.createdAt);
            } else if (lead.createdAt && typeof lead.createdAt === 'object' && lead.createdAt._seconds) {
                // Firestore Timestamp object
                createdAt = new Date(lead.createdAt._seconds * 1000);
            } else {
                
                createdAt = new Date();
            }
            
            const month = createdAt.toLocaleString('en-US', { month: 'short' });
            
            // Add customer email to the month's set (handles duplicates automatically)
            if (lead.email) {
                customersByMonth[month].add(lead.email);
            }
        });

        // Count new customers in each month (not cumulative)
        Object.keys(monthlyCustomers).forEach(month => {
            monthlyCustomers[month] = customersByMonth[month].size;
        });

        

        // Convert to array format for chart
        const chartData = Object.entries(monthlyCustomers).map(([month, customers]) => ({
            month,
            customers
        }));

        
        return chartData;
    } catch (error) {
        console.error('Error in getCustomerGrowthData service:', error);
        throw new Error(`Failed to get customer growth data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const getCitywiseProjectsData = async (userId: string) => {
    try {
        const leadsSnapshot = await db.collection(LEADS_COLLECTION)
            .where('userId', '==', userId)
            .get();
        const leads = leadsSnapshot.docs.map(doc => doc.data() as ILead);

        // Initialize citywise projects object
        const citywiseProjects: { [key: string]: { Interior: number; Architecture: number; Builders: number } } = {};

        // Process each lead
        leads.forEach((lead) => {
            const city = lead.city || 'Unknown';
            
            // Initialize city if not exists
            if (!citywiseProjects[city]) {
                citywiseProjects[city] = {
                    Interior: 0,
                    Architecture: 0,
                    Builders: 0
                };
            }

            // Count by type
            if (lead.type === 'Interior') {
                citywiseProjects[city].Interior++;
            } else if (lead.type === 'Architecture') {
                citywiseProjects[city].Architecture++;
            }
            // Note: Builders type is not in current lead types, but keeping for chart compatibility
        });

        // Convert to array format for chart
        const chartData = Object.entries(citywiseProjects).map(([state, projects]) => ({
            state,
            Interior: projects.Interior,
            Architecture: projects.Architecture,
            Builders: projects.Builders
        }));

        return chartData;
    } catch (error) {
        console.error('Error in getCitywiseProjectsData service:', error);
        throw new Error(`Failed to get citywise projects data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};