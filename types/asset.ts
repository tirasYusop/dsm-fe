export interface Transaction {
  type: string;
  date: string;
  end_date?: string | null;
  quantity: number;
  notes: string;
  photo_before?: string | null;
  photo_after?: string | null;
  photo?: string | null;
};

export interface EditForm {
  name_brand: string;
  purchase_date: string;
  warranty: string;
  price: string;
  quantity: string;
  source_type: string;
  location: string;
};

export interface OverviewAsset {
  id: number;
  name_brand: string;
  purchase_date: string;
  original_location: string | null;
  status: string;
  status_display: string;
  quantity: number;
  available_quantity: number;
  in_maintenance_quantity: number;
  disposed_quantity: number;
  image: string | null;
  transactions: Transaction[];
};

export interface AssetOption {
  id: number;
  name_brand: string;
};

export interface Asset {
  id: number;
  name_brand: string;
  location_name: string | null;
  available_quantity: number;
};

export interface OngoingMaintenance {
  id: number;
  asset: number;
  asset_name: string;
  quantity: number;
  start_date: string;
  notes: string;
  photo_before: string | null;
};
