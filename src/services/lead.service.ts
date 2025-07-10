import { ILead, ICreateLeadDTO, IUpdateLeadDTO } from '../types/lead.types';
import { db } from '../config/firebase';
import axios from 'axios';

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

export const fetchAndStoreLeadsFromAPI = async (userId: string, count: number): Promise<ILead[]> => {
    try {
        // Validate user exists
        const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', userId).get();
        if (userQuery.empty) {
            throw new Error('User not found');
        }

        // Call external API
        const response = await axios.post(`${process.env.ARCHITEX_CUST_URL}/socialLeads/partners`, {
            Count: count,
            AccountNum: userId
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const apiLeads = response.data;

        // Fetch existing leads to avoid duplicates
        const existingLeadsSnapshot = await db.collection(LEADS_COLLECTION)
            .where('userId', '==', userId)
            .get();
        const existingLeadEmails = new Set(existingLeadsSnapshot.docs.map(doc => doc.data().email));

        const batch = db.batch();
        const createdLeads: ILead[] = [];

        // Support new Architex API response structure
        let leadsArray: any[] = [];
        if (Array.isArray(apiLeads)) {
            leadsArray = apiLeads;
        } else if (apiLeads && Array.isArray(apiLeads.leads)) {
            leadsArray = apiLeads.leads;
        }
        const fetchDate = new Date();
        leadsArray.forEach((apiLead: any) => {
            // Use LeadName or Name for name, and map all fields
            const email = apiLead.Email || apiLead.email || '';
            if (existingLeadEmails.has(email)) {
                return;
            }
            const leadRef = db.collection(LEADS_COLLECTION).doc();
            // Remarks: if LastNoteAdded is present and not default, add as remark
            let remarks = [];
            if (apiLead.LastNoteAdded && apiLead.LastNoteAdded !== '1900-01-01T00:00:00.000Z') {
                remarks.push({ text: apiLead.LastNoteAdded, date: new Date(apiLead.LastNoteAdded) });
            }
            const newLead: ILead = {
                id: leadRef.id,
                name: apiLead.LeadName || apiLead.Name || apiLead.name || 'Unknown',
                email: email,
                phone: apiLead.Phone || apiLead.phone || '',
                company: apiLead.Company || apiLead.company || '',
                type: apiLead.Type || apiLead.type || 'Architecture',
                value: apiLead.Size ? String(apiLead.Size) : (apiLead.value || apiLead.budget || '0'),
                source: apiLead.Source ? String(apiLead.Source) : (apiLead.source || 'API'),
                status: 'Fresh',
                remarks: remarks,
                city: apiLead.City || apiLead.city || '',
                state: apiLead.State || apiLead.state || '',
                createdAt: apiLead.CreatedDateTime ? new Date(apiLead.CreatedDateTime) : fetchDate,
                userId: userId,
                architexFetchedAt: fetchDate
            };
            batch.set(leadRef, newLead);
            createdLeads.push(newLead);
        });

        // Commit batch if there are leads to create
        if (createdLeads.length > 0) {
            await batch.commit();

            // Update CRM plan usage for the user
            const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', userId).get();
            if (!userQuery.empty) {
                const userDoc = userQuery.docs[0];
                const userData = userDoc.data();
                if (userData.isCrmSubscribed && userData.CRMplanInfo) {
                    const crmPlanInfo = userData.CRMplanInfo;
                    const features = crmPlanInfo.features || {};
                    const freshLeadsPerMonth = features.freshLeadsPerMonth || 0;
                    const now = new Date();
                    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                    // Count only leads fetched from Architex in the current month
                    const leadsSnapshot = await db.collection(LEADS_COLLECTION)
                        .where('userId', '==', userId)
                        .where('architexFetchedAt', '>=', new Date(now.getFullYear(), now.getMonth(), 1))
                        .get();
                    const usedLeadsThisMonth = leadsSnapshot.size;
                    const remainingLeadsThisMonth = Math.max(0, freshLeadsPerMonth - usedLeadsThisMonth);

                    // Track usage history
                    let leadsUsageHistory = crmPlanInfo.leadsUsageHistory || [];
                    let monthUsage = leadsUsageHistory.find((h: any) => h.month === currentMonth);
                    if (!monthUsage) {
                        monthUsage = { month: currentMonth, used: 0, remaining: freshLeadsPerMonth };
                        leadsUsageHistory = leadsUsageHistory.filter((h: any) => h.month !== currentMonth);
                        leadsUsageHistory.push(monthUsage);
                    }
                    monthUsage.used = usedLeadsThisMonth;
                    monthUsage.remaining = remainingLeadsThisMonth;

                    // Update features
                    features.usedLeadsThisMonth = usedLeadsThisMonth;
                    features.remainingLeadsThisMonth = remainingLeadsThisMonth;

                    await userDoc.ref.update({
                        'CRMplanInfo.features': features,
                        'CRMplanInfo.leadsUsageHistory': leadsUsageHistory
                    });
                }
            }
        }

        // Return all leads for the user
        return await getLeadsByUserId(userId);
    } catch (error) {
        console.error('Error in fetchAndStoreLeadsFromAPI service:', error);
        // If error is from axios and has a response, extract the API error message
        if (error && typeof error === 'object' && (error as any).isAxiosError && (error as any).response) {
            const apiError = (error as any).response.data?.message || (error as any).response.data || (error as any).message;
            throw new Error(`Architex API error: ${apiError}`);
        }
        throw new Error(`Failed to fetch and store leads: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};