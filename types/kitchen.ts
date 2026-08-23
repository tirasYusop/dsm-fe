export interface Slot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  available_capacity: number;
  status: string;
};

export interface Kitchen {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  location : string;
  status?: "active" | "maintenance" | "closed";
  status_note?: string;
}
export interface Participant {
  id:number;
  name:string;
  student_id:string;
  faculty:string;
  is_owner:boolean;
};

export interface Booking {
  id: number;
  student: number;
  student_name: string;
  slot: number;
  slot_detail: {
    id: number;
    kitchen: number;
    kitchen_name: string;
    date: string;
    start_time: string;
    end_time: string;
    max_capacity: number;
    current_booking: number;
    available_capacity: number;
    status: string;
  };
  slot_date: string;
  start_time: string;
  end_time: string;
  number_of_people: number;
  purpose: string;
  status: string;
  attended: boolean;
  created_at: string;
  is_passed: boolean;
  display_status: "confirmed" | "attended" | "expired" | "cancelled";
  kitchen_name: string;
  participants: Participant[];
};

export interface StorageLog {
  id: number;
  item_name: string;
  student_name: string;
  student_email: string;
  kitchen: number;
  kitchen_name: string;
  date_stored: string;
  proof_image: string | null;
  status: "stored" | "removed" | "expired";
  expiry_date: string;
  days_left: number;
  is_past_limit: boolean;
  created_at: string;
};

export interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  volunteer_stock: number;
  status: string;
  last_reported_quantity: number | null;
};

export interface UsageRecord{
  id: number;
  item_name: string;
  quantity: number;
  usage_unit: string;
  created_at: string;
};

export interface UsageEntry {
  quantity: number;
  unit: string;
};

export interface RequestItem{
  id: number;
  item: number | null;
  item_name: string | null;
  new_item_name: string | null;
  quantity: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
  kitchen_name: string | null;
  new_item_unit: string;
  new_item_package_size: string;
};

export interface VolunteerProfile  {
  id: number;
  name: string;
  matrik_no: string;
  phone_number: string;
  faculty: string;
  kitchen: number;
  kolej: string;
  kitchen_name: string;
};

export interface Shift {
  id: number;
  volunteer: number;
  volunteer_name: string;
  kitchen_name: string;
  clock_in: string;
  clock_out: string | null;
  notes: string;
  duration_minutes: number;
  is_active: boolean;
  auto_clocked_out:boolean;
};

export interface Request {
    id: number;
    item: number | null;
    item_name: string;
    new_item_name: string | null;
    quantity: number;
    reason: string;
    status: string;
    kitchen_name: string | null;
    new_item_unit: string;
    new_item_package_size: string;
};

export interface ItemInfo {
    name: string;
    unit: string;
    price_per_unit: number | null;
    management_stock: number;
};

export interface GroupedRequests {
    kitchen_name: string;
    requests: Request[];
};

export interface StockCheck {
    isNew: boolean;
    hasEnough: boolean;
    currentStock: number;
};

export type SlotType = "food_prep" | "customer_service";

export interface ShiftSlot {
  id: number;
  kitchen: number;
  name: string;
  slot_type: SlotType;
  start_time: string; // "07:00:00"
  end_time: string;
  capacity: number;
}

export interface ScheduledShift {
  id: number;
  slot: number;
  slot_name: string;
  volunteer: number;
  volunteer_name: string;
  date: string; // "2026-07-27"
}

export interface DaySlot {
  slot: ShiftSlot;
  assigned: ScheduledShift[];
  open_spots: number;
}

export interface WeekDay {
  date: string;
  slots: DaySlot[];
}

type ReportStatus = "open" | "in_progress" | "resolved";

export interface StatusUpdate {
  id: number;
  status: ReportStatus;
  status_display: string;
  notes: string;
  updated_by_name: string | null;
  created_at: string;
}

export interface Report {
  id: number;
  title: string;
  description: string;
  category_display: string;
  severity: "low" | "medium" | "high";
  severity_display: string;
  status: ReportStatus;
  status_display: string;
  reporter_name: string;
  reported_by_name: string | null;
  kitchen_name: string;
  asset_name: string | null;
  photo_url: string | null;
  resolution_notes: string;
  status_history: StatusUpdate[];
  created_at: string;
}