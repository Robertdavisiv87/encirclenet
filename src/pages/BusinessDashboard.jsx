import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Briefcase, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Package,
  BarChart3,
  Users,
  Eye,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessProfileSetup from '../components/business/BusinessProfileSetup';
import SEO from '../components/SEO';

export default function BusinessDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  const { data: businessProfile } = useQuery({
    queryKey: ['businessProfile', user?.email],
    queryFn: () => base44.entities.BusinessProfile.filter({ user_email: user.email }),
    enabled: !!user?.email,
    select: (data) => data[0]
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products', user?.email],
    queryFn: () => base44.entities.ShoppableProduct.filter({ creator_email: user.email }),
    enabled: !!user?.email
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => base44.entities.ProductOrder.filter({ seller_email: user.email }),
    enabled: !!user?.email
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const activeProducts = products.filter(p => p.is_active).length;

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!businessProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
        <SEO 
          title="Business Dashboard - Set Up Your Store"
          description="Create your business profile and start selling on Encircle Net"
        />
        <BusinessProfileSetup 
          userEmail={user.email} 
          onComplete={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <SEO 
        title={`${businessProfile.business_name} - Business Dashboard`}
        description="Manage your business, products, and orders on Encircle Net"
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          {businessProfile.logo_url && (
            <img src={businessProfile.logo_url} alt="Logo" className="w-16 h-16 rounded-full shadow-lg" />
          )}
          <div>
            <h1 className="text-3xl font-bold gradient-text">{businessProfile.business_name}</h1>
            <p className="text-gray-600">{businessProfile.business_type}</p>
          </div>
          {businessProfile.is_verified && (
            <div className="ml-auto bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              ✓ Verified
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-purple-600">{activeProducts}</p>
              </div>
              <Package className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600">{pendingOrders}</p>
              </div>
              <ShoppingBag className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trust Score</p>
                <p className="text-2xl font-bold text-blue-600">{businessProfile.trust_score}/100</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Your Products</h2>
                <Button className="gradient-bg-primary text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No products yet. Create your first product!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.product_name} className="w-full h-40 object-cover rounded-lg mb-3" />
                      )}
                      <h3 className="font-semibold mb-1">{product.product_name}</h3>
                      <p className="text-2xl font-bold text-purple-600 mb-2">${product.price}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{product.sales_count} sales</span>
                        <span>{product.views_count} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 10).map(order => (
                    <div key={order.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">{order.buyer_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">${order.total_amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Business Analytics</h2>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Advanced analytics coming soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}