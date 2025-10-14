/*
  # Clinic Accounting System - Complete Database Schema

  ## Overview
  This migration creates the complete database schema for a comprehensive clinic accounting and inventory management system.

  ## New Tables

  ### 1. clinic_settings
  Stores clinic information and system preferences
  - `id` (uuid, primary key) - Unique identifier
  - `clinic_name` (text) - Name of the clinic
  - `address` (text) - Physical address
  - `phone` (text) - Contact phone number
  - `email` (text) - Contact email
  - `logo_url` (text) - URL to clinic logo
  - `tax_rate` (numeric) - Default tax rate percentage
  - `tax_label` (text) - Tax label (e.g., "VAT", "GST")
  - `currency` (text) - Currency code (e.g., "USD", "EUR")
  - `invoice_prefix` (text) - Prefix for invoice numbers
  - `next_invoice_number` (integer) - Next invoice number sequence
  - `terms_and_conditions` (text) - Default invoice terms
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. item_categories
  Organizes items into categories
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Category name
  - `description` (text) - Category description
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. items
  Medical supplies, equipment, and services catalog
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Item name
  - `description` (text) - Item description
  - `category_id` (uuid, foreign key) - Reference to category
  - `unit_price` (numeric) - Price per unit
  - `sku` (text) - Stock keeping unit code
  - `is_active` (boolean) - Whether item is active
  - `track_inventory` (boolean) - Whether to track stock levels
  - `current_stock` (integer) - Current quantity in stock
  - `min_stock_level` (integer) - Minimum stock alert threshold
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. patients
  Patient information and contact details
  - `id` (uuid, primary key) - Unique identifier
  - `patient_number` (text) - Unique patient identifier
  - `first_name` (text) - Patient first name
  - `last_name` (text) - Patient last name
  - `email` (text) - Patient email
  - `phone` (text) - Patient phone
  - `address` (text) - Patient address
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. invoices
  Patient billing records
  - `id` (uuid, primary key) - Unique identifier
  - `invoice_number` (text) - Formatted invoice number
  - `patient_id` (uuid, foreign key) - Reference to patient
  - `invoice_date` (date) - Date of invoice
  - `due_date` (date) - Payment due date
  - `subtotal` (numeric) - Subtotal before tax
  - `tax_amount` (numeric) - Tax amount
  - `discount_amount` (numeric) - Discount applied
  - `total_amount` (numeric) - Final total amount
  - `payment_status` (text) - Status: "paid", "pending", "partially_paid"
  - `notes` (text) - Invoice notes
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. invoice_items
  Line items for each invoice
  - `id` (uuid, primary key) - Unique identifier
  - `invoice_id` (uuid, foreign key) - Reference to invoice
  - `item_id` (uuid, foreign key) - Reference to item
  - `item_name` (text) - Snapshot of item name
  - `description` (text) - Item description
  - `quantity` (numeric) - Quantity used
  - `unit_price` (numeric) - Price per unit at time of invoice
  - `line_total` (numeric) - Total for this line item
  - `created_at` (timestamptz) - Record creation timestamp

  ### 7. inventory_transactions
  Tracks all inventory movements
  - `id` (uuid, primary key) - Unique identifier
  - `item_id` (uuid, foreign key) - Reference to item
  - `transaction_type` (text) - Type: "purchase", "usage", "adjustment"
  - `quantity` (integer) - Quantity (positive for additions, negative for reductions)
  - `reference_type` (text) - Reference type (e.g., "invoice", "manual")
  - `reference_id` (uuid) - Reference to related record
  - `notes` (text) - Transaction notes
  - `transaction_date` (timestamptz) - Date of transaction
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for authenticated access to all tables
  - Policies allow full CRUD operations for authenticated users

  ## Indexes
  - Add indexes on foreign keys for better query performance
  - Add index on invoice_number for fast lookups
  - Add index on patient_number for fast patient searches

  ## Functions
  - Create function to auto-generate next invoice number
  - Create function to update inventory stock levels
*/

-- Create clinic_settings table
CREATE TABLE IF NOT EXISTS clinic_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL DEFAULT '',
  address text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  logo_url text DEFAULT '',
  tax_rate numeric(5,2) DEFAULT 0.00,
  tax_label text DEFAULT 'Tax',
  currency text DEFAULT 'USD',
  invoice_prefix text DEFAULT 'INV',
  next_invoice_number integer DEFAULT 1,
  terms_and_conditions text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create item_categories table
CREATE TABLE IF NOT EXISTS item_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category_id uuid REFERENCES item_categories(id) ON DELETE SET NULL,
  unit_price numeric(10,2) NOT NULL DEFAULT 0.00,
  sku text DEFAULT '',
  is_active boolean DEFAULT true,
  track_inventory boolean DEFAULT false,
  current_stock integer DEFAULT 0,
  min_stock_level integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_number text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  patient_id uuid REFERENCES patients(id) ON DELETE RESTRICT,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric(10,2) DEFAULT 0.00,
  tax_amount numeric(10,2) DEFAULT 0.00,
  discount_amount numeric(10,2) DEFAULT 0.00,
  total_amount numeric(10,2) DEFAULT 0.00,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'partially_paid')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  item_id uuid REFERENCES items(id) ON DELETE RESTRICT,
  item_name text NOT NULL,
  description text DEFAULT '',
  quantity numeric(10,2) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  line_total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'adjustment')),
  quantity integer NOT NULL,
  reference_type text DEFAULT '',
  reference_id uuid,
  notes text DEFAULT '',
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_active ON items(is_active);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_item ON invoice_items(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_trans_item ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_patients_number ON patients(patient_number);

-- Enable Row Level Security
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for clinic_settings
CREATE POLICY "Allow all operations on clinic_settings"
  ON clinic_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create RLS Policies for item_categories
CREATE POLICY "Allow read access to item_categories"
  ON item_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to item_categories"
  ON item_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update access to item_categories"
  ON item_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete access to item_categories"
  ON item_categories FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for items
CREATE POLICY "Allow read access to items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update access to items"
  ON items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete access to items"
  ON items FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for patients
CREATE POLICY "Allow read access to patients"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update access to patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete access to patients"
  ON patients FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for invoices
CREATE POLICY "Allow read access to invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update access to invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete access to invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for invoice_items
CREATE POLICY "Allow read access to invoice_items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to invoice_items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update access to invoice_items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete access to invoice_items"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for inventory_transactions
CREATE POLICY "Allow read access to inventory_transactions"
  ON inventory_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to inventory_transactions"
  ON inventory_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update access to inventory_transactions"
  ON inventory_transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete access to inventory_transactions"
  ON inventory_transactions FOR DELETE
  TO authenticated
  USING (true);

-- Insert default clinic settings record
INSERT INTO clinic_settings (clinic_name, invoice_prefix, next_invoice_number)
VALUES ('My Clinic', 'INV', 1)
ON CONFLICT DO NOTHING;

-- Insert default item categories
INSERT INTO item_categories (name, description) VALUES
  ('Medicines', 'Pharmaceutical products and medications'),
  ('Medical Supplies', 'General medical supplies and consumables'),
  ('Equipment', 'Medical equipment and devices'),
  ('Procedures', 'Medical procedures and treatments'),
  ('Consultations', 'Professional consultation services'),
  ('Laboratory Tests', 'Diagnostic and laboratory services')
ON CONFLICT DO NOTHING;

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  settings_rec RECORD;
  new_number integer;
  invoice_num text;
BEGIN
  SELECT * INTO settings_rec FROM clinic_settings LIMIT 1;
  
  new_number := settings_rec.next_invoice_number;
  invoice_num := settings_rec.invoice_prefix || '-' || LPAD(new_number::text, 5, '0');
  
  UPDATE clinic_settings 
  SET next_invoice_number = next_invoice_number + 1
  WHERE id = settings_rec.id;
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update inventory after invoice creation
CREATE OR REPLACE FUNCTION update_inventory_on_invoice()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    INSERT INTO inventory_transactions (item_id, transaction_type, quantity, reference_type, reference_id, notes)
    SELECT 
      ii.item_id,
      'usage',
      -ii.quantity::integer,
      'invoice',
      NEW.id,
      'Auto-deducted from invoice ' || NEW.invoice_number
    FROM invoice_items ii
    JOIN items i ON i.id = ii.item_id
    WHERE ii.invoice_id = NEW.id AND i.track_inventory = true;
    
    UPDATE items
    SET current_stock = current_stock - ii.quantity::integer
    FROM invoice_items ii
    WHERE items.id = ii.item_id 
      AND ii.invoice_id = NEW.id 
      AND items.track_inventory = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory updates
DROP TRIGGER IF EXISTS trigger_update_inventory ON invoices;
CREATE TRIGGER trigger_update_inventory
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_on_invoice();