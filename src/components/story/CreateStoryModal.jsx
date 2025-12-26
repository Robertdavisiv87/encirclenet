import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon, Video, Camera, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateStoryModal({ isOpen, onClose, currentUser }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [contentType, setContentType] = useState('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setContentType(file.type.startsWith('video/') ? 'video' : 'photo');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
        setSelectedFile(file);
        setContentType('video');
        setPreview(URL.createObjectURL(blob));
        setIsRecording(false);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert('Camera access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handlePost = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      const newStory = await base44.entities.Post.create({
        content_type: contentType,
        media_url: file_url,
        author_name: currentUser.full_name,
        author_avatar: currentUser.avatar,
        caption: '📖 Story',
        likes_count: 0,
        comments_count: 0,
        tips_received: 0
      });

      // Ensure story appears in all feeds immediately
      await Promise.all([
        base44.entities.Post.list('-created_date', 50),
        base44.entities.Post.list('-likes_count', 50)
      ]);

      onClose();
      window.location.reload();
    } catch (error) {
      alert('Failed to post story');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-blue-900">Create Story</h3>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {isRecording ? (
                <div>
                  <div className="relative rounded-xl overflow-hidden mb-4 bg-black">
                    <video 
                      ref={videoRef}
                      className="w-full max-h-96 object-contain"
                      autoPlay
                      muted
                    />
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      REC
                    </div>
                  </div>
                  <Button
                    onClick={stopRecording}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <StopCircle className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                </div>
              ) : !preview ? (
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="story-file"
                  />
                  <label
                    htmlFor="story-file"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-12 cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-sm font-medium text-gray-700 mb-2">Upload Photo or Video</p>
                    <p className="text-xs text-gray-500">Click to select a file</p>
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-xs text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  <Button
                    onClick={startRecording}
                    className="w-full gradient-bg-primary text-white shadow-glow"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Record Live Video
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="relative rounded-xl overflow-hidden mb-4">
                    {contentType === 'photo' ? (
                      <img src={preview} alt="Preview" className="w-full max-h-96 object-contain" />
                    ) : (
                      <video 
                        src={preview} 
                        controls 
                        playsInline
                        preload="metadata"
                        muted
                        className="w-full max-h-96"
                        style={{ pointerEvents: 'auto' }}
                      />
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPreview(null);
                        setSelectedFile(null);
                      }}
                      className="flex-1"
                    >
                      Change
                    </Button>
                    <Button
                      onClick={handlePost}
                      disabled={uploading}
                      className="flex-1 gradient-bg-primary text-white shadow-glow"
                    >
                      {uploading ? 'Posting...' : 'Post Story'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}