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

interface Permission {
  id: string;
  name: string;
  guard_name: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([])
  const [activeTab, setActiveTab] = useState("list")
  const [roleName, setRoleName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

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
    setSelectedPermissions((current) =>
      current.includes(permission.name)
        ? current.filter((name) => name !== permission.name)
        : [...current, permission.name]
    )
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
    const role = roles.find(role => role.id === roleId)
    if (!role) return
    
    setRoleName(role.name)
    setSelectedPermissions(role.permissions)
    setEditingId(roleId)
    setIsEditing(true)
    setActiveTab("create")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
      </div>

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">View Roles</TabsTrigger>
          <TabsTrigger value="create">Create Role</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="grid gap-4">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(role.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create">
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
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availablePermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={permission.name}
                          checked={selectedPermissions.includes(permission.name)}
                          onCheckedChange={() => handlePermissionToggle(permission)}
                        />
                        <Label htmlFor={permission.name} className="text-sm">
                          {permission.name}
                        </Label>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}