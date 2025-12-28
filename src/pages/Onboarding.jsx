import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Heart, 
  DollarSign, 
  Users, 
  TrendingUp,
  Crown,
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to EncircleNet',
    subtitle: 'Your World • Your Voice • Your Value',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'monetize',
    title: 'Turn Your Voice Into Value',
    subtitle: 'Earn from tips, subscriptions, and referrals',
    icon: DollarSign,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'engage',
    title: 'Build Your Circle',
    subtitle: 'Connect with like-minded creators and fans',
    icon: Users,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    subtitle: 'Let the world know who you are',
    icon: Crown,
    gradient: 'from-orange-500 to-yellow-500'
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check for referral code in URL
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
          // Store referral code to process after onboarding
          localStorage.setItem('pending_referral_code', refCode);
        }
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
    };
    loadUser();
  }, []);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await base44.auth.updateMe({
        bio: bio,
        website: website,
        onboarding_completed: true
      });
      
      // Create initial user stats
      await base44.entities.UserStats.create({
        user_email: user.email,
        points: 100,
        level: 1,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: new Date().toISOString()
      });

      // Award early adopter badge
      await base44.entities.Badge.create({
        user_email: user.email,
        badge_type: 'early_adopter',
        display_name: 'Early Adopter',
        icon: '🚀',
        earned_date: new Date().toISOString()
      });

      // Process referral if exists
      const pendingRefCode = localStorage.getItem('pending_referral_code');
      if (pendingRefCode) {
        try {
          await base44.functions.invoke('trackReferralSignup', {
            referral_code: pendingRefCode
          });
          localStorage.removeItem('pending_referral_code');
        } catch (refError) {
          console.error('Referral tracking failed:', refError);
        }
      }

      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((s, i) => (
              <motion.div
                key={s.id}
                className={`w-full h-2 rounded-full mx-1 ${
                  i <= currentStep ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i <= currentStep ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-glow`}
            >
              <Icon className="w-12 h-12 text-white" />
            </motion.div>

            {/* Content */}
            <h2 className="text-3xl font-bold text-center mb-3 text-blue-900">
              {step.title}
            </h2>
            <p className="text-center text-gray-600 mb-8">
              {step.subtitle}
            </p>

            {/* Step-specific content */}
            {currentStep === 0 && (
              <div className="space-y-4 text-blue-900">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Share Your Story</h3>
                    <p className="text-sm text-gray-600">Post photos, videos, and thoughts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Earn CircleValue</h3>
                    <p className="text-sm text-gray-600">Monetize your content and influence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Grow Your Circle</h3>
                    <p className="text-sm text-gray-600">Build a community around what you love</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-blue-900 mb-2">💰 Multiple Revenue Streams</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Tips & Boosts from fans</li>
                    <li>• Premium Circle subscriptions</li>
                    <li>• Referral commissions</li>
                    <li>• Affiliate partnerships</li>
                  </ul>
                </div>
                <p className="text-sm text-center text-gray-600 italic">
                  "Turn your passion into income. Start earning from day one."
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {['🎨 Creators', '💪 Fitness', '🍳 Cooking', '💼 Business', '🌟 Lifestyle', '🎵 Music'].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center border border-purple-200"
                    >
                      <span className="text-2xl mb-1 block">{item.split(' ')[0]}</span>
                      <span className="text-xs font-medium text-blue-900">{item.split(' ')[1]}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-center text-gray-600">
                  Join thousands of creators in your niche
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-white border-gray-300 text-blue-900"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website (optional)</label>
                  <Input
                    placeholder="https://yourwebsite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-white border-gray-300 text-blue-900"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1 gradient-bg-primary text-white shadow-glow"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 gradient-bg-primary text-white shadow-glow"
                >
                  {isLoading ? 'Setting up...' : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Complete
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}