import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  category?: { id: number; name: string };
  price: number;
  stock_quantity: number;
  unit: string;
  created_at: string;
  updated_at: string | null;
}

interface Category {
  id: number;
  name: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: 0,
    price: 0,
    stock_quantity: 0,
    unit: 'pcs',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getProducts({ limit: 1000 }),
        categoryService.getCategories(),
      ]);
      setProducts(productsRes.items);
      setCategories(categoriesRes);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load products');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.category_id === 0) {
      toast.error('Please select a category');
      return;
    }

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          name: formData.name,
          price: formData.price,
          stock_quantity: formData.stock_quantity,
        });
        toast.success('Product updated successfully');
      } else {
        await productService.createProduct({
          name: formData.name,
          sku: formData.sku,
          category_id: formData.category_id,
          price: formData.price,
          stock_quantity: formData.stock_quantity,
          unit: formData.unit,
        });
        toast.success('Product created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        toast.success('Product deleted successfully');
        await loadData();
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      category_id: 0,
      price: 0,
      stock_quantity: 0,
      unit: 'pcs',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id,
      price: product.price,
      stock_quantity: product.stock_quantity,
      unit: product.unit,
    });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'sku', header: 'SKU' },
    {
      key: 'category',
      header: 'Category',
      render: (value: any, item: Product) => item.category?.name || 'N/A',
    },
    {
      key: 'price',
      header: 'Price',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'stock_quantity',
      header: 'Stock',
      render: (value: number) => (
        <Badge status={value < 10 ? 'danger' : value < 20 ? 'warning' : 'success'}>
          {value} units
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, item: Product) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEditModal(item)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-mono text-neon-cyan animate-glow">Products</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
        {searchTerm && (
          <Button variant="secondary" onClick={() => setSearchTerm('')}>
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
        </div>
      ) : (
        <Table columns={columns} data={filteredProducts} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-mono text-gray-300">Category</label>
            <select
              className="w-full bg-dark-100 border border-neon-cyan/30 rounded-lg px-4 py-2 focus:outline-none focus:border-neon-cyan text-gray-200"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
              required
            >
              <option value={0}>Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Input
            label="Price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
            required
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
