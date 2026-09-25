"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Plus, 
  Upload, 
  Check, 
  X, 
  Search, 
  ArrowUpRight, 
  Phone, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  Lock, 
  LogOut, 
  ExternalLink, 
  RefreshCw,
  Eye,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ShieldCheck,
  AlertCircle
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
}

const CATEGORIES = [
  'Navratri',
  'Classical',
  'Devotional',
  'Royal Wedding',
  'Stage Show'
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [activeTab, setActiveTab] = useState<'inquiries' | 'gallery'>('inquiries');

  // Inquiries State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState<string>('all');
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

  // Gallery State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form states for Add/Edit Gallery
  const [formData, setFormData] = useState({
    title: '',
    category: 'Navratri',
    designation: '',
    quote: '',
    image: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check auth from localStorage on mount
  useEffect(() => {
    const auth = localStorage.getItem('sm_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries();
      fetchGallery();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'sonal2026' || passcode.trim() === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('sm_admin_auth', 'true');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sm_admin_auth');
    setPasscode('');
  };

  // Fetch inquiries
  const fetchInquiries = async () => {
    setIsLoadingInquiries(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (data.success) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  // Fetch gallery
  const fetchGallery = async () => {
    setIsLoadingGallery(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) {
        setGalleryItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setIsLoadingGallery(false);
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
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  // Delete inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry record?')) return;
    try {
      const res = await fetch(`/api/inquiries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInquiries(prev => prev.filter(inq => inq.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  // File upload handler
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
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (err) {
      setUploadError('Network error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  // Save gallery item (Create or Update)
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      alert('Please provide at least a title and an image.');
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const res = await fetch('/api/gallery', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            ...formData
          })
        });
        if (res.ok) {
          fetchGallery();
          closeModal();
        }
      } else {
        // Create new item
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          fetchGallery();
          closeModal();
        }
      }
    } catch (err) {
      console.error('Failed to save gallery item:', err);
    }
  };

  // Delete gallery item
  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery image from the live website?')) return;
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGalleryItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete gallery item:', err);
    }
  };

  // Reorder gallery items
  const handleMoveGalleryItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryItems.length) return;

    const updated = [...galleryItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-index number strings
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
      image: ''
    });
    setUploadError('');
    setShowAddModal(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      designation: item.designation,
      quote: item.quote,
      image: item.image
    });
    setUploadError('');
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingItem(null);
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

  // Counters
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;
  const contactedCount = inquiries.filter(i => i.status === 'contacted').length;
  const confirmedCount = inquiries.filter(i => i.status === 'confirmed').length;

  // Unauthenticated Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0705] text-[#F5EBDD] flex items-center justify-center p-6 font-['Outfit',sans-serif]">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-xl bg-[#14110E] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E5BE7A] to-transparent" />
          
          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 rounded-full border border-[#E5BE7A]/40 flex items-center justify-center mx-auto text-[#E5BE7A] bg-[#1a1612]">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-serif-luxury text-3xl font-light text-[#F5EBDD]">
              Management Portal
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#C4B7A5]">
              Sonal Makwana Official Management
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#E5BE7A] font-medium block">
                Access Passcode
              </label>
              <input
                type="password"
                required
                placeholder="Enter passcode (default: sonal2026)"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError(false);
                }}
                className="w-full bg-[#0B0705] border border-white/15 focus:border-[#E5BE7A] p-3.5 text-sm text-[#F5EBDD] placeholder:text-white/30 focus:outline-none transition-colors rounded"
              />
              {passcodeError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Incorrect passcode. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#E5BE7A] to-[#C89B56] text-[#0B0705] text-xs uppercase tracking-[0.2em] font-semibold hover:brightness-110 active:scale-[0.99] transition-all rounded"
            >
              Unlock Admin Portal
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <a
              href="/"
              className="text-xs text-[#C4B7A5] hover:text-[#E5BE7A] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>← Return to Public Website</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0705] text-[#F5EBDD] font-['Outfit',sans-serif]">
      {/* Top Header Bar */}
      <header className="border-b border-white/10 bg-[#120E0B] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-[#E5BE7A]/50 flex items-center justify-center text-xs font-serif-luxury text-[#E5BE7A] bg-[#1a1612]">
              SM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-xl text-[#F5EBDD] tracking-wide">
                  Sonal Makwana
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#E5BE7A]/15 text-[#E5BE7A] border border-[#E5BE7A]/30">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-[#A39888] font-mono">Official Artist Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#E5BE7A] border border-[#E5BE7A]/30 hover:bg-[#E5BE7A]/10 transition-colors rounded"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C4B7A5] hover:text-white border border-white/10 hover:bg-white/5 transition-colors rounded"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 border-t border-white/[0.06] text-xs font-mono uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'inquiries'
                ? 'border-[#E5BE7A] text-[#E5BE7A] font-semibold'
                : 'border-transparent text-[#A39888] hover:text-[#F5EBDD]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inquiries & Mails</span>
            {newInquiriesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E5BE7A] text-[#0B0705] font-bold">
                {newInquiriesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'gallery'
                ? 'border-[#E5BE7A] text-[#E5BE7A] font-semibold'
                : 'border-transparent text-[#A39888] hover:text-[#F5EBDD]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Gallery Manager</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/10 text-[#C4B7A5]">
              {galleryItems.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* ======================================================== */}
        {/* TAB 1: INQUIRIES & MAILS                                 */}
        {/* ======================================================== */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-[#14110E] border border-white/10">
                <span className="text-[11px] font-mono text-[#A39888] uppercase block">Total Mails</span>
                <span className="text-2xl font-serif-luxury text-[#F5EBDD] font-semibold">{inquiries.length}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#14110E] border border-[#E5BE7A]/30">
                <span className="text-[11px] font-mono text-[#E5BE7A] uppercase block">New / Unread</span>
                <span className="text-2xl font-serif-luxury text-[#E5BE7A] font-semibold">{newInquiriesCount}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#14110E] border border-blue-500/20">
                <span className="text-[11px] font-mono text-blue-400 uppercase block">Contacted</span>
                <span className="text-2xl font-serif-luxury text-blue-300 font-semibold">{contactedCount}</span>
              </div>
              <div className="p-4 rounded-lg bg-[#14110E] border border-green-500/20">
                <span className="text-[11px] font-mono text-green-400 uppercase block">Confirmed Shows</span>
                <span className="text-2xl font-serif-luxury text-green-300 font-semibold">{confirmedCount}</span>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#14110E] p-4 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 text-xs font-mono">
                {['all', 'new', 'contacted', 'confirmed', 'archived'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setInquiryFilter(st)}
                    className={`px-3 py-1.5 rounded uppercase tracking-wider transition-colors ${
                      inquiryFilter === st
                        ? 'bg-[#E5BE7A] text-[#0B0705] font-semibold'
                        : 'bg-white/5 text-[#A39888] hover:text-[#F5EBDD] hover:bg-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search client, city, event..."
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    className="w-full bg-[#0B0705] border border-white/15 focus:border-[#E5BE7A] pl-9 pr-3 py-1.5 text-xs text-[#F5EBDD] placeholder:text-white/30 rounded focus:outline-none"
                  />
                </div>

                <button
                  onClick={fetchInquiries}
                  className="p-2 border border-white/10 rounded hover:bg-white/5 text-[#A39888] hover:text-white transition-colors"
                  title="Refresh inquiries"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingInquiries ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Inquiries List */}
            {filteredInquiries.length === 0 ? (
              <div className="text-center py-16 bg-[#14110E] border border-white/10 rounded-lg space-y-3">
                <Mail className="w-10 h-10 text-[#E5BE7A]/40 mx-auto" />
                <h3 className="font-serif-luxury text-xl text-[#F5EBDD]">No Inquiries Found</h3>
                <p className="text-xs text-[#A39888] max-w-sm mx-auto">
                  {inquirySearch ? 'No inquiries matched your search criteria.' : 'Booking requests submitted through the website form will appear here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((inq) => {
                  const statusColors: Record<Inquiry['status'], string> = {
                    new: 'bg-[#E5BE7A]/20 text-[#E5BE7A] border-[#E5BE7A]/40',
                    contacted: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    confirmed: 'bg-green-500/20 text-green-300 border-green-500/30',
                    archived: 'bg-white/10 text-white/50 border-white/15'
                  };

                  const cleanPhone = inq.phone.replace(/[^0-9+]/g, '');

                  return (
                    <div
                      key={inq.id}
                      className="p-5 sm:p-6 rounded-lg bg-[#14110E] border border-white/10 hover:border-white/20 transition-all space-y-4"
                    >
                      {/* Top Row: Client Info, Date, Status */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-serif-luxury text-2xl text-[#F5EBDD] font-normal">
                              {inq.name}
                            </h3>
                            <span className="font-mono text-[11px] text-[#A39888]">
                              [{inq.id}]
                            </span>
                            <span
                              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                                statusColors[inq.status]
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#C4B7A5]">
                            <span className="text-[#E5BE7A] font-medium">{inq.eventType}</span>
                            {inq.eventDate && (
                              <span className="flex items-center gap-1 font-mono">
                                <Calendar className="w-3.5 h-3.5 text-[#E5BE7A]" />
                                {inq.eventDate}
                              </span>
                            )}
                            {inq.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#E5BE7A]" />
                                {inq.city}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Received Timestamp */}
                        <div className="text-[11px] font-mono text-[#A39888] sm:text-right">
                          {new Date(inq.createdAt).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </div>
                      </div>

                      {/* Message Body */}
                      {inq.message && (
                        <div className="bg-[#0B0705] p-3.5 rounded border border-white/[0.06] text-xs sm:text-sm text-[#D8CDC0] leading-relaxed">
                          <span className="font-mono text-[10px] text-[#E5BE7A] uppercase tracking-wider block mb-1">
                            Client Message:
                          </span>
                          {inq.message}
                        </div>
                      )}

                      {/* Bottom Action Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        {/* Direct Communication Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* WhatsApp Direct Reply */}
                          <a
                            href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
                              `Hello ${inq.name}, thank you for your booking enquiry regarding Sonal Makwana for ${inq.eventType} on ${inq.eventDate || 'your upcoming event'}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] text-xs font-mono transition-colors font-medium"
                          >
                            <span>WhatsApp ({inq.phone})</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>

                          {/* Phone Call */}
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#C4B7A5] hover:text-white transition-colors"
                          >
                            <Phone className="w-3 h-3 text-[#E5BE7A]" />
                            <span>Call</span>
                          </a>

                          {/* Email */}
                          {inq.email && (
                            <a
                              href={`mailto:${inq.email}?subject=Booking Inquiry for Sonal Makwana - ${inq.eventType}&body=Dear ${inq.name},%0D%0A%0D%0AThank you for reaching out regarding Sonal Makwana's performance for ${inq.eventType}.`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#C4B7A5] hover:text-white transition-colors"
                            >
                              <Mail className="w-3 h-3 text-[#E5BE7A]" />
                              <span>{inq.email}</span>
                            </a>
                          )}
                        </div>

                        {/* Status Dropdown & Delete */}
                        <div className="flex items-center gap-3">
                          <label className="text-[11px] font-mono text-[#A39888] hidden sm:block">Status:</label>
                          <select
                            value={inq.status}
                            onChange={(e) => handleStatusChange(inq.id, e.target.value as Inquiry['status'])}
                            className="bg-[#0B0705] border border-white/20 text-xs text-[#E5BE7A] font-mono px-2.5 py-1 rounded focus:outline-none focus:border-[#E5BE7A]"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="archived">Archived</option>
                          </select>

                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: GALLERY MANAGER                                   */}
        {/* ======================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#14110E] p-4 rounded-lg border border-white/10">
              <div>
                <h2 className="font-serif-luxury text-2xl text-[#F5EBDD]">Gallery Images ({galleryItems.length})</h2>
                <p className="text-xs text-[#A39888] font-mono mt-0.5">
                  These images display in the interactive 3D circular stage showcase on the website.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchGallery}
                  className="p-2 border border-white/10 rounded hover:bg-white/5 text-[#A39888] hover:text-white transition-colors"
                  title="Refresh gallery"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingGallery ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5BE7A] text-[#0B0705] font-semibold text-xs uppercase tracking-wider rounded hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Image</span>
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-[#14110E] border border-white/10 rounded-lg overflow-hidden flex flex-col justify-between hover:border-[#E5BE7A]/40 transition-all group"
                >
                  {/* Image Aspect Box */}
                  <div className="relative aspect-[4/3] bg-black overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-mono text-[#E5BE7A] border border-white/10">
                      #{item.number}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-mono text-white/80 border border-white/10">
                      {item.category}
                    </div>
                  </div>

                  {/* Meta Details */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-serif-luxury text-xl text-[#F5EBDD] font-normal leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#E5BE7A] font-mono">
                        {item.designation}
                      </p>
                      {item.quote && (
                        <p className="text-xs text-[#A39888] pt-2 line-clamp-2 leading-relaxed">
                          "{item.quote}"
                        </p>
                      )}
                    </div>

                    {/* Controls Footer */}
                    <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveGalleryItem(index, 'up')}
                          className="p-1 text-[#A39888] hover:text-white disabled:opacity-20 hover:bg-white/5 rounded"
                          title="Move earlier"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === galleryItems.length - 1}
                          onClick={() => handleMoveGalleryItem(index, 'down')}
                          className="p-1 text-[#A39888] hover:text-white disabled:opacity-20 hover:bg-white/5 rounded"
                          title="Move later"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Edit / Delete Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/15 text-[#E5BE7A] hover:text-white transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Change</span>
                        </button>

                        <button
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT GALLERY ITEM                           */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#14110E] border border-white/20 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-serif-luxury text-2xl text-[#F5EBDD]">
                {editingItem ? 'Edit Gallery Image' : 'Add New Gallery Image'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveGallery} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Image Source / Upload */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#E5BE7A] font-medium block">
                  Image Source *
                </label>

                {/* Upload or Drop */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 py-3 px-4 border border-dashed border-[#E5BE7A]/40 rounded hover:border-[#E5BE7A] bg-white/[0.02] hover:bg-white/[0.04] text-xs font-mono text-[#E5BE7A] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Uploading file...' : 'Upload Image File from Device'}</span>
                  </button>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-400">{uploadError}</p>
                )}

                {/* Or enter path/URL */}
                <div className="pt-1">
                  <span className="text-[11px] text-[#A39888] font-mono block mb-1">
                    Or specify file path or URL:
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="/gallery-item-1.png or /uploads/... or https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-[#0B0705] border border-white/15 focus:border-[#E5BE7A] p-2.5 text-xs text-[#F5EBDD] font-mono rounded focus:outline-none"
                  />
                </div>

                {/* Image Preview */}
                {formData.image && (
                  <div className="mt-2 relative aspect-[16/9] w-full rounded overflow-hidden border border-white/10 bg-black">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/gallery-item-1.png';
                      }}
                    />
                    <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 text-[10px] font-mono text-[#E5BE7A] rounded">
                      Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#C4B7A5] font-medium block">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navratri Raas Stage"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0B0705] border border-white/15 focus:border-[#E5BE7A] p-2.5 text-sm text-[#F5EBDD] rounded focus:outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#C4B7A5] font-medium block">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#0B0705] border border-white/15 focus:border-[#E5BE7A] p-2.5 text-xs text-[#F5EBDD] font-mono rounded focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation / Subtitle */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#C4B7A5] font-medium block">
                  Designation / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. Live Festive Performance / Sangeet Sabha"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-[#0B0705] border border-white/15 focus:border-[#E5BE7A] p-2.5 text-sm text-[#F5EBDD] rounded focus:outline-none"
                />
              </div>

              {/* Quote / Description */}
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-[#C4B7A5] font-medium block">
                  Description / Quote
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the event or performance..."
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full bg-[#0B0705] border border-white/15 focus:border-[#E5BE7A] p-2.5 text-xs text-[#F5EBDD] rounded focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs text-[#C4B7A5] hover:text-white border border-white/10 rounded hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E5BE7A] text-[#0B0705] text-xs font-semibold uppercase tracking-wider rounded hover:brightness-110 transition-all active:scale-[0.98]"
                >
                  {editingItem ? 'Save Changes' : 'Add to Live Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
