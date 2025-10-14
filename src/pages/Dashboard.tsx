import { DollarSign, FileText, Users, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useInvoices } from '../hooks/useInvoices';
import { usePatients } from '../hooks/usePatients';
import { useItems } from '../hooks/useItems';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency, formatDate } from '../lib/utils';

export function Dashboard() {
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { patients, loading: patientsLoading } = usePatients();
  const { items, loading: itemsLoading } = useItems();
  const { settings } = useSettings();

  const todayRevenue = invoices
    .filter(inv => {
      const today = new Date().toISOString().split('T')[0];
      return inv.invoice_date === today && inv.payment_status === 'paid';
    })
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const pendingInvoices = invoices.filter(inv => inv.payment_status === 'pending').length;

  const lowStockItems = items.filter(
    item => item.track_inventory && item.current_stock <= item.min_stock_level
  );

  const recentInvoices = invoices.slice(0, 5);

  const loading = invoicesLoading || patientsLoading || itemsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your clinic operations</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-gray-500">Loading dashboard data...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(todayRevenue, settings?.currency)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{pendingInvoices}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{patients.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{lowStockItems.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {lowStockItems.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Low Stock Alerts
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Current: {item.current_stock} | Minimum: {item.min_stock_level}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                        Low Stock
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
            </CardHeader>
            <CardContent>
              {recentInvoices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No invoices yet</p>
              ) : (
                <div className="space-y-3">
                  {recentInvoices.map(invoice => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-600">
                          {invoice.patients
                            ? `${invoice.patients.first_name} ${invoice.patients.last_name}`
                            : 'Walk-in Patient'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(invoice.invoice_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(invoice.total_amount, settings?.currency)}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
