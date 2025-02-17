"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import Image from "next/image";
import { Switch } from "@/components/ui/switch"

interface BannerGroup {
  id: string;
  name: string;
  is_active: boolean;
}

interface Section {
  title: string;
  description: string;
  image: File | null;
  imagePreview: string | undefined;
}

export default function BannerGroupsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [bannerGroups, setBannerGroups] = useState<BannerGroup[]>([]);
  const [newBannerGroup, setNewBannerGroup] = useState<{
    name: string;
    is_active: boolean;
    sections: Section[];
  }>({
    name: "",
    is_active: false,
    sections: [{ title: "", description: "", image: null, imagePreview: undefined }]
  });
  const [activeTab, setActiveTab] = useState("list");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasActiveBannerGroup, setHasActiveBannerGroup] = useState(false);

  const fetchBannerGroups = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/banner-groups');
      setBannerGroups(response.data.banner_groups);
      setHasActiveBannerGroup(response.data.banner_groups.some((group: BannerGroup) => group.is_active));
    } catch (error: any) {
      console.error('Error fetching banner groups:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  };

  const handleImageChange = (index: number, file: File | null) => {
    const updatedSections = [...newBannerGroup.sections];
    updatedSections[index].image = file;
    updatedSections[index].imagePreview = file ? URL.createObjectURL(file) : undefined;
    setNewBannerGroup({
      ...newBannerGroup,
      sections: updatedSections
    });
  };

  const handleCreateBannerGroup = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newBannerGroup.name);
      formData.append('is_active', (!isEditing && hasActiveBannerGroup) ? '0' : newBannerGroup.is_active ? '1' : '0');
      
      newBannerGroup.sections.forEach((section, index) => {
        formData.append(`sections[${index}][title]`, section.title);
        formData.append(`sections[${index}][description]`, section.description);
        
        if (section.image) {
          // New file upload
          formData.append(`sections[${index}][image]`, section.image);
        } else if (section.imagePreview) {
          // Keep existing image path (strip the domain if present)
          const imagePath = section.imagePreview.replace(process.env.NEXT_PUBLIC_BACKEND_URL || '', '');
          formData.append(`sections[${index}][image_url]`, imagePath);
        }
      });

      if (isEditing && editingId) {
        formData.append('_method', 'PUT');
        await axiosInstance.post(`/api/admin/banner-groups/${editingId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axiosInstance.post('/api/admin/banner-groups', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      await fetchBannerGroups();
      setNewBannerGroup({
        name: "",
        is_active: false,
        sections: [{ title: "", description: "", image: null, imagePreview: undefined }]
      });
      setIsEditing(false);
      setEditingId(null);
      setActiveTab("list");
    } catch (error) {
      console.error('Error creating/updating banner group:', error);
    }
  };

  const handleDeleteBannerGroup = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/api/admin/banner-groups/${id}`);
        if (response.data.error) {
            // You might want to show this message to the user with a toast or alert
            console.error(response.data.message);
            return;
        }
        setBannerGroups(prevGroups => prevGroups.filter(group => group.id !== id));
    } catch (error: any) {
        console.error('Error deleting banner group:', error);
        // You might want to show this error to the user
        if (error.response?.data?.message) {
            console.error(error.response.data.message);
        }
    }
  };

  const handleEditClick = async (groupId: string) => {
    try {
      const response = await axiosInstance.get(`/api/admin/banner-groups/${groupId}`);
      const bannerGroup = response.data.banner_group;
      
      if (!bannerGroup || !bannerGroup.banners) {
        console.error('Invalid banner group data received');
        return;
      }
      
      setNewBannerGroup({
        name: bannerGroup.name,
        is_active: bannerGroup.is_active,
        sections: bannerGroup.banners.map((banner: any) => ({
          title: banner.title,
          description: banner.description,
          image: null,
          imagePreview: banner.image_url ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${banner.image_url}` : undefined
        }))
      });
      
      setEditingId(groupId);
      setIsEditing(true);
      setActiveTab("create");
    } catch (error) {
      console.error('Error fetching banner group:', error);
    }
  };

  const handleToggleActive = async (groupId: string) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/banner-groups/${groupId}/toggle-active`);
      setBannerGroups(response.data.banner_groups);
    } catch (error: any) {
      console.error('Error toggling banner group:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      }
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBannerGroups();
  }, [user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Banner Groups</h2>
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="create">{isEditing ? 'Edit' : 'Create New'}</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="list" className="space-y-4">
        {bannerGroups.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Banner Groups</CardTitle>
              <CardDescription>
                There are no banner groups created yet. Use the "Create New" tab to add one.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bannerGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{group.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={group.is_active}
                        onCheckedChange={() => handleToggleActive(group.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {group.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(group.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBannerGroup(group.id)}
                      disabled={group.is_active}
                      title={group.is_active ? "Deactivate banner group before deleting" : "Delete banner group"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Banner Group' : 'Create New Banner Group'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={newBannerGroup.name}
                onChange={(e) => setNewBannerGroup({
                  ...newBannerGroup,
                  name: e.target.value
                })}
                placeholder="Enter banner group name"
              />
            </div>
            
            <div className="space-y-2">
              {(!hasActiveBannerGroup && !isEditing) && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newBannerGroup.is_active}
                      onCheckedChange={(checked) => setNewBannerGroup({
                        ...newBannerGroup,
                        is_active: checked
                      })}
                    />
                    <span>Active</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Sections</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewBannerGroup({
                    ...newBannerGroup,
                    sections: [...newBannerGroup.sections, { title: "", description: "", image: null, imagePreview: undefined }]
                  })}
                >
                  Add Section
                </Button>
              </div>
              
              {newBannerGroup.sections.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm">Section {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={section.title}
                        onChange={(e) => {
                          const updatedSections = [...newBannerGroup.sections];
                          updatedSections[index].title = e.target.value;
                          setNewBannerGroup({
                            ...newBannerGroup,
                            sections: updatedSections
                          });
                        }}
                        placeholder="Enter section title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={section.description}
                        onChange={(e) => {
                          const updatedSections = [...newBannerGroup.sections];
                          updatedSections[index].description = e.target.value;
                          setNewBannerGroup({
                            ...newBannerGroup,
                            sections: updatedSections
                          });
                        }}
                        placeholder="Enter section description"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Image</Label>
                      <div className="space-y-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleImageChange(index, file);
                          }}
                        />
                        {section.imagePreview && (
                          <div className="relative w-full h-40">
                            <Image
                              src={section.imagePreview}
                              alt="Preview"
                              fill
                              className="object-contain rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {newBannerGroup.sections.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          const updatedSections = newBannerGroup.sections.filter((_, i) => i !== index);
                          setNewBannerGroup({
                            ...newBannerGroup,
                            sections: updatedSections
                          });
                        }}
                      >
                        Remove Section
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={handleCreateBannerGroup} className="w-full">
              {isEditing ? 'Update Banner Group' : 'Create Banner Group'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
