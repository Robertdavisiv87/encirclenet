import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Car, Home, Scissors, Heart, GraduationCap, Dumbbell, Dog, PartyPopper,
  Camera, Truck, Laptop, Wrench, Briefcase, MoreHorizontal,
  Share2, PenTool, TrendingUp, Target, FileText, Users, Palette,
  Video, Mail, DollarSign, ShoppingCart, Code, BarChart, Smartphone,
  Lightbulb, Megaphone, Package, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LOCAL_CATEGORIES = [
  { id: 'automotive', name: 'Automotive', icon: Car, color: 'from-blue-500 to-cyan-500' },
  { id: 'home-garden', name: 'Home & Garden', icon: Home, color: 'from-green-500 to-emerald-500' },
  { id: 'cleaning', name: 'Cleaning', icon: Scissors, color: 'from-purple-500 to-pink-500' },
  { id: 'health', name: 'Health & Wellness', icon: Heart, color: 'from-red-500 to-rose-500' },
  { id: 'beauty', name: 'Beauty & Care', icon: Scissors, color: 'from-pink-500 to-fuchsia-500' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'from-indigo-500 to-blue-500' },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'from-orange-500 to-red-500' },
  { id: 'pets', name: 'Pet Services', icon: Dog, color: 'from-amber-500 to-yellow-500' },
  { id: 'events', name: 'Events & Catering', icon: PartyPopper, color: 'from-violet-500 to-purple-500' },
  { id: 'photography', name: 'Photography', icon: Camera, color: 'from-sky-500 to-blue-500' },
  { id: 'moving', name: 'Moving & Storage', icon: Truck, color: 'from-slate-500 to-gray-500' },
  { id: 'tech-support', name: 'Tech Support', icon: Laptop, color: 'from-cyan-500 to-teal-500' },
  { id: 'handyman', name: 'Repair & Handyman', icon: Wrench, color: 'from-yellow-500 to-orange-500' },
  { id: 'professional', name: 'Professional Services', icon: Briefcase, color: 'from-gray-700 to-slate-700' },
  { id: 'misc', name: 'Odd Jobs', icon: MoreHorizontal, color: 'from-lime-500 to-green-500' }
];

const DIGITAL_CATEGORIES = [
  { id: 'social-media', name: 'Social Media', icon: Share2, color: 'from-blue-500 to-indigo-500' },
  { id: 'content-creation', name: 'Content Creation', icon: PenTool, color: 'from-purple-500 to-pink-500' },
  { id: 'seo-sem', name: 'SEO/SEM', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { id: 'paid-ads', name: 'Paid Advertising', icon: Target, color: 'from-orange-500 to-red-500' },
  { id: 'copywriting', name: 'Copywriting', icon: FileText, color: 'from-yellow-500 to-amber-500' },
  { id: 'influencer', name: 'Influencer Marketing', icon: Users, color: 'from-pink-500 to-rose-500' },
  { id: 'design', name: 'Graphic Design', icon: Palette, color: 'from-violet-500 to-purple-500' },
  { id: 'video-editing', name: 'Video Editing', icon: Video, color: 'from-red-500 to-pink-500' },
  { id: 'email-marketing', name: 'Email Marketing', icon: Mail, color: 'from-cyan-500 to-blue-500' },
  { id: 'affiliate', name: 'Affiliate Marketing', icon: DollarSign, color: 'from-green-600 to-emerald-600' },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart, color: 'from-indigo-500 to-blue-500' },
  { id: 'web-dev', name: 'Web Development', icon: Code, color: 'from-gray-700 to-slate-600' },
  { id: 'analytics', name: 'Analytics & Growth', icon: BarChart, color: 'from-blue-600 to-cyan-600' },
  { id: 'app-marketing', name: 'App Marketing', icon: Smartphone, color: 'from-purple-600 to-indigo-600' },
  { id: 'consulting', name: 'Strategy & Consulting', icon: Lightbulb, color: 'from-yellow-600 to-orange-600' },
  { id: 'pr', name: 'PR & Communications', icon: Megaphone, color: 'from-rose-500 to-pink-500' },
  { id: 'brand', name: 'Brand Strategy', icon: Package, color: 'from-amber-600 to-yellow-600' },
  { id: 'podcast', name: 'Podcast Production', icon: Smartphone, color: 'from-indigo-600 to-purple-600' },
  { id: 'community', name: 'Community Management', icon: Users, color: 'from-teal-500 to-cyan-500' },
  { id: 'automation', name: 'Marketing Automation', icon: Target, color: 'from-blue-700 to-indigo-700' }
];

export default function CategoryGrid({ selectedCategory, onCategorySelect }) {
  const [viewMode, setViewMode] = useState('local'); // local or digital

  const categories = viewMode === 'local' ? LOCAL_CATEGORIES : DIGITAL_CATEGORIES;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-blue-900">Browse by Category</h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'local' ? 'default' : 'outline'}
            onClick={() => setViewMode('local')}
            size="sm"
            className={viewMode === 'local' ? 'gradient-bg-primary text-white' : ''}
          >
            Local Services (15)
          </Button>
          <Button
            variant={viewMode === 'digital' ? 'default' : 'outline'}
            onClick={() => setViewMode('digital')}
            size="sm"
            className={viewMode === 'digital' ? 'gradient-bg-primary text-white' : ''}
          >
            Digital Creators (20)
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategorySelect('all')}
          className={cn(
            "p-4 rounded-xl border-2 transition-all",
            selectedCategory === 'all'
              ? "gradient-bg-primary text-white shadow-glow border-purple-400"
              : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
          )}
        >
          <Filter className="w-6 h-6 mx-auto mb-2" />
          <p className="text-xs font-semibold">All</p>
        </motion.button>

        {categories.map((category, i) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategorySelect(category.id)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all",
                selectedCategory === category.id
                  ? `bg-gradient-to-br ${category.color} text-white shadow-glow border-transparent`
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
              )}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-semibold text-center leading-tight">{category.name}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}