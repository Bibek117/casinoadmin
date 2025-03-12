import { useAuth } from "@/context/AuthProvider";

export const usePermission = () => {
  const { permissions } = useAuth();

  const can = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAny = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAll = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  return { can, hasAny, hasAll };
}; 