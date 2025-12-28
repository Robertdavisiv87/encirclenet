import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function AddPortfolioModal({ show, onClose, onSave, currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    live_url: '',
    images: []
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, images: [...prev.images, file_url] }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Portfolio.create({
        freelancer_email: currentUser.email,
        title: formData.title,
        description: formData.description,
        live_url: formData.live_url,
        images: formData.images,
        views_count: 0,
        likes_count: 0
      });
      
      onSave && onSave();
      onClose();
      setFormData({ title: '', description: '', live_url: '', images: [] });
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      alert('Failed to save portfolio item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-300 realistic-shadow custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-pink-100 p-6 border-b border-purple-200 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold gradient-text">Add Portfolio Item</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Project Title*</label>
                <Input
                  type="text"
                  placeholder="e.g., E-commerce Website Design"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Description</label>
                <Textarea
                  placeholder="Describe your project..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Live URL (optional)</label>
                <Input
                  type="url"
                  placeholder="https://project-url.com"
                  value={formData.live_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, live_url: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Project Images</label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.images.length < 6 && (
                    <label className="cursor-pointer border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center hover:border-purple-400 transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                      ) : (
                        <Plus className="w-6 h-6 text-gray-400" />
                      )}
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 gradient-bg-primary text-white"
                >
                  {saving ? 'Saving...' : 'Add Portfolio'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}