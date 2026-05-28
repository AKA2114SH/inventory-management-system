import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Package, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { productService } from '../services/productService';
import { transactionService } from '../services/transactionService';
import toast from 'react-hot-toast';

interface CartItem {
  product: any;
  quantity: number;
}

export function Billing() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT'>('OUT');
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await productService.getProducts({ limit: 100 });
      setProducts(response.items);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const addToCart = (product: any) => {
    if (transactionType === 'OUT' && product.stock_quantity <= 0) {
      toast.error('Product out of stock');
      return;
    }
    
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    toast.success(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
    toast.success('Item removed from cart');
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      for (const item of cart) {
        if (transactionType === 'OUT' && item.quantity > item.product.stock_quantity) {
          toast.error(`Insufficient stock for ${item.product.name}. Available: ${item.product.stock_quantity}`);
          setLoading(false);
          return;
        }
        
        await transactionService.createTransaction({
          product_id: item.product.id,
          type: transactionType,
          quantity: item.quantity,
          total_price: item.product.price * item.quantity,
        });
      }
      
      toast.success(`${transactionType === 'OUT' ? 'Sale' : 'Purchase'} completed successfully!`);
      setCart([]);
      await loadProducts(); // Refresh stock levels
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-mono text-neon-cyan animate-glow">Billing Terminal</h1>
        <div className="flex gap-4">
          <Button
            variant={transactionType === 'OUT' ? 'primary' : 'secondary'}
            onClick={() => {
              setTransactionType('OUT');
              setCart([]);
            }}
          >
            Sell (OUT)
          </Button>
          <Button
            variant={transactionType === 'IN' ? 'success' : 'secondary'}
            onClick={() => {
              setTransactionType('IN');
              setCart([]);
            }}
          >
            Restock (IN)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Package}
              />
            </div>
            {searchTerm && (
              <Button variant="secondary" onClick={() => setSearchTerm('')}>
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="card-glow p-4 hover:shadow-lg hover:shadow-neon-cyan/20 transition-all cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <Badge status={product.stock_quantity < 10 ? 'danger' : product.stock_quantity < 20 ? 'warning' : 'success'}>
                      Stock: {product.stock_quantity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">SKU: {product.sku}</p>
                  <p className="text-sm text-gray-400">Category: {product.category?.name}</p>
                  <p className="text-xl font-bold text-neon-cyan mt-2">${product.price.toFixed(2)}</p>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-2 text-center py-12 text-gray-400">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="card-glow p-4">
          <h2 className="text-xl font-bold text-neon-cyan mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Current {transactionType === 'OUT' ? 'Sale' : 'Purchase'}
          </h2>
          
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Cart is empty</p>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center p-2 bg-dark-100 rounded-lg">
                    <div className="flex-1">
                      <p className="font-mono text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-400">${item.product.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-neon-cyan/30 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-neon-cyan">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={handleCheckout}
                  loading={loading}
                >
                  {transactionType === 'OUT' ? 'Complete Sale' : 'Process Purchase'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
