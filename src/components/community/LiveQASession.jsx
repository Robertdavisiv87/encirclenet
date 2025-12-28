import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, ThumbsUp, Clock, Users } from 'lucide-react';
import moment from 'moment';
import { motion } from 'framer-motion';

export default function LiveQASession({ sessionId, currentUser, isHost }) {
  const [newQuestion, setNewQuestion] = useState('');
  const [answerText, setAnswerText] = useState({});
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['qa-session', sessionId],
    queryFn: () => base44.entities.LiveQA.filter({ id: sessionId }).then(s => s[0]),
    refetchInterval: 10000
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['qa-questions', sessionId],
    queryFn: () => base44.entities.QAQuestion.filter({ qa_session_id: sessionId }, '-created_date'),
    refetchInterval: 5000
  });

  const askMutation = useMutation({
    mutationFn: (question) => base44.entities.QAQuestion.create({
      qa_session_id: sessionId,
      asker_email: currentUser.email,
      asker_name: currentUser.full_name,
      question,
      upvotes: 0,
      is_answered: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['qa-questions']);
      setNewQuestion('');
    }
  });

  const answerMutation = useMutation({
    mutationFn: ({ questionId, answer }) => 
      base44.entities.QAQuestion.update(questionId, {
        answer,
        is_answered: true,
        answered_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['qa-questions']);
      setAnswerText({});
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: (question) => 
      base44.entities.QAQuestion.update(question.id, {
        upvotes: (question.upvotes || 0) + 1
      }),
    onSuccess: () => queryClient.invalidateQueries(['qa-questions'])
  });

  if (!session) return null;

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              {session.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{session.description}</p>
          </div>
          <Badge className={session.status === 'live' ? 'bg-red-600 animate-pulse' : 'bg-gray-600'}>
            {session.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {moment(session.scheduled_time).format('MMM D, h:mm A')}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {questions.length} questions
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Ask Question Form */}
        {!isHost && session.status === 'live' && (
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <Textarea
              placeholder="Ask a question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="mb-3"
            />
            <Button
              onClick={() => askMutation.mutate(newQuestion)}
              disabled={!newQuestion.trim() || askMutation.isPending}
              className="gradient-bg-primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Question
            </Button>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-3">
          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={q.is_answered ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => upvoteMutation.mutate(q)}
                      className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-600"
                      disabled={!currentUser}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-xs font-bold">{q.upvotes || 0}</span>
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 mb-1">{q.question}</p>
                      <p className="text-xs text-gray-500 mb-2">
                        Asked by {q.asker_name} • {moment(q.created_date).fromNow()}
                      </p>
                      
                      {q.is_answered ? (
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-sm text-gray-700">{q.answer}</p>
                        </div>
                      ) : isHost ? (
                        <div className="mt-2">
                          <Input
                            placeholder="Type your answer..."
                            value={answerText[q.id] || ''}
                            onChange={(e) => setAnswerText({ ...answerText, [q.id]: e.target.value })}
                            className="mb-2"
                          />
                          <Button
                            size="sm"
                            onClick={() => answerMutation.mutate({ 
                              questionId: q.id, 
                              answer: answerText[q.id] 
                            })}
                            disabled={!answerText[q.id]}
                            className="gradient-bg-primary"
                          >
                            Answer
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline">Awaiting answer</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
          {questions.length === 0 && (
            <p className="text-center text-gray-500 py-8">No questions yet. Be the first to ask!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}