"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import axiosInstance from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/types/types";
import { useToast } from "@/hooks/use-toast";
import useDropdownData from "@/hooks/useDropdownData";

//const roles = ["super-admin"]; //fectch later
const fetchFnc = () =>
  axiosInstance
    .get("api/admin/users/admins")
    .then((res) => res.data.data.adminUsers);

export default function AdminPage() {
  const {
    data: users = [],
    error,
    isLoading,
  } = useSWR<User[]>("api/admin/users/admins", fetchFnc, {
    dedupingInterval: 0,
    revalidateOnMount: true,
  });
  const {
    data: roles,
    loading,
    error: dropDownErr,
  } = useDropdownData("api/admin/dropdowns/roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role_name: "", // Role will be set from dropdown
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { toast } = useToast();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role_name: "" });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setErrors({});
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role_name: user?.roles[0]?.name,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      let res = await axiosInstance.delete(`api/admin/users/${userId}`);
      mutate("api/admin/users/admins");
      toast({
        title: "Success",
        description: res.data.message,
      });
    } catch (error: any) {
      toast({
        title: "error",
        description: error?.response.data.message,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editingUser) {
        await axiosInstance.patch(
          `api/admin/users/${editingUser.id}`,
          formData
        );
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        await axiosInstance.post("api/admin/users", formData);
        toast({
          title: "Success",
          description: "User added successfully",
        });
      }
      mutate("api/admin/users/admins");
      setIsDialogOpen(false);
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error saving user:", error);
      }
    }
  };
  if (isLoading) <div>Loading</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Admin Users</h2>
        <Button onClick={handleAddUser}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {" "}
                  {user?.roles?.[0]?.name || "No Role Assigned"}
                </TableCell>
                {/* <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    }`}
                  >
                    {user.status}
                  </div>
                </TableCell> */}
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Edit user details below."
                : "Add new admin user to the system."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                {errors.name && (
                  <p className="text-sm text-red-500">
                    {errors.name.join(", ")}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {errors.email && (
                  <p className="text-sm text-red-500">
                    {errors.email.join(", ")}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role_name}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role_name: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_name && (
                  <p className="text-sm text-red-500">
                    {errors.role_name.join(", ")}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingUser ? "Save Changes" : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
