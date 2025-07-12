import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api.service';
import { toast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  BarChart as BarChartIcon,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

interface ReportData {
  salesReport: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
    dailySales: Array<{
      date: string;
      sales: number;
      revenue: number;
    }>;
  };
  inventoryReport: {
    totalProducts: number;
    lowStockCount: number;
    totalValue: number;
    topCategories: Array<{
      name: string;
      count: number;
      value: number;
    }>;
    stockLevels: Array<{
      category: string;
      inStock: number;
      lowStock: number;
      outOfStock: number;
    }>;
  };
  customerReport: {
    totalCustomers: number;
    newCustomers: number;
    repeatingCustomers: number;
    topCustomers: Array<{
      name: string;
      totalSpent: number;
      orderCount: number;
    }>;
    customerGrowth: Array<{
      month: string;
      newCustomers: number;
      totalCustomers: number;
    }>;
  };
}

export function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const [salesResponse, inventoryResponse, customerResponse] = await Promise.all([
        apiService.getSalesReport({ 
          startDate: dateRange.startDate, 
          endDate: dateRange.endDate 
        }),
        apiService.getInventoryReport(),
        apiService.getCustomerReport({ 
          startDate: dateRange.startDate, 
          endDate: dateRange.endDate 
        })
      ]);

      // Mock data for demonstration - in real implementation, use API responses
      setReportData({
        salesReport: {
          totalSales: 156,
          totalRevenue: 15425.50,
          averageOrderValue: 98.88,
          topProducts: [
            { name: 'Premium Coffee Beans', quantity: 45, revenue: 2250 },
            { name: 'Organic Tea Blend', quantity: 32, revenue: 1280 },
            { name: 'Chocolate Croissant', quantity: 78, revenue: 1170 }
          ],
          dailySales: [
            { date: '2024-01-08', sales: 12, revenue: 1250 },
            { date: '2024-01-09', sales: 18, revenue: 1680 },
            { date: '2024-01-10', sales: 15, revenue: 1420 },
            { date: '2024-01-11', sales: 22, revenue: 2180 },
            { date: '2024-01-12', sales: 19, revenue: 1890 },
            { date: '2024-01-13', sales: 25, revenue: 2455 },
            { date: '2024-01-14', sales: 21, revenue: 2080 }
          ]
        },
        inventoryReport: {
          totalProducts: 245,
          lowStockCount: 12,
          totalValue: 45680.75,
          topCategories: [
            { name: 'Beverages', count: 65, value: 15250 },
            { name: 'Food Items', count: 89, value: 18900 },
            { name: 'Snacks', count: 45, value: 8750 },
            { name: 'Desserts', count: 46, value: 2780 }
          ],
          stockLevels: [
            { category: 'Beverages', inStock: 52, lowStock: 8, outOfStock: 5 },
            { category: 'Food Items', inStock: 76, lowStock: 10, outOfStock: 3 },
            { category: 'Snacks', inStock: 38, lowStock: 5, outOfStock: 2 },
            { category: 'Desserts', inStock: 40, lowStock: 4, outOfStock: 2 }
          ]
        },
        customerReport: {
          totalCustomers: 428,
          newCustomers: 34,
          repeatingCustomers: 289,
          topCustomers: [
            { name: 'John Smith', totalSpent: 1250.50, orderCount: 12 },
            { name: 'Sarah Johnson', totalSpent: 890.25, orderCount: 8 },
            { name: 'Mike Davis', totalSpent: 675.80, orderCount: 6 }
          ],
          customerGrowth: [
            { month: 'Oct', newCustomers: 28, totalCustomers: 360 },
            { month: 'Nov', newCustomers: 32, totalCustomers: 392 },
            { month: 'Dec', newCustomers: 36, totalCustomers: 428 }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportSalesData = async () => {
    try {
      const response = await apiService.exportSalesData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format: 'csv'
      });
      
      // Create download link
      const blob = new Blob([response.data as string], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Sales data exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export sales data',
        variant: 'destructive',
      });
    }
  };

  const handleExportInventoryData = async () => {
    try {
      if (!reportData?.inventoryReport) return;
      
      const csvContent = [
        ['Product Name', 'Category', 'Stock', 'Value'].join(','),
        // This would be populated with actual inventory data from API
        ['Sample Product', 'Category', '100', '$1000'].join(',')
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory-report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Inventory data exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export inventory data',
        variant: 'destructive',
      });
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            Analytics and insights for your business
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportSalesData}>
            <Download className="h-4 w-4 mr-2" />
            Export Sales
          </Button>
          <Button variant="outline" onClick={handleExportInventoryData}>
            <Download className="h-4 w-4 mr-2" />
            Export Inventory
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Date Range Filter
          </CardTitle>
          <CardDescription>Select date range for reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <Button onClick={fetchReports} className="mt-6">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.salesReport.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {reportData?.salesReport.totalSales || 0} sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.salesReport.averageOrderValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData?.customerReport.totalCustomers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData?.customerReport.newCustomers || 0} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(reportData?.inventoryReport.totalValue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData?.inventoryReport.lowStockCount || 0} low stock items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top Selling Products
            </CardTitle>
            <CardDescription>Best performing products by quantity sold</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.salesReport.topProducts.length ? (
              <div className="space-y-4">
                {reportData.salesReport.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.quantity} units sold
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChartIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Top Customers
            </CardTitle>
            <CardDescription>Highest value customers</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.customerReport.topCustomers.length ? (
              <div className="space-y-4">
                {reportData.customerReport.topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.orderCount} orders
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(customer.totalSpent)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>No customer data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Product Categories
            </CardTitle>
            <CardDescription>Products by category</CardDescription>
          </CardHeader>
          <CardContent>
            {reportData?.inventoryReport.topCategories.length ? (
              <div className="space-y-4">
                {reportData.inventoryReport.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-right">
                      <div className="font-medium">{category.count} products</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <p>No inventory data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChartIcon className="h-5 w-5 mr-2" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Key business indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Customer Retention Rate</span>
                <span className="font-medium">
                  {reportData?.customerReport.repeatingCustomers && reportData?.customerReport.totalCustomers
                    ? Math.round((reportData.customerReport.repeatingCustomers / reportData.customerReport.totalCustomers) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Inventory Turnover</span>
                <span className="font-medium">N/A</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Stock Alert</span>
                <span className="font-medium text-orange-600">
                  {reportData?.inventoryReport.lowStockCount || 0} items
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Sales Trend (Last 7 Days)
            </CardTitle>
            <CardDescription>Daily sales performance and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData?.salesReport.dailySales || []}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name === 'revenue' ? 'Revenue' : 'Sales Count'
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="sales" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2" />
              Inventory by Category
            </CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData?.inventoryReport.topCategories || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  >
                    {(reportData?.inventoryReport.topCategories || []).map((entry, index) => {
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Products']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Stock Status by Category
            </CardTitle>
            <CardDescription>Inventory levels across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData?.inventoryReport.stockLevels || []}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="inStock" stackId="a" fill="#10b981" name="In Stock" />
                  <Bar dataKey="lowStock" stackId="a" fill="#f59e0b" name="Low Stock" />
                  <Bar dataKey="outOfStock" stackId="a" fill="#ef4444" name="Out of Stock" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Growth Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Customer Growth Trend
            </CardTitle>
            <CardDescription>New customer acquisition over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData?.customerReport.customerGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="newCustomers" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="New Customers"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalCustomers" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Total Customers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}