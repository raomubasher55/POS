import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/services/api.service';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Edit,
  History,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  totalStock: number;
  minStock: number;
  category: {
    name: string;
  };
  inventory: Array<{
    shopId: string;
    shopName: string;
    quantity: number;
  }>;
}

interface StockAdjustment {
  productId: string;
  shopId: string;
  type: 'add' | 'subtract' | 'set';
  quantity: number;
  reason: string;
  notes?: string;
}

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustment, setAdjustment] = useState<StockAdjustment>({
    productId: '',
    shopId: '',
    type: 'add',
    quantity: 0,
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [productsResponse, shopsResponse] = await Promise.all([
        apiService.getProducts(),
        // Assuming shops endpoint exists
        fetch('/api/v1/shops').then(res => res.json()).catch(() => ({ shops: [] }))
      ]);
      
      setProducts((productsResponse.data as any)?.products || []);
      setShops(shopsResponse.shops || []);
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inventory data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'low' && product.totalStock <= product.minStock && product.totalStock > 0) ||
      (statusFilter === 'out' && product.totalStock === 0);

    return matchesSearch && matchesStatus;
  });

  const lowStockProducts = products.filter(p => p.totalStock <= p.minStock && p.totalStock > 0);
  const outOfStockProducts = products.filter(p => p.totalStock === 0);
  const totalInventoryValue = products.reduce((total, product) => total + (product.price * product.totalStock), 0);

  const handleStockAdjustment = async () => {
    if (!adjustment.productId || !adjustment.shopId || adjustment.quantity <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const operation = adjustment.type === 'add' ? 'add' : 'subtract';
      await apiService.updateStock(adjustment.productId, adjustment.quantity, operation);
      
      toast({
        title: 'Success',
        description: `Stock ${adjustment.type} completed successfully`,
      });
      
      setShowAdjustmentModal(false);
      setAdjustment({
        productId: '',
        shopId: '',
        type: 'add',
        quantity: 0,
        reason: '',
        notes: ''
      });
      
      fetchInventoryData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to adjust stock',
        variant: 'destructive',
      });
    }
  };

  const openAdjustmentModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustment(prev => ({
      ...prev,
      productId: product._id,
      shopId: product.inventory[0]?.shopId || ''
    }));
    setShowAdjustmentModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">
            Track stock levels, adjust inventory, and manage product availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchInventoryData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Products need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Products unavailable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalInventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>Monitor and manage product stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Product</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">SKU</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Current Stock</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Min Stock</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{product.sku}</td>
                      <td className="p-4 text-sm">{product.category.name}</td>
                      <td className="p-4">
                        <div className="font-medium">
                          {product.totalStock}
                        </div>
                      </td>
                      <td className="p-4 text-sm">{product.minStock}</td>
                      <td className="p-4">
                        {product.totalStock === 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of Stock
                          </span>
                        ) : product.totalStock <= product.minStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAdjustmentModal(product)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Adjust
                          </Button>
                          <Button variant="outline" size="sm">
                            <History className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Adjust Stock</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdjustmentModal(false)}
              >
                ×
              </Button>
            </div>
            
            {selectedProduct && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="font-medium">{selectedProduct.name}</div>
                <div className="text-sm text-muted-foreground">
                  Current Stock: {selectedProduct.totalStock} | SKU: {selectedProduct.sku}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="adjustment-type">Adjustment Type</Label>
                <Select
                  value={adjustment.type}
                  onValueChange={(value: any) => setAdjustment(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="subtract">Remove Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={adjustment.quantity}
                  onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Select
                  value={adjustment.reason}
                  onValueChange={(value) => setAdjustment(prev => ({ ...prev, reason: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Stock Received</SelectItem>
                    <SelectItem value="damaged">Damaged Goods</SelectItem>
                    <SelectItem value="theft">Theft/Loss</SelectItem>
                    <SelectItem value="returned">Customer Return</SelectItem>
                    <SelectItem value="correction">Inventory Correction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={adjustment.notes}
                  onChange={(e) => setAdjustment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleStockAdjustment}
                  className="flex-1"
                  disabled={!adjustment.reason || adjustment.quantity <= 0}
                >
                  {adjustment.type === 'add' ? (
                    <Plus className="h-4 w-4 mr-2" />
                  ) : (
                    <Minus className="h-4 w-4 mr-2" />
                  )}
                  Apply Adjustment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAdjustmentModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}