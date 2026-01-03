import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    memoryUsage: 0,
    apiCalls: 0,
    errorCount: 0,
    uptime: 0
  });
  const [status, setStatus] = useState('optimal');

  useEffect(() => {
    // Monitor performance metrics
    const startTime = performance.now();
    
    const monitorPerformance = () => {
      const loadTime = performance.now() - startTime;
      const memory = performance.memory ? (performance.memory.usedJSHeapSize / 1048576).toFixed(2) : 0;
      
      setMetrics(prev => ({
        ...prev,
        pageLoadTime: loadTime.toFixed(0),
        memoryUsage: memory,
        uptime: prev.uptime + 1
      }));

      // Determine status
      if (loadTime > 3000 || memory > 100) {
        setStatus('warning');
      } else if (loadTime < 1000 && memory < 50) {
        setStatus('optimal');
      } else {
        setStatus('good');
      }
    };

    monitorPerformance();
    const interval = setInterval(monitorPerformance, 5000);

    // Monitor errors
    const errorHandler = () => {
      setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
    };
    window.addEventListener('error', errorHandler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'optimal': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'optimal': return CheckCircle;
      case 'warning': return AlertTriangle;
      default: return Activity;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            System Health
          </span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <StatusIcon className={`w-5 h-5 ${getStatusColor()}`} />
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-2">
            <p className="text-xs text-gray-600">Load Time</p>
            <p className="text-sm font-bold text-blue-900">{metrics.pageLoadTime}ms</p>
          </div>
          <div className="bg-white rounded-lg p-2">
            <p className="text-xs text-gray-600">Memory</p>
            <p className="text-sm font-bold text-blue-900">{metrics.memoryUsage}MB</p>
          </div>
          <div className="bg-white rounded-lg p-2">
            <p className="text-xs text-gray-600">Errors</p>
            <p className="text-sm font-bold text-blue-900">{metrics.errorCount}</p>
          </div>
          <div className="bg-white rounded-lg p-2">
            <p className="text-xs text-gray-600">Uptime</p>
            <p className="text-sm font-bold text-blue-900">{Math.floor(metrics.uptime / 60)}m</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={`font-semibold ${getStatusColor()}`}>
            {status.toUpperCase()}
          </span>
          <span className="text-gray-600 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Auto-optimizing
          </span>
        </div>
      </CardContent>
    </Card>
  );
}