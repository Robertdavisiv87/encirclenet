import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link as LinkIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function EditProfileModal({ show, onClose, currentUser, onSave }) {
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    website: '',
    social_links: '',
    profile_photo: '',
    skills: '',
    location: '',
    video_intro_url: '',
    custom_section_title: '',
    custom_section_content: ''
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        bio: currentUser.bio || '',
        website: currentUser.website || '',
        social_links: currentUser.social_links || '',
        profile_photo: currentUser.profile_photo || '',
        skills: currentUser.skills || '',
        location: currentUser.location || '',
        video_intro_url: currentUser.video_intro_url || '',
        custom_section_title: currentUser.custom_section_title || '',
        custom_section_content: currentUser.custom_section_content || ''
      });
    }
  }, [currentUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_photo: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await base44.auth.updateMe(formData);
      onSave && onSave();
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
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
            className="bg-gradient-to-b from-purple-50 via-white to-pink-50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-300 realistic-shadow custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-pink-100 p-6 border-b border-purple-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
                  <Save className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold gradient-text">Edit Your Profile</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Profile Photo */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {formData.profile_photo && (
                    <img
                      src={formData.profile_photo}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-300 shadow-glow"
                    />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-400 transition-all">
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                      ) : (
                        <Upload className="w-5 h-5 text-purple-600" />
                      )}
                      <span className="text-sm font-medium text-blue-900">
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Your Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Bio</label>
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400 min-h-[100px]"
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Website
                </label>
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Social Media Links
                </label>
                <Input
                  type="text"
                  placeholder="@username or profile URL"
                  value={formData.social_links}
                  onChange={(e) => setFormData(prev => ({ ...prev, social_links: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400"
                />
                <p className="text-xs text-gray-600">Instagram, TikTok, YouTube, etc.</p>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Skills & Expertise</label>
                <Input
                  type="text"
                  placeholder="e.g., Photography, Video Editing, Graphic Design"
                  value={formData.skills}
                  onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400"
                />
                <p className="text-xs text-gray-600">Comma-separated skills</p>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Location</label>
                <Input
                  type="text"
                  placeholder="e.g., Los Angeles, CA"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400"
                />
              </div>

              {/* Video Intro */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900">Video Introduction URL</label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or video file URL"
                  value={formData.video_intro_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_intro_url: e.target.value }))}
                  className="border-2 border-gray-300 focus:border-purple-400"
                />
                <p className="text-xs text-gray-600">YouTube, Vimeo, or direct video URL</p>
              </div>

              {/* Custom Section */}
              <div className="space-y-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                <h3 className="font-bold text-blue-900">Custom Section (Optional)</h3>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-900">Section Title</label>
                  <Input
                    type="text"
                    placeholder="e.g., My Services, Achievements, etc."
                    value={formData.custom_section_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_section_title: e.target.value }))}
                    className="border-2 border-gray-300 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-900">Section Content</label>
                  <Textarea
                    placeholder="Add custom content to showcase on your profile..."
                    value={formData.custom_section_content}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_section_content: e.target.value }))}
                    className="border-2 border-gray-300 focus:border-purple-400 min-h-[100px]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 gradient-bg-primary text-white font-semibold hover-lift shadow-glow"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    '✅ Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}