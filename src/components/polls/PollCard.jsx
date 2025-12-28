import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Clock } from 'lucide-react';
import moment from 'moment';
import { motion } from 'framer-motion';

export default function PollCard({ poll, currentUser, onVoted }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const queryClient = useQueryClient();

  const hasVoted = poll.voters?.includes(currentUser?.email);
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

  const voteMutation = useMutation({
    mutationFn: async () => {
      const updatedOptions = poll.options.map((opt, idx) => ({
        ...opt,
        votes: idx === selectedOption ? (opt.votes || 0) + 1 : (opt.votes || 0)
      }));

      await base44.entities.Poll.update(poll.id, {
        options: updatedOptions,
        voters: [...(poll.voters || []), currentUser.email],
        total_votes: (poll.total_votes || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['polls']);
      if (onVoted) onVoted();
    }
  });

  const handleVote = () => {
    if (selectedOption === null || hasVoted || isExpired) return;
    voteMutation.mutate();
  };

  const getPercentage = (votes) => {
    return poll.total_votes > 0 ? ((votes / poll.total_votes) * 100).toFixed(1) : 0;
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-2">{poll.question}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {poll.total_votes || 0} votes
              </span>
              {poll.expires_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {isExpired ? 'Ended' : `Ends ${moment(poll.expires_at).fromNow()}`}
                </span>
              )}
            </div>
          </div>
          {isExpired && <Badge variant="outline" className="text-gray-600">Closed</Badge>}
          {hasVoted && !isExpired && <Badge className="bg-green-600">Voted</Badge>}
        </div>

        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const percentage = getPercentage(option.votes || 0);
            const isSelected = selectedOption === index;
            const showResults = hasVoted || isExpired;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {showResults ? (
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{option.text}</span>
                      <span className="text-sm font-bold text-blue-600">{percentage}%</span>
                    </div>
                    <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end pr-2"
                      >
                        <span className="text-xs text-white font-bold">{option.votes || 0}</span>
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedOption(index)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{option.text}</span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {!hasVoted && !isExpired && (
          <Button
            onClick={handleVote}
            disabled={selectedOption === null || voteMutation.isPending}
            className="w-full mt-4 gradient-bg-primary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Submit Vote
          </Button>
        )}
      </CardContent>
    </Card>
  );
}