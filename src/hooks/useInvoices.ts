import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];
type InvoiceItemInsert = Database['public']['Tables']['invoice_items']['Insert'];

export interface InvoiceWithItems extends Invoice {
  invoice_items: InvoiceItem[];
  patients?: {
    first_name: string;
    last_name: string;
  };
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*),
          patients (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInvoices(data as InvoiceWithItems[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('generate_invoice_number');
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invoice number');
      return null;
    }
  };

  const createInvoice = async (
    invoice: Omit<InvoiceInsert, 'invoice_number'>,
    items: Omit<InvoiceItemInsert, 'invoice_id'>[]
  ) => {
    try {
      const invoiceNumber = await generateInvoiceNumber();
      if (!invoiceNumber) throw new Error('Failed to generate invoice number');

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({ ...invoice, invoice_number: invoiceNumber })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const itemsWithInvoiceId = items.map(item => ({
        ...item,
        invoice_id: invoiceData.id,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvoiceId);

      if (itemsError) throw itemsError;

      await fetchInvoices();
      return { success: true, data: invoiceData };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create invoice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateInvoice = async (id: string, updates: InvoiceUpdate) => {
    try {
      const { data, error: updateError } = await supabase
        .from('invoices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchInvoices();
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update invoice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setInvoices(invoices.filter(invoice => invoice.id !== id));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refetch: fetchInvoices,
  };
}
