import { Router } from 'express';
import {
    createProjectHandler,
    getProjectByIdHandler,
    getAllProjectsHandler,
    updateProjectHandler,
    deleteProjectHandler
} from '../controllers/project.controller';

const router = Router();

// Create a new project
router.post('/', createProjectHandler);

// Get all projects
router.get('/', getAllProjectsHandler);

// Get project by ID
router.get('/:id', getProjectByIdHandler);

// Update project
router.put('/:id', updateProjectHandler);

// Delete project
router.delete('/:id', deleteProjectHandler);

export default router; 