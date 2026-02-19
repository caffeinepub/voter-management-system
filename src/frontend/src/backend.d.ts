import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Voter {
    dob?: string;
    houseNumber?: bigint;
    signature?: ExternalBlob;
    area?: string;
    caste?: string;
    name: string;
    srNo: bigint;
    mobileNo?: string;
    education?: string;
    profession?: string;
    fatherHusbandName?: string;
    office?: string;
    educationalDocuments?: Array<ExternalBlob>;
    district?: string;
    taluka?: string;
    state?: string;
    voterId: string;
    address?: string;
    gender?: Gender;
    politicalIdeology?: string;
    comments?: string;
    photo?: ExternalBlob;
    pincode?: string;
}
export interface Task {
    id: bigint;
    status: TaskStatus;
    title: string;
    assignedBy: Principal;
    assignedTo: Role;
    description: string;
    deadline: string;
    attachments: Array<ExternalBlob>;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum Role {
    supervisor = "supervisor",
    karyakarta = "karyakarta",
    admin = "admin"
}
export enum TaskStatus {
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addVoter(name: string, voterId: string, fatherHusbandName: string | null, houseNumber: bigint | null, address: string | null, gender: Gender | null, area: string | null, taluka: string | null, district: string | null, state: string | null, pincode: string | null, mobileNo: string | null, dob: string | null, caste: string | null, education: string | null, profession: string | null, office: string | null, politicalIdeology: string | null, comments: string | null, photo: ExternalBlob | null, signature: ExternalBlob | null, educationalDocuments: Array<ExternalBlob> | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignTask(title: string, description: string, deadline: string, assignedTo: Role, attachments: Array<ExternalBlob>): Promise<void>;
    assignUserRole(user: Principal, profile: UserProfile): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVoterById(voterId: string): Promise<Voter | null>;
    getVoters(): Promise<Array<Voter>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTaskStatus(taskId: bigint, newStatus: TaskStatus): Promise<void>;
}
