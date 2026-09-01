export type AccountRole =
    | "USER"
    | "MODERATOR"
    | "ADMIN"
    | "OWNER"
    | "SYSTEM";


export function isOwner(role: AccountRole) {
    return role === "OWNER";
}


export function isAdmin(role: AccountRole) {
    return (
        role === "ADMIN" ||
        role === "OWNER" ||
        role === "SYSTEM"
    );
}


export function isModerator(role: AccountRole) {
    return (
        role === "MODERATOR" ||
        role === "ADMIN" ||
        role === "OWNER" ||
        role === "SYSTEM"
    );
}