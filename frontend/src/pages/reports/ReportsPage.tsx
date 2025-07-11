import React from 'react';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">View detailed analytics and reports</p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">$</span>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">Sales Report</h3>
                <p className="text-sm text-gray-500">Daily, weekly, and monthly sales analytics</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Generate
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">#</span>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">Inventory Report</h3>
                <p className="text-sm text-gray-500">Stock levels and product performance</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                Generate
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-lg font-medium text-gray-900">Staff Report</h3>
                <p className="text-sm text-gray-500">Employee performance and sales</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Statistics
          </h3>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">
                This Week Sales
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">$12,426</dd>
              <dd className="mt-1 text-sm text-green-600">+12% from last week</dd>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Products Sold
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">389</dd>
              <dd className="mt-1 text-sm text-green-600">+8% from last week</dd>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Avg Order Value
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">$31.95</dd>
              <dd className="mt-1 text-sm text-red-600">-2% from last week</dd>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Customer Count
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">156</dd>
              <dd className="mt-1 text-sm text-green-600">+15% from last week</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Sales Trend (Last 30 Days)
          </h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Top Selling Products
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Widget Pro</p>
                  <p className="text-sm text-gray-500">SKU: WP001</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">45 sold</p>
                <p className="text-sm text-gray-500">$1,347.55</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Super Gadget</p>
                  <p className="text-sm text-gray-500">SKU: SG002</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">32 sold</p>
                <p className="text-sm text-gray-500">$1,599.68</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-yellow-600 font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Basic Item</p>
                  <p className="text-sm text-gray-500">SKU: BI003</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">28 sold</p>
                <p className="text-sm text-gray-500">$419.72</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;