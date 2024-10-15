import { UserTracking } from "./tracking.model";

export class User {
    id: string;
    _id?: string;
    email: string;
    password: string;
    confirmPassword: string;
    title: string;
    firstName: string;
    lastName: string;
    jwtToken: string;
    role: string;
    acceptTerms: boolean;
    lastLogin: string[];
    created: Date;
    updated: Date;
    tracking: UserTracking;
    phoneNumber: string;
    countryCode: string;
    active: boolean;
    avatar: string;
    expanded: boolean;
    isPhoneVerified: boolean;
    
    constructor() {
        this.tracking = new UserTracking();
    }
    
}