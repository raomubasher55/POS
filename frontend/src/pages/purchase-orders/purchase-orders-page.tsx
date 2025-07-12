import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/api.service';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  ShoppingCart,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Send,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface PurchaseOrder {
  _id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate: string;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface POFormData {
  supplierId: string;
  expectedDeliveryDate: string;
  notes: string;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [formData, setFormData] = useState<POFormData>({
    supplierId: '',
    expectedDeliveryDate: '',
    notes: '',
    items: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, these would be API calls
      const mockPOs: PurchaseOrder[] = [
        {
          _id: '1',
          poNumber: 'PO-2024-001',
          supplierId: '1',
          supplierName: 'ABC Distribution Co.',
          status: 'sent',
          orderDate: '2024-01-15',
          expectedDeliveryDate: '2024-01-22',
          items: [
            {
              productId: '1',
              productName: 'Premium Coffee Beans',
              sku: 'COF-001',
              quantity: 50,
              unitPrice: 12.50,
              totalPrice: 625.00
            },
            {
              productId: '2',
              productName: 'Organic Tea Blend',
              sku: 'TEA-001',
              quantity: 30,
              unitPrice: 9.00,
              totalPrice: 270.00
            }
          ],
          subtotal: 895.00,
          tax: 89.50,
          total: 984.50,
          notes: 'Rush order for weekend stock',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          _id: '2',
          poNumber: 'PO-2024-002',
          supplierId: '2',
          supplierName: 'Global Supplies Inc.',
          status: 'confirmed',
          orderDate: '2024-01-18',
          expectedDeliveryDate: '2024-01-25',
          items: [
            {
              productId: '3',
              productName: 'Chocolate Croissant',
              sku: 'BAK-001',
              quantity: 100,
              unitPrice: 2.25,
              totalPrice: 225.00
            }
          ],
          subtotal: 225.00,
          tax: 22.50,
          total: 247.50,
          createdAt: '2024-01-18T14:30:00Z',
          updatedAt: '2024-01-18T14:30:00Z'
        }
      ];

      const mockSuppliers = [
        { _id: '1', name: 'ABC Distribution Co.' },
        { _id: '2', name: 'Global Supplies Inc.' }
      ];

      const mockProducts = [
        { _id: '1', name: 'Premium Coffee Beans', sku: 'COF-001', price: 12.50 },
        { _id: '2', name: 'Organic Tea Blend', sku: 'TEA-001', price: 9.00 },
        { _id: '3', name: 'Chocolate Croissant', sku: 'BAK-001', price: 2.25 }
      ];

      setPurchaseOrders(mockPOs);
      setSuppliers(mockSuppliers);
      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to fetch purchase order data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchase order data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addItemToForm = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        productName: '',
        sku: '',
        quantity: 1,
        unitPrice: 0
      }]
    }));
  };

  const removeItemFromForm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateFormItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      updateFormItem(index, 'productId', productId);
      updateFormItem(index, 'productName', product.name);
      updateFormItem(index, 'sku', product.sku);
      updateFormItem(index, 'unitPrice', product.price);
    }
  };

  const calculateFormTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item to the purchase order',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { subtotal, tax, total } = calculateFormTotals();
      const supplier = suppliers.find(s => s._id === formData.supplierId);
      
      const newPO: PurchaseOrder = {
        _id: Date.now().toString(),
        poNumber: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
        supplierId: formData.supplierId,
        supplierName: supplier?.name || '',
        status: 'draft',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: formData.expectedDeliveryDate,
        items: formData.items.map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        })),
        subtotal,
        tax,
        total,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setPurchaseOrders([...purchaseOrders, newPO]);
      
      toast({
        title: 'Success',
        description: 'Purchase order created successfully',
      });
      
      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create purchase order',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      expectedDeliveryDate: '',
      notes: '',
      items: []
    });
    setShowCreateModal(false);
  };

  const updatePOStatus = (poId: string, newStatus: PurchaseOrder['status']) => {
    setPurchaseOrders(purchaseOrders.map(po => 
      po._id === poId 
        ? { ...po, status: newStatus, updatedAt: new Date().toISOString() }
        : po
    ));
    
    toast({
      title: 'Success',
      description: `Purchase order status updated to ${newStatus}`,
    });
  };

  const getStatusIcon = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'received': return <Package className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'confirmed': return 'text-yellow-600 bg-yellow-100';
      case 'received': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
          <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
          <p className="text-muted-foreground">
            Manage purchase orders and supplier ordering
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Purchase Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders.length}</div>
            <p className="text-xs text-muted-foreground">All purchase orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {purchaseOrders.filter(po => ['sent', 'confirmed'].includes(po.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {purchaseOrders.filter(po => po.status === 'received').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(purchaseOrders.reduce((sum, po) => sum + po.total, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total order value</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>Track and manage your purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">PO Number</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Supplier</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Order Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Expected Delivery</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Total</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPOs.map((po) => (
                    <tr key={po._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{po.poNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {po.items.length} items
                        </div>
                      </td>
                      <td className="p-4">{po.supplierName}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                          {getStatusIcon(po.status)}
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(po.orderDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm">
                        {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrency(po.total)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingPO(po)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {po.status === 'sent' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updatePOStatus(po._id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {po.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updatePOStatus(po._id, 'received')}
                            >
                              Receive
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredPOs.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No purchase orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Create your first purchase order to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Create Purchase Order</h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  ×
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier *</Label>
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expectedDelivery">Expected Delivery Date *</Label>
                    <Input
                      id="expectedDelivery"
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Order Items</Label>
                    <Button type="button" onClick={addItemToForm} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <Label>Product</Label>
                            <Select
                              value={item.productId}
                              onValueChange={(value) => handleProductSelect(index, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product._id} value={product._id}>
                                    {product.name} ({product.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateFormItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateFormItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label>Total</Label>
                            <div className="p-2 bg-gray-50 rounded border">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </div>
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItemFromForm(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.items.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(calculateFormTotals().subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (10%):</span>
                            <span>{formatCurrency(calculateFormTotals().tax)}</span>
                          </div>
                          <div className="flex justify-between font-medium text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(calculateFormTotals().total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for this purchase order..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!formData.supplierId || formData.items.length === 0}
                  >
                    Create Purchase Order
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View PO Modal */}
      {viewingPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{viewingPO.poNumber}</h3>
                  <p className="text-muted-foreground">{viewingPO.supplierName}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setViewingPO(null)}>
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingPO.status)}`}>
                      {getStatusIcon(viewingPO.status)}
                      {viewingPO.status.charAt(0).toUpperCase() + viewingPO.status.slice(1)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Order Date</Label>
                    <p>{new Date(viewingPO.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expected Delivery</Label>
                    <p>{new Date(viewingPO.expectedDeliveryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Amount</Label>
                    <p className="text-lg font-semibold">{formatCurrency(viewingPO.total)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Order Items</Label>
                  <div className="mt-2 border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left">Product</th>
                          <th className="p-3 text-left">SKU</th>
                          <th className="p-3 text-left">Qty</th>
                          <th className="p-3 text-left">Unit Price</th>
                          <th className="p-3 text-left">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingPO.items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{item.productName}</td>
                            <td className="p-3 text-sm text-muted-foreground">{item.sku}</td>
                            <td className="p-3">{item.quantity}</td>
                            <td className="p-3">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3 font-medium">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(viewingPO.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(viewingPO.tax)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(viewingPO.total)}</span>
                    </div>
                  </div>
                </div>

                {viewingPO.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingPO.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}