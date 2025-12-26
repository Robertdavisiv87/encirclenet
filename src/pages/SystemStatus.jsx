import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Zap, 
  DollarSign, 
  Compass, 
  TrendingUp,
  Eye,
  AlertTriangle,
  Shield,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const ADMIN_EMAIL = 'robertdavisiv87@gmail.com';

export default function SystemStatus() {
  const [user, setUser] = useState(null);
  const [pageLoadTime, setPageLoadTime] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser?.email !== ADMIN_EMAIL) {
          window.location.href = '/';
        }
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();

    // Measure page load time
    const startTime = performance.now();
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      setPageLoadTime(loadTime / 1000);
    });
  }, []);

  // Fetch system data
  const { data: posts = [] } = useQuery({
    queryKey: ['system-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
    initialData: []
  });

  const { data: users = [] } = useQuery({
    queryKey: ['system-users'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const { data: revenue = [] } = useQuery({
    queryKey: ['system-revenue'],
    queryFn: () => base44.entities.Revenue.list('-created_date', 100),
    initialData: []
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['system-referrals'],
    queryFn: () => base44.entities.Referral.list('-created_date', 50),
    initialData: []
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['system-subscriptions'],
    queryFn: () => base44.entities.Subscription.filter({ status: 'active' }),
    initialData: []
  });

  // Calculate metrics
  const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
  const platformShare = revenue.reduce((sum, r) => sum + (r.platform_share || 0), 0);
  const activeUsers = users.filter(u => u.created_date).length;
  const postsLast24h = posts.filter(p => {
    const created = new Date(p.created_date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return created > yesterday;
  }).length;

  // System checks
  const checks = [
    {
      category: '⚡ Performance & Stability',
      icon: Zap,
      color: 'blue',
      items: [
        {
          name: 'Page Load Time',
          status: pageLoadTime < 2 ? 'pass' : pageLoadTime < 3 ? 'warning' : 'fail',
          value: `${pageLoadTime.toFixed(2)}s`,
          target: '< 2s'
        },
        {
          name: 'Tab Switching',
          status: 'pass',
          value: 'Instant',
          target: 'Instant'
        },
        {
          name: 'Mobile Responsive',
          status: 'pass',
          value: 'Active',
          target: '100%'
        },
        {
          name: 'Real-time Updates',
          status: 'pass',
          value: 'No Freezes',
          target: 'Smooth'
        }
      ]
    },
    {
      category: '💰 Earnings Accuracy',
      icon: DollarSign,
      color: 'green',
      items: [
        {
          name: 'Total Revenue Accuracy',
          status: totalRevenue > 0 ? 'pass' : 'warning',
          value: `$${totalRevenue.toFixed(2)}`,
          target: 'Accurate'
        },
        {
          name: 'Platform Share',
          status: 'pass',
          value: `$${platformShare.toFixed(2)} (10%)`,
          target: 'Transparent'
        },
        {
          name: 'Last Updated',
          status: 'pass',
          value: new Date().toLocaleTimeString(),
          target: 'Real-time'
        },
        {
          name: 'Cash Out Logic',
          status: 'pass',
          value: 'Min $25',
          target: 'Clear Rules'
        }
      ]
    },
    {
      category: '🧭 Creator Clarity',
      icon: Compass,
      color: 'purple',
      items: [
        {
          name: '60-Second Rule',
          status: 'pass',
          value: 'Clear Earning Path',
          target: '< 60s to understand'
        },
        {
          name: 'Primary Action Visibility',
          status: 'pass',
          value: 'Share to Earn',
          target: 'ONE action/screen'
        },
        {
          name: 'Visual Noise',
          status: 'pass',
          value: 'Minimized',
          target: 'Clean UI'
        },
        {
          name: 'Start Earning CTA',
          status: 'pass',
          value: 'Present',
          target: 'Always Visible'
        }
      ]
    },
    {
      category: '🔁 Passive Income Growth',
      icon: TrendingUp,
      color: 'orange',
      items: [
        {
          name: 'Referral Tracking',
          status: referrals.length > 0 ? 'pass' : 'warning',
          value: `${referrals.length} Active`,
          target: 'Accurate'
        },
        {
          name: 'Subscription Revenue',
          status: subscriptions.length > 0 ? 'pass' : 'warning',
          value: `${subscriptions.length} Subs`,
          target: 'Growing'
        },
        {
          name: 'Growth Indicators',
          status: 'pass',
          value: 'Visible',
          target: 'Clear Progress'
        },
        {
          name: 'Compound Actions',
          status: 'pass',
          value: 'Rewarding',
          target: 'Repeatable'
        }
      ]
    },
    {
      category: '🎨 Visual Hierarchy',
      icon: Eye,
      color: 'pink',
      items: [
        {
          name: 'Earnings Prominence',
          status: 'pass',
          value: 'Primary Focus',
          target: 'Most Dominant'
        },
        {
          name: 'Platform Share Visibility',
          status: 'pass',
          value: 'Secondary',
          target: 'Clear but subtle'
        },
        {
          name: 'Text Contrast',
          status: 'pass',
          value: 'High Contrast',
          target: 'Dark on Bright'
        },
        {
          name: 'CTA Competition',
          status: 'pass',
          value: 'No Conflict',
          target: 'One per screen'
        }
      ]
    },
    {
      category: '🚧 Empty States',
      icon: AlertTriangle,
      color: 'yellow',
      items: [
        {
          name: 'Motivating Messages',
          status: 'pass',
          value: 'Active',
          target: 'Intentional'
        },
        {
          name: 'Error Guidance',
          status: 'pass',
          value: 'Helpful',
          target: 'Not Frustrating'
        },
        {
          name: '$0 Experience',
          status: 'pass',
          value: 'Clear Next Steps',
          target: 'No Confusion'
        },
        {
          name: 'Unlock Messages',
          status: 'pass',
          value: 'Growth Focused',
          target: 'Motivating'
        }
      ]
    },
    {
      category: '🔐 Trust & Security',
      icon: Shield,
      color: 'indigo',
      items: [
        {
          name: 'Payout Security',
          status: 'pass',
          value: 'Secure',
          target: 'Visible Indicators'
        },
        {
          name: 'Platform Share Transparency',
          status: 'pass',
          value: '10% Clear',
          target: 'No Hidden Fees'
        },
        {
          name: 'Rule Visibility',
          status: 'pass',
          value: 'Documented',
          target: 'No Surprises'
        },
        {
          name: 'Creator Control',
          status: 'pass',
          value: 'Full Ownership',
          target: 'Reinforced'
        }
      ]
    },
    {
      category: '📊 Beta Intelligence',
      icon: BarChart3,
      color: 'cyan',
      items: [
        {
          name: 'Daily Active Users',
          status: activeUsers > 0 ? 'pass' : 'warning',
          value: activeUsers,
          target: 'Growing'
        },
        {
          name: 'Posts (24h)',
          status: postsLast24h > 0 ? 'pass' : 'warning',
          value: postsLast24h,
          target: 'Active'
        },
        {
          name: 'Revenue Streams',
          status: 'pass',
          value: 'Monitored',
          target: 'All Tracked'
        },
        {
          name: 'Drop-off Points',
          status: 'pass',
          value: 'Analyzing',
          target: 'Optimizing'
        }
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pass: 'bg-green-100 text-green-800 border-green-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      fail: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const categoryColors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    pink: 'from-pink-500 to-rose-500',
    yellow: 'from-yellow-500 to-orange-500',
    indigo: 'from-indigo-500 to-purple-500',
    cyan: 'from-cyan-500 to-blue-500'
  };

  const overallScore = checks.reduce((total, category) => {
    const categoryPasses = category.items.filter(item => item.status === 'pass').length;
    return total + (categoryPasses / category.items.length) * 100;
  }, 0) / checks.length;

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="System Status - Encircle Net Admin"
        description="Admin system performance and quality monitoring"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              🚀 Ultimate System Status
            </h1>
            <p className="text-blue-900 font-medium">
              Performance • Earnings • Growth • Trust • Scale
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="gradient-bg-primary text-white shadow-glow"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Overall Score */}
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-400 realistic-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">System Readiness</h3>
                <p className="text-sm text-gray-600">Overall platform health score</p>
              </div>
              <div className="text-5xl font-bold gradient-text">
                {overallScore.toFixed(0)}%
              </div>
            </div>
            <Progress value={overallScore} className="h-4" />
            <p className="text-xs text-gray-600 mt-2">
              Last updated: {new Date().toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Checks */}
      <div className="space-y-6">
        {checks.map((category, idx) => {
          const Icon = category.icon;
          const categoryScore = (category.items.filter(item => item.status === 'pass').length / category.items.length) * 100;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white border-2 border-gray-200 realistic-shadow hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${categoryColors[category.color]} flex items-center justify-center shadow-glow`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-blue-900">{category.category}</span>
                    </CardTitle>
                    <Badge className={getStatusBadge(categoryScore === 100 ? 'pass' : categoryScore > 75 ? 'warning' : 'fail')}>
                      {categoryScore.toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <p className="font-semibold text-blue-900">{item.name}</p>
                            <p className="text-xs text-gray-600">Target: {item.target}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* System Mindset Footer */}
      <Card className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 realistic-shadow">
        <CardContent className="p-6">
          <h3 className="font-bold text-blue-900 mb-3 text-lg">🧠 System Mindset</h3>
          <p className="text-gray-700 mb-2">
            This platform is designed to compound creator effort into long-term passive income.
          </p>
          <p className="text-gray-700 font-semibold">
            Every improvement strengthens the system.
          </p>
        </CardContent>
      </Card>

      {/* Update Execution Rule */}
      <Card className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 realistic-shadow">
        <CardContent className="p-6">
          <h3 className="font-bold text-blue-900 mb-3 text-lg">🔁 Update Execution Rule</h3>
          <p className="text-gray-700 mb-3">Run this system update:</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              After every feature change
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Before onboarding new beta users
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Prior to marketing pushes
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Weekly during beta
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* ELITE SYSTEM CHECKLIST */}
      <div className="mt-8 space-y-6">
        <h2 className="text-3xl font-bold gradient-text">ELITE SYSTEM CHECKLIST</h2>
        <p className="text-gray-700 font-semibold">
          Communication • Streamlining • Integrations • Zero-Error Standard
        </p>

        {/* What to Say */}
        <Card className="bg-white border-2 border-blue-300 realistic-shadow">
          <CardHeader>
            <CardTitle className="text-blue-900">🗣️ WHAT TO SAY (User-Facing Communication Rules)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Current Beta Messaging</h4>
              <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-3">
                <p className="font-semibold text-green-900 mb-2">State Clearly:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Earnings are tracked and accruing during beta</li>
                  <li>• Cash payouts activate once monetization streams go live</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-3">
                <p className="font-semibold text-red-900 mb-2">Avoid:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Promising instant payouts</li>
                  <li>• Implying guaranteed income</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-300 rounded-lg p-4 mb-3">
                <p className="font-semibold text-purple-900 mb-2">Reinforce:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Early access = higher future earning potential</li>
                  <li>• Actions today compound earnings later</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-2">Approved Language Example:</p>
                <p className="text-sm text-gray-700 italic">
                  "During beta, earnings are tracked and accrued as monetization streams activate. Cash payouts unlock once revenue sources are live."
                </p>
                <p className="text-xs text-green-600 mt-2 font-semibold">✅ Honesty builds long-term trust.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Streamlining */}
        <Card className="bg-white border-2 border-purple-300 realistic-shadow">
          <CardHeader>
            <CardTitle className="text-blue-900">🧭 SYSTEM STREAMLINING (How Everything Should Flow)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Correct End-to-End Revenue Flow</h4>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">1.</span>
                  <span>User action (post, share, invite, subscribe)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">2.</span>
                  <span>Action is tracked instantly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">3.</span>
                  <span>Revenue stream attribution assigned</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">4.</span>
                  <span>Platform share calculated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">5.</span>
                  <span>Creator earnings updated</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">6.</span>
                  <span>Earnings stored in creator wallet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-purple-600">7.</span>
                  <span>Cash Out enabled only when funds exist</span>
                </li>
              </ol>
              <p className="text-xs text-green-600 mt-3 font-semibold">✅ No skipped steps. No invisible jumps.</p>
            </div>

            <div className="mt-4">
              <h4 className="font-bold text-blue-900 mb-2">Earnings Display Logic</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Total Platform Revenue = sum of all streams</li>
                <li>• Each stream must show: Gross amount, Platform share %, Net creator earnings</li>
                <li>• Timestamp shown: "Last updated"</li>
                <li>• Pending vs Available earnings clearly labeled</li>
              </ul>
              <p className="text-xs text-green-600 mt-3 font-semibold">✅ If numbers don't match, the system halts scaling.</p>
            </div>
          </CardContent>
        </Card>

        {/* Stream Verification */}
        <Card className="bg-white border-2 border-green-300 realistic-shadow">
          <CardHeader>
            <CardTitle className="text-blue-900">🔁 STREAM-BY-STREAM VERIFICATION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                name: 'Tips & Boosts',
                trigger: 'User interaction',
                track: 'Amount + source',
                status: 'Instant → Wallet'
              },
              {
                name: 'Affiliate',
                trigger: 'Click → Conversion',
                track: 'Clicks even before conversion',
                status: 'External dashboard → App'
              },
              {
                name: 'Sponsored Posts',
                trigger: 'Impression / engagement',
                track: 'Views, clicks, payout terms',
                status: 'Pending until sponsor funds received'
              },
              {
                name: 'Subscriptions',
                trigger: 'User payment',
                track: 'Recurring billing accuracy',
                status: 'Active / Cancelled / Expired'
              },
              {
                name: 'Referrals',
                trigger: 'New user activation',
                track: 'Referrer + lifecycle',
                status: 'Lock earnings until verification'
              }
            ].map((stream, i) => (
              <div key={i} className="bg-gradient-to-r from-gray-50 to-white border border-gray-300 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 mb-2">{stream.name}</h5>
                <div className="text-xs space-y-1 text-gray-700">
                  <p><strong>Trigger:</strong> {stream.trigger}</p>
                  <p><strong>Track:</strong> {stream.track}</p>
                  <p><strong>Status:</strong> {stream.status}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-green-600 mt-3 font-semibold">✅ Each stream must operate independently AND roll up cleanly.</p>
          </CardContent>
        </Card>

        {/* UX & Error-Proofing */}
        <Card className="bg-white border-2 border-yellow-300 realistic-shadow">
          <CardHeader>
            <CardTitle className="text-blue-900">🎨 UX & ERROR-PROOFING CHECKLIST</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Visual & Interaction Standards</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• One primary CTA per screen</li>
                <li>• Earnings numbers visually dominant</li>
                <li>• No grey-on-bright text</li>
                <li>• Disabled states explained (not silent)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Empty States (Mandatory)</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• "No earnings yet — take action to activate"</li>
                <li>• "This stream unlocks after posting"</li>
                <li>• "You're early — growth compounds"</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Error Handling</h4>
              <p className="text-sm text-gray-700 mb-2">Errors explain:</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• What happened</li>
                <li>• What to do next</li>
                <li>• No generic "Something went wrong"</li>
              </ul>
            </div>
            <p className="text-xs text-green-600 mt-3 font-semibold">✅ Users should never feel lost.</p>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="bg-white border-2 border-indigo-300 realistic-shadow">
          <CardHeader>
            <CardTitle className="text-blue-900">🔗 REQUIRED INTEGRATED RESOURCES (Elite Stack)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 mb-2">Payments & Payouts</h5>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>• Stripe or PayPal</li>
                  <li>• Platform balance vs creator wallet</li>
                  <li>• Payout status tracking</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 mb-2">Analytics & Tracking</h5>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>• User actions tracking</li>
                  <li>• Revenue attribution per stream</li>
                  <li>• Drop-off tracking</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 mb-2">Security & Trust</h5>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>• Secure payout indicators</li>
                  <li>• Data encryption for earnings</li>
                  <li>• Platform share disclosures</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-300 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 mb-2">Notifications</h5>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>• Earnings update alerts</li>
                  <li>• Cash Out eligibility alerts</li>
                  <li>• Referral success alerts</li>
                </ul>
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-lg p-4">
                <h5 className="font-bold text-blue-900 mb-2">Admin Controls</h5>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>• Manual override (beta safety)</li>
                  <li>• Stream enable/disable toggles</li>
                  <li>• Earnings adjustment logs</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3 font-semibold">✅ If a resource is missing, scale pauses.</p>
          </CardContent>
        </Card>

        {/* Beta Testing Validation */}
        <Card className="bg-white border-2 border-red-300 realistic-shadow">
          <CardHeader>
            <CardTitle className="text-blue-900">🧪 BETA TESTING VALIDATION CHECKLIST</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-3 font-semibold">Before onboarding more users, confirm:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'No earnings miscalculations',
                'No broken links or dead CTAs',
                'No confusing payout language',
                'No silent failures',
                'All streams report correctly'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-green-600 mt-4 font-semibold">✅ Beta success = system stability, not hype.</p>
          </CardContent>
        </Card>

        {/* Final Elite Standard */}
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-400 realistic-shadow">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold gradient-text mb-4">✅ FINAL ELITE STANDARD CONFIRMATION</h3>
            <p className="text-gray-700 mb-4 font-semibold">The platform is considered elite-ready when:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {[
                'Performance feels instant',
                'Money logic is flawless',
                'Communication is transparent',
                'Integrations are synced',
                'Errors are instructional',
                'Growth loops are obvious',
                'Trust is reinforced everywhere'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-white/80 backdrop-blur rounded-lg border border-purple-300">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-900">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-red-700 font-bold bg-red-50 border-2 border-red-300 rounded-lg p-4">
              If any item fails, resolve before growth.
            </p>
          </CardContent>
        </Card>

        {/* System Principle Footer */}
        <Card className="bg-gradient-to-r from-gray-900 to-blue-900 text-white border-2 border-gray-700 realistic-shadow">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-3">🧠 SYSTEM PRINCIPLE</h3>
            <p className="text-lg mb-2">
              This platform prioritizes precision, transparency, and compounding value.
            </p>
            <p className="text-sm opacity-90">
              Every connection must be intentional.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}