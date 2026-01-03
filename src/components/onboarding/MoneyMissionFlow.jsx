import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Wrench, Users, TrendingUp, Zap, MapPin, Sparkles } from 'lucide-react';

const roleOptions = [
  {
    id: 'service_provider',
    icon: '🔧',
    title: 'Offer a Service',
    subtitle: 'Mechanic, Cleaner, Tech, Freelancer',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'drop_servicer',
    icon: '🤝',
    title: 'Connect Buyers & Providers',
    subtitle: 'Drop Servicer - No skills needed',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'affiliate',
    icon: '📢',
    title: 'Promote Local Services',
    subtitle: 'Affiliate Style - Earn per booking',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'digital_hustler',
    icon: '🧠',
    title: 'Digital Hustles',
    subtitle: 'AI tasks, posting, outreach',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'mobile_on_demand',
    icon: '🚚',
    title: 'Mobile Services',
    subtitle: 'On-demand delivery & services',
    color: 'from-indigo-500 to-violet-500'
  }
];

export default function MoneyMissionFlow({ isOpen, onClose, user }) {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const queryClient = useQueryClient();

  const createMissionMutation = useMutation({
    mutationFn: (data) => base44.entities.MoneyMission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['money-mission']);
      setStep(2);
    }
  });

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleStartMission = () => {
    if (!selectedRole) return;
    
    createMissionMutation.mutate({
      user_email: user.email,
      role_selected: selectedRole,
      mission_step: 1
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            Your First Dollar in 24 Hours
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                <h3 className="font-bold text-green-900 mb-2">How do you want to make money today?</h3>
                <p className="text-sm text-gray-700">No experience needed. Pick what feels right and we'll help you get started.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {roleOptions.map((role) => (
                  <Card
                    key={role.id}
                    className={`cursor-pointer transition-all hover-lift ${
                      selectedRole === role.id ? 'ring-4 ring-purple-500 shadow-glow' : ''
                    }`}
                    onClick={() => handleRoleSelect(role.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`text-4xl bg-gradient-to-br ${role.color} p-2 rounded-lg`}>
                          {role.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{role.title}</h3>
                          <p className="text-sm text-gray-600">{role.subtitle}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>Skip for Now</Button>
                <Button
                  onClick={handleStartMission}
                  disabled={!selectedRole || createMissionMutation.isLoading}
                  className="gradient-bg-primary text-white shadow-glow"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start My Mission
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold gradient-text mb-3">Mission Activated!</h2>
                <p className="text-gray-700 mb-4">
                  Your personalized dashboard is ready. Let's get you earning!
                </p>
                <Button onClick={onClose} className="gradient-bg-primary text-white shadow-glow">
                  Go to Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}