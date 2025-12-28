import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Lightbulb, PenTool, Image as ImageIcon, Copy, Check, Loader2, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

export default function CreatorTools() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('ideas');
  
  // Content Idea Generator
  const [niche, setNiche] = useState('');
  const [contentType, setContentType] = useState('video');
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState([]);

  // Caption Assistant
  const [draftCaption, setDraftCaption] = useState('');
  const [captionTone, setCaptionTone] = useState('engaging');
  const [captionLoading, setCaptionLoading] = useState(false);
  const [optimizedCaptions, setOptimizedCaptions] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Visual Enhancement
  const [imagePrompt, setImagePrompt] = useState('');
  const [visualStyle, setVisualStyle] = useState('professional');
  const [visualLoading, setVisualLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  const handleGenerateIdeas = async () => {
    if (!niche) {
      alert('Please enter your niche or topic');
      return;
    }

    setIdeasLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a viral content strategist. Generate 5 creative, trending-worthy content ideas for a ${contentType} creator in the "${niche}" niche.

For each idea, provide:
- A catchy title
- Brief description (1-2 sentences)
- Why it will perform well
- Suggested hashtags

Make ideas fresh, engaging, and aligned with current trends. Focus on ideas that drive engagement and monetization.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  why_it_works: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setGeneratedIdeas(response.ideas || []);
    } catch (error) {
      console.error('Failed to generate ideas:', error);
      alert('Failed to generate ideas. Please try again.');
    } finally {
      setIdeasLoading(false);
    }
  };

  const handleOptimizeCaption = async () => {
    if (!draftCaption) {
      alert('Please enter a caption to optimize');
      return;
    }

    setCaptionLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert social media copywriter. Optimize this caption for maximum engagement:

Original caption: "${draftCaption}"

Desired tone: ${captionTone}

Provide 3 optimized versions:
1. SEO-optimized (keyword-rich, searchable)
2. Engagement-optimized (conversation-starting, interactive)
3. Conversion-optimized (clear CTA, monetization-focused)

For each version:
- Rewritten caption
- Suggested hashtags (5-10)
- Expected engagement boost (%)
- Best posting time

Make captions compelling, authentic, and platform-friendly.`,
        response_json_schema: {
          type: "object",
          properties: {
            versions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  caption: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  engagement_boost: { type: "string" },
                  best_time: { type: "string" }
                }
              }
            }
          }
        }
      });

      setOptimizedCaptions(response.versions || []);
    } catch (error) {
      console.error('Failed to optimize caption:', error);
      alert('Failed to optimize caption. Please try again.');
    } finally {
      setCaptionLoading(false);
    }
  };

  const handleGenerateVisual = async () => {
    if (!imagePrompt) {
      alert('Please describe the image you want to create');
      return;
    }

    setVisualLoading(true);
    try {
      const stylePrompts = {
        professional: 'professional, clean, corporate, high-quality, business-appropriate',
        creative: 'artistic, creative, vibrant colors, unique perspective, eye-catching',
        minimal: 'minimalist, simple, elegant, clean lines, modern aesthetic',
        vibrant: 'colorful, energetic, bold, dynamic, attention-grabbing',
        cinematic: 'cinematic lighting, dramatic, film-like, atmospheric, professional photography'
      };

      const fullPrompt = `${imagePrompt}, ${stylePrompts[visualStyle]}, social media optimized, high resolution, trending style`;

      const response = await base44.integrations.Core.GenerateImage({
        prompt: fullPrompt
      });

      setGeneratedImage(response.url);
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setVisualLoading(false);
    }
  };

  const handleCopyCaption = (caption, index) => {
    navigator.clipboard.writeText(caption);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="AI Creator Tools - EncircleNet"
        description="Powerful AI tools to help creators generate ideas, optimize captions, and enhance visuals"
      />

      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">AI Creator Tools</h1>
        <p className="text-gray-600">Supercharge your content with AI-powered assistance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-purple-200">
          <TabsTrigger 
            value="ideas" 
            className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Ideas
          </TabsTrigger>
          <TabsTrigger 
            value="captions" 
            className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Captions
          </TabsTrigger>
          <TabsTrigger 
            value="visuals" 
            className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Visuals
          </TabsTrigger>
        </TabsList>

        {/* Content Idea Generator */}
        <TabsContent value="ideas">
          <Card className="bg-white border-2 border-blue-300 realistic-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                Content Idea Generator
              </CardTitle>
              <p className="text-sm text-gray-600">Get trending content ideas based on your niche</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Niche/Topic</label>
                  <Input
                    placeholder="e.g., Fitness, Cooking, Tech Reviews, Travel"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="border-blue-300"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Content Type</label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="border-blue-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="text">Text Post</SelectItem>
                      <SelectItem value="voice">Voice Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateIdeas}
                  disabled={ideasLoading}
                  className="w-full gradient-bg-primary text-white shadow-glow"
                >
                  {ideasLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Ideas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Ideas
                    </>
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {generatedIdeas.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bold text-blue-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      Your Content Ideas
                    </h3>
                    {generatedIdeas.map((idea, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4"
                      >
                        <h4 className="font-bold text-purple-900 mb-2">{idea.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{idea.description}</p>
                        <div className="bg-white rounded-lg p-3 border border-purple-200 mb-2">
                          <p className="text-xs font-semibold text-green-900 mb-1">Why it works:</p>
                          <p className="text-xs text-gray-700">{idea.why_it_works}</p>
                        </div>
                        {idea.hashtags && idea.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {idea.hashtags.map((tag, i) => (
                              <span key={i} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Caption Assistant */}
        <TabsContent value="captions">
          <Card className="bg-white border-2 border-green-300 realistic-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-6 h-6 text-green-600" />
                Caption Assistant
              </CardTitle>
              <p className="text-sm text-gray-600">Optimize your captions for engagement and reach</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Draft Caption</label>
                  <Textarea
                    placeholder="Enter your caption here..."
                    value={draftCaption}
                    onChange={(e) => setDraftCaption(e.target.value)}
                    className="border-green-300 min-h-32"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Desired Tone</label>
                  <Select value={captionTone} onValueChange={setCaptionTone}>
                    <SelectTrigger className="border-green-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engaging">Engaging & Fun</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="authentic">Authentic & Raw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleOptimizeCaption}
                  disabled={captionLoading}
                  className="w-full gradient-bg-primary text-white shadow-glow"
                >
                  {captionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Optimize Caption
                    </>
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {optimizedCaptions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bold text-green-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      Optimized Versions
                    </h3>
                    {optimizedCaptions.map((version, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-green-900">{version.type}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyCaption(version.caption, index)}
                            className="border-green-300"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3 h-3 mr-1 text-green-600" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{version.caption}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-white rounded-lg p-2 border border-green-200">
                            <p className="text-xs text-gray-600">Engagement Boost</p>
                            <p className="text-lg font-bold text-green-900">{version.engagement_boost}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-green-200">
                            <p className="text-xs text-gray-600">Best Time</p>
                            <p className="text-sm font-semibold text-green-900">{version.best_time}</p>
                          </div>
                        </div>

                        {version.hashtags && version.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {version.hashtags.map((tag, i) => (
                              <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visual Enhancement */}
        <TabsContent value="visuals">
          <Card className="bg-white border-2 border-pink-300 realistic-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-pink-600" />
                Visual Enhancement
              </CardTitle>
              <p className="text-sm text-gray-600">Generate stunning visuals for your posts</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Describe Your Image</label>
                  <Textarea
                    placeholder="e.g., A vibrant sunset over a tropical beach with palm trees"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="border-pink-300 min-h-24"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Visual Style</label>
                  <Select value={visualStyle} onValueChange={setVisualStyle}>
                    <SelectTrigger className="border-pink-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="creative">Creative & Artistic</SelectItem>
                      <SelectItem value="minimal">Minimalist</SelectItem>
                      <SelectItem value="vibrant">Vibrant & Colorful</SelectItem>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerateVisual}
                  disabled={visualLoading}
                  className="w-full gradient-bg-primary text-white shadow-glow"
                >
                  {visualLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Image... (5-10 seconds)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {generatedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bold text-pink-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                      Generated Visual
                    </h3>
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-4">
                      <img 
                        src={generatedImage} 
                        alt="AI Generated" 
                        className="w-full rounded-lg shadow-lg mb-4"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImage;
                            link.download = 'encirclenet-ai-image.png';
                            link.click();
                          }}
                          className="flex-1 gradient-bg-primary text-white"
                        >
                          Download Image
                        </Button>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedImage);
                            alert('Image URL copied!');
                          }}
                          variant="outline"
                          className="border-pink-300"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-3">
                        💡 Use this image in your next post or save it to your device
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-300 mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-indigo-900 mb-2">AI-Powered Creator Success</h3>
              <p className="text-sm text-gray-700">
                These tools use advanced AI to help you create better content, reach more people, and earn more. 
                All suggestions are based on current trends and best practices from top-performing creators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}