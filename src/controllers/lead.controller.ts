import { Request, Response } from 'express';
import { createMultipleLeads, getLeadsByUserId, updateLeadById, getDashboardStats } from '../services/lead.service';
import { leads as dummyLeads } from '../data/leads';
import { IUpdateLeadDTO } from '../types/lead.types';

export const createLeadHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ error: 'Missing userId' });
            return;
        }

        const createdLeads = await createMultipleLeads(dummyLeads, userId);
        res.status(201).json({ message: 'Dummy leads seeded successfully', count: createdLeads.length, leads: createdLeads });

    } catch (error) {
        console.error('Error seeding leads:', error);
        
        if (error instanceof Error) {
            if (error.message.includes('User not found')) {
                res.status(404).json({
                    error: 'User not found',
                    details: error.message
                });
                return;
            }
        }

        res.status(500).json({
            error: 'Failed to seed leads',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
};

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