import { Router } from 'express';
import {
    createProjectHandler,
    getProjectByIdHandler,
    getAllProjectsHandler,
    updateProjectHandler,
    deleteProjectHandler,
    getProjectsByUserIdHandler,
    addRemarkToProjectHandler,
    updateProjectStatusHandler
} from '../controllers/project.controller';

const router = Router();

// Create a new project
router.post('/', createProjectHandler);

// Get all projects
router.get('/', getAllProjectsHandler);

// Get projects by user ID
router.get('/user/:userId', getProjectsByUserIdHandler);

// Get project by ID
router.get('/:id', getProjectByIdHandler);

// Update project
router.put('/:id', updateProjectHandler);

// Add remark to project
router.post('/:id/remarks', addRemarkToProjectHandler);

// Update project status
router.put('/:id/status', updateProjectStatusHandler);

// Delete project
router.delete('/:id', deleteProjectHandler);

export default router; 