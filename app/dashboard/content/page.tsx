"use client";

import { useState } from "react";
import Image from "next/image";
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

interface Banner {
  id: string;
  title: string;
  status: "Active" | "Inactive";
  sections: {
    header: string;
    description: string;
    image?: string;
  }[];
}

const initialBanners: Banner[] = [];

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [newBanner, setNewBanner] = useState<{
    title: string;
    status: "Active" | "Inactive";
  }>({
    title: "",
    status: "Active",
  });

  const [sections, setSections] = useState<
    { header: string; description: string; image?: string }[]
  >([{ header: "", description: "", image: undefined }]);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "create">("posts");
  const handleAddSection = () => {
    setSections([
      ...sections,
      { header: "", description: "", image: undefined },
    ]);
  };
  const handleSectionChange = (
    index: number,
    field: keyof (typeof sections)[0],
    value: string
  ) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };
  const handleImageChange = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const updatedSections = [...sections];
      updatedSections[index].image = event.target?.result as string;
      setSections(updatedSections);
    };
    reader.readAsDataURL(file);
  };
  const handleSubmitBanner = () => {
    if (!newBanner.title) {
      alert("Please enter a banner title.");
      return;
    }
    const newBannerData: Banner = {
      id: editingBanner ? editingBanner.id : String(banners.length + 1),
      title: newBanner.title,
      status: newBanner.status,
      sections: sections,
    };
    if (editingBanner) {
      setBanners(
        banners.map((banner) =>
          banner.id === editingBanner.id ? newBannerData : banner
        )
      );
      setEditingBanner(null); 
    } else {
      setBanners([...banners, newBannerData]);
    }
    setNewBanner({ title: "", status: "Active" });
    setSections([{ header: "", description: "", image: undefined }]); 
    setActiveTab("posts"); 
  };
  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setNewBanner({ title: banner.title, status: banner.status });
    setSections(banner.sections);
    setActiveTab("create"); 
  };
  const handleDeleteBanner = (bannerId: string) => {
    setBanners(banners.filter((banner) => banner.id !== bannerId));
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as "posts" | "create")}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Banners Management
        </h2>
        <TabsList>
          <TabsTrigger value="posts">Banners</TabsTrigger>
          <TabsTrigger value="create">
            {editingBanner ? "Edit Banner" : "Add new"}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="posts" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <Card key={banner.id}>
              <CardHeader>
                <CardTitle>{banner.title}</CardTitle>
                <CardDescription>Status: {banner.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {banner.sections.map((section, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <h3 className="font-semibold">{section.header}</h3>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                      {section.image && (
                        <div className="mt-2">
                          <Image
                            src={section.image}
                            alt="Section"
                            width={500}
                            height={300}
                            className="rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditBanner(banner)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBanner(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="create" className="space-y-2">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBanner ? "Edit Banner" : "Add New Banner"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>Banner Title</Label>
            <Input
              value={newBanner.title}
              onChange={(e) =>
                setNewBanner({ ...newBanner, title: e.target.value })
              }
              placeholder="Enter banner title"
            />
            <Label>Status</Label>
            <select
              value={newBanner.status}
              onChange={(e) =>
                setNewBanner({
                  ...newBanner,
                  status: e.target.value as "Active" | "Inactive",
                })
              }
              className="block w-full border p-2"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="space-y-4">
              {sections.map((section, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <Label>Section {index + 1}</Label>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label>Header</Label>
                      <Input
                        value={section.header}
                        onChange={(e) =>
                          handleSectionChange(index, "header", e.target.value)
                        }
                        placeholder="Enter section header"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Description</Label>
                      <Input
                        value={section.description}
                        onChange={(e) =>
                          handleSectionChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Enter section description"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageChange(index, file);
                          }
                        }}
                      />
                    </div>
                    {section.image && (
                      <div className="mt-2">
                        <Image
                          src={section.image}
                          alt="Section"
                          width={500}
                          height={300}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-5">
              {sections.length > 0 && (
                <Button onClick={handleAddSection} className="w-40">
                  Add Section
                </Button>
              )}
              <Button onClick={handleSubmitBanner} className="w-40">
                {editingBanner ? "Update Banner" : "Submit Banner"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
