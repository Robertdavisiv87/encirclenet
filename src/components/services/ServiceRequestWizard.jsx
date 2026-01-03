import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, DollarSign, CheckCircle, Loader2, Shield } from 'lucide-react';
import CalendarBooking from './CalendarBooking';

export default function ServiceRequestWizard({ vertical, isOpen, onClose, user }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [addOns, setAddOns] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [loadingAddOns, setLoadingAddOns] = useState(false);
  const [serviceRequest, setServiceRequest] = useState(null);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ServiceRequest.create(data);
    },
    onSuccess: (request) => {
      setServiceRequest(request);
      setStep(4);
    }
  });

  const handleInputChange = (questionId, value) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
  };

  const generateAIPricing = async () => {
    setLoadingPricing(true);
    try {
      const prompt = `You are a pricing expert for ${vertical.name} services.

Service Details:
${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Base Price: $${vertical.pricing_logic?.base_price || 0}
${vertical.pricing_logic?.ai_prompt || ''}

Provide a fair, competitive price estimate considering:
- Service complexity
- Market rates
- Time required
- Materials needed

Return JSON with: estimated_price (number), breakdown (array of {item, cost}), reasoning (string)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            estimated_price: { type: "number" },
            breakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  cost: { type: "number" }
                }
              }
            },
            reasoning: { type: "string" }
          }
        }
      });

      setPricing(result);
    } catch (error) {
      console.error('Pricing error:', error);
      setPricing({
        estimated_price: vertical.pricing_logic?.base_price || 50,
        breakdown: [{ item: 'Base service', cost: vertical.pricing_logic?.base_price || 50 }],
        reasoning: 'Standard pricing applied'
      });
    }
    setLoadingPricing(false);
  };

  const generateAddOnSuggestions = async () => {
    setLoadingAddOns(true);
    try {
      const prompt = `You are a service upsell expert for ${vertical.name}.

Customer's Request:
${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join('\n')}

Suggest 3-5 relevant add-on services that would benefit this customer. Be specific and helpful.

Return JSON array with: name (string), description (string), price (number), priority (1-5)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            addons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  priority: { type: "number" }
                }
              }
            }
          }
        }
      });

      setAddOns(result.addons || []);
    } catch (error) {
      console.error('Add-ons error:', error);
    }
    setLoadingAddOns(false);
  };

  const handleNext = async () => {
    if (step === 1) {
      // After questions, generate pricing and add-ons
      await Promise.all([generateAIPricing(), generateAddOnSuggestions()]);
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleReviewSubmit = () => {
    const selectedAddOns = addOns.filter(addon => formData[`addon_${addon.name}`]);
    const totalPrice = (pricing?.estimated_price || 0) + selectedAddOns.reduce((sum, a) => sum + a.price, 0);

    createRequestMutation.mutate({
      customer_email: user.email,
      service_vertical: vertical.slug,
      service_details: formData,
      selected_addons: selectedAddOns,
      estimated_price: totalPrice,
      status: 'pending_provider'
    });
  };

  const totalPrice = (pricing?.estimated_price || 0) + addOns.filter(a => formData[`addon_${a.name}`]).reduce((sum, a) => sum + a.price, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 gradient-text">
            <Sparkles className="w-6 h-6 text-purple-600" />
            {vertical.name} Request
          </DialogTitle>
        </DialogHeader>

        <Progress value={progress} className="mb-4" />

        <AnimatePresence mode="wait">
          {/* Step 1: Service Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Tell us about your needs</h3>
              
              {vertical.intake_questions?.map((question) => (
                <div key={question.id}>
                  <Label>{question.label} {question.required && <span className="text-red-500">*</span>}</Label>
                  
                  {question.type === 'text' && (
                    <Input
                      value={formData[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder={question.label}
                      required={question.required}
                    />
                  )}
                  
                  {question.type === 'textarea' && (
                    <Textarea
                      value={formData[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder={question.label}
                      rows={3}
                      required={question.required}
                    />
                  )}
                  
                  {question.type === 'select' && (
                    <select
                      value={formData[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                      required={question.required}
                    >
                      <option value="">Select...</option>
                      {question.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                  
                  {question.type === 'number' && (
                    <Input
                      type="number"
                      value={formData[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder={question.label}
                      required={question.required}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Step 2: AI Pricing & Add-ons */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Pricing Estimate</h3>
              
              {loadingPricing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Calculating best price...</span>
                </div>
              ) : pricing && (
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-green-900">${pricing.estimated_price}</span>
                      <Sparkles className="w-6 h-6 text-green-600" />
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {pricing.breakdown?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.item}</span>
                          <span className="font-semibold text-gray-900">${item.cost}</span>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-600 italic">{pricing.reasoning}</p>
                  </CardContent>
                </Card>
              )}

              <h3 className="text-lg font-semibold text-gray-900 pt-4">Recommended Add-ons</h3>
              
              {loadingAddOns ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="space-y-2">
                  {addOns.map((addon, i) => (
                    <Card key={i} className="hover-lift cursor-pointer" onClick={() => handleInputChange(`addon_${addon.name}`, !formData[`addon_${addon.name}`])}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={!!formData[`addon_${addon.name}`]}
                            onCheckedChange={(checked) => handleInputChange(`addon_${addon.name}`, checked)}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                              <span className="text-green-600 font-bold">+${addon.price}</span>
                            </div>
                            <p className="text-sm text-gray-600">{addon.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">Review Your Request</h3>
              
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <h4 className="font-semibold text-gray-900">Service Details</h4>
                  {Object.entries(formData).filter(([key]) => !key.startsWith('addon_')).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-blue-900 mb-3">Total Price</h4>
                  <div className="text-3xl font-bold text-blue-900 mb-3">
                    ${(pricing?.estimated_price || 0) + addOns.filter(a => formData[`addon_${a.name}`]).reduce((sum, a) => sum + a.price, 0)}
                  </div>
                  
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Base service</span>
                      <span>${pricing?.estimated_price || 0}</span>
                    </div>
                    {addOns.filter(a => formData[`addon_${a.name}`]).map((addon, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{addon.name}</span>
                        <span>${addon.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-green-900 mb-1">Payment Protection</p>
                    <p>Your payment is held securely until service is completed and verified.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Calendar Booking */}
          {step === 4 && serviceRequest && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CalendarBooking
                serviceRequest={serviceRequest}
                provider={{ email: 'auto-assigned', name: 'Best Available Provider' }}
                totalPrice={totalPrice}
                onBookingComplete={() => setStep(5)}
              />
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
              <p className="text-gray-600 mb-6">We're matching you with the best provider in your area.</p>
              <Button onClick={onClose} className="gradient-bg-primary text-white">
                View Request Status
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 5 && (
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {step < 3 && (
              <Button onClick={handleNext} className="flex-1 gradient-bg-primary text-white" disabled={loadingPricing || loadingAddOns}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleReviewSubmit} className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={createRequestMutation.isLoading}>
                {createRequestMutation.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue to Booking'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}