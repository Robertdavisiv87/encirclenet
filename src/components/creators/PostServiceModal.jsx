import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostServiceModal({ isOpen, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    service_title: '',
    description: '',
    category: 'graphic_design',
    price_starting: '',
    delivery_days: '',
    tags: ''
  });
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);

  const categories = [
    { value: 'graphic_design', label: 'Graphic Design' },
    { value: 'logo_design', label: 'Logo Design' },
    { value: 'web_design', label: 'Web Design' },
    { value: 'uiux_design', label: 'UI/UX Design' },
    { value: 'mobile_app_dev', label: 'Mobile App Development' },
    { value: 'wordpress_dev', label: 'WordPress Development' },
    { value: 'shopify_dev', label: 'Shopify Development' },
    { value: 'ecommerce', label: 'E-commerce Setup' },
    { value: 'seo', label: 'SEO Services' },
    { value: 'content_writing', label: 'Content Writing' },
    { value: 'copywriting', label: 'Copywriting' },
    { value: 'video_editing', label: 'Video Editing' },
    { value: 'social_media_mgmt', label: 'Social Media Management' },
    { value: 'virtual_assistant', label: 'Virtual Assistant' },
    { value: 'ai_automation', label: 'AI & Automation' }
  ];

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      }
      setImages([...images, ...uploadedUrls]);
    } catch (error) {
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      await base44.entities.FreelanceService.create({
        freelancer_email: user.email,
        freelancer_name: user.full_name || user.email.split('@')[0],
        freelancer_avatar: user.avatar,
        service_title: formData.service_title,
        description: formData.description,
        category: formData.category,
        price_starting: parseFloat(formData.price_starting),
        delivery_days: parseInt(formData.delivery_days),
        images: images,
        tags: tags,
        is_active: true
      });

      onSuccess();
      onClose();
      setFormData({
        service_title: '',
        description: '',
        category: 'graphic_design',
        price_starting: '',
        delivery_days: '',
        tags: ''
      });
      setImages([]);
    } catch (error) {
      alert('Failed to post service: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold gradient-text">Post a Service</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Service Title *
                </label>
                <Input
                  placeholder="I will design a professional logo"
                  value={formData.service_title}
                  onChange={(e) => setFormData({...formData, service_title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Category *
                </label>
                <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Description *
                </label>
                <Textarea
                  placeholder="Describe your service in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Starting Price ($) *
                  </label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={formData.price_starting}
                    onChange={(e) => setFormData({...formData, price_starting: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Delivery Days *
                  </label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={formData.delivery_days}
                    onChange={(e) => setFormData({...formData, delivery_days: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Tags (comma separated)
                </label>
                <Input
                  placeholder="logo, branding, design"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Portfolio Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload images</p>
                  </label>
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {images.map((url, idx) => (
                        <img key={idx} src={url} alt="" className="w-full h-20 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">
                  ℹ️ Platform commission: 10% per order
                </p>
              </div>

              <Button
                type="submit"
                className="w-full gradient-bg-primary text-white shadow-glow"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Service'
                )}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}