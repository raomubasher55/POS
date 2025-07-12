import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { formatCurrency } from '@/lib/utils';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';

// Mock data - replace with real API calls
const stats = [
  {
    title: 'Total Revenue',
    value: 45231.89,
    change: '+20.1%',
    icon: DollarSign,
    description: 'from last month',
  },
  {
    title: 'Sales',
    value: 2350,
    change: '+180.1%',
    icon: ShoppingCart,
    description: 'from last month',
  },
  {
    title: 'Products',
    value: 12234,
    change: '+19%',
    icon: Package,
    description: 'in inventory',
  },
  {
    title: 'Active Users',
    value: 573,
    change: '+201',
    icon: Users,
    description: 'from last month',
  },
];

const recentSales = [
  {
    id: '1',
    customer: 'John Doe',
    amount: 129.99,
    time: '2 minutes ago',
  },
  {
    id: '2',
    customer: 'Jane Smith',
    amount: 89.50,
    time: '5 minutes ago',
  },
  {
    id: '3',
    customer: 'Bob Johnson',
    amount: 199.99,
    time: '10 minutes ago',
  },
  {
    id: '4',
    customer: 'Alice Brown',
    amount: 59.99,
    time: '15 minutes ago',
  },
];

export function DashboardPage() {
  const { user, business } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening with {business?.name} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.title === 'Total Revenue' 
                  ? formatCurrency(stat.value)
                  : stat.value.toLocaleString()
                }
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
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
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
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
              You made {recentSales.length} sales today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {sale.customer}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sale.time}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {formatCurrency(sale.amount)}
                  </div>
                </div>
              ))}
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
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <Package className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Add Product</h3>
              <p className="text-sm text-muted-foreground">Add new product to inventory</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <ShoppingCart className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">New Sale</h3>
              <p className="text-sm text-muted-foreground">Process a new sale</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">View Reports</h3>
              <p className="text-sm text-muted-foreground">Check your business analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}