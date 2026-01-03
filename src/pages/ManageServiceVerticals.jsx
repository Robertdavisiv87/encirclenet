import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminProtection from '../components/auth/AdminProtection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Wrench, Sparkles, Trash2, Edit, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ManageServiceVerticals() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVertical, setEditingVertical] = useState(null);
  const queryClient = useQueryClient();

  const { data: verticals, isLoading } = useQuery({
    queryKey: ['service-verticals'],
    queryFn: () => base44.entities.ServiceVertical.list('-created_date'),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceVertical.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['service-verticals']);
      setShowCreateModal(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceVertical.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['service-verticals']);
      setEditingVertical(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServiceVertical.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['service-verticals'])
  });

  const handleGenerateWithAI = async (verticalName) => {
    const prompt = `Generate a comprehensive service vertical configuration for "${verticalName}" including:
    1. 5-7 relevant intake questions with appropriate field types
    2. AI-powered pricing logic with key factors
    3. Compliance rules and required documents
    4. Provider requirements
    Return as JSON.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          intake_questions: { type: "array" },
          pricing_logic: { type: "object" },
          compliance_rules: { type: "array" },
          provider_requirements: { type: "array" }
        }
      }
    });

    return result;
  };

  return (
    <AdminProtection>
      <div className="max-w-7xl mx-auto p-6 bg-gradient-to-b from-purple-50 to-white min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Service Verticals Management</h1>
            <p className="text-gray-600">Define and manage AI-powered service categories</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gradient-bg-primary text-white shadow-glow">
            <Plus className="w-5 h-5 mr-2" />
            Create Vertical
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading verticals...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {verticals.map((vertical) => (
              <Card key={vertical.id} className="bg-white realistic-shadow hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-3xl">{vertical.icon || '🔧'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{vertical.name}</span>
                        {vertical.pricing_logic?.ai_enabled && (
                          <Sparkles className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-normal">{vertical.description}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-700">Intake Questions: {vertical.intake_questions?.length || 0}</p>
                    <p className="font-semibold text-gray-700">Compliance Rules: {vertical.compliance_rules?.length || 0}</p>
                    <p className="font-semibold text-gray-700">Provider Reqs: {vertical.provider_requirements?.length || 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingVertical(vertical)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(vertical.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateVerticalModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createMutation.mutate(data)}
          onGenerateAI={handleGenerateWithAI}
        />

        <EditVerticalModal
          vertical={editingVertical}
          onClose={() => setEditingVertical(null)}
          onUpdate={(data) => updateMutation.mutate({ id: editingVertical.id, data })}
        />
      </div>
    </AdminProtection>
  );
}

function CreateVerticalModal({ isOpen, onClose, onCreate, onGenerateAI }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    intake_questions: [],
    pricing_logic: { ai_enabled: false, pricing_factors: [] },
    compliance_rules: [],
    provider_requirements: []
  });
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const aiConfig = await onGenerateAI(formData.name);
      setFormData(prev => ({ ...prev, ...aiConfig }));
    } catch (error) {
      alert('AI generation failed');
    }
    setGenerating(false);
  };

  const handleSubmit = () => {
    onCreate({
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-')
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Service Vertical</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Service Name (e.g., Mobile Mechanics)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            placeholder="Icon (emoji or icon name)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <Button 
            onClick={handleGenerate} 
            disabled={!formData.name || generating}
            className="w-full gradient-bg-primary text-white"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {generating ? 'Generating...' : 'Generate Configuration with AI'}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name} className="flex-1 gradient-bg-primary text-white">
              <Save className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditVerticalModal({ vertical, onClose, onUpdate }) {
  const [formData, setFormData] = useState(vertical || {});

  React.useEffect(() => {
    if (vertical) setFormData(vertical);
  }, [vertical]);

  if (!vertical) return null;

  return (
    <Dialog open={!!vertical} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {vertical.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Service Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Configuration Preview</h4>
            <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={() => onUpdate(formData)} className="flex-1 gradient-bg-primary text-white">
              <Save className="w-4 h-4 mr-2" />
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}