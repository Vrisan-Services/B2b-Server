export interface IProject {
    id: string;
    userId: string;
    title: string;
    description: string;
    size: number;
    projectType: string;
    buildingConfig: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateProjectDTO {
    userId: string;
    title: string;
    description: string;
    size: number;
    projectType: string;
    buildingConfig: string;
    address: string;
}

export interface IUpdateProjectDTO extends Partial<ICreateProjectDTO> {} 