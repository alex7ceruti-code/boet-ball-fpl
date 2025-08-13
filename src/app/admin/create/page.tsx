'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Crown,
  Tag,
  Calendar,
  FileText,
  Zap,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  Palette,
  X
} from 'lucide-react';
import { FPL_TAGS, CONTENT_GUIDELINES } from '@/types/news';

interface CreateArticleData {
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  tags: string;
  coverImage?: string;
  isPremium: boolean;
  status: 'DRAFT' | 'PUBLISHED';
}

export default function CreateArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState<CreateArticleData>({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '',
    tags: '',
    isPremium: false,
    status: 'DRAFT'
  });
  
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCanvaHelp, setShowCanvaHelp] = useState(false);

  // Check admin access
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    console.log('Starting file upload:', { name: file.name, size: file.size, type: file.type });
    
    setImageUploading(true);
    setError('');
    setSuccess('');

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 5MB.');
      }

      console.log('File validation passed, creating FormData');
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      console.log('Sending upload request to /api/upload');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('Upload response status:', response.status);
      
      const data = await response.json();
      console.log('Upload response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Upload failed with status ${response.status}`);
      }

      if (!data.url) {
        throw new Error('No image URL returned from server');
      }

      // Set the uploaded image URL
      setFormData(prev => ({ ...prev, coverImage: data.url }));
      setSuccess(`Image uploaded successfully! (${(file.size / 1024 / 1024).toFixed(2)}MB)${data.method ? ` - ${data.method}` : ''}`);
      
      console.log('Upload completed successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setError(`Upload failed: ${errorMessage}`);
      
      // Clear error message after 10 seconds
      setTimeout(() => setError(''), 10000);
    } finally {
      setImageUploading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSubmit = async (submitStatus: 'DRAFT' | 'PUBLISHED') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Basic validation
      if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
        throw new Error('Title, excerpt, and content are required');
      }

      const submitData = {
        ...formData,
        status: submitStatus,
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        tags: formData.tags.trim()
      };

      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You need admin access to create articles. Contact support to become an editor.');
        }
        throw new Error(data.error || 'Failed to create article');
      }

      setSuccess(`Article ${submitStatus.toLowerCase()} successfully!`);
      
      // Redirect after success
      setTimeout(() => {
        router.push('/admin');
      }, 2000);

    } catch (error) {
      console.error('Article creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  // Auto-populate tags suggestions
  const getTagSuggestions = () => {
    return FPL_TAGS.slice(0, 8); // Show first 8 popular tags
  };

  const addTag = (tag: string) => {
    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setFormData(prev => ({ ...prev, tags: newTags }));
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Article
          </h1>
          <p className="text-gray-600">
            Create engaging FPL content with authentic South African flavor
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Content Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">South African FPL Content Tips</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Use local slang: "boet", "lekker", "sharp", "howzit", "braai"</p>
                <p>• Include SAST time references for deadlines</p>
                <p>• Add original FPL analysis with cultural context</p>
                <p>• Reference rugby, braai culture, and SA lifestyle</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Howzit Boet! GW15 Captain Picks That Won't Let You Down"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Brief secondary headline"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Excerpt (Homepage Preview) *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                placeholder="2-3 sentences that will appear on the homepage and in previews..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Keep it under 200 characters for best display</p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cover Image (Optional)
              </label>
              
              {formData.coverImage ? (
                <div className="space-y-3">
                  {/* Image Preview */}
                  <div className="relative group">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Replace Image */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCanvaHelp(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      <Palette className="w-4 h-4" />
                      Canva
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image URL Input */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="coverImage"
                      value={formData.coverImage || ''}
                      onChange={handleInputChange}
                      placeholder="Paste image URL here..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCanvaHelp(true)}
                      className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Palette className="w-5 h-5" />
                      Create with Canva
                    </button>
                  </div>
                  
                  /* Upload Area with Drag & Drop */
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      imageUploading ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {imageUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                        <p className="text-green-700 font-medium">Uploading image...</p>
                        <p className="text-sm text-green-600 mt-1">Please wait while we process your file</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-gray-400 mr-2" />
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-2 font-medium">Drop your image here or click to browse</p>
                        <p className="text-sm text-gray-500 mb-4">
                          Drag & drop supported • JPG, PNG, WebP • Max 5MB
                        </p>
                        
                        <div className="flex items-center justify-center gap-3">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handleFileInputChange}
                              className="hidden"
                            />
                            <span className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              <Upload className="w-4 h-4" />
                              Choose File
                            </span>
                          </label>
                          
                          <div className="text-gray-400 text-sm">or</div>
                          
                          <button
                            type="button"
                            onClick={() => setShowCanvaHelp(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Palette className="w-4 h-4" />
                            Create with Canva
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Add a compelling cover image to increase engagement. Use SA-themed colors and FPL elements.
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Article Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={20}
                placeholder="Write your full article content here. Use markdown formatting:

**Bold text**
- Bullet points
- More points

## Subheadings

Remember to add SA slang and cultural references!"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Supports basic markdown formatting</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="fpl, transfers, gameweek, players, analysis"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              
              {/* Tag Suggestions */}
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-2">
                  {getTagSuggestions().map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPremium"
                name="isPremium"
                checked={formData.isPremium}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="isPremium" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Crown className="w-4 h-4 text-yellow-500" />
                Premium Content (Subscribers Only)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit('PUBLISHED')}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Publish Now
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Will be {loading ? 'saving...' : 'saved based on button clicked'}
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Canva Help Modal */}
      {showCanvaHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Palette className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Create with Canva</h2>
                </div>
                <button
                  onClick={() => setShowCanvaHelp(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Step-by-step Guide */}
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick SA FPL Template Setup
                  </h3>
                  <p className="text-green-800 text-sm">
                    Follow these steps to create engaging BoetBall covers with South African flair!
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Open Canva & Choose Template</h4>
                      <p className="text-gray-600 text-sm mb-2">
                        Go to canva.com → Search "Blog Header" or "Facebook Cover" → Choose 1200x630px size
                      </p>
                      <a
                        href="https://www.canva.com/create/blog-headers/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Canva Templates
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Add BoetBall Branding</h4>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p>• Use South African flag colors: Green (#1B5E20), Gold (#FFD600)</p>
                        <p>• Add "BoetBall" logo/text in Springbok green</p>
                        <p>• Include FPL-related elements (football, stats, charts)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Add Your Article Title</h4>
                      <p className="text-gray-600 text-sm">
                        Use bold, readable fonts → Add your article title → Include SA slang like "Howzit Boet!" or "Sharp Tips"
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Download & Use</h4>
                      <p className="text-gray-600 text-sm">
                        Click "Download" → Choose PNG format → Copy the image URL or upload to your hosting → Paste URL in the field above
                      </p>
                    </div>
                  </div>
                </div>

                {/* Template Suggestions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">🎨 SA FPL Template Ideas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-1">Gameweek Previews</h4>
                      <p className="text-gray-600">Green background + "GWX Preview" + Player photos + SA flag elements</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-1">Transfer Tips</h4>
                      <p className="text-gray-600">Arrow graphics + "Boet's Transfers" + Player comparison + Springbok colors</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-1">Captain Picks</h4>
                      <p className="text-gray-600">Crown icon + "Captain Sharp" + Player photo + Gold accents</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-1">Analysis Posts</h4>
                      <p className="text-gray-600">Chart graphics + "Braai Time Analysis" + Stats overlay + Green theme</p>
                    </div>
                  </div>
                </div>

                {/* Free Resources */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📚 Free Resources</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <a href="https://unsplash.com/s/photos/south-africa" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                        Free SA-themed photos (Unsplash)
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <a href="https://www.pexels.com/search/football/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                        Free football images (Pexels)
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <a href="https://fonts.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                        Free fonts (Google Fonts)
                      </a>
                    </div>
                  </div>
                </div>

                {/* Color Palette */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">🎨 BoetBall Color Palette</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="text-center">
                      <div className="w-full h-12 bg-green-800 rounded mb-1"></div>
                      <p className="font-semibold">Springbok Green</p>
                      <p className="text-gray-500">#1B5E20</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-12 bg-yellow-400 rounded mb-1"></div>
                      <p className="font-semibold">Protea Gold</p>
                      <p className="text-gray-500">#FFD600</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-12 bg-orange-600 rounded mb-1"></div>
                      <p className="font-semibold">Braai Orange</p>
                      <p className="text-gray-500">#EA580C</p>
                    </div>
                    <div className="text-center">
                      <div className="w-full h-12 bg-blue-800 rounded mb-1"></div>
                      <p className="font-semibold">Table Mountain Blue</p>
                      <p className="text-gray-500">#1E3A8A</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowCanvaHelp(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Close
                  </button>
                  <a
                    href="https://www.canva.com/create/blog-headers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    onClick={() => setShowCanvaHelp(false)}
                  >
                    <Palette className="w-4 h-4" />
                    Start Creating
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
