import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency } from '@/lib/utils';
import { apiService } from '@/services/api.service';
import { toast } from '@/hooks/use-toast';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';

interface DashboardStats {
  today: {
    totalSales: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
  thisMonth: {
    totalSales: number;
    totalRevenue: number;
  };
  recentSales: any[];
  lowStockCount: number;
  totalCustomers: number;
}

export function DashboardPage() {
  const { user, business } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardStats();
      setStats((response.data as any).stats || null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-gray-600">
          Here's what's happening with {business?.name} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.today.totalRevenue || 0)}
            </div>
            <p className="text-xs text-gray-600">
              <span className="text-success font-medium">
                {stats?.today.totalSales || 0} sales today
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.thisMonth.totalSales || 0}
            </div>
            <p className="text-xs text-gray-600">
              <span className="text-success font-medium">
                {formatCurrency(stats?.thisMonth.totalRevenue || 0)} revenue
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCustomers || 0}
            </div>
            <p className="text-xs text-gray-600">
              <span className="text-primary-500 font-medium">Active customers</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.lowStockCount || 0}
            </div>
            <p className="text-xs text-gray-600">
              <span className="text-warning font-medium">Items need restocking</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Sales Overview Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Your sales performance over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Sales chart will be displayed here</p>
                <p className="text-sm">Connect your sales data to view charts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              {stats?.recentSales?.length || 0} recent transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats?.recentSales && stats.recentSales.length > 0 ? (
                stats.recentSales.map((sale: any) => (
                  <div key={sale._id} className="flex items-center">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium leading-none">
                        {sale.customer?.name || 'Walk-in Customer'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(sale.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {formatCurrency(sale.totals?.total || 0)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent sales</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
              <Package className="h-8 w-8 text-primary-500 mb-2" />
              <h3 className="font-medium">Add Product</h3>
              <p className="text-sm text-gray-600">Add new product to inventory</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
              <ShoppingCart className="h-8 w-8 text-primary-500 mb-2" />
              <h3 className="font-medium">New Sale</h3>
              <p className="text-sm text-gray-600">Process a new sale</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
              <TrendingUp className="h-8 w-8 text-primary-500 mb-2" />
              <h3 className="font-medium">View Reports</h3>
              <p className="text-sm text-gray-600">Check your business analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}