import { useQuery } from "@tanstack/react-query";
import {
  fetchFinancialAnalytics,
  fetchInventoryAnalytics,
  fetchProjectsAnalytics,
  fetchRecentActivity,
  fetchDashboardSummary,
} from "@/api/statistics";

export const useFinancialAnalytics = () => {
  return useQuery({
    queryKey: ["financial-analytics"],
    queryFn: fetchFinancialAnalytics,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useInventoryAnalytics = () => {
  return useQuery({
    queryKey: ["inventory-analytics"],
    queryFn: fetchInventoryAnalytics,
    staleTime: 1000 * 60 * 5,
  });
};

export const useProjectsAnalytics = () => {
  return useQuery({
    queryKey: ["projects-analytics"],
    queryFn: fetchProjectsAnalytics,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: fetchRecentActivity,
    staleTime: 1000 * 60 * 2, // 2 minutes for recent activity
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
    staleTime: 1000 * 60 * 5,
  });
};
