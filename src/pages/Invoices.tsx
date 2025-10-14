import { useState } from 'react';
import { Eye, Printer, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useInvoices } from '../hooks/useInvoices';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency, formatDate } from '../lib/utils';

export function Invoices() {
  const { invoices, loading, updateInvoice } = useInvoices();
  const { settings } = useSettings();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const invoice = selectedInvoice
    ? invoices.find(inv => inv.id === selectedInvoice)
    : null;

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    setIsViewModalOpen(true);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleUpdateStatus = async (invoiceId: string, status: string) => {
    await updateInvoice(invoiceId, {
      payment_status: status as 'paid' | 'pending' | 'partially_paid',
    });
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'all' || inv.payment_status === filterStatus;
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.patients && `${inv.patients.first_name} ${inv.patients.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-500 mt-1">View and manage all invoices</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by invoice number or patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'partially_paid', label: 'Partially Paid' },
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No invoices found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      {invoice.patients
                        ? `${invoice.patients.first_name} ${invoice.patients.last_name}`
                        : 'Walk-in Patient'}
                    </TableCell>
                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.total_amount, settings?.currency)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={invoice.payment_status}
                        onChange={(e) => handleUpdateStatus(invoice.id, e.target.value)}
                        options={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'paid', label: 'Paid' },
                          { value: 'partially_paid', label: 'Partially Paid' },
                        ]}
                        className="text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Invoice Details"
        size="xl"
      >
        {invoice && (
          <div className="space-y-6" id="invoice-print">
            <div className="flex justify-end gap-3 print:hidden">
              <Button onClick={handlePrintInvoice} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>

            <div className="border border-gray-200 rounded-lg p-8 print:border-0">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{settings?.clinic_name}</h2>
                  <p className="text-gray-600 mt-1">{settings?.address}</p>
                  <p className="text-gray-600">{settings?.phone}</p>
                  <p className="text-gray-600">{settings?.email}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
                  <p className="text-gray-600 mt-1">#{invoice.invoice_number}</p>
                  <p className="text-gray-600">Date: {formatDate(invoice.invoice_date)}</p>
                </div>
              </div>

              <div className="mb-8 p-4 bg-gray-50 rounded-lg print:bg-gray-100">
                <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
                {invoice.patients ? (
                  <>
                    <p className="text-gray-700">{invoice.patients.first_name} {invoice.patients.last_name}</p>
                  </>
                ) : (
                  <p className="text-gray-700">Walk-in Patient</p>
                )}
              </div>

              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 text-gray-700">Description</th>
                      <th className="text-right py-3 text-gray-700">Qty</th>
                      <th className="text-right py-3 text-gray-700">Price</th>
                      <th className="text-right py-3 text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.invoice_items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3">
                          <p className="font-medium text-gray-900">{item.item_name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </td>
                        <td className="text-right text-gray-700">{item.quantity}</td>
                        <td className="text-right text-gray-700">
                          {formatCurrency(item.unit_price, settings?.currency)}
                        </td>
                        <td className="text-right font-medium text-gray-900">
                          {formatCurrency(item.line_total, settings?.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal, settings?.currency)}</span>
                  </div>
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Discount:</span>
                      <span>-{formatCurrency(invoice.discount_amount, settings?.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>{settings?.tax_label || 'Tax'}:</span>
                    <span>{formatCurrency(invoice.tax_amount, settings?.currency)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total_amount, settings?.currency)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-700">Payment Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      invoice.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {invoice.payment_status}
                  </span>
                </div>
                {invoice.notes && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700">Notes:</p>
                    <p className="text-gray-600 mt-1">{invoice.notes}</p>
                  </div>
                )}
              </div>

              {settings?.terms_and_conditions && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">{settings.terms_and_conditions}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print, #invoice-print * {
            visibility: visible;
          }
          #invoice-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
