export enum Role {
    SuperAdmin = 'SuperAdmin', // can CRUD admins and others
    Admin = 'Admin', // can CRUD others but not a superAdmin.
}
