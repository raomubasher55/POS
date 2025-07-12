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
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Search,
  Eye,
  Receipt,
} from 'lucide-react';

interface CreditSale {
  _id: string;
  saleNumber: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
    creditLimit: number;
    outstandingBalance: number;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
  };
  creditAmount: number;
  paidAmount: number;
  remainingBalance: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentHistory: Array<{
    amount: number;
    paymentDate: string;
    method: string;
    notes?: string;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentData {
  creditSaleId: string;
  amount: number;
  paymentMethod: string;
  notes: string;
}

export function CreditSalesPage() {
  const [creditSales, setCreditSales] = useState<CreditSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [viewingSale, setViewingSale] = useState<CreditSale | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    creditSaleId: '',
    amount: 0,
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    fetchCreditSales();
  }, []);

  const fetchCreditSales = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, this would be apiService.getCreditSales()
      const mockCreditSales: CreditSale[] = [
        {
          _id: '1',
          saleNumber: 'CS-2024-001',
          customer: {
            name: 'John Smith',
            phone: '+1-555-0123',
            email: 'john.smith@email.com',
            creditLimit: 5000,
            outstandingBalance: 1250.75
          },
          items: [
            {
              productId: '1',
              productName: 'Premium Coffee Beans',
              quantity: 2,
              unitPrice: 25.00,
              totalPrice: 50.00
            }
          ],
          totals: {
            subtotal: 125.00,
            tax: 12.50,
            total: 137.50
          },
          creditAmount: 137.50,
          paidAmount: 0,
          remainingBalance: 137.50,
          dueDate: '2024-02-15',
          status: 'pending',
          paymentHistory: [],
          notes: 'Regular customer, good payment history',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        }
      ];
      
      setCreditSales(mockCreditSales);
    } catch (error) {
      console.error('Failed to fetch credit sales:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credit sales',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCreditSales = creditSales.filter(sale => {
    const matchesSearch = sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePayment = async () => {
    if (paymentData.amount <= 0) {
      toast({
        title: 'Error',
        description: 'Payment amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedSale = creditSales.find(s => s._id === paymentData.creditSaleId);
      if (updatedSale) {
        const newPaidAmount = updatedSale.paidAmount + paymentData.amount;
        const newRemainingBalance = updatedSale.creditAmount - newPaidAmount;
        const newStatus = newRemainingBalance <= 0 ? 'paid' : 'partial';
        
        setCreditSales(creditSales.map(sale => 
          sale._id === paymentData.creditSaleId 
            ? {
                ...sale,
                paidAmount: newPaidAmount,
                remainingBalance: newRemainingBalance,
                status: newStatus,
                updatedAt: new Date().toISOString()
              }
            : sale
        ));
        
        toast({
          title: 'Payment Recorded',
          description: `Payment of ${formatCurrency(paymentData.amount)} recorded successfully`,
        });
        
        setShowPaymentModal(false);
        setPaymentData({
          creditSaleId: '',
          amount: 0,
          paymentMethod: 'cash',
          notes: ''
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      });
    }
  };

  const openPaymentModal = (sale: CreditSale) => {
    setPaymentData({
      creditSaleId: sale._id,
      amount: 0,
      paymentMethod: 'cash',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const getStatusIcon = (status: CreditSale['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: CreditSale['status']) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  const totalOutstanding = creditSales.reduce((sum, sale) => sum + sale.remainingBalance, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Credit Sales</h2>
          <p className="text-muted-foreground">
            Track and manage credit sales and customer payments
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">Amount owed by customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditSales.length}</div>
            <p className="text-xs text-muted-foreground">Total credit transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Sales</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {creditSales.filter(s => s.status === 'paid').length}
            </div>
            <p className="text-xs text-muted-foreground">Fully paid sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {creditSales.filter(s => s.status === 'overdue').length}
            </div>
            <p className="text-xs text-muted-foreground">Overdue payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit Sales</CardTitle>
          <CardDescription>Manage credit sales and track payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search credit sales..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Sale #</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Customer</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Credit Amount</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Balance</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCreditSales.map((sale) => (
                    <tr key={sale._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{sale.saleNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{sale.customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {sale.customer.phone}
                        </div>
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrency(sale.creditAmount)}
                      </td>
                      <td className="p-4 font-medium text-red-600">
                        {formatCurrency(sale.remainingBalance)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                          {getStatusIcon(sale.status)}
                          {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingSale(sale)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {sale.remainingBalance > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPaymentModal(sale)}
                            >
                              <DollarSign className="h-4 w-4" />
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

          {filteredCreditSales.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No credit sales found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'No credit sales have been made yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Record Payment</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(false)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter payment amount"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={paymentData.paymentMethod}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Payment notes..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handlePayment}
                    className="flex-1"
                    disabled={paymentData.amount <= 0}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Sale Modal */}
      {viewingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{viewingSale.saleNumber}</h3>
                  <p className="text-muted-foreground">{viewingSale.customer.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setViewingSale(null)}>
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Customer</Label>
                    <div className="space-y-1">
                      <p className="font-medium">{viewingSale.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{viewingSale.customer.phone}</p>
                      <p className="text-sm text-muted-foreground">{viewingSale.customer.email}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Credit Info</Label>
                    <div className="space-y-1">
                      <p className="text-sm">Credit Limit: {formatCurrency(viewingSale.customer.creditLimit)}</p>
                      <p className="text-sm">Outstanding: {formatCurrency(viewingSale.customer.outstandingBalance)}</p>
                      <p className="text-sm">Due Date: {new Date(viewingSale.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Sale Items</Label>
                  <div className="mt-2 border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left">Product</th>
                          <th className="p-3 text-left">Qty</th>
                          <th className="p-3 text-left">Unit Price</th>
                          <th className="p-3 text-left">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingSale.items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{item.productName}</td>
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
                      <span>{formatCurrency(viewingSale.totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(viewingSale.totals.tax)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(viewingSale.totals.total)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Paid:</span>
                      <span>{formatCurrency(viewingSale.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-medium">
                      <span>Balance:</span>
                      <span>{formatCurrency(viewingSale.remainingBalance)}</span>
                    </div>
                  </div>
                </div>

                {viewingSale.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingSale.notes}</p>
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