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
  Sparkles, 
  AlertCircle, 
  Sliders, 
  Music, 
  Image as ImageIcon, 
  Download, 
  CheckCircle2, 
  Share2, 
  Clock, 
  Play, 
  Copy,
  ChevronRight,
  UserCheck
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
  const [sessionTimer, setSessionTimer] = useState<string>('24:00:00');

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
        showToast('Z+ Security Verification Successful.');
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
    if (!confirm('Are you sure you want to permanently delete this organizer inquiry?')) return;
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
    // Parse existing objectPosition like 'center 25%'
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

  // Unauthenticated Z+ Security Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070504] text-[#F5EBDD] flex items-center justify-center p-4 sm:p-6 font-['Outfit',sans-serif]">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-[#120F0C] border border-[#E5BE7A]/30 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative overflow-hidden">
          
          {/* Gold Decorative Beam */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#E5BE7A] to-transparent" />
          
          {/* Security Shield Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E5BE7A]/10 border border-[#E5BE7A]/40 text-[#E5BE7A] mb-2 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#E5BE7A] font-semibold bg-[#E5BE7A]/10 px-3 py-1 rounded-full border border-[#E5BE7A]/20">
                Z+ SECURE ACCESS
              </span>
            </div>
            <h1 className="font-serif text-3xl font-normal text-[#F5EBDD] pt-2">
              Sonal Makwana
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#A39888]">
              Executive Artist Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                Security Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter administrative master key..."
                  className="w-full px-4 py-3.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] focus:outline-none rounded-lg text-sm text-[#F5EBDD] font-mono tracking-wider pr-12 transition-colors placeholder:text-white/20"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#E5BE7A] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {passcodeError && (
                <div className="flex items-center gap-2 text-rose-400 text-xs mt-2 bg-rose-950/40 p-2.5 rounded border border-rose-800/50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#E5BE7A] to-[#C89B56] hover:brightness-110 active:scale-[0.99] text-[#090807] font-semibold text-xs sm:text-sm uppercase tracking-[0.2em] rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify Identity & Enter</span>
                </>
              )}
            </button>
          </form>

          {/* Security Features HUD */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-2 text-[11px] font-mono text-[#8C8072]">
            <div className="flex items-center justify-between">
              <span>Encryption</span>
              <span className="text-emerald-400 font-semibold">WebCrypto HMAC-256</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Brute-force Shield</span>
              <span className="text-emerald-400 font-semibold">Active (5 Attempts)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Session Storage</span>
              <span className="text-emerald-400 font-semibold">HttpOnly Strict Cookie</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Main Admin Dashboard
  return (
    <div className="min-h-screen bg-[#070504] text-[#F5EBDD] font-['Outfit',sans-serif]">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-[#1A1612] border border-[#E5BE7A] text-[#F5EBDD] rounded-lg shadow-2xl text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#E5BE7A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B0806]/95 backdrop-blur-md border-b border-[#E5BE7A]/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E5BE7A]/15 border border-[#E5BE7A]/40 flex items-center justify-center text-[#E5BE7A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-normal text-[#F5EBDD]">
                  Sonal Makwana
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest font-semibold">
                  Z+ SECURED
                </span>
              </div>
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#8C8072]">
                Admin Control Room · Live Edge Connected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/15 text-xs text-[#C4B7A5] hover:text-white hover:border-[#E5BE7A] transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-rose-800/40 text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 text-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-white/[0.08] bg-[#0E0B09]">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center gap-1 sm:gap-2 pt-3">
          
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'inquiries'
                ? 'border-[#E5BE7A] text-[#E5BE7A] bg-[#E5BE7A]/5'
                : 'border-transparent text-[#8C8072] hover:text-[#D8CDC0]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Organiser Bookings</span>
            {newCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#E5BE7A] text-black font-mono text-[10px] font-bold">
                {newCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'gallery'
                ? 'border-[#E5BE7A] text-[#E5BE7A] bg-[#E5BE7A]/5'
                : 'border-transparent text-[#8C8072] hover:text-[#D8CDC0]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Moments on Stage (Gallery)</span>
            <span className="text-xs font-mono text-[#8C8072]">({galleryItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'video'
                ? 'border-[#E5BE7A] text-[#E5BE7A] bg-[#E5BE7A]/5'
                : 'border-transparent text-[#8C8072] hover:text-[#D8CDC0]'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Magic of Live Music (Video)</span>
          </button>

          <button
            onClick={() => setActiveTab('song')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'song'
                ? 'border-[#E5BE7A] text-[#E5BE7A] bg-[#E5BE7A]/5'
                : 'border-transparent text-[#8C8072] hover:text-[#D8CDC0]'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Featured Song & Audio</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-[#E5BE7A] text-[#E5BE7A] bg-[#E5BE7A]/5'
                : 'border-transparent text-[#8C8072] hover:text-[#D8CDC0]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Z+ Security Center</span>
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
              <div className="p-5 rounded-xl bg-[#120F0C] border border-white/10 space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8072]">New Requests</span>
                <div className="text-3xl font-serif text-[#E5BE7A]">{newCount}</div>
                <span className="text-[10px] text-amber-400 font-mono">Requires action</span>
              </div>
              <div className="p-5 rounded-xl bg-[#120F0C] border border-white/10 space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8072]">Contacted</span>
                <div className="text-3xl font-serif text-[#D8CDC0]">{contactedCount}</div>
                <span className="text-[10px] text-blue-400 font-mono">In discussion</span>
              </div>
              <div className="p-5 rounded-xl bg-[#120F0C] border border-white/10 space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8072]">Confirmed Shows</span>
                <div className="text-3xl font-serif text-emerald-400">{confirmedCount}</div>
                <span className="text-[10px] text-emerald-400 font-mono">Booked on dates</span>
              </div>
              <div className="p-5 rounded-xl bg-[#120F0C] border border-white/10 space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C8072]">Total Inquiries</span>
                <div className="text-3xl font-serif text-[#F5EBDD]">{inquiries.length}</div>
                <span className="text-[10px] text-[#A39888] font-mono">Lifetime records</span>
              </div>
            </div>

            {/* Filter & Action Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#120F0C] border border-white/10">
              
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8C8072] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search organiser name, phone, city, or event..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090706] border border-white/10 focus:border-[#E5BE7A] focus:outline-none rounded-lg text-xs sm:text-sm text-[#F5EBDD] placeholder:text-white/20"
                />
              </div>

              {/* Status Pills & Export */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-white/10 bg-[#090706] p-1 text-xs font-mono">
                  {['all', 'new', 'contacted', 'confirmed', 'archived'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setInquiryFilter(st)}
                      className={`px-3 py-1 rounded capitalize transition-colors ${
                        inquiryFilter === st ? 'bg-[#E5BE7A] text-black font-semibold' : 'text-[#8C8072] hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchInquiries}
                  className="p-2 rounded-lg border border-white/10 hover:border-[#E5BE7A] text-[#C4B7A5] hover:text-white transition-colors"
                  title="Refresh Inquiries"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingInquiries ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={exportInquiriesCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E5BE7A]/15 border border-[#E5BE7A]/40 text-[#E5BE7A] hover:bg-[#E5BE7A] hover:text-black transition-all text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Excel / CSV</span>
                </button>
              </div>
            </div>

            {/* Inquiries Cards List */}
            {isLoadingInquiries ? (
              <div className="text-center py-16 text-[#8C8072] font-mono">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E5BE7A]" />
                Loading organizer booking submissions...
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="text-center py-16 rounded-xl bg-[#120F0C] border border-white/10 text-[#8C8072] space-y-2">
                <Mail className="w-8 h-8 mx-auto text-[#E5BE7A]/40 mb-2" />
                <p className="text-sm">No organizer booking inquiries match your filter.</p>
                <p className="text-xs font-mono">New submissions from the live booking form will appear here instantly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => {
                  const whatsappCleanPhone = inq.phone.replace(/[^0-9]/g, '');
                  const whatsappText = encodeURIComponent(
                    `Hello ${inq.name}, thank you for inquiring for Sonal Makwana's live show regarding ${inq.eventType}.`
                  );
                  const whatsappUrl = `https://wa.me/${whatsappCleanPhone}?text=${whatsappText}`;

                  return (
                    <div 
                      key={inq.id}
                      className="p-6 rounded-xl bg-[#120F0C] border border-white/10 hover:border-[#E5BE7A]/30 transition-all space-y-4 shadow-lg"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-serif text-2xl text-[#F5EBDD] font-normal">
                              {inq.name}
                            </h3>
                            <span className="font-mono text-xs text-[#8C8072]">
                              [{inq.id}]
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A39888]">
                            <span className="text-[#E5BE7A] font-semibold">{inq.eventType}</span>
                            {inq.city && <span>📍 {inq.city}</span>}
                            {inq.eventDate && <span>📅 Date: {inq.eventDate}</span>}
                            <span>⏱ Submitted {new Date(inq.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Status Dropdown & Delete */}
                        <div className="flex items-center gap-3">
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value as Inquiry['status'])}
                            className={`px-3 py-1.5 rounded text-xs font-mono font-semibold uppercase border transition-colors focus:outline-none ${
                              inq.status === 'new'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : inq.status === 'contacted'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : inq.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            <option value="new" className="bg-[#120F0C] text-amber-300">🟡 New Form</option>
                            <option value="contacted" className="bg-[#120F0C] text-blue-300">🔵 Contacted</option>
                            <option value="confirmed" className="bg-[#120F0C] text-emerald-300">🟢 Confirmed</option>
                            <option value="archived" className="bg-[#120F0C] text-zinc-400">⚪ Archived</option>
                          </select>

                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Organizer Message / Requirements */}
                      {inq.message && (
                        <div className="bg-[#090706] p-4 rounded-lg border border-white/5 text-sm text-[#D8CDC0] font-light leading-relaxed">
                          <span className="block text-[11px] font-mono uppercase tracking-wider text-[#8C8072] mb-1">
                            Organiser's Event Message:
                          </span>
                          "{inq.message}"
                        </div>
                      )}

                      {/* Contact Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Direct WhatsApp Call/Chat */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold font-mono transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp ({inq.phone})</span>
                          </a>

                          {/* Direct Phone Call */}
                          <a
                            href={`tel:${inq.phone}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E5BE7A]/15 hover:bg-[#E5BE7A] text-[#E5BE7A] hover:text-black border border-[#E5BE7A]/30 text-xs font-semibold font-mono transition-all"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Organiser</span>
                          </a>

                          {/* Email */}
                          {inq.email && (
                            <a
                              href={`mailto:${inq.email}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-white/30 text-xs font-mono text-[#A39888] hover:text-white transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
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
                                className="px-3 py-1 bg-[#090706] border border-[#E5BE7A] text-xs text-[#F5EBDD] rounded focus:outline-none"
                              />
                              <button
                                onClick={() => handleSaveNotes(inq.id)}
                                className="p-1 bg-[#E5BE7A] text-black rounded text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="p-1 text-[#8C8072] text-xs"
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
                              className="text-xs text-[#8C8072] hover:text-[#E5BE7A] font-mono transition-colors"
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
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#120F0C] border border-white/10">
              <div>
                <h2 className="font-serif text-2xl text-[#F5EBDD]">
                  Moments on Stage Gallery
                </h2>
                <p className="text-xs text-[#8C8072] font-mono mt-0.5">
                  Manage the interactive 3D stage carousel pictures shown on the live website.
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E5BE7A] hover:bg-white text-[#090807] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Stage Photo</span>
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="rounded-xl bg-[#120F0C] border border-white/10 overflow-hidden flex flex-col justify-between group shadow-xl"
                >
                  <div className="space-y-3">
                    {/* Image with Focal Frame Position applied */}
                    <div className="relative aspect-[4/3] w-full bg-[#181410] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ objectPosition: item.objectPosition || 'center 20%' }}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="font-mono text-xs bg-black/70 text-[#E5BE7A] px-2.5 py-1 rounded backdrop-blur-sm border border-white/10 font-bold">
                          PLATE {item.number}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider bg-black/70 text-white/90 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                          {item.category}
                        </span>
                      </div>

                      {/* Focal Indicator Badge */}
                      <div className="absolute bottom-3 right-3 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-[#E5BE7A] border border-white/10">
                        Frame: {item.objectPosition || 'center 20%'}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-5 space-y-2">
                      <h4 className="font-serif text-xl text-[#F5EBDD] font-normal leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs font-mono text-[#E5BE7A] uppercase tracking-wider">
                        {item.designation}
                      </p>
                      {item.quote && (
                        <p className="text-xs text-[#A39888] font-light italic line-clamp-2 pt-2 border-t border-white/[0.06]">
                          "{item.quote}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-5 py-3.5 bg-[#090706] border-t border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveGalleryItem(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-[#C4B7A5]"
                        title="Move Earlier"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveGalleryItem(index, 'down')}
                        disabled={index === galleryItems.length - 1}
                        className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-[#C4B7A5]"
                        title="Move Later"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-mono text-[#E5BE7A] hover:bg-[#E5BE7A]/15 border border-[#E5BE7A]/30 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Adjust / Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
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
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="p-6 rounded-xl bg-[#120F0C] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[#E5BE7A] text-xs font-mono uppercase tracking-wider">
                <Play className="w-4 h-4" />
                <span>Section [04] Configuration</span>
              </div>
              <h2 className="font-serif text-3xl text-[#F5EBDD]">
                The Magic of Live Music
              </h2>
              <p className="text-xs sm:text-sm text-[#A39888] font-light leading-relaxed">
                Update the featured live concert showcase video shown in the cinematic letterbox section of the homepage.
              </p>
            </div>

            {/* Video Preview */}
            <div className="p-6 rounded-xl bg-[#120F0C] border border-white/10 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#E5BE7A] font-semibold block">
                Live Video Preview (YouTube Embed)
              </span>
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${settings.livePerformance.videoId}?controls=1&rel=0`}
                  title="Concert Preview"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Video Edit Form */}
            <div className="p-6 rounded-xl bg-[#120F0C] border border-white/10 space-y-5">
              
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                  YouTube Performance Video Link or Video ID
                </label>
                <input
                  type="text"
                  value={settings.livePerformance.youtubeUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    livePerformance: { ...settings.livePerformance, youtubeUrl: e.target.value }
                  })}
                  placeholder="e.g. https://www.youtube.com/watch?v=RXVnBqGBi9A or RXVnBqGBi9A"
                  className="w-full px-4 py-3 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD] font-mono"
                />
                <span className="text-[11px] font-mono text-[#8C8072]">
                  Paste any YouTube link (youtu.be/..., youtube.com/watch?v=..., or 11-char ID). System extracts it automatically.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={settings.livePerformance.title}
                    onChange={(e) => setSettings({
                      ...settings,
                      livePerformance: { ...settings.livePerformance, title: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                    Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.livePerformance.subtitle}
                    onChange={(e) => setSettings({
                      ...settings,
                      livePerformance: { ...settings.livePerformance, subtitle: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                  Narrative Description
                </label>
                <textarea
                  rows={2}
                  value={settings.livePerformance.description}
                  onChange={(e) => setSettings({
                    ...settings,
                    livePerformance: { ...settings.livePerformance, description: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={settings.livePerformance.channelUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    livePerformance: { ...settings.livePerformance, channelUrl: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD] font-mono"
                />
              </div>

              <button
                onClick={() => handleSaveSettings('video')}
                disabled={isSavingSettings}
                className="w-full py-3.5 bg-[#E5BE7A] hover:bg-white text-[#090807] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing Video to Live Site...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Publish Live Performance Video</span>
                  </>
                )}
              </button>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FEATURED SONG & AUDIO STREAM */}
        {/* ========================================================================= */}
        {activeTab === 'song' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="p-6 rounded-xl bg-[#120F0C] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-[#E5BE7A] text-xs font-mono uppercase tracking-wider">
                <Music className="w-4 h-4" />
                <span>Section [02] Configuration</span>
              </div>
              <h2 className="font-serif text-3xl text-[#F5EBDD]">
                Featured Song & Audio Deck
              </h2>
              <p className="text-xs sm:text-sm text-[#A39888] font-light leading-relaxed">
                Update the featured song, sacred raag, and background stream that plays when visitors press the vinyl play button.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#120F0C] border border-white/10 space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
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
                    className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
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
                    className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
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
                  className="w-full px-4 py-3 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD] font-mono"
                />
                <span className="text-[11px] font-mono text-[#8C8072]">
                  The site streams audio directly from this YouTube video when users click Play on the vinyl deck.
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                  Song Description & Emotional Context
                </label>
                <textarea
                  rows={3}
                  value={settings.featuredSong.subtitle}
                  onChange={(e) => setSettings({
                    ...settings,
                    featuredSong: { ...settings.featuredSong, subtitle: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                />
              </div>

              <button
                onClick={() => handleSaveSettings('song')}
                disabled={isSavingSettings}
                className="w-full py-3.5 bg-[#E5BE7A] hover:bg-white text-[#090807] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-xl disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing Song to Live Site...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Publish Featured Song</span>
                  </>
                )}
              </button>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: Z+ SECURITY AUDIT & PROTOCOLS */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="p-6 rounded-xl bg-[#120F0C] border border-[#E5BE7A]/30 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5BE7A]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Enterprise Z+ Security Shield Active</span>
              </div>
              <h2 className="font-serif text-3xl text-[#F5EBDD]">
                Security Center & Protection Audit
              </h2>
              <p className="text-xs sm:text-sm text-[#A39888] font-light leading-relaxed">
                Your admin panel is protected by multi-layered defensive security designed to block automated bots, credential scanners, and unauthorized modifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#120F0C] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Server-Side Token Verification</span>
                </div>
                <p className="text-xs text-[#C4B7A5] font-light leading-relaxed">
                  Passcodes and tokens are verified solely on the server edge. No hardcoded passwords exist in client JavaScript.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#120F0C] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Brute-Force Rate Limiter</span>
                </div>
                <p className="text-xs text-[#C4B7A5] font-light leading-relaxed">
                  Automatic IP lockdown activates after 5 consecutive failed attempts. Bots and brute-force tools are banned for 15 minutes.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#120F0C] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>HttpOnly SameSite Cookies</span>
                </div>
                <p className="text-xs text-[#C4B7A5] font-light leading-relaxed">
                  Session tokens reside inside HttpOnly, Secure, SameSite=Strict cookies that cannot be read by malicious third-party scripts or XSS.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#120F0C] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Protected API Endpoints</span>
                </div>
                <p className="text-xs text-[#C4B7A5] font-light leading-relaxed">
                  Every mutation request (delete photo, update status, change video) strictly rejects non-authenticated requests with HTTP 401.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#120F0C] border border-white/10 space-y-4">
              <h3 className="font-serif text-xl text-[#F5EBDD]">
                To Change Your Master Passcode in Production:
              </h3>
              <p className="text-xs sm:text-sm text-[#A39888] font-light leading-relaxed">
                To set your own private custom passcode, add an environment variable in Cloudflare Dashboard:
              </p>
              <div className="p-3 bg-[#090706] rounded-lg border border-white/10 font-mono text-xs text-[#E5BE7A]">
                ADMIN_PASSWORD = YourUltraSecurePasscodeHere
              </div>
              <p className="text-xs text-[#8C8072]">
                Location: Cloudflare Dashboard → Workers & Pages → singer-portfolio → Settings → Variables and Secrets.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT GALLERY ITEM WITH MANUAL FRAME & HEAD POSITION SLIDER */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#120F0C] rounded-2xl border border-[#E5BE7A]/40 shadow-2xl p-6 sm:p-8 space-y-6 my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-serif text-2xl text-[#F5EBDD]">
                  {editingItem ? 'Edit Stage Photo & Adjust Frame' : 'Add New Stage Photo'}
                </h3>
                <p className="text-xs font-mono text-[#E5BE7A]">
                  {editingItem ? `Editing Plate ${editingItem.number}` : 'Upload & adjust image positioning'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-5">
              
              {/* Image Input & Upload */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                  Stage Photo
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Enter image URL or upload photo below..."
                    className="flex-1 px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-xs sm:text-sm text-[#F5EBDD] font-mono"
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
                    className="px-4 py-2.5 bg-[#E5BE7A]/15 hover:bg-[#E5BE7A] text-[#E5BE7A] hover:text-black border border-[#E5BE7A]/30 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                  </button>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-400 font-mono">{uploadError}</p>
                )}
              </div>

              {/* LIVE FRAME PREVIEW & MANUAL HEAD POSITION SLIDER */}
              {formData.image && (
                <div className="p-4 rounded-xl bg-[#090706] border border-[#E5BE7A]/30 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-[#E5BE7A]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Sliders className="w-3.5 h-3.5" />
                      Manual Frame & Head Position Control
                    </span>
                    <span>Offset: {focalPercent}%</span>
                  </div>

                  {/* Frame Simulation Box */}
                  <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-black border border-white/20 shadow-inner">
                    <img
                      src={formData.image}
                      alt="Frame preview"
                      className="w-full h-full object-cover transition-all duration-150"
                      style={{ objectPosition: `center ${focalPercent}%` }}
                    />

                    {/* Frame Guide Overlay Lines */}
                    <div className="absolute inset-0 pointer-events-none border border-[#E5BE7A]/40 rounded-xl" />
                    <div className="absolute top-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300">
                      Live Stage Frame Preview
                    </div>
                  </div>

                  {/* Vertical Slider Control */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono text-[#A39888]">
                      <span>Top (Head Focus: 0%)</span>
                      <span className="text-[#E5BE7A]">Current: {focalPercent}%</span>
                      <span>Bottom (Feet Focus: 100%)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={focalPercent}
                      onChange={(e) => setFocalPercent(parseInt(e.target.value, 10))}
                      className="w-full accent-[#E5BE7A] cursor-pointer"
                    />
                  </div>

                  {/* Quick-Preset Buttons for Perfect Portrait Framing */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                    <span className="text-[#8C8072] text-[11px]">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => setFocalPercent(15)}
                      className="px-2.5 py-1 bg-white/5 hover:bg-[#E5BE7A]/20 border border-white/10 rounded text-[11px] text-[#F5EBDD]"
                    >
                      Top Head (15%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFocalPercent(25)}
                      className="px-2.5 py-1 bg-white/5 hover:bg-[#E5BE7A]/20 border border-white/10 rounded text-[11px] text-[#F5EBDD]"
                    >
                      Upper Body (25%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFocalPercent(50)}
                      className="px-2.5 py-1 bg-white/5 hover:bg-[#E5BE7A]/20 border border-white/10 rounded text-[11px] text-[#F5EBDD]"
                    >
                      Center (50%)
                    </button>
                  </div>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                    Photo Title / Stage Event
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Navratri Raas Mahotsav"
                    className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#120F0C] text-[#F5EBDD]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Designation / Sub-caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                  Designation / Subheading
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Live Festive Performance"
                  className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                />
              </div>

              {/* Quote / Memory text */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#C4B7A5] block">
                  Stage Narrative / Memory Quote
                </label>
                <textarea
                  rows={2}
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Energetic traditional Garba and folk melodies bringing thousands of dancers together..."
                  className="w-full px-4 py-2.5 bg-[#090706] border border-white/15 focus:border-[#E5BE7A] rounded-lg text-sm text-[#F5EBDD]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg border border-white/15 text-[#C4B7A5] hover:text-white text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E5BE7A] hover:bg-white text-[#090807] font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-all shadow-xl"
                >
                  {editingItem ? 'Save Adjustments' : 'Publish Stage Photo'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
