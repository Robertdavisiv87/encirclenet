import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateStoryModal({ isOpen, onClose, currentUser }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [contentType, setContentType] = useState('photo');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setContentType(file.type.startsWith('video/') ? 'video' : 'photo');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePost = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      await base44.entities.Post.create({
        content_type: contentType,
        media_url: file_url,
        author_name: currentUser.full_name,
        author_avatar: currentUser.avatar,
        caption: '📖 Story'
      });

      onClose();
      window.location.reload();
    } catch (error) {
      alert('Failed to post story');
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
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-blue-900">Create Story</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {!preview ? (
                <div>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="story-file"
                  />
                  <label
                    htmlFor="story-file"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12 cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-sm font-medium text-gray-700 mb-2">Upload Photo or Video</p>
                    <p className="text-xs text-gray-500">Click to select a file</p>
                  </label>
                </div>
              ) : (
                <div>
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    {contentType === 'photo' ? (
                      <img src={preview} alt="Preview" className="w-full max-h-96 object-contain" />
                    ) : (
                      <video src={preview} controls className="w-full max-h-96" />
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPreview(null);
                        setSelectedFile(null);
                      }}
                      className="flex-1"
                    >
                      Change
                    </Button>
                    <Button
                      onClick={handlePost}
                      disabled={uploading}
                      className="flex-1 gradient-bg-primary text-white shadow-glow"
                    >
                      {uploading ? 'Posting...' : 'Post Story'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}