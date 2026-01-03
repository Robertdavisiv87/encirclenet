import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign, MapPin, Briefcase, User, TrendingUp, Sparkles,
  CheckCircle2, Zap, Target, Gift, Crown, Rocket, ArrowRight,
  Clock, Star, Award, Share2, FileText, Calendar
} from 'lucide-react';
import { createPageUrl } from '../../utils';
import confetti from 'canvas-confetti';

const EARNING_PATHS = [
  {
    id: 'local_services',
    title: 'Local Services',
    icon: MapPin,
    color: 'from-blue-500 to-cyan-500',
    description: 'Offer or book nearby services',
    potential24h: '$50-150',
    timeToFirst: '2 hours',
    tasks: ['Book a service', 'Offer your skills', 'Complete job']
  },
  {
    id: 'digital_creator',
    title: 'Digital Creator',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    description: 'Create content, manage social media',
    potential24h: '$100-300',
    timeToFirst: '1 hour',
    tasks: ['Create post', 'Edit video', 'Write copy']
  },
  {
    id: 'referral',
    title: 'Referral Program',
    icon: Share2,
    color: 'from-green-500 to-emerald-500',
    description: 'Invite friends and earn bonuses',
    potential24h: '$25-100',
    timeToFirst: '30 minutes',
    tasks: ['Share link', 'Get signups', 'Earn bonuses']
  },
  {
    id: 'challenges',
    title: 'Quick Challenges',
    icon: Target,
    color: 'from-orange-500 to-red-500',
    description: 'Complete micro-tasks for instant pay',
    potential24h: '$20-80',
    timeToFirst: '15 minutes',
    tasks: ['Take photo', 'Write review', 'Share content']
  }
];

export default function MoneyMakingOnboarding({ isOpen, onClose, user }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    location: '',
    skills: [],
    availability: 'flexible',
    interests: []
  });
  const [selectedPath, setSelectedPath] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);

  const progress = ((step + 1) / 8) * 100;

  const handleProfileComplete = async () => {
    try {
      await base44.auth.updateMe({
        onboarding_profile: profile,
        onboarding_completed: false,
        money_mission_started: true
      });
      setStep(1);
    } catch (e) {
      console.error('Profile update failed:', e);
      setStep(1); // Continue anyway
    }
  };

  const handlePathSelect = (path) => {
    setSelectedPath(path);
    setStep(3);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleTaskComplete = (taskId) => {
    setCompletedTasks([...completedTasks, taskId]);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  const completeOnboarding = async () => {
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        first_earning_path: selectedPath?.id
      });
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.5 }
      });
      setTimeout(() => {
        onClose();
        window.location.href = createPageUrl('Hub');
      }, 2000);
    } catch (e) {
      console.error('Onboarding completion failed:', e);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome & Profile Setup */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <Rocket className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold gradient-text mb-2">
                  Start Making Money in 24 Hours
                </h1>
                <p className="text-gray-600">Your World • Your Voice • Your Value</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📍 Your Location
                  </label>
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="City, State (e.g., Austin, TX)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💼 Your Skills/Interests
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Social Media', 'Content Creation', 'Design', 'Writing', 'Video Editing', 'Local Services'].map((skill) => (
                      <Button
                        key={skill}
                        variant={profile.skills.includes(skill) ? 'default' : 'outline'}
                        onClick={() => {
                          const skills = profile.skills.includes(skill)
                            ? profile.skills.filter(s => s !== skill)
                            : [...profile.skills, skill];
                          setProfile({ ...profile, skills });
                        }}
                        className={profile.skills.includes(skill) ? 'gradient-bg-primary text-white' : ''}
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⏰ Your Availability
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['part-time', 'full-time', 'flexible'].map((avail) => (
                      <Button
                        key={avail}
                        variant={profile.availability === avail ? 'default' : 'outline'}
                        onClick={() => setProfile({ ...profile, availability: avail })}
                        className={profile.availability === avail ? 'gradient-bg-primary text-white' : ''}
                      >
                        {avail.charAt(0).toUpperCase() + avail.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProfileComplete}
                className="w-full gradient-bg-primary text-white shadow-glow"
                size="lg"
              >
                Complete Profile & Start Earning
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: AI Tutorial */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Quick Tutorial</h2>
                <p className="text-gray-600">Here's how you'll make money on EncircleNet</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: MapPin, title: 'Local Services', desc: 'Book or offer services nearby', color: 'blue' },
                  { icon: Sparkles, title: 'Digital Tasks', desc: 'Create content & manage social media', color: 'purple' },
                  { icon: Share2, title: 'Referral Bonuses', desc: 'Invite friends for instant credits', color: 'green' },
                  { icon: Target, title: 'Quick Challenges', desc: 'Micro-tasks with instant payouts', color: 'orange' }
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 border-2 border-${feature.color}-200 rounded-xl p-4`}
                    >
                      <Icon className={`w-8 h-8 text-${feature.color}-600 mb-2`} />
                      <h3 className="font-bold text-blue-900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  How It Works
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Choose your earning path based on skills & availability
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Complete tasks with step-by-step AI guidance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Track earnings in real-time on your dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Instant payouts via Stripe, PayPal, or Venmo
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => setStep(2)}
                className="w-full gradient-bg-primary text-white shadow-glow"
                size="lg"
              >
                Got It! Show Me Earning Paths
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Choose Earning Path */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Choose Your First Earning Path</h2>
                <p className="text-gray-600">AI recommends the fastest path based on your profile</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {EARNING_PATHS.map((path, i) => {
                  const Icon = path.icon;
                  return (
                    <motion.div
                      key={path.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      {i === 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white z-10">
                          ⚡ AI Recommended
                        </Badge>
                      )}
                      <div
                        onClick={() => handlePathSelect(path)}
                        className={`bg-gradient-to-br ${path.color} p-6 rounded-2xl cursor-pointer hover:shadow-2xl transition-all`}
                      >
                        <Icon className="w-12 h-12 text-white mb-3" />
                        <h3 className="text-xl font-bold text-white mb-2">{path.title}</h3>
                        <p className="text-white/90 text-sm mb-4">{path.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-white text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              24h Potential
                            </span>
                            <span className="font-bold">{path.potential24h}</span>
                          </div>
                          <div className="flex items-center justify-between text-white text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              First Earnings
                            </span>
                            <span className="font-bold">{path.timeToFirst}</span>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-white text-gray-900 hover:bg-gray-100"
                          size="sm"
                        >
                          Start Now
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 3: AI Guided Action */}
          {step === 3 && selectedPath && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${selectedPath.color} flex items-center justify-center`}>
                  <selectedPath.icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Let's Get You Earning!</h2>
                <p className="text-gray-600">Follow these AI-guided steps to complete your first task</p>
              </div>

              <div className="space-y-3">
                {selectedPath.tasks.map((task, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      completedTasks.includes(i)
                        ? "bg-green-50 border-green-300"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {completedTasks.includes(i) ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <span className="text-sm text-gray-600">{i + 1}</span>
                          </div>
                        )}
                        <span className={cn(
                          "font-semibold",
                          completedTasks.includes(i) ? "text-green-900 line-through" : "text-blue-900"
                        )}>
                          {task}
                        </span>
                      </div>
                      {!completedTasks.includes(i) && (
                        <Button
                          onClick={() => handleTaskComplete(i)}
                          size="sm"
                          className="gradient-bg-primary text-white"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {completedTasks.length === selectedPath.tasks.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 text-center"
                >
                  <Award className="w-12 h-12 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-2">All Tasks Complete! 🎉</h3>
                  <p className="mb-4">You're ready to start earning</p>
                  <Button
                    onClick={() => setStep(4)}
                    size="lg"
                    className="bg-white text-green-600 hover:bg-gray-100"
                  >
                    View Earnings Dashboard
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 4: Instant Payout Dashboard */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Your Earnings Dashboard</h2>
                <p className="text-gray-600">Track your income in real-time</p>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white text-center">
                <p className="text-purple-100 mb-2">Current Balance</p>
                <h1 className="text-5xl font-bold mb-4">$0.00</h1>
                <p className="text-sm text-purple-100 mb-4">Complete your first real task to see earnings here!</p>
                <Button
                  onClick={() => window.location.href = createPageUrl('CreatorEconomy')}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  Go to Full Dashboard
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Tasks Completed', value: '0', icon: CheckCircle2 },
                  { label: 'Referrals', value: '0', icon: Share2 },
                  { label: 'Streak', value: '1 day', icon: Star }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white border-2 border-gray-200 rounded-xl p-4 text-center">
                      <Icon className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{stat.value}</p>
                      <p className="text-xs text-gray-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => setStep(5)}
                className="w-full gradient-bg-primary text-white shadow-glow"
                size="lg"
              >
                Continue to Rewards
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 5: Gamification */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Badges & Rewards</h2>
                <p className="text-gray-600">Earn badges as you complete milestones</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'First Task', icon: '🎯', locked: false },
                  { name: 'First $', icon: '💰', locked: true },
                  { name: 'Referral Pro', icon: '🤝', locked: true },
                  { name: '7 Day Streak', icon: '🔥', locked: true },
                  { name: 'Top Earner', icon: '👑', locked: true },
                  { name: 'Elite Member', icon: '⭐', locked: true }
                ].map((badge, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "rounded-xl p-4 text-center border-2",
                      badge.locked
                        ? "bg-gray-100 border-gray-300 opacity-50"
                        : "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300"
                    )}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className="text-xs font-semibold text-gray-700">{badge.name}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Next Milestones
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center justify-between">
                    <span>Complete 5 tasks</span>
                    <Badge>+100 pts</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Earn first $10</span>
                    <Badge>+200 pts</Badge>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Get 3 referrals</span>
                    <Badge>+300 pts</Badge>
                  </li>
                </ul>
              </div>

              <Button
                onClick={() => setStep(6)}
                className="w-full gradient-bg-primary text-white shadow-glow"
                size="lg"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 6: AI Support */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">24/7 AI Assistance</h2>
                <p className="text-gray-600">Your personal earning guide, always available</p>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white rounded-xl p-4 flex-1">
                    <p className="text-sm text-gray-700">
                      Hi {user?.full_name?.split(' ')[0] || 'there'}! I'm your AI assistant. I can help you find the best earning opportunities, troubleshoot issues, and maximize your income. Just ask me anything!
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-blue-900 mb-3">I Can Help With:</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    '💡 Recommend high-paying tasks',
                    '🎯 Find gigs near you',
                    '🔧 Fix technical issues',
                    '📈 Track your progress',
                    '💰 Optimize earnings',
                    '🚀 Level up strategies'
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 text-sm text-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  AI monitors your activity 24/7 and auto-fixes errors to ensure smooth earning
                </p>
              </div>

              <Button
                onClick={() => setStep(7)}
                className="w-full gradient-bg-primary text-white shadow-glow"
                size="lg"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 7: Optional Upsell */}
          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Unlock Premium Features</h2>
                <p className="text-gray-600">Level up your earning potential (optional)</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Premium Templates',
                    desc: 'Pre-made content templates for faster task completion',
                    price: '$9.99/mo',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    title: 'Advanced Analytics',
                    desc: 'Deep insights into your earnings and performance',
                    price: '$14.99/mo',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    title: 'Priority Support',
                    desc: 'Get help faster with dedicated support team',
                    price: '$19.99/mo',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    title: 'Elite Challenges',
                    desc: 'Access exclusive high-paying challenges',
                    price: '$24.99/mo',
                    color: 'from-orange-500 to-red-500'
                  }
                ].map((tier, i) => (
                  <div key={i} className={`bg-gradient-to-br ${tier.color} rounded-xl p-6 text-white`}>
                    <h3 className="text-lg font-bold mb-2">{tier.title}</h3>
                    <p className="text-sm text-white/90 mb-4">{tier.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{tier.price}</span>
                      <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
                        Upgrade
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={completeOnboarding}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={completeOnboarding}
                  className="flex-1 gradient-bg-primary text-white shadow-glow"
                  size="lg"
                >
                  Start Earning Now!
                  <Rocket className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="mt-6">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 text-center mt-2">
            Step {step + 1} of 8
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}