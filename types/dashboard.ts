export interface DashboardData{
  summary: {
    total_inventory_items: number;
    low_stock_items: number;
    pending_requests: number;
    today_usage: number;
  };
  recent_usage: {
    id: number;
    item: string;
    quantity: number;
    unit: string;
    reason: string;
    date: string;
  }[];
  pending_requests: {
    id: number;
    item: string;
    quantity: number;
    status: "pending" | "approved" | "rejected" | "cancelled";
    created_at: string;
  }[];
};