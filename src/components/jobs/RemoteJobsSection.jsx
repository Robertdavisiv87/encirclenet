import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, ExternalLink, Clock, DollarSign, MapPin, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

export default function RemoteJobsSection() {
  const [category, setCategory] = useState('all');

  const { data: jobsData, isLoading, refetch } = useQuery({
    queryKey: ['remote-jobs', category],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchRemoteJobs', { category });
      return response.data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const jobs = jobsData?.jobs || [];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'it_helpdesk', label: 'IT Help Desk' },
    { value: 'cloud_infrastructure', label: 'Cloud & DevOps' },
    { value: 'admin', label: 'Administrative' },
    { value: 'freelance', label: 'Freelance' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Briefcase className="w-7 h-7" />
            Work From Home Jobs
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time remote job listings from top platforms
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl">
        <Filter className="w-5 h-5 text-purple-600" />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-64 bg-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Jobs Grid */}
      {!isLoading && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-purple-400 transition-all shadow-md hover:shadow-xl"
            >
              {/* Job Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-lg mb-1">
                    {job.job_title}
                  </h3>
                  <p className="text-purple-600 font-semibold">{job.company}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full">
                  {job.job_type}
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  {job.salary_range}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  {job.posted_date}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {job.description}
              </p>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Key Requirements:</p>
                  <ul className="space-y-1">
                    {job.requirements.slice(0, 3).map((req, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply Button */}
              <Button
                className="w-full gradient-bg-primary text-white shadow-glow hover-lift"
                onClick={() => {
                  if (job.apply_url) {
                    window.open(job.apply_url, '_blank', 'noopener,noreferrer');
                  } else {
                    alert('Application URL not available. Please search for this job on ' + (job.platform || 'job boards'));
                  }
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Apply Now
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && jobs.length === 0 && (
        <div className="text-center py-20">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 font-medium">No jobs found</p>
          <p className="text-sm text-gray-500 mt-1">Try changing the category filter</p>
        </div>
      )}

      {/* Job Platforms Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mt-6">
        <p className="text-xs text-gray-600 text-center">
          Jobs aggregated from: LinkedIn, Indeed, ZipRecruiter, FlexJobs, We Work Remotely, Remote.co, Upwork, Fiverr, and 12+ platforms
        </p>
      </div>
    </div>
  );
}