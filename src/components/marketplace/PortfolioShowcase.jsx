import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Heart, ExternalLink, Plus } from 'lucide-react';
import ImageLightbox from '@/components/ui/ImageLightbox';
import VideoPlayer from '@/components/video/VideoPlayer';
import moment from 'moment';

export default function PortfolioShowcase({ portfolioItems = [], onAddNew, isOwner = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const categories = [
    'all',
    'graphic_design',
    'web_design',
    'uiux_design',
    'mobile_app_dev',
    'video_editing',
    'animation',
    'content_writing',
    'photography',
    'illustration'
  ];

  const filteredItems = portfolioItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredItems = filteredItems.filter(item => item.is_featured);
  const regularItems = filteredItems.filter(item => !item.is_featured);

  const PortfolioCard = ({ item }) => (
    <Card className="bg-white border-gray-200 hover:shadow-xl transition-all realistic-shadow group overflow-hidden">
      <div 
        className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => {
          if (item.video_url) {
            setSelectedVideo({ url: item.video_url, title: item.title });
            setShowVideoModal(true);
          } else if (item.images?.[0]) {
            setSelectedImage({ url: item.images[0], caption: item.title });
            setShowImageLightbox(true);
          }
        }}
      >
        {item.images?.[0] ? (
          <img 
            src={item.images[0]} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
            <span className="text-4xl">📁</span>
          </div>
        )}
        {item.video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <div className="w-0 h-0 border-l-8 border-l-purple-600 border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
            </div>
          </div>
        )}
        {item.is_featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
            ⭐ Featured
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="flex items-center gap-4 text-white text-sm">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {item.views_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {item.likes_count || 0}
            </span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-blue-900 flex-1">{item.title}</h3>
          {item.live_url && (
            <a 
              href={item.live_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">{item.category}</Badge>
          {item.project_date && (
            <Badge variant="outline" className="text-xs">
              {moment(item.project_date).format('MMM YYYY')}
            </Badge>
          )}
        </div>
        {item.tools_used && item.tools_used.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tools_used.slice(0, 3).map((tool, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {tool}
              </span>
            ))}
            {item.tools_used.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{item.tools_used.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search portfolio..."
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isOwner && (
            <Button 
              onClick={onAddNew}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          )}
        </div>
      </div>

      {/* Portfolio Grid */}
      {portfolioItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <span className="text-4xl">📁</span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-blue-900">No Portfolio Items</h3>
          <p className="text-gray-600 mb-6">
            {isOwner ? 'Start building your portfolio by adding your best work' : 'This creator hasn\'t added any portfolio items yet'}
          </p>
          {isOwner && (
            <Button 
              onClick={onAddNew}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Project
            </Button>
          )}
        </div>
      ) : (
        <>
          {featuredItems.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2">
                ⭐ Featured Work
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredItems.map(item => (
                  <PortfolioCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {regularItems.length > 0 && (
            <div>
              {featuredItems.length > 0 && (
                <h3 className="text-lg font-bold mb-4 text-blue-900">All Projects</h3>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularItems.map(item => (
                  <PortfolioCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600">No items match your filters</p>
            </div>
          )}
        </>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={showImageLightbox}
        imageUrl={selectedImage?.url}
        caption={selectedImage?.caption}
        onClose={() => {
          setShowImageLightbox(false);
          setSelectedImage(null);
        }}
      />

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
        >
          <div 
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowVideoModal(false);
                setSelectedVideo(null);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-black rounded-xl overflow-hidden">
              <VideoPlayer 
                src={selectedVideo.url} 
                className="w-full"
                aspectRatio="video"
              />
              {selectedVideo.title && (
                <div className="p-4 bg-zinc-900">
                  <p className="text-white font-semibold">{selectedVideo.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}