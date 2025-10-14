import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import { usePatients } from '../hooks/usePatients';
import { useItems } from '../hooks/useItems';
import { useSettings } from '../hooks/useSettings';
import { useInvoices } from '../hooks/useInvoices';
import { formatCurrency, calculateLineTotal, calculateInvoiceTotals } from '../lib/utils';

interface LineItem {
  id: string;
  item_id: string | null;
  item_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export function Billing() {
  const { patients } = usePatients();
  const { items, addItem } = useItems();
  const { settings } = useSettings();
  const { createInvoice } = useInvoices();

  const [selectedPatient, setSelectedPatient] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partially_paid'>('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const [newItemForm, setNewItemForm] = useState({
    isCustomItem: false,
    selectedItemId: '',
    customName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
  const { taxAmount, total } = calculateInvoiceTotals(
    subtotal,
    settings?.tax_rate || 0,
    discountAmount
  );

  const handleAddLineItem = () => {
    if (newItemForm.isCustomItem) {
      if (!newItemForm.customName.trim()) {
        setError('Please enter an item name');
        return;
      }

      const newItem: LineItem = {
        id: Date.now().toString(),
        item_id: null,
        item_name: newItemForm.customName.trim(),
        description: newItemForm.description.trim(),
        quantity: newItemForm.quantity,
        unit_price: newItemForm.unitPrice,
        line_total: calculateLineTotal(newItemForm.quantity, newItemForm.unitPrice),
      };

      setLineItems([...lineItems, newItem]);
      setNewItemForm({
        isCustomItem: false,
        selectedItemId: '',
        customName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
      });
    } else {
      if (!newItemForm.selectedItemId) {
        setError('Please select an item');
        return;
      }

      const item = items.find(i => i.id === newItemForm.selectedItemId);
      if (!item) return;

      const newItem: LineItem = {
        id: Date.now().toString(),
        item_id: item.id,
        item_name: item.name,
        description: item.description,
        quantity: newItemForm.quantity,
        unit_price: item.unit_price,
        line_total: calculateLineTotal(newItemForm.quantity, item.unit_price),
      };

      setLineItems([...lineItems, newItem]);
      setNewItemForm({
        ...newItemForm,
        selectedItemId: '',
        quantity: 1,
      });
    }

    setError('');
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return;

    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity,
          line_total: calculateLineTotal(quantity, item.unit_price),
        };
      }
      return item;
    }));
  };

  const handleCreateInvoice = async () => {
    if (lineItems.length === 0) {
      setError('Please add at least one item to the invoice');
      return;
    }

    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }

    setIsCreatingInvoice(true);
    setError('');

    try {
      for (const lineItem of lineItems) {
        if (!lineItem.item_id && lineItem.item_name) {
          const result = await addItem({
            name: lineItem.item_name,
            description: lineItem.description,
            unit_price: lineItem.unit_price,
            is_active: true,
          });

          if (result.success && result.data) {
            lineItem.item_id = result.data.id;
          }
        }
      }

      const invoiceData = {
        patient_id: selectedPatient,
        invoice_date: new Date().toISOString().split('T')[0],
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: total,
        payment_status: paymentStatus,
        notes,
      };

      const invoiceItems = lineItems.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      }));

      const result = await createInvoice(invoiceData, invoiceItems);

      if (result.success) {
        setSuccess('Invoice created successfully!');
        setLineItems([]);
        setSelectedPatient('');
        setDiscountAmount(0);
        setNotes('');
        setPaymentStatus('pending');

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('navigate', { detail: 'invoices' }));
        }, 1500);
      } else {
        setError(result.error || 'Failed to create invoice');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-500 mt-1">Generate a new patient bill</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Patient Information</h3>
            </CardHeader>
            <CardContent>
              <Select
                label="Select Patient"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                options={[
                  { value: '', label: 'Choose a patient' },
                  ...patients.map(p => ({
                    value: p.id,
                    label: `${p.first_name} ${p.last_name} (${p.patient_number})`,
                  })),
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Add Items</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!newItemForm.isCustomItem}
                    onChange={() => setNewItemForm({ ...newItemForm, isCustomItem: false })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Select from catalog</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={newItemForm.isCustomItem}
                    onChange={() => setNewItemForm({ ...newItemForm, isCustomItem: true })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium">Add custom item</span>
                </label>
              </div>

              {newItemForm.isCustomItem ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Item Name"
                    value={newItemForm.customName}
                    onChange={(e) => setNewItemForm({ ...newItemForm, customName: e.target.value })}
                    placeholder="Enter item name"
                  />
                  <Input
                    label="Description"
                    value={newItemForm.description}
                    onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                    placeholder="Optional description"
                  />
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={newItemForm.quantity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, quantity: parseFloat(e.target.value) || 1 })}
                  />
                  <Input
                    label="Unit Price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemForm.unitPrice}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Select Item"
                    value={newItemForm.selectedItemId}
                    onChange={(e) => setNewItemForm({ ...newItemForm, selectedItemId: e.target.value })}
                    options={[
                      { value: '', label: 'Choose an item' },
                      ...items.filter(i => i.is_active).map(i => ({
                        value: i.id,
                        label: `${i.name} - ${formatCurrency(i.unit_price, settings?.currency)}`,
                      })),
                    ]}
                  />
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={newItemForm.quantity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, quantity: parseFloat(e.target.value) || 1 })}
                  />
                </div>
              )}

              <Button onClick={handleAddLineItem} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add to Invoice
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Invoice Items</h3>
            </CardHeader>
            <CardContent>
              {lineItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No items added yet</p>
              ) : (
                <div className="space-y-3">
                  {lineItems.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.item_name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, parseFloat(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            @ {formatCurrency(item.unit_price, settings?.currency)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.line_total, settings?.currency)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="mt-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Invoice Summary</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal, settings?.currency)}</span>
                </div>

                <div>
                  <Input
                    label="Discount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={subtotal}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>{settings?.tax_label || 'Tax'} ({settings?.tax_rate || 0}%):</span>
                  <span>{formatCurrency(taxAmount, settings?.currency)}</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>{formatCurrency(total, settings?.currency)}</span>
                  </div>
                </div>
              </div>

              <Select
                label="Payment Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'partially_paid', label: 'Partially Paid' },
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={handleCreateInvoice}
                disabled={isCreatingInvoice || lineItems.length === 0}
                className="w-full flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isCreatingInvoice ? 'Creating...' : 'Create Invoice'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
