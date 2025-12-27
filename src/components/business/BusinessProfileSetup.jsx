import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Upload, Palette, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessProfileSetup({ userEmail, onComplete }) {
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: 'creator',
    bio: '',
    website: '',
    category: '',
    logo_url: '',
    cover_image: '',
    brand_colors: {
      primary: '#9333EA',
      secondary: '#EC4899',
      accent: '#F59E0B'
    },
    payment_methods: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, logo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.business_name || !formData.business_type) {
      alert('Please fill in required fields');
      return;
    }

    setIsLoading(true);
    try {
      let logoUrl = formData.logo_url;
      
      if (logoFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: logoFile });
        logoUrl = file_url;
      }

      await base44.entities.BusinessProfile.create({
        user_email: userEmail,
        business_name: formData.business_name,
        business_type: formData.business_type,
        bio: formData.bio,
        website: formData.website,
        category: formData.category,
        logo_url: logoUrl,
        cover_image: formData.cover_image,
        brand_colors: formData.brand_colors,
        payment_methods: formData.payment_methods,
        is_verified: false,
        trust_score: 0,
        storefront_enabled: false
      });

      onComplete && onComplete();
    } catch (error) {
      alert('Failed to create business profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full gradient-bg-primary flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold gradient-text">Set Up Business Profile</h2>
          <p className="text-sm text-gray-600">Start monetizing and growing your brand</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <div>
          <Label>Business Logo</Label>
          <div className="mt-2 flex items-center gap-4">
            {formData.logo_url && (
              <img src={formData.logo_url} alt="Logo" className="w-20 h-20 rounded-full object-cover" />
            )}
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload Logo</span>
              </div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Business Name */}
        <div>
          <Label>Business Name *</Label>
          <Input
            value={formData.business_name}
            onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
            placeholder="Your Business Name"
            className="mt-2"
          />
        </div>

        {/* Business Type */}
        <div>
          <Label>Business Type *</Label>
          <Select value={formData.business_type} onValueChange={(val) => setFormData(prev => ({ ...prev, business_type: val }))}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creator">Creator / Influencer</SelectItem>
              <SelectItem value="small_business">Small Business</SelectItem>
              <SelectItem value="agency">Agency</SelectItem>
              <SelectItem value="professional_service">Professional Service</SelectItem>
              <SelectItem value="retailer">Retailer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bio */}
        <div>
          <Label>Business Description</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Describe what you offer..."
            className="mt-2 min-h-[100px]"
          />
        </div>

        {/* Category */}
        <div>
          <Label>Category / Niche</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Fashion, Tech, Fitness"
            className="mt-2"
          />
        </div>

        {/* Website */}
        <div>
          <Label>Website</Label>
          <Input
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://yourbusiness.com"
            className="mt-2"
          />
        </div>

        {/* Brand Colors */}
        <div>
          <Label className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Brand Colors
          </Label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {['primary', 'secondary', 'accent'].map(colorKey => (
              <div key={colorKey}>
                <p className="text-xs text-gray-600 mb-1 capitalize">{colorKey}</p>
                <input
                  type="color"
                  value={formData.brand_colors[colorKey]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    brand_colors: { ...prev.brand_colors, [colorKey]: e.target.value }
                  }))}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full gradient-bg-primary text-white"
        >
          {isLoading ? 'Creating...' : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Create Business Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}