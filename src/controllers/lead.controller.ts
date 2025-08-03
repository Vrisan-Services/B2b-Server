import { Request, Response } from 'express';
import { createMultipleLeads, getLeadsByUserId, updateLeadById, getDashboardStats, getMonthlyBudgetData, getCustomerGrowthData, getCitywiseProjectsData, fetchAndStoreLeadsFromAPI, fetchAndStoreSignupLeadsFromAPI } from '../services/lead.service';
import { leads as dummyLeads } from '../data/leads';
import { IUpdateLeadDTO } from '../types/lead.types';



export const getLeadsByUserIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const leads = await getLeadsByUserId(userId);
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user leads' });
    }
};

export const updateLeadHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId, ...updateData }: { userId: string } & IUpdateLeadDTO = req.body;

        if (!userId) {
            res.status(400).json({ error: 'userId is required for updating lead' });
            return;
        }

        const lead = await updateLeadById(id, userId, updateData);
        res.json(lead);
    } catch (error) {
        
        if (error instanceof Error) {
            if (error.message.includes('User not found')) {
                res.status(404).json({ error: 'User not found' });
            } else if (error.message.includes('Lead not found')) {
                res.status(404).json({ error: 'Lead not found' });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({
                    error: 'Failed to update lead',
                    details: error.message
                });
            }
        } else {
            res.status(500).json({
                error: 'Failed to update lead',
                details: 'Unknown error occurred'
            });
        }
    }
};

export const getDashboardStatsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'Missing userId' });
            return;
        }
        const stats = await getDashboardStats(userId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getMonthlyBudgetDataHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'Missing userId' });
            return;
        }
        const monthlyData = await getMonthlyBudgetData(userId);
        res.json(monthlyData);
    } catch (error) {
        console.error('Error fetching monthly budget data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch monthly budget data',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
};

export const getCustomerGrowthDataHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'Missing userId' });
            return;
        }
        const customerGrowthData = await getCustomerGrowthData(userId);
        res.json(customerGrowthData);
    } catch (error) {
        console.error('Error fetching customer growth data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch customer growth data',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
};

export const getCitywiseProjectsDataHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ error: 'Missing userId' });
            return;
        }
        const citywiseProjectsData = await getCitywiseProjectsData(userId);
        res.json(citywiseProjectsData);
    } catch (error) {
        console.error('Error fetching citywise projects data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch citywise projects data',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}; 

export const fetchLeadsFromAPIHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, count } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'Missing userId' });
            return;
        }
        if (!count) {
            res.status(400).json({ error: 'Missing count' });
            return;
        }

        // Fetch leads from external API and store in database
        const createdLeads = await fetchAndStoreLeadsFromAPI(userId, count);
        res.status(200).json({ 
            message: 'Leads fetched and stored successfully', 
            count: createdLeads.length, 
            leads: createdLeads // Only the newly stored leads
        });

    } catch (error) {
        console.error('Error fetching leads from API:', error);
        
        if (error instanceof Error) {
            if (error.message.includes('User not found')) {
                res.status(404).json({
                    error: 'User not found',
                    details: error.message
                });
                return;
            }
            // Handle Architex API 404 Not Found
            if (error.message.includes('Architex API error') && (error.message.includes('404') || error.message.toLowerCase().includes('not found'))) {
                res.status(404).json({
                    error: 'No leads found',
                    details: error.message
                });
                return;
            }
        }

        res.status(500).json({
            error: 'Failed to fetch leads from API',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}; 


export const fetchFreeLeadsFromAPIHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, count } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'Missing userId' });
            return;
        }
        if (!count) {
            res.status(400).json({ error: 'Missing count' });
            return;
        }

        // Fetch leads from external API and store in database
        const createdLeads = await fetchAndStoreSignupLeadsFromAPI(userId, count);
        res.status(200).json({ 
            message: 'Leads fetched and stored successfully', 
            count: createdLeads.length, 
            leads: createdLeads // Only the newly stored leads
        });

    } catch (error) {
        console.error('Error fetching leads from API:', error);
        
        if (error instanceof Error) {
            if (error.message.includes('User not found')) {
                res.status(404).json({
                    error: 'User not found',
                    details: error.message
                });
                return;
            }
            // Handle Architex API 404 Not Found
            if (error.message.includes('Architex API error') && (error.message.includes('404') || error.message.toLowerCase().includes('not found'))) {
                res.status(404).json({
                    error: 'No leads found',
                    details: error.message
                });
                return;
            }
        }

        res.status(500).json({
            error: 'Failed to fetch leads from API',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}; 