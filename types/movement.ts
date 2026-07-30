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