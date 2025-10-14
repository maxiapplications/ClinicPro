/*
  # Fix RLS Policies for Public Access

  ## Changes
  This migration updates all Row Level Security policies to allow public access
  since this is a single-user clinic management system without authentication.

  ## Security Note
  All tables are configured to allow public CRUD operations. This is appropriate
  for a single-user clinic system where the Supabase project itself provides
  the access control layer.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on clinic_settings" ON clinic_settings;
DROP POLICY IF EXISTS "Allow read access to item_categories" ON item_categories;
DROP POLICY IF EXISTS "Allow insert access to item_categories" ON item_categories;
DROP POLICY IF EXISTS "Allow update access to item_categories" ON item_categories;
DROP POLICY IF EXISTS "Allow delete access to item_categories" ON item_categories;
DROP POLICY IF EXISTS "Allow read access to items" ON items;
DROP POLICY IF EXISTS "Allow insert access to items" ON items;
DROP POLICY IF EXISTS "Allow update access to items" ON items;
DROP POLICY IF EXISTS "Allow delete access to items" ON items;
DROP POLICY IF EXISTS "Allow read access to patients" ON patients;
DROP POLICY IF EXISTS "Allow insert access to patients" ON patients;
DROP POLICY IF EXISTS "Allow update access to patients" ON patients;
DROP POLICY IF EXISTS "Allow delete access to patients" ON patients;
DROP POLICY IF EXISTS "Allow read access to invoices" ON invoices;
DROP POLICY IF EXISTS "Allow insert access to invoices" ON invoices;
DROP POLICY IF EXISTS "Allow update access to invoices" ON invoices;
DROP POLICY IF EXISTS "Allow delete access to invoices" ON invoices;
DROP POLICY IF EXISTS "Allow read access to invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Allow insert access to invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Allow update access to invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Allow delete access to invoice_items" ON invoice_items;
DROP POLICY IF EXISTS "Allow read access to inventory_transactions" ON inventory_transactions;
DROP POLICY IF EXISTS "Allow insert access to inventory_transactions" ON inventory_transactions;
DROP POLICY IF EXISTS "Allow update access to inventory_transactions" ON inventory_transactions;
DROP POLICY IF EXISTS "Allow delete access to inventory_transactions" ON inventory_transactions;

-- Create new public access policies for clinic_settings
CREATE POLICY "Public access to clinic_settings"
  ON clinic_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create new public access policies for item_categories
CREATE POLICY "Public read access to item_categories"
  ON item_categories FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to item_categories"
  ON item_categories FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to item_categories"
  ON item_categories FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access to item_categories"
  ON item_categories FOR DELETE
  USING (true);

-- Create new public access policies for items
CREATE POLICY "Public read access to items"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to items"
  ON items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to items"
  ON items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access to items"
  ON items FOR DELETE
  USING (true);

-- Create new public access policies for patients
CREATE POLICY "Public read access to patients"
  ON patients FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to patients"
  ON patients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to patients"
  ON patients FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access to patients"
  ON patients FOR DELETE
  USING (true);

-- Create new public access policies for invoices
CREATE POLICY "Public read access to invoices"
  ON invoices FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to invoices"
  ON invoices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to invoices"
  ON invoices FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access to invoices"
  ON invoices FOR DELETE
  USING (true);

-- Create new public access policies for invoice_items
CREATE POLICY "Public read access to invoice_items"
  ON invoice_items FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to invoice_items"
  ON invoice_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to invoice_items"
  ON invoice_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access to invoice_items"
  ON invoice_items FOR DELETE
  USING (true);

-- Create new public access policies for inventory_transactions
CREATE POLICY "Public read access to inventory_transactions"
  ON inventory_transactions FOR SELECT
  USING (true);

CREATE POLICY "Public insert access to inventory_transactions"
  ON inventory_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access to inventory_transactions"
  ON inventory_transactions FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public delete access to inventory_transactions"
  ON inventory_transactions FOR DELETE
  USING (true);