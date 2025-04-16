"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

interface FeatureBanner {
  heading: string;
  text: string;
  is_active: boolean;
}

export default function FeatureBannerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { can } = usePermission();
  const [isLoading, setIsLoading] = useState(false);
  const [banner, setBanner] = useState<FeatureBanner>({
    heading: "",
    text: "",
    is_active: true // Keep this as true by default
  });

  // Memoize the permission check
  const canUpdateBanner = useMemo(() => can('banner-update'), [can]);

  const fetchFeatureBanner = async () => {
    console.log('Fetching banner...'); // Debug log
    try {
      const response = await axiosInstance.get('/api/cta-banner');
      const settings = response.data;
      setBanner({
        heading: settings.heading,
        text: settings.text,
        is_active: true // Always set to true
      });
    } catch (error) {
      console.error('Error fetching feature banner:', error);
      toast.error('Failed to load feature banner');
    }
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.patch('/api/admin/cta-banner', {
        ...banner,
        is_active: true // Always send as true
      });
      toast.success('Feature banner updated successfully');
      await fetchFeatureBanner();
    } catch (error) {
      console.error('Error updating feature banner:', error);
      toast.error('Failed to update feature banner');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Effect running...', { user, can: canUpdateBanner }); // Debug log
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!canUpdateBanner) {
      router.push('/dashboard');
      return;
    }

    fetchFeatureBanner();
  }, [user, router, canUpdateBanner]); // Use memoized value instead

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Feature Banner</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Feature Banner</CardTitle>
          <CardDescription>
            Manage the content of the feature banner that appears on the casino site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="heading">Heading</Label>
            <Input
              id="heading"
              value={banner.heading}
              onChange={(e) => setBanner({
                ...banner,
                heading: e.target.value
              })}
              placeholder="Enter banner heading"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
              value={banner.text}
              onChange={(e) => setBanner({
                ...banner,
                text: e.target.value
              })}
              placeholder="Enter banner text content"
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleUpdate} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Feature Banner'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
