import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';

export default function ServicePackageBuilder({ serviceId, existingPackages = [], onSave }) {
  const [packages, setPackages] = useState(existingPackages.length > 0 ? existingPackages : [
    { tier: 'basic', name: 'Basic', price: 0, delivery_days: 0, features: [], revisions: 0, add_ons: [] },
    { tier: 'standard', name: 'Standard', price: 0, delivery_days: 0, features: [], revisions: 0, add_ons: [] },
    { tier: 'premium', name: 'Premium', price: 0, delivery_days: 0, features: [], revisions: 0, add_ons: [] }
  ]);

  const [newFeature, setNewFeature] = useState({ basic: '', standard: '', premium: '' });
  const [newAddOn, setNewAddOn] = useState({ basic: '', standard: '', premium: '' });

  const updatePackage = (tier, field, value) => {
    setPackages(packages.map(pkg => 
      pkg.tier === tier ? { ...pkg, [field]: value } : pkg
    ));
  };

  const addFeature = (tier) => {
    if (!newFeature[tier].trim()) return;
    setPackages(packages.map(pkg => 
      pkg.tier === tier ? { ...pkg, features: [...(pkg.features || []), newFeature[tier]] } : pkg
    ));
    setNewFeature({ ...newFeature, [tier]: '' });
  };

  const removeFeature = (tier, index) => {
    setPackages(packages.map(pkg => 
      pkg.tier === tier ? { ...pkg, features: pkg.features.filter((_, i) => i !== index) } : pkg
    ));
  };

  const handleSave = async () => {
    try {
      const user = await base44.auth.me();
      
      for (const pkg of packages) {
        if (pkg.price > 0) {
          const packageData = {
            service_id: serviceId,
            freelancer_email: user.email,
            package_name: pkg.name,
            package_tier: pkg.tier,
            price: parseFloat(pkg.price),
            delivery_days: parseInt(pkg.delivery_days),
            description: pkg.description || '',
            features: pkg.features || [],
            revisions: parseInt(pkg.revisions) || 0,
            add_ons: pkg.add_ons || []
          };

          if (pkg.id) {
            await base44.entities.ServicePackage.update(pkg.id, packageData);
          } else {
            await base44.entities.ServicePackage.create(packageData);
          }
        }
      }
      
      toast.success('Service packages saved successfully!');
      if (onSave) onSave();
    } catch (error) {
      toast.error('Failed to save packages');
      console.error(error);
    }
  };

  const tierColors = {
    basic: 'bg-blue-100 text-blue-900 border-blue-300',
    standard: 'bg-purple-100 text-purple-900 border-purple-300',
    premium: 'bg-yellow-100 text-yellow-900 border-yellow-300'
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.tier} className={`border-2 ${tierColors[pkg.tier]}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {pkg.name}
                <Badge className={tierColors[pkg.tier]}>{pkg.tier}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold">Price ($)</label>
                <Input
                  type="number"
                  value={pkg.price}
                  onChange={(e) => updatePackage(pkg.tier, 'price', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Delivery (days)</label>
                <Input
                  type="number"
                  value={pkg.delivery_days}
                  onChange={(e) => updatePackage(pkg.tier, 'delivery_days', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Revisions</label>
                <Input
                  type="number"
                  value={pkg.revisions}
                  onChange={(e) => updatePackage(pkg.tier, 'revisions', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">Description</label>
                <Textarea
                  value={pkg.description}
                  onChange={(e) => updatePackage(pkg.tier, 'description', e.target.value)}
                  placeholder="Package description"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-2 block">Features Included</label>
                <div className="space-y-2 mb-2">
                  {(pkg.features || []).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="flex-1">{feature}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFeature(pkg.tier, idx)}
                        className="h-6 w-6"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newFeature[pkg.tier]}
                    onChange={(e) => setNewFeature({ ...newFeature, [pkg.tier]: e.target.value })}
                    placeholder="Add feature"
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    onClick={() => addFeature(pkg.tier)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white"
        >
          Save All Packages
        </Button>
      </div>
    </div>
  );
}