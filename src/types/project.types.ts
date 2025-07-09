export interface IRemark {
    text: string;
    date: Date;
}

export interface IProject {
    id: string;
    userId: string;
    title: string;
    description: string;
    size: number;
    projectType: string;
    buildingConfig: string;
    address: string;
    status: 'created' | 'inprogress' | 'completed';
    remarks: IRemark[];
    createdAt: Date;
    updatedAt: Date;
    purchaseIncharge?: string;
    purchaseAmount?: number;
}

export interface ICreateProjectDTO {
    userId: string;
    title: string;
    description: string;
    size: number;
    projectType: string;
    buildingConfig: string;
    address: string;
    status?: 'created' | 'inprogress' | 'completed';
    remarks?: IRemark[];
    purchaseIncharge?: string;
    purchaseAmount?: number;
}

export interface IUpdateProjectDTO extends Partial<ICreateProjectDTO> {} 