import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Palette, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfileCustomization({ user, onSave }) {
  const [formData, setFormData] = useState({
    tagline: user.tagline || '',
    profile_theme: user.profile_theme || 'default',
    skills: user.skills || [],
    services_offered: user.services_offered || [],
    hourly_rate: user.hourly_rate || 0,
    availability_status: user.availability_status || 'available',
    social_links: user.social_links || {}
  });
  const [newSkill, setNewSkill] = useState('');
  const [newService, setNewService] = useState('');
  const [saving, setSaving] = useState(false);

  const themes = [
    { id: 'default', name: 'Default', gradient: 'from-purple-500 to-pink-500' },
    { id: 'dark', name: 'Dark', gradient: 'from-gray-800 to-gray-900' },
    { id: 'minimal', name: 'Minimal', gradient: 'from-gray-100 to-white' },
    { id: 'vibrant', name: 'Vibrant', gradient: 'from-orange-500 to-red-500' },
    { id: 'elegant', name: 'Elegant', gradient: 'from-indigo-500 to-purple-600' },
    { id: 'professional', name: 'Professional', gradient: 'from-blue-600 to-cyan-500' }
  ];

  const handleUploadBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_banner: file_url });
      alert('✅ Banner uploaded successfully!');
      onSave();
    } catch (error) {
      alert('Failed to upload banner');
    }
  };

  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addService = () => {
    if (newService && !formData.services_offered.includes(newService)) {
      setFormData({ ...formData, services_offered: [...formData.services_offered, newService] });
      setNewService('');
    }
  };

  const removeService = (service) => {
    setFormData({ ...formData, services_offered: formData.services_offered.filter(s => s !== service) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      alert('✅ Profile customization saved!');
      onSave();
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Profile Banner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user.profile_banner && (
              <img src={user.profile_banner} alt="Banner" className="w-full h-32 object-cover rounded-lg" />
            )}
            <Input type="file" accept="image/*" onChange={handleUploadBanner} />
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Profile Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themes.map(theme => (
              <div
                key={theme.id}
                onClick={() => setFormData({ ...formData, profile_theme: theme.id })}
                className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  formData.profile_theme === theme.id ? 'border-purple-500 shadow-glow' : 'border-gray-200'
                }`}
              >
                <div className={`w-full h-12 rounded-lg bg-gradient-to-r ${theme.gradient} mb-2`}></div>
                <p className="text-sm font-semibold text-center">{theme.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tagline</Label>
            <Input
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g., Creative Designer | Brand Strategist"
            />
          </div>

          <div>
            <Label>Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2">
                  {skill}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label>Services Offered</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add a service"
                onKeyPress={(e) => e.key === 'Enter' && addService()}
              />
              <Button onClick={addService} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.services_offered.map(service => (
                <span key={service} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                  {service}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeService(service)} />
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Hourly Rate ($)</Label>
              <Input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Availability</Label>
              <Select value={formData.availability_status} onValueChange={(value) => setFormData({ ...formData, availability_status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {['instagram', 'twitter', 'youtube', 'linkedin', 'tiktok'].map(platform => (
            <div key={platform}>
              <Label className="capitalize">{platform}</Label>
              <Input
                value={formData.social_links[platform] || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  social_links: { ...formData.social_links, [platform]: e.target.value }
                })}
                placeholder={`https://${platform}.com/...`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full gradient-bg-primary text-white shadow-glow">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}