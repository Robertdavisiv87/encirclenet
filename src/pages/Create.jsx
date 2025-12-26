import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Image, 
  Video, 
  Mic, 
  Type, 
  X, 
  Upload, 
  Sparkles,
  Hash,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import SEO from '../components/SEO';

const contentTypes = [
  { id: 'photo', icon: Image, label: 'Photo', color: 'from-pink-500 to-rose-500' },
  { id: 'video', icon: Video, label: 'Video', color: 'from-purple-500 to-indigo-500' },
  { id: 'voice', icon: Mic, label: 'Voice', color: 'from-blue-500 to-cyan-500' },
  { id: 'text', icon: Type, label: 'Text', color: 'from-orange-500 to-yellow-500' },
];

export default function Create() {
  const [user, setUser] = useState(null);
  const [contentType, setContentType] = useState('photo');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [isRawMode, setIsRawMode] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        // Redirect to login if not authenticated
      }
    };
    loadUser();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    // Content validation rules
    const forbiddenWords = ['hate', 'violence', 'spam', 'illegal'];
    const containsForbidden = forbiddenWords.some(word => 
      caption.toLowerCase().includes(word)
    );
    
    if (containsForbidden) {
      alert('Your post contains inappropriate content. Please review our community guidelines.');
      return;
    }
    
    if (caption.length > 2200) {
      alert('Caption is too long. Maximum 2200 characters.');
      return;
    }
    
    setIsLoading(true);

    try {
      let mediaUrl = null;
      
      if (mediaFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
        mediaUrl = file_url;
      }

      const tagArray = tags
        .split(',')
        .map(t => t.trim().replace('#', ''))
        .filter(t => t.length > 0);

      await base44.entities.Post.create({
        content_type: contentType,
        media_url: mediaUrl,
        caption: caption,
        author_name: user.full_name || 'Anonymous',
        author_avatar: user.avatar,
        tags: tagArray,
        is_raw_mode: isRawMode,
        likes_count: 0,
        comments_count: 0,
        tips_received: 0
      });

      // Navigate to home
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Create & Share Content - EncircleNet | Monetize Your Posts"
        description="Create and share photos, videos, voice notes, and text posts on EncircleNet. Start earning from your content with tips, boosts, and subscriptions."
        keywords="create content, share posts, monetize content, creator tools, post content, earn from posts, social media creator"
      />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold gradient-text animate-shimmer">Create VibePosts</h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (!caption && !mediaFile)}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 shadow-glow hover-glow"
          >
            {isLoading ? (
              <span className="animate-pulse">Posting...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2 animate-sparkle" />
                Share
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Content Type Selector */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {contentTypes.map(type => (
          <motion.button
            key={type.id}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setContentType(type.id);
              setMediaFile(null);
              setMediaPreview(null);
            }}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl transition-all realistic-shadow",
              contentType === type.id
                ? `bg-gradient-to-br ${type.color} text-white shadow-glow`
                : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200"
            )}
          >
            <type.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{type.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Media Upload */}
      {contentType !== 'text' && (
        <div className="mb-6">
          {mediaPreview ? (
            <div className="relative rounded-xl overflow-hidden">
              {contentType === 'photo' && (
                <img src={mediaPreview} alt="Preview" className="w-full aspect-square object-cover" />
              )}
              {contentType === 'video' && (
                <video src={mediaPreview} className="w-full aspect-square object-cover" controls />
              )}
              {contentType === 'voice' && (
                <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center">
                  <audio src={mediaPreview} controls />
                </div>
              )}
              <button
                onClick={() => {
                  setMediaFile(null);
                  setMediaPreview(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="block">
              <motion.div 
                whileHover={{ scale: 1.02, borderColor: "rgb(168, 85, 247)" }}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition-all bg-gradient-to-br from-purple-50 to-blue-50"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-float" />
                <p className="text-gray-700 mb-2">
                  Click to upload {contentType}
                </p>
                <p className="text-xs text-gray-500">
                  {contentType === 'photo' && 'JPG, PNG, GIF up to 10MB'}
                  {contentType === 'video' && 'MP4, MOV up to 100MB'}
                  {contentType === 'voice' && 'MP3, WAV up to 10MB'}
                </p>
              </motion.div>
              <input
                type="file"
                className="hidden"
                accept={
                  contentType === 'photo' ? 'image/*' :
                  contentType === 'video' ? 'video/*' :
                  'audio/*'
                }
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      )}

      {/* Caption */}
      <div className="mb-6">
        <Label className="text-gray-700 mb-2 block">
          {contentType === 'text' ? 'Your Thoughts' : 'Caption'}
        </Label>
        <Textarea
          placeholder={contentType === 'text' 
            ? "Express yourself freely..." 
            : "Add a caption..."
          }
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={cn(
            "bg-white border-gray-300 text-blue-900 placeholder:text-gray-400 resize-none",
            contentType === 'text' ? "min-h-[200px]" : "min-h-[100px]"
          )}
        />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <Label className="text-gray-700 mb-2 block">
          <Hash className="w-4 h-4 inline mr-1" />
          Tags
        </Label>
        <Input
          placeholder="lifestyle, thoughts, creative (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="bg-white border-gray-300 text-blue-900 placeholder:text-gray-400"
        />
      </div>

      {/* Raw Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-blue-900">Raw Mode</p>
            <p className="text-xs text-gray-600">No filters, no pretending. Just real.</p>
          </div>
        </div>
        <Switch
          checked={isRawMode}
          onCheckedChange={setIsRawMode}
        />
      </div>

      {/* Content Guidelines */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Community Guidelines
        </h3>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• Be respectful and authentic</li>
          <li>• No hate speech, harassment, or illegal content</li>
          <li>• Maximum caption length: 2200 characters</li>
          <li>• All media uploads are moderated</li>
          <li>• Protect privacy - yours and others</li>
        </ul>
      </div>
    </div>
  );
}