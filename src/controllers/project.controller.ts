import { Request, Response } from 'express';
import { createProject, getProjectById, getAllProjects, updateProject, deleteProject, getProjectsByUserId, addRemarkToProject, updateProjectStatus } from '../services/project.service';
import { ICreateProjectDTO, IUpdateProjectDTO } from '../types/project.types';



export const createProjectHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const projectData: ICreateProjectDTO = req.body;

        // Validate required fields
        if (!projectData.userId || !projectData.title || !projectData.description ||
            !projectData.size || !projectData.projectType || !projectData.buildingConfig ||
            !projectData.address) {
            res.status(400).json({
                error: 'Missing required fields',
                details: {
                    userId: !projectData.userId,
                    title: !projectData.title,
                    description: !projectData.description,
                    size: !projectData.size,
                    projectType: !projectData.projectType,
                    buildingConfig: !projectData.buildingConfig,
                    address: !projectData.address
                }
            });
            return;
        }

        // Set default values for new fields if not provided
        if (!projectData.status) {
            projectData.status = 'created';
        }
        if (!projectData.remarks) {
            projectData.remarks = [];
        }

        const project = await createProject(projectData);
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        
        if (error instanceof Error) {
            // Handle subscription-related errors
            if (error.message.includes('active subscription')) {
                res.status(403).json({
                    error: 'Subscription required',
                    details: error.message
                });
                return;
            }
            
            if (error.message.includes('limit exceeded')) {
                res.status(403).json({
                    error: 'Subscription limit exceeded',
                    details: error.message
                });
                return;
            }

            if (error.message === 'User not found') {
                res.status(404).json({
                    error: 'User not found',
                    details: error.message
                });
                return;
            }
        }

        res.status(500).json({
            error: 'Failed to create project',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
};

export const getProjectByIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ error: 'userId query parameter is required' });
            return;
        }

        const project = await getProjectById(id, userId);
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        res.json(project);
    } catch (error) {
        
        if (error instanceof Error) {
            if (error.message === 'User not found') {
                res.status(404).json({ error: 'User not found' });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({
                    error: 'Failed to fetch project',
                    details: error.message
                });
            }
        } else {
            res.status(500).json({
                error: 'Failed to fetch project',
                details: 'Unknown error occurred'
            });
        }
    }
};

export const getProjectsByUserIdHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!userId) {
            res.status(400).json({ error: 'userId parameter is required' });
            return;
        }

        const projects = await getProjectsByUserId(userId);
        res.json(projects);
    } catch (error) {
        console.error('Error fetching user projects:', error);
        if (error instanceof Error) {
            res.status(500).json({
                error: 'Failed to fetch user projects',
                details: error.message
            });
        } else {
            res.status(500).json({
                error: 'Failed to fetch user projects',
                details: 'Unknown error occurred'
            });
        }
    }
};

export const getAllProjectsHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const projects = await getAllProjects();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

export const updateProjectHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData: IUpdateProjectDTO = req.body;

        // Check if userId is provided in the request body
        if (!updateData.userId) {
            res.status(400).json({ error: 'userId is required for updating project' });
            return;
        }

        const project = await updateProject(id, updateData.userId, updateData);
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
};

export const deleteProjectHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ error: 'userId query parameter is required' });
            return;
        }

        await deleteProject(id, userId);
        res.status(200).json({ 
            message: 'Project deleted successfully',
            projectId: id
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        if (error instanceof Error) {
            if (error.message === 'User not found') {
                res.status(404).json({ error: 'User not found' });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else if (error.message.includes('Project not found')) {
                res.status(404).json({ error: 'Project not found' });
            } else {
                res.status(500).json({ 
                    error: 'Failed to delete project',
                    details: error.message
                });
            }
        } else {
            res.status(500).json({ 
                error: 'Failed to delete project',
                details: 'Unknown error occurred'
            });
        }
    }
}; 

export const addRemarkToProjectHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId, remarkText } = req.body;

        if (!userId || !remarkText) {
            res.status(400).json({ 
                error: 'Missing required fields',
                details: {
                    userId: !userId,
                    remarkText: !remarkText
                }
            });
            return;
        }

        const project = await addRemarkToProject(id, userId, remarkText);
        res.json(project);
    } catch (error) {
        console.error('Error adding remark to project:', error);
        if (error instanceof Error) {
            if (error.message === 'User not found') {
                res.status(404).json({ error: 'User not found' });
            } else if (error.message.includes('Project not found')) {
                res.status(404).json({ error: 'Project not found' });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({
                    error: 'Failed to add remark to project',
                    details: error.message
                });
            }
        } else {
            res.status(500).json({
                error: 'Failed to add remark to project',
                details: 'Unknown error occurred'
            });
        }
    }
};

export const updateProjectStatusHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId, status } = req.body;

        if (!userId || !status) {
            res.status(400).json({ 
                error: 'Missing required fields',
                details: {
                    userId: !userId,
                    status: !status
                }
            });
            return;
        }

        // Validate status value
        if (!['created', 'inprogress', 'completed'].includes(status)) {
            res.status(400).json({ 
                error: 'Invalid status value',
                details: 'Status must be one of: created, inprogress, completed'
            });
            return;
        }

        const project = await updateProjectStatus(id, userId, status);
        res.json(project);
    } catch (error) {
        console.error('Error updating project status:', error);
        if (error instanceof Error) {
            if (error.message === 'User not found') {
                res.status(404).json({ error: 'User not found' });
            } else if (error.message.includes('Project not found')) {
                res.status(404).json({ error: 'Project not found' });
            } else if (error.message.includes('Unauthorized')) {
                res.status(403).json({ error: error.message });
            } else {
                res.status(500).json({
                    error: 'Failed to update project status',
                    details: error.message
                });
            }
        } else {
            res.status(500).json({
                error: 'Failed to update project status',
                details: 'Unknown error occurred'
            });
        }
    }
}; 