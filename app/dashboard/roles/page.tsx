"use client"

import { useState } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import { Shield, Plus } from "lucide-react"

// Mock permissions data - replace with actual permissions from your backend
const availablePermissions = [
  {
    category: "User Management",
    permissions: [
      { id: "user-view", label: "View Users" },
      { id: "user-create", label: "Create Users" },
      { id: "user-edit", label: "Edit Users" },
      { id: "user-delete", label: "Delete Users" },
    ],
  },
  {
    category: "Content Management",
    permissions: [
      { id: "content-view", label: "View Content" },
      { id: "content-create", label: "Create Content" },
      { id: "content-edit", label: "Edit Content" },
      { id: "content-publish", label: "Publish Content" },
    ],
  },
  {
    category: "Settings",
    permissions: [
      { id: "settings-view", label: "View Settings" },
      { id: "settings-edit", label: "Edit Settings" },
      { id: "settings-system", label: "System Settings" },
    ],
  },
]

export default function RolesPage() {
  const [roleName, setRoleName] = useState("")
  const [roleDescription, setRoleDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((current) =>
      current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement role creation with selected permissions
    console.log({
      name: roleName,
      description: roleDescription,
      permissions: selectedPermissions,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Role Management</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
              <CardDescription>
                Define a new role and assign permissions
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter role description"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Assign Permissions</CardTitle>
              <CardDescription>
                Select the permissions for this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {availablePermissions.map((category, index) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <h3 className="font-semibold mb-3">{category.category}</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {category.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() =>
                                handlePermissionToggle(permission.id)
                              }
                            />
                            <Label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}