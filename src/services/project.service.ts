import { IProject, ICreateProjectDTO, IUpdateProjectDTO } from '../types/project.types';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'projects';
const USERS_COLLECTION = 'users';

export const createProject = async (data: ICreateProjectDTO): Promise<IProject> => {
    try {
        // First verify if user exists in users collection
        const userRef = db.collection(USERS_COLLECTION).doc(data.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        const projectRef = db.collection(COLLECTION_NAME).doc();
        const now = new Date();
        
        // Ensure size is a number
        const size = typeof data.size === 'string' ? parseFloat(data.size) : data.size;
        
        const projectData = {
            id: projectRef.id,
            userId: data.userId,
            title: data.title,
            description: data.description,
            size: size,
            projectType: data.projectType,
            buildingConfig: data.buildingConfig,
            address: data.address,
            createdAt: now,
            updatedAt: now
        };
        
        await projectRef.set(projectData);
        return projectData as IProject;
    } catch (error) {
        console.error('Error in createProject service:', error);
        throw new Error(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const getProjectById = async (id: string, userId: string): Promise<IProject | null> => {
    try {
        // First verify if user exists in users collection
        const userRef = db.collection(USERS_COLLECTION).doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        // Then get the project
        const projectRef = db.collection(COLLECTION_NAME).doc(id);
        const projectDoc = await projectRef.get();
    
        if (!projectDoc.exists) {
            return null;
        }

        const projectData = projectDoc.data() as IProject;
        
        // Verify if the project belongs to the user
        if (projectData.userId !== userId) {
            throw new Error('Unauthorized: Project does not belong to this user');
        }
        
        return projectData;
    } catch (error) {
        console.error('Error in getProjectById service:', error);
        throw error;
    }
};

export const getProjectsByUserId = async (userId: string): Promise<IProject[]> => {
    const projectsSnapshot = await db.collection(COLLECTION_NAME)
        .where('userId', '==', userId)
        .get();
    
    return projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as IProject[];
};

export const getAllProjects = async (): Promise<IProject[]> => {
    const projectsSnapshot = await db.collection(COLLECTION_NAME).get();
    return projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as IProject[];
};

export const updateProject = async (id: string, userId: string, data: IUpdateProjectDTO): Promise<IProject> => {
    // First verify if user exists in users collection
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new Error('User not found');
    }

    // Then verify if project exists and belongs to the user
    const projectRef = db.collection(COLLECTION_NAME).doc(id);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
        throw new Error('Project not found');
    }

    const projectData = projectDoc.data() as IProject;
    if (projectData.userId !== userId) {
        throw new Error('Unauthorized: Project does not belong to this user');
    }

    const updateData = {
        ...data,
        updatedAt: new Date(),
    };
    
    await projectRef.update(updateData);
    const updatedDoc = await projectRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as IProject;
};

export const deleteProject = async (id: string, userId: string): Promise<void> => {
    try {
        // First verify if user exists in users collection
        const userRef = db.collection(USERS_COLLECTION).doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        // Then verify if project exists and belongs to the user
        const projectRef = db.collection(COLLECTION_NAME).doc(id);
        const projectDoc = await projectRef.get();

        if (!projectDoc.exists) {
            throw new Error('Project not found');
        }

        const projectData = projectDoc.data() as IProject;
        if (projectData.userId !== userId) {
            throw new Error('Unauthorized: Project does not belong to this user');
        }

        await projectRef.delete();
    } catch (error) {
        console.error('Error in deleteProject service:', error);
        throw error;
    }
}; 