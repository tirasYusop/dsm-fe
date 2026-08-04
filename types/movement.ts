export interface Movement {
  id: number;
  item_name: string;
  movement_type: string;
  quantity: number;
  source: string;
  reason: string;
  remarks?: string;
  purpose?: string;
  kitchen_name?: string;
  display_name: string;
  created_at: string;
  unit_price?: number;
  total_amount?: number;
  proof_image?: string;
  destination?: string;
}

export interface DashboardSummary {
  totalItems: number;
  pendingRequests: number;
  inventoryInToday: number;
  inventoryOutToday: number;
  attendanceToday: number;
  totalKitchens: number;
  totalStudents: number;
  totalWalkin: number;
  totalBooking: number;
};

export interface  SourceSummary {
  source: string;
  total_quantity: number;
  item_count: number;
  total_amount: number;
};

export interface BookingStatusBreakdown {
  confirm: number;
  checkin: number;
  cancelled: number;
};

export interface StorageLike {
  status: "stored" | "removed" | "expired";
  days_left: number;
  is_past_limit: boolean;
};
