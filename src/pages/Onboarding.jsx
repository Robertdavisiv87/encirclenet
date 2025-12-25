import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  User, 
  Heart, 
  DollarSign, 
  Flame,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState({
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check if user has completed onboarding
        if (currentUser.onboarding_completed) {
          window.location.href = createPageUrl('Home');
        }
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const steps = [
    {
      title: 'Welcome to EncircleNet!',
      subtitle: 'Connect, share, and earn rewards while being yourself. Let\'s set up your profile!',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Complete Your Profile',
      subtitle: 'Add your bio and pick your favorite theme. Complete your profile to unlock perks!',
      icon: User,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Explore the Feed',
      subtitle: 'Scroll through your feed! Like, comment, share, and try reels/stories for maximum engagement.',
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Earn Rewards',
      subtitle: 'Invite friends, post content, and unlock Pro/Elite monetization tools.',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Start Your Streak',
      subtitle: 'Complete your first post today and start your streak! Daily engagement = points & rewards.',
      icon: Flame,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = async () => {
    if (step === 1) {
      // Save profile data
      try {
        await base44.auth.updateMe({
          bio: profileData.bio,
          onboarding_step: 2
        });
      } catch (e) {}
    }

    if (step === steps.length - 1) {
      // Complete onboarding
      try {
        await base44.auth.updateMe({ onboarding_completed: true });
        
        // Initialize user stats
        await base44.entities.UserStats.create({
          user_email: user.email,
          points: 100,
          level: 1,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        });

        // Award first badge
        await base44.entities.Badge.create({
          user_email: user.email,
          badge_type: 'early_adopter',
          earned_date: new Date().toISOString(),
          display_name: 'Early Adopter',
          icon: '🌟'
        });

        window.location.href = createPageUrl('Home');
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
    } else {
      setStep(step + 1);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            {/* Icon */}
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${currentStep.color} flex items-center justify-center`}>
              <Icon className="w-12 h-12 text-white" />
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{currentStep.title}</h1>
            <p className="text-zinc-400 text-lg mb-8">{currentStep.subtitle}</p>

            {/* Step-specific content */}
            {step === 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-sm">Share Your Story</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="text-3xl mb-2">🎥</div>
                  <p className="text-sm">Create Reels</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="text-sm">Earn Rewards</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                  <div className="text-3xl mb-2">🌟</div>
                  <p className="text-sm">Unlock Perks</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="max-w-md mx-auto mb-8 space-y-4">
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 min-h-[100px]"
                />
                <p className="text-sm text-zinc-500">Complete your profile to unlock 50 bonus points!</p>
              </div>
            )}

            {step === 2 && (
              <div className="bg-zinc-900 rounded-xl p-6 max-w-md mx-auto mb-8 border border-zinc-800">
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Like and comment on posts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Share stories and reels</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Discover new content</span>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 max-w-md mx-auto mb-8">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-400/40">
                  <p className="font-semibold mb-1">💸 Engagement Revenue</p>
                  <p className="text-sm text-zinc-300">Earn automatically from likes, comments & shares</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-xl p-4 border border-blue-400/40">
                  <p className="font-semibold mb-1">🎯 Referral Income</p>
                  <p className="text-sm text-zinc-300">$5 per signup + 10% of their earnings forever</p>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-orange-500/20 rounded-xl p-4 border border-green-400/40">
                  <p className="font-semibold mb-1">🚀 Passive Growth</p>
                  <p className="text-sm text-zinc-300">Your content earns while you sleep (Pro/Elite)</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-xl p-4 border border-orange-400/40">
                  <p className="font-semibold mb-1">💎 Tiered Bonuses</p>
                  <p className="text-sm text-zinc-300">Higher tiers = higher % from participation</p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="bg-zinc-900 rounded-xl p-8 max-w-md mx-auto mb-8 border border-zinc-800">
                <div className="text-6xl mb-4">🔥</div>
                <p className="text-xl font-bold mb-2">Start with 100 Points!</p>
                <p className="text-zinc-400">Post daily to maintain your streak and earn rewards</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="border-zinc-700"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className={`bg-gradient-to-r ${currentStep.color} hover:opacity-90 px-8`}
              >
                {step === steps.length - 1 ? "Let's Go!" : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Skip Option */}
            {step > 0 && step < steps.length - 1 && (
              <button
                onClick={() => setStep(steps.length - 1)}
                className="text-zinc-500 text-sm mt-4 hover:text-zinc-300"
              >
                Skip tutorial
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Help Link */}
        <div className="text-center mt-8">
          <p className="text-sm text-zinc-500">
            Need help? Tap <span className="text-purple-400">?</span> for tutorials or support anytime
          </p>
        </div>
      </div>
    </div>
  );
}