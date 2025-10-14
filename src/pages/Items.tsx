import { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Alert } from '../components/ui/Alert';
import { useItems } from '../hooks/useItems';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency } from '../lib/utils';

interface ItemFormData {
  name: string;
  description: string;
  category_id: string;
  unit_price: string;
  sku: string;
  track_inventory: boolean;
  current_stock: string;
  min_stock_level: string;
}

export function Items() {
  const { items, loading, error, addItem, updateItem, deleteItem } = useItems();
  const { categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    category_id: '',
    unit_price: '',
    sku: '',
    track_inventory: false,
    current_stock: '0',
    min_stock_level: '0',
  });
  const [formError, setFormError] = useState('');

  const handleOpenModal = (itemId?: string) => {
    if (itemId) {
      const item = items.find(i => i.id === itemId);
      if (item) {
        setFormData({
          name: item.name,
          description: item.description,
          category_id: item.category_id || '',
          unit_price: item.unit_price.toString(),
          sku: item.sku,
          track_inventory: item.track_inventory,
          current_stock: item.current_stock.toString(),
          min_stock_level: item.min_stock_level.toString(),
        });
        setEditingItem(itemId);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        category_id: categories[0]?.id || '',
        unit_price: '',
        sku: '',
        track_inventory: false,
        current_stock: '0',
        min_stock_level: '0',
      });
      setEditingItem(null);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError('Item name is required');
      return;
    }

    if (!formData.unit_price || parseFloat(formData.unit_price) < 0) {
      setFormError('Valid unit price is required');
      return;
    }

    const itemData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category_id: formData.category_id || null,
      unit_price: parseFloat(formData.unit_price),
      sku: formData.sku.trim(),
      track_inventory: formData.track_inventory,
      current_stock: parseInt(formData.current_stock) || 0,
      min_stock_level: parseInt(formData.min_stock_level) || 0,
    };

    const result = editingItem
      ? await updateItem(editingItem, itemData)
      : await addItem(itemData);

    if (result.success) {
      handleCloseModal();
    } else {
      setFormError(result.error || 'Failed to save item');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const activeItems = filteredItems.filter(item => item.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Items Management</h1>
          <p className="text-gray-500 mt-1">Manage your medical supplies and services</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {error && (
        <Alert type="error">{error}</Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.map(cat => ({ value: cat.id, label: cat.name })),
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading items...</div>
          ) : activeItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No items found</p>
              <Button onClick={() => handleOpenModal()} className="mt-4" size="sm">
                Add Your First Item
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {activeItems.map(item => {
                  const category = categories.find(c => c.id === item.category_id);
                  const isLowStock = item.track_inventory && item.current_stock <= item.min_stock_level;

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
                      <TableCell>{category?.name || '-'}</TableCell>
                      <TableCell>{item.sku || '-'}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.unit_price)}</TableCell>
                      <TableCell>
                        {item.track_inventory ? (
                          <span className={isLowStock ? 'text-red-600 font-medium' : ''}>
                            {item.current_stock}
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(item.id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error">{formError}</Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Item Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Paracetamol 500mg"
            />

            <Select
              label="Category"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              options={[
                { value: '', label: 'Select Category' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name })),
              ]}
            />
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SKU / Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Optional SKU"
            />

            <Input
              label="Unit Price"
              type="number"
              step="0.01"
              required
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="track_inventory"
              checked={formData.track_inventory}
              onChange={(e) => setFormData({ ...formData, track_inventory: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="track_inventory" className="text-sm font-medium text-gray-700">
              Track inventory for this item
            </label>
          </div>

          {formData.track_inventory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Current Stock"
                type="number"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                placeholder="0"
              />

              <Input
                label="Minimum Stock Level"
                type="number"
                value={formData.min_stock_level}
                onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                placeholder="0"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
