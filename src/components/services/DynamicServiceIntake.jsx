import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Sparkles, DollarSign } from 'lucide-react';

export default function DynamicServiceIntake({ vertical, onSubmit }) {
  const [formData, setFormData] = useState({});
  const [aiPricing, setAiPricing] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (questionId, value) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const handleAIPricing = async () => {
    if (!vertical.pricing_logic?.ai_enabled) return;
    
    setLoading(true);
    try {
      const context = vertical.intake_questions
        .map(q => `${q.label}: ${formData[q.id] || 'Not provided'}`)
        .join('\n');

      const prompt = vertical.pricing_logic.ai_prompt || 
        `Based on this ${vertical.name} service request:\n${context}\n\nProvide a fair price estimate with breakdown.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            estimated_price: { type: "number" },
            price_range_min: { type: "number" },
            price_range_max: { type: "number" },
            breakdown: { type: "array", items: { type: "string" } },
            reasoning: { type: "string" }
          }
        }
      });

      setAiPricing(result);
    } catch (error) {
      console.error('AI pricing failed:', error);
    }
    setLoading(false);
  };

  const renderField = (question) => {
    switch (question.type) {
      case 'text':
        return (
          <Input
            value={formData[question.id] || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.label}
          />
        );
      case 'textarea':
        return (
          <Textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.label}
            rows={3}
          />
        );
      case 'select':
        return (
          <Select value={formData[question.id]} onValueChange={(val) => handleChange(question.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${question.label}`} />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((opt, i) => (
                <SelectItem key={i} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={formData[question.id] || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            placeholder={question.label}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={formData[question.id] || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{vertical.icon || '🔧'}</span>
        <div>
          <h2 className="text-2xl font-bold text-blue-900">{vertical.name}</h2>
          <p className="text-sm text-gray-600">{vertical.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {vertical.intake_questions?.map((question) => (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              {question.label}
              {question.required && <span className="text-red-600 ml-1">*</span>}
            </Label>
            {renderField(question)}
          </div>
        ))}
      </div>

      {vertical.pricing_logic?.ai_enabled && (
        <div className="space-y-3">
          <Button 
            onClick={handleAIPricing} 
            disabled={loading}
            variant="outline"
            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {loading ? 'Calculating...' : 'Get AI Price Estimate'}
          </Button>

          {aiPricing && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-green-900">AI Price Estimate</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-2xl font-bold text-green-900">${aiPricing.estimated_price}</p>
                <p className="text-gray-700">Range: ${aiPricing.price_range_min} - ${aiPricing.price_range_max}</p>
                {aiPricing.breakdown && (
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Breakdown:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {aiPricing.breakdown.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-gray-600 italic mt-2">{aiPricing.reasoning}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Button 
        onClick={() => onSubmit({ ...formData, aiPricing })}
        className="w-full gradient-bg-primary text-white shadow-glow"
      >
        Submit Request
      </Button>
    </div>
  );
}