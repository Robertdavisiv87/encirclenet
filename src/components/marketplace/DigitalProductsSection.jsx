import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Package, Download, Loader2 } from 'lucide-react';
import DigitalProductCard from './DigitalProductCard';

export default function DigitalProductsSection({ creatorEmail, isOwner, currentUser }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productData, setProductData] = useState({
    product_name: '',
    description: '',
    price: '',
    category: 'digital_content',
    tags: [],
    digital_file_url: ''
  });
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['digital-products', creatorEmail],
    queryFn: () => base44.entities.ShoppableProduct.filter({ 
      creator_email: creatorEmail,
      is_digital: true,
      is_active: true 
    }),
    enabled: !!creatorEmail
  });

  const createProductMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ShoppableProduct.create({
        ...data,
        creator_email: creatorEmail,
        is_digital: true,
        is_active: true,
        sales_count: 0,
        views_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['digital-products']);
      setShowAddModal(false);
      setProductData({
        product_name: '',
        description: '',
        price: '',
        category: 'digital_content',
        tags: [],
        digital_file_url: ''
      });
      alert('✅ Product added!');
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: async (product) => {
      const result = await base44.functions.invoke('processProductOrder', {
        product_id: product.id,
        buyer_email: currentUser.email,
        seller_email: creatorEmail,
        amount: product.price,
        quantity: 1
      });
      
      // Update sales count
      await base44.entities.ShoppableProduct.update(product.id, {
        sales_count: (product.sales_count || 0) + 1
      });

      return result.data;
    },
    onSuccess: (data, product) => {
      queryClient.invalidateQueries(['digital-products']);
      
      // Create notification
      base44.functions.invoke('createNotification', {
        user_email: creatorEmail,
        type: 'tip',
        title: 'Product Sold!',
        message: `${currentUser.full_name || currentUser.email} purchased "${product.product_name}" for $${product.price}`,
        from_user: currentUser.email,
        from_user_name: currentUser.full_name
      }).catch(err => console.log('Notification failed:', err));

      setShowPurchaseModal(false);
      alert('✅ Purchase successful! Check your email for the download link.');
    }
  });

  const handleAddProduct = () => {
    if (!productData.product_name || !productData.price) {
      alert('Please fill in required fields');
      return;
    }
    createProductMutation.mutate(productData);
  };

  const handlePurchase = (product) => {
    if (!currentUser) {
      base44.auth.redirectToLogin();
      return;
    }
    setSelectedProduct(product);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    purchaseMutation.mutate(selectedProduct);
  };

  if (products.length === 0 && !isOwner) return null;

  return (
    <Card className="bg-white border-2 border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Digital Products
          </CardTitle>
          {isOwner && (
            <Button 
              size="sm" 
              onClick={() => setShowAddModal(true)}
              className="gradient-bg-primary text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No digital products yet</p>
            {isOwner && (
              <p className="text-sm">Add digital products to start selling</p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {products.map((product) => (
              <DigitalProductCard
                key={product.id}
                product={product}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Product Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Digital Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={productData.product_name}
                onChange={(e) => setProductData({ ...productData, product_name: e.target.value })}
                placeholder="e.g., Premium Presets Pack"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                placeholder="Describe your digital product..."
              />
            </div>
            <div>
              <Label>Price ($) *</Label>
              <Input
                type="number"
                value={productData.price}
                onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                placeholder="9.99"
              />
            </div>
            <div>
              <Label>Download File URL</Label>
              <Input
                value={productData.digital_file_url}
                onChange={(e) => setProductData({ ...productData, digital_file_url: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">Upload file first, then paste URL</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddProduct}
                disabled={createProductMutation.isPending}
                className="gradient-bg-primary flex-1"
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Product'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">{selectedProduct.product_name}</h3>
                <p className="text-sm text-gray-600 mb-3">{selectedProduct.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">${selectedProduct.price}</span>
                  <Badge className="bg-blue-500">Digital Download</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                You will receive an email with the download link after purchase.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={confirmPurchase}
                  disabled={purchaseMutation.isPending}
                  className="flex-1 gradient-bg-primary text-white shadow-glow"
                >
                  {purchaseMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Purchase ${selectedProduct.price}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}