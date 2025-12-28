import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Plus, Edit, Trash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollaborationsShowcase({ user, isOwner }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ brand_name: '', description: '', year: '' });
  const collaborations = user.past_collaborations || [];

  const handleSave = async () => {
    const updated = editingId !== null
      ? collaborations.map((c, i) => i === editingId ? formData : c)
      : [...collaborations, formData];

    await base44.auth.updateMe({ past_collaborations: updated });
    setIsAdding(false);
    setEditingId(null);
    setFormData({ brand_name: '', description: '', year: '' });
    window.location.reload();
  };

  const handleDelete = async (index) => {
    const updated = collaborations.filter((_, i) => i !== index);
    await base44.auth.updateMe({ past_collaborations: updated });
    window.location.reload();
  };

  return (
    <Card className="bg-white border-2 border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Past Collaborations
          </CardTitle>
          {isOwner && (
            <Button size="sm" onClick={() => setIsAdding(true)} className="gradient-bg-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="border-2 border-purple-300 rounded-xl p-4 bg-purple-50 space-y-3">
            <div>
              <Label>Brand Name</Label>
              <Input value={formData.brand_name} onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <Label>Year</Label>
              <Input value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} placeholder="2024" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gradient-bg-primary text-white">Save</Button>
              <Button variant="outline" onClick={() => { setIsAdding(false); setFormData({ brand_name: '', description: '', year: '' }); }}>Cancel</Button>
            </div>
          </div>
        )}

        {collaborations.length === 0 && !isAdding ? (
          <p className="text-center text-gray-500 py-8">No collaborations added yet</p>
        ) : (
          collaborations.map((collab, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-cyan-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900">{collab.brand_name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{collab.description}</p>
                  <p className="text-xs text-gray-500 mt-2">{collab.year}</p>
                </div>
                {isOwner && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(index)}>
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}