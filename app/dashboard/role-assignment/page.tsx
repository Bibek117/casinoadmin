"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, UserPlus } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import axiosInstance  from "@/lib/axios"
import { usePermission } from "@/hooks/usePermission"
import { useRouter } from "next/navigation"

interface User {
  id: string;
  name: string;
  email: string;
  roles: { name: string }[];
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
}

export default function RoleAssignmentPage() {
  const { can } = usePermission()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          axiosInstance.get('/api/admin/users/admins'),
          axiosInstance.get('/api/admin/dropdowns/roles')
        ]);
        
        setUsers(usersResponse.data.data.adminUsers || []);
        setRoles(rolesResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!can('role-assign')) {
      router.push('/dashboard')
    }
  }, [can, router])

  if (!can('role-assign')) {
    return null
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRoleUpdate = async (userId: string) => {
    try {
      const newRole = selectedRoles[userId];
      if (!newRole) return;

      const user = users.find(u => u.id === userId);
      if (!user) return;

      await axiosInstance.patch(`/api/admin/users/${userId}`, {
        name: user.name,
        email: user.email,
        role_name: newRole
      });
      
      // Refresh the users list
      const response = await axiosInstance.get('/api/admin/users/admins');
      setUsers(response.data.data.adminUsers || []);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Role Assignment</h2>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign New Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assign Roles to Users</CardTitle>
          <CardDescription>
            Manage user roles and permissions by assigning appropriate roles to users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>New Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.roles[0]?.name || 'No Role'}</TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => setSelectedRoles(prev => ({ ...prev, [user.id]: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRoleUpdate(user.id)}
                      >
                        Update Role
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}