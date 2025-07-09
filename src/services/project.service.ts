import { IProject, ICreateProjectDTO, IUpdateProjectDTO, IRemark } from '../types/project.types';
import { db } from '../config/firebase';
import * as admin from 'firebase-admin';

const COLLECTION_NAME = 'projects';
const USERS_COLLECTION = 'users';

export const createProject = async (data: ICreateProjectDTO): Promise<IProject> => {
    try {
        // First verify if user exists and check their plan info
        const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', data.userId).get();
        if (userQuery.empty) {
            throw new Error('User not found');
        }
        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();
        
        // Get current projects count
        const projectsSnapshot = await db.collection(COLLECTION_NAME)
            .where('userId', '==', data.userId)
            .get();
        const currentProjectsCount = projectsSnapshot.size;

        // Allow 1 free project without subscription
        if (!userData?.isSubscribed) {
            if (currentProjectsCount >= 1) {
                throw new Error('You have reached your free project limit. Please subscribe to create more projects.');
            }
            
            // Create the free project
            const projectRef = db.collection(COLLECTION_NAME).doc();
            const now = new Date();
            
            const projectData = {
                id: projectRef.id,
                userId: data.userId,
                title: data.title,
                description: data.description,
                size: typeof data.size === 'string' ? parseFloat(data.size) : data.size,
                projectType: data.projectType,
                buildingConfig: data.buildingConfig,
                address: data.address,
                status: data.status || 'created',
                remarks: data.remarks || [],
                createdAt: now,
                updatedAt: now,
                planName: 'free',
                purchaseIncharge: data.purchaseIncharge,
                purchaseAmount: data.purchaseAmount,
            };

            await projectRef.set(projectData);
            return projectData as IProject;
        }

        // For subscribed users, check their plan info
        const planInfo = userData.planInfo;
        if (!planInfo || !planInfo.features) {
            throw new Error('Invalid subscription plan');
        }

        // Check if plan is expired
        if (new Date(planInfo.expiresAt) < new Date()) {
            throw new Error('Subscription plan has expired');
        }

        // Convert size to number if it's a string
        const projectSize = typeof data.size === 'string' ? parseFloat(data.size) : data.size;

        // Calculate total area of existing projects
        let totalExistingArea = 0;
        projectsSnapshot.forEach(doc => {
            const project = doc.data();
            totalExistingArea += project.size;
        });

        // Check project count limit
        if (typeof planInfo.features.projects === 'number') {
            if (currentProjectsCount >= planInfo.features.projects) {
                throw new Error(`Project limit of ${planInfo.features.projects} exceeded for ${planInfo.planName} plan`);
            }
        }

        // Extract and check area limit
        const areaLimitStr = planInfo.features.areaLimit;
        const areaLimit = parseInt(areaLimitStr.replace(/[^0-9]/g, ''));

        // Check if new project would exceed area limit
        if (totalExistingArea + projectSize > areaLimit) {
            throw new Error(`Area limit of ${areaLimit} sq. ft. exceeded for ${planInfo.planName} plan`);
        }

        // Create the project
        const projectRef = db.collection(COLLECTION_NAME).doc();
        const now = new Date();
        
        const projectData = {
            id: projectRef.id,
            userId: data.userId,
            title: data.title,
            description: data.description,
            size: projectSize,
            projectType: data.projectType,
            buildingConfig: data.buildingConfig,
            address: data.address,
            status: data.status || 'created',
            remarks: data.remarks || [],
            createdAt: now,
            updatedAt: now,
            planName: planInfo.planName,
            purchaseIncharge: data.purchaseIncharge,
            purchaseAmount: data.purchaseAmount,
        };

        // Update user's plan info with remaining values and usage
        const updateData: Record<string, number> = {
            'planInfo.features.usedArea': totalExistingArea + projectSize,
            'planInfo.features.usedProjects': currentProjectsCount + 1,
            'planInfo.features.remainingArea': areaLimit - (totalExistingArea + projectSize)
        };

        if (typeof planInfo.features.projects === 'number') {
            updateData['planInfo.features.remainingProjects'] = planInfo.features.projects - (currentProjectsCount + 1);
        }

        await userDoc.ref.update(updateData);
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
        const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', userId).get();
        if (userQuery.empty) {
            throw new Error('User not found');
        }
        const userDoc = userQuery.docs[0];

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
    const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', userId).get();
    if (userQuery.empty) {
        throw new Error('User not found');
    }
    const userDoc = userQuery.docs[0];

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
        const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', userId).get();
        if (userQuery.empty) {
            throw new Error('User not found');
        }
        const userDoc = userQuery.docs[0];

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

export const addRemarkToProject = async (id: string, userId: string, remarkText: string): Promise<IProject> => {
    try {
        // First verify if user exists in users collection
        const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', userId).get();
        if (userQuery.empty) {
            throw new Error('User not found');
        }
        const userDoc = userQuery.docs[0];

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

        // Create new remark
        const newRemark: IRemark = {
            text: remarkText,
            date: new Date()
        };

        // Add remark to existing remarks array
        const updatedRemarks = [...(projectData.remarks || []), newRemark];

        // Update the project
        const updateData = {
            remarks: updatedRemarks,
            updatedAt: new Date()
        };

        await projectRef.update(updateData);
        const updatedDoc = await projectRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() } as IProject;
    } catch (error) {
        console.error('Error in addRemarkToProject service:', error);
        throw error;
    }
};

export const updateProjectStatus = async (id: string, userId: string, status: 'created' | 'inprogress' | 'completed'): Promise<IProject> => {
    try {
        // First verify if user exists in users collection
        const userQuery = await db.collection(USERS_COLLECTION).where('userId', '==', userId).get();
        if (userQuery.empty) {
            throw new Error('User not found');
        }
        const userDoc = userQuery.docs[0];

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

        // Update the project status
        const updateData = {
            status: status,
            updatedAt: new Date()
        };

        await projectRef.update(updateData);
        const updatedDoc = await projectRef.get();
        return { id: updatedDoc.id, ...updatedDoc.data() } as IProject;
    } catch (error) {
        console.error('Error in updateProjectStatus service:', error);
        throw error;
    }
}; 