"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  ExternalLink, 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  Upload, 
  Check, 
  X, 
  RefreshCw, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  AlertCircle, 
  Sliders, 
  Music, 
  Image as ImageIcon, 
  Download, 
  CheckCircle2, 
  Play, 
  Key,
  Layers
} from 'lucide-react';

interface Inquiry {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string | null;
  eventType: string;
  eventDate: string | null;
  city: string | null;
  message: string | null;
  status: 'new' | 'contacted' | 'confirmed' | 'archived';
  notes?: string;
}

interface GalleryItem {
  id: string;
  number: string;
  title: string;
  category: string;
  designation: string;
  quote: string;
  image: string;
  objectPosition?: string;
}

interface SiteSettings {
  livePerformance: {
    title: string;
    subtitle: string;
    description: string;
    youtubeUrl: string;
    videoId: string;
    channelUrl: string;
    thumbnail: string;
  };
  featuredSong: {
    title: string;
    subtitle: string;
    videoId: string;
    raag: string;
    frequencyHz: number;
    youtubeUrl?: string;
  };
}

const CATEGORIES = [
  'Navratri',
  'Classical',
  'Devotional',
  'Royal Wedding',
  'Stage Show'
];

export default function AdminPage() {
  // Authentication & Security State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'inquiries' | 'gallery' | 'video' | 'song' | 'security'>('inquiries');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inquiries State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState<string>('all');
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Gallery State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Gallery Form State with Manual Frame / Head Position
  const [formData, setFormData] = useState({
    title: '',
    category: 'Navratri',
    designation: 'Live Festive Performance',
    quote: '',
    image: '',
    objectPosition: 'center 20%'
  });
  const [focalPercent, setFocalPercent] = useState<number>(20);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Settings State (Live Performance & Featured Song)
  const [settings, setSettings] = useState<SiteSettings>({
    livePerformance: {
      title: "The Magic of Live Music",
      subtitle: "Glimpses from stage shows and festival evenings",
      description: "Experience the energy, warmth, and joy that Sonal brings to every live stage performance.",
      youtubeUrl: "https://www.youtube.com/watch?v=RXVnBqGBi9A",
      videoId: "RXVnBqGBi9A",
      channelUrl: "https://www.youtube.com/@SonalMakwana-zb7qc",
      thumbnail: "/sonal-concert-stage.png"
    },
    featuredSong: {
      title: "Ram Aayenge",
      subtitle: "A soulful devotional rendition sung with deep emotion, classical grace, and devotion by Sonal Makwana.",
      videoId: "1CTF9uM65b8",
      raag: "Bhairavi",
      frequencyHz: 136.1,
      youtubeUrl: "https://www.youtube.com/watch?v=1CTF9uM65b8"
    }
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Check auth session on mount via server-side verification
  useEffect(() => {
    checkServerSession();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const checkServerSession = async () => {
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' })
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
      }
    } catch {
      // Not authenticated yet
    }
  };

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries();
      fetchGallery();
      fetchSettings();
    }
  }, [isAuthenticated]);

  // Server-side login with rate-limiting and encryption
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setPasscodeError('Please enter your security passcode.');
      return;
    }

    setIsVerifying(true);
    setPasscodeError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', passcode: passcode.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPasscode('');
        showToast('Security verification successful.');
      } else {
        setPasscodeError(data.error || 'Authentication failed. Please verify passcode.');
      }
    } catch {
      setPasscodeError('Network error connecting to security server.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch {
      // Ignored
    }
    setIsAuthenticated(false);
    setPasscode('');
    showToast('Securely logged out.');
  };

  // 1. Fetch Inquiries
  const fetchInquiries = async () => {
    setIsLoadingInquiries(true);
    try {
      const res = await fetch('/api/inquiries');
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  // 2. Fetch Gallery
  const fetchGallery = async () => {
    setIsLoadingGallery(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setGalleryItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  // 3. Fetch Settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  // Update inquiry status
  const handleStatusChange = async (id: string, newStatus: Inquiry['status']) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        setInquiries(prev =>
          prev.map(inq => (inq.id === id ? { ...inq, status: newStatus } : inq))
        );
        showToast(`Status updated to "${newStatus}"`);
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  // Save notes for inquiry
  const handleSaveNotes = async (id: string) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: tempNotes })
      });
      if (res.ok) {
        setInquiries(prev =>
          prev.map(inq => (inq.id === id ? { ...inq, notes: tempNotes } : inq))
        );
        setEditingNotesId(null);
        showToast('Organizer notes saved.');
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  // Delete inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organizer inquiry?')) return;
    try {
      const res = await fetch(`/api/inquiries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInquiries(prev => prev.filter(inq => inq.id !== id));
        showToast('Inquiry record deleted.');
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  // Export Inquiries to CSV
  const exportInquiriesCSV = () => {
    if (inquiries.length === 0) {
      alert('No inquiries to export.');
      return;
    }
    const headers = ['ID', 'Date', 'Organiser Name', 'Phone', 'Email', 'Event Type', 'Event Date', 'City', 'Message', 'Status', 'Notes'];
    const rows = inquiries.map(inq => [
      `"${inq.id}"`,
      `"${new Date(inq.createdAt).toLocaleDateString()}"`,
      `"${inq.name.replace(/"/g, '""')}"`,
      `"${inq.phone}"`,
      `"${inq.email || ''}"`,
      `"${inq.eventType.replace(/"/g, '""')}"`,
      `"${inq.eventDate || ''}"`,
      `"${(inq.city || '').replace(/"/g, '""')}"`,
      `"${(inq.message || '').replace(/"/g, '""')}"`,
      `"${inq.status}"`,
      `"${(inq.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sonal_Makwana_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded bookings to CSV.');
  };

  // Gallery: File upload with resilient fallback
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
        showToast('Photo uploaded successfully.');
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch {
      setUploadError('Network error uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  // Gallery: Save item (Add or Edit) with objectPosition (Head & Frame alignment)
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      alert('Please provide both a Title and an Image URL.');
      return;
    }

    const payload = {
      ...formData,
      objectPosition: `center ${focalPercent}%`
    };

    try {
      if (editingItem) {
        const res = await fetch('/api/gallery', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingItem.id, ...payload })
        });
        if (res.ok) {
          fetchGallery();
          closeModal();
          showToast('Stage photo updated with new frame alignment.');
        }
      } else {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          fetchGallery();
          closeModal();
          showToast('New stage photo published to live website.');
        }
      }
    } catch (err) {
      console.error('Failed to save gallery item:', err);
    }
  };

  // Gallery: Delete item
  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Are you sure you want to remove this photo from the live website?')) return;
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGalleryItems(prev => prev.filter(item => item.id !== id));
        showToast('Photo removed from live gallery.');
      }
    } catch (err) {
      console.error('Failed to delete gallery item:', err);
    }
  };

  // Gallery: Reorder items
  const handleMoveGalleryItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryItems.length) return;

    const updated = [...galleryItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const renumbered = updated.map((it, idx) => ({
      ...it,
      number: String(idx + 1).padStart(2, '0')
    }));

    setGalleryItems(renumbered);

    try {
      await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: renumbered })
      });
      showToast('Gallery sequence reordered.');
    } catch (err) {
      console.error('Failed to save reordered items:', err);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Navratri',
      designation: 'Live Festive Performance',
      quote: '',
      image: '',
      objectPosition: 'center 20%'
    });
    setFocalPercent(20);
    setUploadError('');
    setShowAddModal(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    let initialFocal = 20;
    if (item.objectPosition) {
      const match = item.objectPosition.match(/(\d+)%/);
      if (match) initialFocal = parseInt(match[1], 10);
    }
    setFormData({
      title: item.title,
      category: item.category,
      designation: item.designation,
      quote: item.quote,
      image: item.image,
      objectPosition: item.objectPosition || 'center 20%'
    });
    setFocalPercent(initialFocal);
    setUploadError('');
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
  };

  // Settings Save: Live Performance Video or Featured Song
  const handleSaveSettings = async (section: 'video' | 'song') => {
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          livePerformance: settings.livePerformance,
          featuredSong: settings.featuredSong
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          section === 'video' 
            ? 'Live performance video link updated on website!' 
            : 'Featured song and audio player updated on website!'
        );
      } else {
        alert(data.error || 'Failed to update settings');
      }
    } catch {
      alert('Error updating settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter(inq => {
    const matchesFilter = inquiryFilter === 'all' || inq.status === inquiryFilter;
    const matchesSearch =
      inq.name.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.phone.includes(inquirySearch) ||
      (inq.city && inq.city.toLowerCase().includes(inquirySearch.toLowerCase())) ||
      inq.eventType.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      (inq.message && inq.message.toLowerCase().includes(inquirySearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const newCount = inquiries.filter(i => i.status === 'new').length;
  const contactedCount = inquiries.filter(i => i.status === 'contacted').length;
  const confirmedCount = inquiries.filter(i => i.status === 'confirmed').length;

  // Unauthenticated Minimalist Dark Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-sm p-8 rounded-xl bg-[#121215] border border-zinc-800 shadow-2xl relative">
          
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 mb-1">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
              Sonal Makwana Admin
            </h1>
            <p className="text-xs text-zinc-400">
              Enter your master passcode to access the control panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Security Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {passcodeError && (
                <div className="flex items-center gap-2 text-rose-400 text-xs mt-2 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 bg-white hover:bg-zinc-200 active:scale-[0.98] text-zinc-950 font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Security Status */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Encrypted Server Session
            </span>
            <span>Rate-limiting Active</span>
          </div>
        </div>
      </div>
    );
  }

  // Modern Clean Dark Executive Dashboard
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg shadow-xl text-xs font-medium animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100 tracking-tight">
                  Sonal Makwana
                </span>
                <span className="text-[10px] font-mono bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/40 uppercase tracking-wider font-semibold">
                  Secure
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Executive Control Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/20 text-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modern Navigation Tabs Bar */}
      <div className="border-b border-zinc-800/80 bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center gap-1 sm:gap-2">
          
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'inquiries'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mail className="w-4 h-4 text-zinc-400" />
            <span>Organiser Bookings</span>
            {newCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-950 font-mono text-[10px] font-bold">
                {newCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'gallery'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <span>Moments on Stage</span>
            <span className="text-xs text-zinc-500">({galleryItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'video'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Play className="w-4 h-4 text-zinc-400" />
            <span>Live Music Video</span>
          </button>

          <button
            onClick={() => setActiveTab('song')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'song'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music className="w-4 h-4 text-zinc-400" />
            <span>Featured Song</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Security Center</span>
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* ========================================================================= */}
        {/* TAB 1: ORGANISER INQUIRIES & BOOKING FORMS */}
        {/* ========================================================================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 font-medium">New Requests</span>
                <div className="text-2xl sm:text-3xl font-semibold text-amber-400">{newCount}</div>
                <span className="text-[11px] text-zinc-500">Requires attention</span>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 font-medium">Contacted</span>
                <div className="text-2xl sm:text-3xl font-semibold text-blue-400">{contactedCount}</div>
                <span className="text-[11px] text-zinc-500">In discussion</span>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 font-medium">Confirmed Shows</span>
                <div className="text-2xl sm:text-3xl font-semibold text-emerald-400">{confirmedCount}</div>
                <span className="text-[11px] text-zinc-500">Event date booked</span>
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400 font-medium">Total Inquiries</span>
                <div className="text-2xl sm:text-3xl font-semibold text-zinc-100">{inquiries.length}</div>
                <span className="text-[11px] text-zinc-500">All submissions</span>
              </div>
            </div>

            {/* Filter & Action Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#121215] border border-zinc-800">
              
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search organiser name, phone, city, or event..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors"
                />
              </div>

              {/* Status Filter Pills & Export */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-1 text-xs">
                  {['all', 'new', 'contacted', 'confirmed', 'archived'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setInquiryFilter(st)}
                      className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                        inquiryFilter === st ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchInquiries}
                  className="p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Refresh Inquiries"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingInquiries ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={exportInquiriesCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium transition-all text-xs"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-950" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Inquiries Cards List */}
            {isLoadingInquiries ? (
              <div className="text-center py-16 text-zinc-500 text-sm">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-zinc-400" />
                Loading organizer booking submissions...
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-[#121215] border border-zinc-800 text-zinc-500 space-y-2">
                <Mail className="w-7 h-7 mx-auto text-zinc-600 mb-2" />
                <p className="text-sm text-zinc-300 font-medium">No booking inquiries match your filter.</p>
                <p className="text-xs text-zinc-500">Submissions from the public booking form will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredInquiries.map((inq) => {
                  const whatsappCleanPhone = inq.phone.replace(/[^0-9]/g, '');
                  const whatsappText = encodeURIComponent(
                    `Hello ${inq.name}, thank you for inquiring for Sonal Makwana's live show regarding ${inq.eventType}.`
                  );
                  const whatsappUrl = `https://wa.me/${whatsappCleanPhone}?text=${whatsappText}`;

                  return (
                    <div 
                      key={inq.id}
                      className="p-5 sm:p-6 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700/80 transition-all space-y-4 shadow-sm"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 tracking-tight">
                              {inq.name}
                            </h3>
                            <span className="font-mono text-xs text-zinc-500">
                              #{inq.id}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                            <span className="text-zinc-200 font-medium">{inq.eventType}</span>
                            {inq.city && <span>📍 {inq.city}</span>}
                            {inq.eventDate && <span>📅 Date: {inq.eventDate}</span>}
                            <span className="text-zinc-500">⏱ {new Date(inq.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Status Dropdown & Delete */}
                        <div className="flex items-center gap-2.5">
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value as Inquiry['status'])}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase border transition-colors focus:outline-none ${
                              inq.status === 'new'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : inq.status === 'contacted'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : inq.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            <option value="new" className="bg-zinc-900 text-amber-400">New Request</option>
                            <option value="contacted" className="bg-zinc-900 text-blue-400">Contacted</option>
                            <option value="confirmed" className="bg-zinc-900 text-emerald-400">Confirmed</option>
                            <option value="archived" className="bg-zinc-900 text-zinc-400">Archived</option>
                          </select>

                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Organizer Message / Requirements */}
                      {inq.message && (
                        <div className="bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800/80 text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                          <span className="block text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                            Organiser's Message:
                          </span>
                          "{inq.message}"
                        </div>
                      )}

                      {/* Contact Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Direct WhatsApp Call/Chat */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/50 text-xs font-medium transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp ({inq.phone})</span>
                          </a>

                          {/* Direct Phone Call */}
                          <a
                            href={`tel:${inq.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-all"
                          >
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Call Organiser</span>
                          </a>

                          {/* Email */}
                          {inq.email && (
                            <a
                              href={`mailto:${inq.email}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{inq.email}</span>
                            </a>
                          )}
                        </div>

                        {/* Internal Notes */}
                        <div className="text-right">
                          {editingNotesId === inq.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                placeholder="Add organizer note..."
                                className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 rounded-lg focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveNotes(inq.id)}
                                className="px-2.5 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-xs font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="px-2 py-1 text-zinc-500 hover:text-zinc-300 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingNotesId(inq.id);
                                setTempNotes(inq.notes || '');
                              }}
                              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                              {inq.notes ? `📝 Note: ${inq.notes}` : '+ Add Internal Note'}
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MOMENTS ON STAGE (GALLERY WITH MANUAL FRAME & HEAD POSITION) */}
        {/* ========================================================================= */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#121215] border border-zinc-800">
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">
                  Moments on Stage Gallery
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage the stage carousel photos shown on the live website.
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs sm:text-sm rounded-lg transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4 text-zinc-950" />
                <span>Add Stage Photo</span>
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="rounded-xl bg-[#121215] border border-zinc-800 overflow-hidden flex flex-col justify-between group shadow-sm hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Image with Focal Frame Position applied */}
                    <div className="relative aspect-[4/3] w-full bg-zinc-900 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ objectPosition: item.objectPosition || 'center 20%' }}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="font-mono text-xs bg-black/80 text-zinc-200 px-2 py-0.5 rounded-md backdrop-blur-sm border border-zinc-700/60 font-semibold">
                          #{item.number}
                        </span>
                        <span className="text-[11px] bg-black/80 text-zinc-300 px-2 py-0.5 rounded-md backdrop-blur-sm border border-zinc-700/60">
                          {item.category}
                        </span>
                      </div>

                      {/* Focal Indicator Badge */}
                      <div className="absolute bottom-2.5 right-2.5 bg-black/80 px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-300 border border-zinc-700/60">
                        {item.objectPosition || 'center 20%'}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 space-y-1.5">
                      <h4 className="text-base font-semibold text-zinc-100 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 font-medium">
                        {item.designation}
                      </p>
                      {item.quote && (
                        <p className="text-xs text-zinc-400 font-normal line-clamp-2 pt-2 border-t border-zinc-800/80">
                          "{item.quote}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-4 py-3 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveGalleryItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Move Earlier"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveGalleryItem(index, 'down')}
                        disabled={index === galleryItems.length - 1}
                        className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Move Later"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/80 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Adjust Frame</span>
                      </button>

                      <button
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: THE MAGIC OF LIVE MUSIC (PERFORMANCE VIDEO) */}
        {/* ========================================================================= */}
        {activeTab === 'video' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="p-6 rounded-xl bg-[#121215] border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                <Play className="w-4 h-4 text-zinc-400" />
                <span>Live Performance Video (Section 04)</span>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-100">
                The Magic of Live Music
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Update the concert video displayed in the video modal on the homepage.
              </p>
            </div>

            {/* Video Preview */}
            <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
              <span className="text-xs font-medium text-zinc-300 block">
                Current Video Preview
              </span>
              <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-black border border-zinc-800 shadow-md">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${settings.livePerformance.videoId}?controls=1&rel=0`}
                  title="Concert Preview"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Video Edit Form */}
            <div className="p-6 rounded-xl bg-[#121215] border border-zinc-800 space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  YouTube Video Link or Video ID
                </label>
                <input
                  type="text"
                  value={settings.livePerformance.youtubeUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    livePerformance: { ...settings.livePerformance, youtubeUrl: e.target.value }
                  })}
                  placeholder="e.g. https://www.youtube.com/watch?v=RXVnBqGBi9A or RXVnBqGBi9A"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 font-mono placeholder:text-zinc-600 transition-colors"
                />
                <span className="text-[11px] text-zinc-500">
                  Accepts any YouTube link or ID. Extracts video ID automatically.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={settings.livePerformance.title}
                    onChange={(e) => setSettings({
                      ...settings,
                      livePerformance: { ...settings.livePerformance, title: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.livePerformance.subtitle}
                    onChange={(e) => setSettings({
                      ...settings,
                      livePerformance: { ...settings.livePerformance, subtitle: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  Narrative Description
                </label>
                <textarea
                  rows={2}
                  value={settings.livePerformance.description}
                  onChange={(e) => setSettings({
                    ...settings,
                    livePerformance: { ...settings.livePerformance, description: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={settings.livePerformance.channelUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    livePerformance: { ...settings.livePerformance, channelUrl: e.target.value }
                  })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 font-mono transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleSaveSettings('video')}
                  disabled={isSavingSettings}
                  className="w-full py-2.5 bg-white hover:bg-zinc-200 active:scale-[0.98] text-zinc-950 font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Updating Video...</span>
                    </>
                  ) : (
                    <span>Save & Update Video</span>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FEATURED SONG & AUDIO STREAM */}
        {/* ========================================================================= */}
        {activeTab === 'song' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="p-6 rounded-xl bg-[#121215] border border-zinc-800 space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                <Music className="w-4 h-4 text-zinc-400" />
                <span>Featured Song (Section 02)</span>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-100">
                Featured Song & Audio Deck
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Update the song and background audio that plays on the homepage vinyl player.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#121215] border border-zinc-800 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={settings.featuredSong.title}
                    onChange={(e) => setSettings({
                      ...settings,
                      featuredSong: { ...settings.featuredSong, title: e.target.value }
                    })}
                    placeholder="e.g. Ram Aayenge"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Raag / Style Category
                  </label>
                  <input
                    type="text"
                    value={settings.featuredSong.raag}
                    onChange={(e) => setSettings({
                      ...settings,
                      featuredSong: { ...settings.featuredSong, raag: e.target.value }
                    })}
                    placeholder="e.g. Devotional Bhajan · Bhakti Rasa"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  YouTube Audio Stream Link or Video ID
                </label>
                <input
                  type="text"
                  value={settings.featuredSong.youtubeUrl || settings.featuredSong.videoId}
                  onChange={(e) => setSettings({
                    ...settings,
                    featuredSong: { 
                      ...settings.featuredSong, 
                      youtubeUrl: e.target.value,
                      videoId: e.target.value
                    }
                  })}
                  placeholder="e.g. https://www.youtube.com/watch?v=1CTF9uM65b8 or 1CTF9uM65b8"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 font-mono transition-colors"
                />
                <span className="text-[11px] text-zinc-500">
                  Audio streams seamlessly when visitors click Play on the homepage vinyl player.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  Song Description & Emotional Context
                </label>
                <textarea
                  rows={3}
                  value={settings.featuredSong.subtitle}
                  onChange={(e) => setSettings({
                    ...settings,
                    featuredSong: { ...settings.featuredSong, subtitle: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleSaveSettings('song')}
                  disabled={isSavingSettings}
                  className="w-full py-2.5 bg-white hover:bg-zinc-200 active:scale-[0.98] text-zinc-950 font-medium text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Updating Featured Song...</span>
                    </>
                  ) : (
                    <span>Save & Update Featured Song</span>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SECURITY CENTER */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="p-6 rounded-xl bg-[#121215] border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Security Engine Active</span>
              </div>
              <h2 className="text-2xl font-semibold text-zinc-100">
                Security Center
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Your administrative portal is protected by multi-layered defensive security designed to block automated bots, credential scanners, and unauthorized modifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Server-Side Token Verification</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Passcodes are strictly validated on the server edge. No passwords or secret keys exist in client-side JavaScript.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Brute-Force Rate Limiter</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  IP lockdown activates automatically after 5 consecutive failed attempts, shielding the portal from bots.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>HttpOnly SameSite Cookies</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Session tokens reside inside HttpOnly, Secure cookies protected against cross-site scripting (XSS) and token theft.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Protected API Endpoints</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every delete or modification API request rejects unauthenticated traffic with HTTP 401 Unauthorized.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
              <h3 className="text-sm font-semibold text-zinc-200">
                Custom Passcode Configuration
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When you set <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-300">ADMIN_PASSWORD</code> in your environment variables, only that custom password is accepted:
              </p>
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300">
                ADMIN_PASSWORD = your-secret-password
              </div>
              <p className="text-[11px] text-zinc-500">
                For live deployments: Cloudflare Dashboard → Workers & Pages → singer-portfolio → Settings → Variables and Secrets.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT GALLERY ITEM WITH MANUAL FRAME & HEAD POSITION SLIDER */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#121215] rounded-xl border border-zinc-800 shadow-2xl p-6 space-y-5 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  {editingItem ? 'Adjust Frame & Edit Photo' : 'Add Stage Photo'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {editingItem ? `Editing Plate #${editingItem.number}` : 'Upload photo and align frame'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-4">
              
              {/* Image Input & Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">
                  Stage Photo
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Image URL or upload..."
                    className="flex-1 px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-xs sm:text-sm text-zinc-100 font-mono transition-colors"
                    required
                  />

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-400">{uploadError}</p>
                )}
              </div>

              {/* LIVE FRAME PREVIEW & MANUAL HEAD POSITION SLIDER */}
              {formData.image && (
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                      Frame & Head Position (Vertical Alignment)
                    </span>
                    <span className="font-mono text-zinc-400">Offset: {focalPercent}%</span>
                  </div>

                  {/* Frame Simulation Box */}
                  <div className="relative w-full h-52 sm:h-56 rounded-lg overflow-hidden bg-black border border-zinc-800 shadow-inner">
                    <img
                      src={formData.image}
                      alt="Frame preview"
                      className="w-full h-full object-cover transition-all duration-150"
                      style={{ objectPosition: `center ${focalPercent}%` }}
                    />

                    {/* Subtle Frame Guide Overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-zinc-700/40 rounded-lg" />
                    <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-zinc-300">
                      Live Frame Simulation
                    </div>
                  </div>

                  {/* Vertical Slider Control */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Top (Head: 0%)</span>
                      <span className="text-zinc-200 font-medium">Current: {focalPercent}%</span>
                      <span>Bottom (Feet: 100%)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={focalPercent}
                      onChange={(e) => setFocalPercent(parseInt(e.target.value, 10))}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>

                  {/* Quick-Preset Buttons for Perfect Portrait Framing */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
                    <span className="text-zinc-500 text-[11px]">Presets:</span>
                    <button
                      type="button"
                      onClick={() => setFocalPercent(15)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
                    >
                      Head Focus (15%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFocalPercent(25)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
                    >
                      Upper Body (25%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFocalPercent(50)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
                    >
                      Center (50%)
                    </button>
                  </div>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Photo Title / Event Name
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Navratri Raas Mahotsav"
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-zinc-900 text-zinc-100">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Designation / Sub-caption */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300 block">
                  Subheading / Caption
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Live Festive Performance"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                />
              </div>

              {/* Quote / Memory text */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300 block">
                  Stage Narrative / Memory
                </label>
                <textarea
                  rows={2}
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Traditional Garba and folk melodies bringing thousands together..."
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-sm text-zinc-100 transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white hover:bg-zinc-200 active:scale-[0.98] text-zinc-950 font-medium text-xs rounded-lg transition-all shadow-sm"
                >
                  {editingItem ? 'Save Adjustments' : 'Publish Photo'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
