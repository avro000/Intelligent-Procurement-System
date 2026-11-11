export type Role = 'REQUESTER' | 'EMPLOYEE' | 'SUPERVISOR' | 'PURCHASING_AGENT' | 'FINANCE_APPROVER' | 'VENDOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department_id?: string | null;
  department_name?: string | null;
  vendor_id?: string | null;
  vendor_name?: string | null;
  is_active?: boolean;
}

export interface Item {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  category?: string;
  unit?: string;
  unit_price?: number;
  available_quantity?: number;
  lead_time_days?: number;
  is_active?: boolean;
}

export interface InventoryAnalysis {
  item_id?: string;
  requested_quantity: number;
  available_quantity: number;
  shortage_quantity: number;
  coverage_status: 'SUFFICIENT' | 'INSUFFICIENT' | 'PARTIAL' | 'DEFICIENT' | string;
  recommended_action?: string;
  surplus_or_deficit?: number;
}

export interface DuplicateMatch {
  id?: string;
  existing_pr_id?: string;
  reference_number?: string;
  existing_reference_number?: string;
  requester_name?: string;
  department_name?: string;
  item_name?: string;
  existing_quantity?: number;
  requested_quantity?: number;
  created_at?: string;
  request_date?: string;
  status: string;
  quantity_similarity_percent?: number;
  difference_percentage?: number;
  selected_vendor_name?: string | null;
}

export interface VendorBadge {
  badge_type: string;
  description?: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_active?: boolean;
  badges?: string[];
  overall_score?: number;
}

export interface VendorRecommendation {
  vendor_id: string;
  vendor_name: string;
  overall_score: number;
  rank: number;
  badges: string[];
  factor_breakdown: {
    quality: number;
    delivery_reliability: number;
    price_competitiveness: number;
    item_specific_fit: number;
    historical_fulfillment: number;
    responsiveness: number;
  };
}

export interface RAGVendorRecommendation {
  vendor_id: string;
  vendor_name: string;
  rank: number;
  recommendation_status: 'RECOMMENDED' | 'ACCEPTABLE' | 'CAUTION' | string;
  evidence_confidence: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  reasoning_summary: string;
  key_strengths: string[];
  potential_risks: string[];
  avg_quality_rating?: number;
  avg_delivery_rating?: number;
  avg_responsiveness_rating?: number;
  avg_price_rating?: number;
  trend_direction?: string;
  review_count: number;
  review_insights?: string[];
  final_recommendation_score: number;
  analytical_score: number;
  badges: string[];
  source: string;
}

export interface RecommendationSnapshot {
  id?: string;
  purchase_request_id?: string;
  version?: number;
  item_id?: string;
  item_name?: string;
  category?: string;
  quantity?: number;
  recommended_vendor_id?: string;
  recommended_vendor_name?: string;
  all_candidates: RAGVendorRecommendation[];
  evidence_confidence?: string;
  reasoning_summary?: string;
  key_strengths: string[];
  potential_risks: string[];
  avg_quality_rating?: number;
  avg_delivery_rating?: number;
  avg_price_rating?: number;
  trend_direction?: string;
  review_count?: number;
  final_recommendation_score: number;
  analytical_score: number;
  source?: string;
  is_stale?: boolean;
  triggered_by?: string;
  created_at?: string;
}

export interface PurchaseRequestReview {
  id: string;
  supervisor_id: string;
  supervisor_name: string;
  decision: string;
  reason?: string;
  created_at: string;
}

export interface PurchaseRequest {
  id: string;
  reference_number: string;
  pr_number?: string;
  requester_id: string;
  requester_name?: string;
  department_id?: string;
  department_name?: string;
  selected_vendor_id?: string | null;
  selected_vendor_name?: string | null;
  item_id?: string;
  item_name?: string;
  item_unit?: string;
  quantity: number;
  status: string;
  notes?: string;
  duplicate_acknowledged?: boolean;
  created_at: string;
  updated_at?: string;
  inventory_analysis?: InventoryAnalysis;
  duplicate_matches?: DuplicateMatch[];
  vendor_recommendation?: VendorRecommendation;
  reviews?: PurchaseRequestReview[];
}

export interface RFQ {
  id: string;
  reference_number: string;
  purchase_request_id: string;
  pr_reference: string;
  item_name: string;
  item_unit: string;
  quantity: number;
  vendor_id: string;
  vendor_name: string;
  status: string;
  issued_at: string;
  due_at?: string | null;
  has_quotation?: boolean;
  quotation?: Quotation | null;
}

export interface Quotation {
  id: string;
  rfq_id: string;
  vendor_id: string;
  vendor_name: string;
  quoted_unit_price: number;
  total_price: number;
  lead_time_days: number;
  expected_delivery_date?: string | null;
  validity_period?: string | null;
  notes?: string | null;
  submitted_at: string;
}

export interface QuotationEvaluationItem {
  rank: number;
  vendor_id: string;
  vendor_name: string;
  quoted_unit_price: number;
  total_price: number;
  lead_time_days: number;
  expected_delivery_date?: string | null;
  price_score: number;
  lead_time_score?: number;
  delivery_date_score?: number;
  delivery_score?: number;
  reliability_score: number;
  quality_score: number;
  final_weighted_score: number;
  is_recommended: boolean;
  is_expired?: boolean;
  vendor_badges: string[];
}

export interface QuotationAnalysis {
  purchase_request_id: string;
  pr_reference: string;
  evaluations: QuotationEvaluationItem[];
  recommended_vendor_id?: string | null;
  recommended_vendor_name?: string | null;
  total_rfqs?: number;
  submitted_quotes_count?: number;
  all_quotes_received?: boolean;
  has_valid_quotes?: boolean;
  deadline_passed?: boolean;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  purchase_request_id: string;
  pr_reference: string;
  vendor_id: string;
  vendor_name: string;
  vendor_email?: string;
  item_name: string;
  quantity: number;
  item_unit: string;
  unit_price: number;
  approved_amount: number;
  total_amount?: number;
  status: string;
  pdf_url?: string | null;
  pdf_path?: string | null;
  generated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type?: string;
  created_at: string;
}

export interface DBTableInfo {
  name: string;
  row_count: number;
  columns?: any[];
}

export interface DBTableData {
  table_name: string;
  columns: { name: string; type: string; pk: boolean; notnull: boolean; dflt_value: any }[];
  primary_key: string;
  total_count: number;
  records: Record<string, any>[];
}

export interface SQLQueryResult {
  type: 'SELECT' | 'MUTATION';
  columns?: string[];
  rows?: Record<string, any>[];
  results?: Record<string, any>[];
  row_count?: number;
  message?: string;
}
