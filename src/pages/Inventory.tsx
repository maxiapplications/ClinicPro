import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useItems } from '../hooks/useItems';
import { formatDate } from '../lib/utils';

export function Inventory() {
  const { items, loading } = useItems();
  const [filterType, setFilterType] = useState<'all' | 'tracked' | 'low'>('all');

  const trackedItems = items.filter(item => item.track_inventory);
  const lowStockItems = trackedItems.filter(item => item.current_stock <= item.min_stock_level);

  const filteredItems = filterType === 'all'
    ? items
    : filterType === 'tracked'
    ? trackedItems
    : lowStockItems;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-500 mt-1">Track your stock levels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tracked Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{trackedItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{lowStockItems.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterType('tracked')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'tracked'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tracked Only
            </button>
            <button
              onClick={() => setFilterType('low')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'low'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Low Stock
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading inventory...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No items found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => {
                  const isLowStock = item.track_inventory && item.current_stock <= item.min_stock_level;
                  const stockPercentage = item.track_inventory && item.min_stock_level > 0
                    ? (item.current_stock / item.min_stock_level) * 100
                    : 100;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.sku || '-'}</TableCell>
                      <TableCell>
                        {item.track_inventory ? (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.track_inventory ? (
                          <span className={isLowStock ? 'text-red-600 font-semibold' : 'font-medium'}>
                            {item.current_stock}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.track_inventory ? item.min_stock_level : '-'}
                      </TableCell>
                      <TableCell>
                        {item.track_inventory ? (
                          isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock
                            </span>
                          ) : stockPercentage < 150 ? (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Warning
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Good
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatDate(item.updated_at)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
