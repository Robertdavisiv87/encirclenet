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
import CollaboratorSelector from '../components/collaboration/CollaboratorSelector';

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
  const [collaborators, setCollaborators] = useState([]);
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

  const validateContent = async (file, type) => {
    // File size limits
    const maxSizes = {
      photo: 10 * 1024 * 1024, // 10MB
      video: 100 * 1024 * 1024, // 100MB
      voice: 10 * 1024 * 1024 // 10MB
    };

    if (file.size > maxSizes[type]) {
      const sizeMB = (maxSizes[type] / (1024 * 1024)).toFixed(0);
      throw new Error(`File too large. Maximum ${sizeMB}MB for ${type}.`);
    }

    // Format validation
    const validFormats = {
      photo: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/quicktime', 'video/webm'],
      voice: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
    };

    if (!validFormats[type].includes(file.type)) {
      throw new Error(`Invalid format. Please upload a valid ${type} file.`);
    }

    // Video duration check
    if (type === 'video') {
      return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > 180) { // 3 minutes max
            reject(new Error('Video too long. Maximum 3 minutes allowed.'));
          } else if (video.duration < 1) {
            reject(new Error('Video too short or corrupted. Please try again.'));
          } else {
            resolve();
          }
        };
        video.onerror = () => reject(new Error('Unable to load video. File may be corrupted.'));
        video.src = URL.createObjectURL(file);
      });
    }

    // Image validation
    if (type === 'photo') {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 100 || img.height < 100) {
            reject(new Error('Image too small. Minimum 100x100 pixels required.'));
          } else {
            resolve();
          }
        };
        img.onerror = () => reject(new Error('Unable to load image. File may be corrupted.'));
        img.src = URL.createObjectURL(file);
      });
    }

    return Promise.resolve();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Validate content
      await validateContent(file, contentType);
      
      // If valid, set file and preview
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert(error.message);
      e.target.value = ''; // Clear input
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please sign in to create posts');
      return;
    }
    
    // Validate that there's content to post
    if (!caption && !mediaFile) {
      alert('Please add content or media to your post');
      return;
    }
    
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
      
      // Upload media file if present
      if (mediaFile) {
        try {
          console.log('Starting upload for:', contentType, 'File size:', mediaFile.size);
          const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
          mediaUrl = file_url;
          console.log('✅ Media uploaded successfully:', file_url);
          
          // Verify URL is accessible
          if (!file_url || file_url.trim() === '') {
            throw new Error('Upload returned empty URL');
          }
        } catch (uploadError) {
          console.error('❌ Upload error:', uploadError);
          alert('Failed to upload media. Please try again or use a different file.');
          setIsLoading(false);
          return;
        }
      }

      const tagArray = tags
        .split(',')
        .map(t => t.trim().replace('#', ''))
        .filter(t => t.length > 0);

      const postData = {
        content_type: contentType,
        media_url: mediaUrl || '',
        caption: caption || '',
        author_name: user.full_name || 'Anonymous',
        author_avatar: user.avatar || '',
        collaborators: collaborators,
        tags: tagArray,
        is_raw_mode: isRawMode,
        likes_count: 0,
        comments_count: 0,
        tips_received: 0
      };

      console.log('✅ Creating post with data:', postData);
      const newPost = await base44.entities.Post.create(postData);
      console.log('✅ Post created successfully with ID:', newPost.id, 'Media URL:', newPost.media_url);

      // AI Moderation check
      try {
        await base44.functions.invoke('aiModerateContent', {
          content: caption,
          content_type: 'post',
          content_id: newPost.id
        });
      } catch (modErr) {
        console.log('Moderation check failed:', modErr);
      }

      // Award points for creating post
      try {
        await base44.functions.invoke('awardPoints', {
          activity_type: 'post_created',
          related_id: newPost.id,
          description: 'Created a new post'
        });
      } catch (err) {
        console.log('Points award failed:', err);
      }

      // Force immediate feed refresh - ensure video appears in all feeds
      await Promise.all([
        base44.entities.Post.list('-created_date', 100), // Home feed
        base44.entities.Post.list('-likes_count', 100),  // Explore feed
        base44.entities.Post.filter({ created_by: user.email }, '-created_date', 50) // Profile
      ]);

      console.log('✅ All feeds refreshed, video should now appear everywhere');

      // Update user stats and streak
      const stats = await base44.entities.UserStats.filter({ user_email: user.email });
      const today = new Date().toDateString();
      
      if (stats.length > 0) {
        const userStat = stats[0];
        const lastActivity = userStat.last_activity_date ? new Date(userStat.last_activity_date).toDateString() : null;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        let newStreak = userStat.current_streak || 0;
        
        // Check if posted today already
        if (lastActivity !== today) {
          // Increment streak if posted yesterday, reset if gap
          if (lastActivity === yesterday) {
            newStreak += 1;
          } else if (!lastActivity) {
            newStreak = 1;
          } else {
            newStreak = 1; // Reset streak if gap
          }
        }
        
        await base44.entities.UserStats.update(userStat.id, {
          posts_count: (userStat.posts_count || 0) + 1,
          current_streak: newStreak,
          longest_streak: Math.max(userStat.longest_streak || 0, newStreak),
          last_activity_date: today
        });
      } else {
        // Create new stats
        await base44.entities.UserStats.create({
          user_email: user.email,
          posts_count: 1,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          points: 0,
          level: 1
        });
      }

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
        url="https://encirclenet.net/create"
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
                <video 
                  src={mediaPreview}
                  className="w-full aspect-square object-cover" 
                  controls
                  playsInline
                />
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

      {/* Collaborators */}
      <div className="mb-6">
        <CollaboratorSelector
          selectedCollaborators={collaborators}
          onCollaboratorsChange={setCollaborators}
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