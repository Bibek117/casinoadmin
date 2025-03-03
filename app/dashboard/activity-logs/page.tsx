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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface Activity {
  id: number;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: number;
  causer_type: string;
  causer_id: number;
  properties: any;
  created_at: string;
  causer?: {
    id: number;
    name: string;
    email: string;
  };
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ActivityResponse {
  data: Activity[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationData;
}

export default function ActivityLogsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filters, setFilters] = useState({
    log_name: "",
    from_date: "",
    to_date: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [showClearDialog, setShowClearDialog] = useState(false);

  const fetchActivityLogs = async (page: number = 1) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.log_name && filters.log_name !== 'all') {
        queryParams.append("log_name", filters.log_name);
      }
      if (filters.from_date) queryParams.append("from_date", filters.from_date);
      if (filters.to_date) queryParams.append("to_date", filters.to_date);
      queryParams.append("page", page.toString());

      const response = await axiosInstance.get<{data: { activities: ActivityResponse }}>(
        `/api/admin/activity-logs?${queryParams.toString()}`
      );
      
      setActivities(response.data.data.activities.data);
      setPagination(response.data.data.activities.meta);
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
      if (error.response?.status === 401) {
        router.push("/login");
      }
    }
  };

  const handleClearLogs = async () => {
    try {
      await axiosInstance.delete("/api/admin/activity-logs/clear");
      setShowClearDialog(false);
      fetchActivityLogs(1);
    } catch (error) {
      console.error("Error clearing activity logs:", error);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchActivityLogs(currentPage);
  }, [user, router, filters, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Activity Logs</h2>
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              Clear All Logs
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex gap-2 items-center text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Clear All Activity Logs
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete all activity logs from the database.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to clear all activity logs? All history of user actions and system changes will be permanently removed.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearLogs}
              >
                Clear All Logs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter activity logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Log Type</Label>
            <Select
              onValueChange={(value) =>
                setFilters({ ...filters, log_name: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select log type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="banners">Banners</SelectItem>
                <SelectItem value="banner_groups">Banner Groups</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>From Date</Label>
            <Input
              type="date"
              value={filters.from_date}
              onChange={(e) =>
                setFilters({ ...filters, from_date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>To Date</Label>
            <Input
              type="date"
              value={filters.to_date}
              onChange={(e) =>
                setFilters({ ...filters, to_date: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {activity.description}
                  </CardTitle>
                  <CardDescription>
                    {activity.log_name} - {activity.subject_type.split('\\').pop()} #{activity.subject_id}
                  </CardDescription>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(activity.created_at), "PPpp")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  By: {activity.causer?.name || "System"}
                </div>
                {activity.properties && Object.keys(activity.properties).length > 0 && (
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(activity.properties, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activities.length > 0 && pagination && (
        <>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {Array.from({ length: 3 }, (_, i) => currentPage + i - 1)
                .filter(page => page > 0 && page <= pagination.last_page)
                .map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {currentPage < pagination.last_page - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {currentPage < pagination.last_page - 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(pagination.last_page)}>
                    {pagination.last_page}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  aria-disabled={currentPage === pagination.last_page}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="text-sm text-muted-foreground text-center">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
            {pagination.total} entries
          </div>
        </>
      )}
    </div>
  );
}
