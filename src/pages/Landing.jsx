import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, TrendingUp, DollarSign, Users } from 'lucide-react';
import { createPageUrl } from '../utils';
import SEO from '../components/SEO';

export default function Landing() {
  const [showVideo, setShowVideo] = useState(false);

  const successStories = [
    {
      name: "Sarah M.",
      niche: "Freelance Designer",
      earning: "$2,400",
      period: "first month",
      thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
    },
    {
      name: "Mike T.",
      niche: "Local Mechanic",
      earning: "$850",
      period: "first week",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4B6CB7] via-[#182848] to-black text-white">
      <SEO 
        title="Start Earning Today, Your Way | EncircleNet"
        description="Watch real people succeed, explore opportunities, and create real income in 24 hours."
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Start Earning Today,<br />
              <span className="gradient-text">Your Way</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Watch real people succeed, explore opportunities, and create real income in 24 hours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                onClick={() => window.location.href = createPageUrl('Welcome')}
                size="lg"
                className="gradient-bg-primary text-white shadow-glow text-lg px-8 py-6 hover-lift"
              >
                <DollarSign className="w-6 h-6 mr-2" />
                Start Making Money
              </Button>
              <Button 
                onClick={() => window.location.href = createPageUrl('Home')}
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#4B6CB7] text-lg px-8 py-6"
              >
                <TrendingUp className="w-6 h-6 mr-2" />
                Explore Opportunities
              </Button>
            </div>

            {/* Success Story Videos */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {successStories.map((story, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="relative group cursor-pointer"
                  onClick={() => setShowVideo(true)}
                >
                  <div className="relative h-64 rounded-2xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all">
                    <img 
                      src={story.thumbnail} 
                      alt={story.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-bold text-lg mb-1">{story.name}</p>
                      <p className="text-sm text-gray-300 mb-2">{story.niche}</p>
                      <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        {story.earning} in {story.period}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-8"
        >
          <div className="text-center">
            <p className="text-3xl font-bold">$2.4M+</p>
            <p className="text-sm text-gray-400">Earned by Creators</p>
          </div>
          <div className="w-px bg-gray-600" />
          <div className="text-center">
            <p className="text-3xl font-bold">15K+</p>
            <p className="text-sm text-gray-400">Active Users</p>
          </div>
          <div className="w-px bg-gray-600" />
          <div className="text-center">
            <p className="text-3xl font-bold">24hrs</p>
            <p className="text-sm text-gray-400">To First Dollar</p>
          </div>
        </motion.div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 px-6 bg-white/5 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Real People. Real Opportunities. Real Income.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multiple Income Streams</h3>
              <p className="text-gray-300">
                Create content, provide services, or learn new skills—all in one app.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">No Scams, Just Freedom</h3>
              <p className="text-gray-300">
                Express yourself and make real money without overbearing security or fake promises.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Earnings</h3>
              <p className="text-gray-300">
                See exactly how much you earn and where it comes from. All visible, all transparent.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button 
              onClick={() => window.location.href = createPageUrl('Welcome')}
              size="lg"
              className="gradient-bg-primary text-white shadow-glow text-lg px-12 py-6"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}