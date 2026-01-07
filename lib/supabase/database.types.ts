export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          user_id: string
          product_name: string
          craft_category: string
          batch_size: number | null
          labor_hours: number | null
          overhead_percentage: number | null
          target_profit_margin: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_name: string
          craft_category: string
          batch_size?: number | null
          labor_hours?: number | null
          overhead_percentage?: number | null
          target_profit_margin?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_name?: string
          craft_category?: string
          batch_size?: number | null
          labor_hours?: number | null
          overhead_percentage?: number | null
          target_profit_margin?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          product_id: string
          material_name: string
          quantity_per_batch: number
          unit_type: string
          cost_per_unit: number
          supplier_name: string | null
          supplier_link: string | null
          last_price_check: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          material_name: string
          quantity_per_batch: number
          unit_type: string
          cost_per_unit: number
          supplier_name?: string | null
          supplier_link?: string | null
          last_price_check?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          material_name?: string
          quantity_per_batch?: number
          unit_type?: string
          cost_per_unit?: number
          supplier_name?: string | null
          supplier_link?: string | null
          last_price_check?: string | null
          created_at?: string
        }
      }
      price_check_history: {
        Row: {
          id: string
          material_id: string
          check_date: string
          found_better_price: boolean
          suggested_supplier: string | null
          suggested_price: number | null
          potential_savings: number | null
          user_action: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          material_id: string
          check_date?: string
          found_better_price?: boolean
          suggested_supplier?: string | null
          suggested_price?: number | null
          potential_savings?: number | null
          user_action?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          material_id?: string
          check_date?: string
          found_better_price?: boolean
          suggested_supplier?: string | null
          suggested_price?: number | null
          potential_savings?: number | null
          user_action?: string | null
          notes?: string | null
        }
      }
      calculations: {
        Row: {
          id: string
          user_id: string
          product_id: string | null
          quantity_to_make: number | null
          total_material_cost: number | null
          total_labor_cost: number | null
          minimum_retail_price: number | null
          marketplace_fees: number | null
          net_profit: number | null
          ai_suggestion: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id?: string | null
          quantity_to_make?: number | null
          total_material_cost?: number | null
          total_labor_cost?: number | null
          minimum_retail_price?: number | null
          marketplace_fees?: number | null
          net_profit?: number | null
          ai_suggestion?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string | null
          quantity_to_make?: number | null
          total_material_cost?: number | null
          total_labor_cost?: number | null
          minimum_retail_price?: number | null
          marketplace_fees?: number | null
          net_profit?: number | null
          ai_suggestion?: Json | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}