export interface Item  {
  id: number;
  name: string;
  display_name: string;
  unit: string;
  package_size: string | null;
  price_per_unit: string | null;
};

export interface Source {
  value: string;
  label: string;
};

export interface StockMovementSubmitData {
  quantity: number;
  kitchenId?: number;
  isFoodbank?: boolean;
  unitPrice?: number;
  remarks: string;
  image: File | null;
};

export interface  SourceStock  {
  id: number;
  item: number;
  item_name: string;
  source: string;
  total_received: number;
  latest_added: number;
  last_updated: string | null;
  price_per_unit: string;
};

export interface  KitchenStock  {
  kitchen_id: number;
  kitchen_name: string;
  stock: number;
  status: string;
};

export interface  ItemWithStock  {
  id: number;
  name: string;
  unit: string;
  management_stock: number;
  kitchens: KitchenStock[];
};