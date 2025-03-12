"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Shield, Trash2, Edit } from "lucide-react"
import axiosInstance from "@/lib/axios"
import { usePermission } from "@/hooks/usePermission"
import { useRouter } from "next/navigation"

interface Permission {
  id: string;
  name: string;
  guard_name: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

export default function RolesPage() {
  const { can } = usePermission()
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([])
  const [activeTab, setActiveTab] = useState("list")
  const [roleName, setRoleName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!can('role-view')) {
      router.push('/dashboard')
    }
  }, [can, router])

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/roles/all')
      setRoles(response.data.roles)
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/roles/permissions')
      setAvailablePermissions(response.data.permissions)
    } catch (error) {
      console.error('Error fetching permissions:', error)
    }
  }

  const handlePermissionToggle = (permission: Permission) => {
    const [groupName, action] = permission.name.split('-');
    
    // If trying to uncheck a "view" permission
    if (action === 'view' && selectedPermissions.includes(permission.name)) {
      // Remove all permissions from this group
      setSelectedPermissions(current =>
        current.filter(name => !name.startsWith(groupName + '-'))
      );
      return;
    }

    // If trying to check a non-view permission
    if (action !== 'view') {
      const viewPermission = `${groupName}-view`;
      const hasViewPermission = selectedPermissions.includes(viewPermission);
      
      if (!hasViewPermission) {
        // Can't select non-view permissions without view permission
        return;
      }
    }

    // Normal toggle behavior
    setSelectedPermissions(current =>
      current.includes(permission.name)
        ? current.filter(name => name !== permission.name)
        : [...current, permission.name]
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditing && editingId) {
        await axiosInstance.put(`/api/admin/roles/update`, {
          role_id: editingId,
          permissions: selectedPermissions
        })
      } else {
        await axiosInstance.post(`/api/admin/roles/create`, {
          name: roleName,
          permissions: selectedPermissions
        })
      }
      await fetchRoles()
      setRoleName("")
      setSelectedPermissions([])
      setIsEditing(false)
      setEditingId(null)
      setActiveTab("list")
    } catch (error) {
      console.error('Error saving role:', error)
    }
  }

  const handleDeleteRole = async (id: string) => {
    try {
      await axiosInstance.delete(`/api/admin/roles/delete`, {
        data: { role_id: id }
      })
      setRoles(prevRoles => prevRoles.filter(role => role.id !== id))
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const handleEditClick = (roleId: string) => {
    const role = roles.find(role => role.id === roleId);
    if (!role) return;
    
    console.log('Editing role:', role);
    console.log('Role permissions:', role.permissions);
    
    setRoleName(role.name);
    // Extract just the permission names from the permission objects
    const permissionNames = role.permissions.map(permission => permission.name);
    console.log('Setting permission names:', permissionNames);
    setSelectedPermissions(permissionNames);
    setEditingId(roleId);
    setIsEditing(true);
    setActiveTab("create");
  };

  const groupPermissions = (permissions: Permission[]): PermissionGroup[] => {
    const groups = permissions.reduce((acc, permission) => {
      const groupName = permission.name.split('-')[0];
      
      const displayName = groupName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      if (!acc[groupName]) {
        acc[groupName] = {
          name: displayName,
          permissions: []
        };
      }
      acc[groupName].permissions.push(permission);
      return acc;
    }, {} as Record<string, PermissionGroup>);

    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  };

  if (!can('role-view')) {
    return null
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
          <TabsList>
            <TabsTrigger value="list">View Roles</TabsTrigger>
            {can('role-create') && (
              <TabsTrigger value="create">Create Role</TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle>{role.name}</CardTitle>
                  <CardDescription>
                    {role.permissions.length} permissions assigned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end space-x-2">
                    {can('role-update') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(role.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {can('role-delete') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {can('role-create') && (
          <TabsContent value="create" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{isEditing ? 'Edit Role' : 'Create New Role'}</CardTitle>
                  <CardDescription>
                    {isEditing ? 'Modify role and permissions' : 'Define a new role and assign permissions'}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Role Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter role name"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        disabled={isEditing}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="text-lg">Permissions</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupPermissions(availablePermissions).map((group) => (
                          <div key={group.name} className="border rounded-lg p-4">
                            <h3 className="font-medium text-sm text-muted-foreground mb-3">{group.name}</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {group.permissions.map((permission) => {
                                const [groupName, action] = permission.name.split('-');
                                const viewPermission = `${groupName}-view`;
                                const isDisabled = action !== 'view' && !selectedPermissions.includes(viewPermission);

                                return (
                                  <div
                                    key={permission.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={permission.name}
                                      checked={selectedPermissions.includes(permission.name)}
                                      onCheckedChange={() => handlePermissionToggle(permission)}
                                      disabled={isDisabled}
                                    />
                                    <Label 
                                      htmlFor={permission.name} 
                                      className={`text-sm ${isDisabled ? 'text-muted-foreground' : ''}`}
                                    >
                                      {action}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update Role' : 'Create Role'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}