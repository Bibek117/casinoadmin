import useSWR from "swr";
import axiosInstance from "@/lib/axios";

interface DropdownItem {
  id: string | number;
  name: string;
}

const fetcher = (url: string) =>
  axiosInstance.get(url).then((res) => res.data.data);

const useDropdownData = (endpoint: string) => {
  const { data, error, isLoading } = useSWR<DropdownItem[]>(endpoint, fetcher);

  return {
    data: data || [],
    loading: isLoading,
    error,
  };
};

export default useDropdownData;