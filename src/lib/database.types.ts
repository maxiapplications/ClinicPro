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
      clinic_settings: {
        Row: {
          id: string
          clinic_name: string
          address: string
          phone: string
          email: string
          logo_url: string
          tax_rate: number
          tax_label: string
          currency: string
          invoice_prefix: string
          next_invoice_number: number
          terms_and_conditions: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_name?: string
          address?: string
          phone?: string
          email?: string
          logo_url?: string
          tax_rate?: number
          tax_label?: string
          currency?: string
          invoice_prefix?: string
          next_invoice_number?: number
          terms_and_conditions?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_name?: string
          address?: string
          phone?: string
          email?: string
          logo_url?: string
          tax_rate?: number
          tax_label?: string
          currency?: string
          invoice_prefix?: string
          next_invoice_number?: number
          terms_and_conditions?: string
          created_at?: string
          updated_at?: string
        }
      }
      item_categories: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          name: string
          description: string
          category_id: string | null
          unit_price: number
          sku: string
          is_active: boolean
          track_inventory: boolean
          current_stock: number
          min_stock_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          category_id?: string | null
          unit_price?: number
          sku?: string
          is_active?: boolean
          track_inventory?: boolean
          current_stock?: number
          min_stock_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category_id?: string | null
          unit_price?: number
          sku?: string
          is_active?: boolean
          track_inventory?: boolean
          current_stock?: number
          min_stock_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          patient_number: string
          first_name: string
          last_name: string
          email: string
          phone: string
          address: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_number: string
          first_name: string
          last_name: string
          email?: string
          phone?: string
          address?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_number?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          address?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          patient_id: string | null
          invoice_date: string
          due_date: string | null
          subtotal: number
          tax_amount: number
          discount_amount: number
          total_amount: number
          payment_status: 'paid' | 'pending' | 'partially_paid'
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          patient_id?: string | null
          invoice_date?: string
          due_date?: string | null
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_status?: 'paid' | 'pending' | 'partially_paid'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          patient_id?: string | null
          invoice_date?: string
          due_date?: string | null
          subtotal?: number
          tax_amount?: number
          discount_amount?: number
          total_amount?: number
          payment_status?: 'paid' | 'pending' | 'partially_paid'
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string | null
          item_id: string | null
          item_name: string
          description: string
          quantity: number
          unit_price: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          item_id?: string | null
          item_name: string
          description?: string
          quantity: number
          unit_price: number
          line_total: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string | null
          item_id?: string | null
          item_name?: string
          description?: string
          quantity?: number
          unit_price?: number
          line_total?: number
          created_at?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          item_id: string | null
          transaction_type: 'purchase' | 'usage' | 'adjustment'
          quantity: number
          reference_type: string
          reference_id: string | null
          notes: string
          transaction_date: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id?: string | null
          transaction_type: 'purchase' | 'usage' | 'adjustment'
          quantity: number
          reference_type?: string
          reference_id?: string | null
          notes?: string
          transaction_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string | null
          transaction_type?: 'purchase' | 'usage' | 'adjustment'
          quantity?: number
          reference_type?: string
          reference_id?: string | null
          notes?: string
          transaction_date?: string
          created_at?: string
        }
      }
    }
    Functions: {
      generate_invoice_number: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}
