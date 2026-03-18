export type UserRole = "guest" | "guru" | "admin" | "teacher" | "student"

export function canManageUsers(role: UserRole): boolean {
  return role === "admin"
}

export function canManageMaterials(role: UserRole): boolean {
  return role === "admin" || role === "teacher" || role === "guru"
}

export function canAccessDashboard(role: UserRole): boolean {
  return role !== "student" && role !== "guest"
}
