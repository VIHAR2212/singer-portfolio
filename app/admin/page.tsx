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
  Layers,
  Crop,
  GripVertical,
  Move,
  RotateCw,
  Minus,
  Camera
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
  scale?: number;
  rotation?: number;
}

interface SiteSettings {
  heroPortrait?: {
    image: string;
    objectPosition?: string;
    scale?: number;
    rotation?: number;
    tagline?: string;
  };
  riyazPhoto?: {
    image: string;
    objectPosition?: string;
    scale?: number;
    rotation?: number;
    title?: string;
    subtitle?: string;
  };
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
  // User explicitly requested: "when i go to admin page it doesnot ask for password"
  // So we require entering the passcode whenever visiting the admin page!
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'inquiries' | 'featured-photos' | 'gallery' | 'video' | 'song' | 'security'>('inquiries');
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

  // Gallery Modal: Direct 2D Pan, Resizing, and Rotation inside exact [4:3] main-page frame
  const [formData, setFormData] = useState({
    title: '',
    category: 'Navratri',
    designation: 'Live Festive Performance',
    quote: '',
    image: '',
    objectPosition: '50% 20%',
    scale: 1,
    rotation: 0
  });
  const [focalX, setFocalX] = useState<number>(50);
  const [focalY, setFocalY] = useState<number>(20);
  const [modalScale, setModalScale] = useState<number>(1);
  const [modalRotation, setModalRotation] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Direct Drag inside Gallery Modal Preview Frame
  const [isFrameDragging, setIsFrameDragging] = useState(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initX: number; initY: number }>({ clientX: 0, clientY: 0, initX: 50, initY: 20 });
  const simulationRef = useRef<HTMLDivElement | null>(null);

  // Drag & Drop Gallery Card Rearranging State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);

  // Featured Photos State: Hero Official Portrait & Musical Journey / Riyaz Photo
  const [heroForm, setHeroForm] = useState({
    image: "/sonal-hero-portrait.webp",
    focalX: 50,
    focalY: 20,
    scale: 1,
    rotation: 0
  });
  const [isHeroDragging, setIsHeroDragging] = useState(false);
  const heroDragStartRef = useRef<{ clientX: number; clientY: number; initX: number; initY: number }>({ clientX: 0, clientY: 0, initX: 50, initY: 20 });
  const heroSimulationRef = useRef<HTMLDivElement | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement | null>(null);

  const [riyazForm, setRiyazForm] = useState({
    image: "/sonal-riyaz-academy.webp",
    focalX: 50,
    focalY: 20,
    scale: 1,
    rotation: 0,
    title: "Musical Journey & Practice",
    subtitle: "Classical Riyaz"
  });
  const [isRiyazDragging, setIsRiyazDragging] = useState(false);
  const riyazDragStartRef = useRef<{ clientX: number; clientY: number; initX: number; initY: number }>({ clientX: 0, clientY: 0, initX: 50, initY: 20 });
  const riyazSimulationRef = useRef<HTMLDivElement | null>(null);
  const riyazFileInputRef = useRef<HTMLInputElement | null>(null);

  // Settings State (Hero Portrait, Riyaz Photo, Live Video, Featured Song)
  const [settings, setSettings] = useState<SiteSettings>({
    heroPortrait: {
      image: "/sonal-hero-portrait.webp",
      objectPosition: "center 20%",
      scale: 1,
      rotation: 0,
      tagline: "A Voice That Brings Every Celebration to Life."
    },
    riyazPhoto: {
      image: "/sonal-riyaz-academy.webp",
      objectPosition: "center 20%",
      scale: 1,
      rotation: 0,
      title: "Musical Journey & Practice",
      subtitle: "Classical Riyaz"
    },
    livePerformance: {
      title: "The Magic of Live Music",
      subtitle: "Glimpses from stage shows and festival evenings",
      description: "Experience the energy, warmth, and joy that Sonal brings to every live stage performance.",
      youtubeUrl: "https://www.youtube.com/watch?v=RXVnBqGBi9A",
      videoId: "RXVnBqGBi9A",
      channelUrl: "https://www.youtube.com/@SonalMakwana-zb7qc",
      thumbnail: "/sonal-concert-stage.webp"
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

  // Passcode gate: Always prompt for passcode when visiting /admin as requested by user
  // ("also when i go to admin page it doesnot ask for password")
  useEffect(() => {
    // Session is locked by default upon visiting /admin until passcode is submitted
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
      const res = await fetch(`/api/gallery?t=${Date.now()}`, { cache: 'no-store' });
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
      const res = await fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        if (data.settings.heroPortrait) {
          const hp = data.settings.heroPortrait;
          let fx = 50, fy = 20;
          if (hp.objectPosition) {
            const parts = hp.objectPosition.split(' ');
            if (parts.length === 2) {
              fx = parseFloat(parts[0]) || 50;
              fy = parseFloat(parts[1]) || 20;
            } else {
              const match = hp.objectPosition.match(/(\d+)%/);
              if (match) fy = parseInt(match[1], 10);
            }
          }
          setHeroForm({
            image: hp.image || '/sonal-hero-portrait.webp',
            focalX: fx,
            focalY: fy,
            scale: hp.scale ?? 1,
            rotation: hp.rotation ?? 0
          });
        }
        if (data.settings.riyazPhoto) {
          const rp = data.settings.riyazPhoto;
          let fx = 50, fy = 20;
          if (rp.objectPosition) {
            const parts = rp.objectPosition.split(' ');
            if (parts.length === 2) {
              fx = parseFloat(parts[0]) || 50;
              fy = parseFloat(parts[1]) || 20;
            } else {
              const match = rp.objectPosition.match(/(\d+)%/);
              if (match) fy = parseInt(match[1], 10);
            }
          }
          setRiyazForm({
            image: rp.image || '/sonal-riyaz-academy.webp',
            focalX: fx,
            focalY: fy,
            scale: rp.scale ?? 1,
            rotation: rp.rotation ?? 0,
            title: rp.title || 'Musical Journey & Practice',
            subtitle: rp.subtitle || 'Classical Riyaz'
          });
        }
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

  // Gallery: File selection with direct upload and immediate preview
  const handleFileSelect = (file: File) => {
    setUploadError('');
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    handleFileUpload(file);
  };

  // Direct In-Frame 2D Drag for Gallery Modal (Aspect 4:3 matching main page)
  const handleFramePointerDown = (e: React.PointerEvent) => {
    setIsFrameDragging(true);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initX: focalX,
      initY: focalY
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleFramePointerMove = (e: React.PointerEvent) => {
    if (!isFrameDragging || !simulationRef.current) return;
    const rect = simulationRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartRef.current.clientX;
    const deltaY = e.clientY - dragStartRef.current.clientY;

    const newX = Math.min(Math.max(Math.round(dragStartRef.current.initX - (deltaX / rect.width) * 100), 0), 100);
    const newY = Math.min(Math.max(Math.round(dragStartRef.current.initY - (deltaY / rect.height) * 100), 0), 100);
    setFocalX(newX);
    setFocalY(newY);
  };

  const handleFramePointerUp = (e: React.PointerEvent) => {
    setIsFrameDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleFrameWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setModalScale(prev => Math.min(Math.max(Number((prev + delta).toFixed(2)), 1), 3));
  };

  // Direct In-Frame 2D Drag for Hero Portrait (Aspect 3:4 matching main page)
  const handleHeroPointerDown = (e: React.PointerEvent) => {
    setIsHeroDragging(true);
    heroDragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initX: heroForm.focalX,
      initY: heroForm.focalY
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleHeroPointerMove = (e: React.PointerEvent) => {
    if (!isHeroDragging || !heroSimulationRef.current) return;
    const rect = heroSimulationRef.current.getBoundingClientRect();
    const deltaX = e.clientX - heroDragStartRef.current.clientX;
    const deltaY = e.clientY - heroDragStartRef.current.clientY;

    const newX = Math.min(Math.max(Math.round(heroDragStartRef.current.initX - (deltaX / rect.width) * 100), 0), 100);
    const newY = Math.min(Math.max(Math.round(heroDragStartRef.current.initY - (deltaY / rect.height) * 100), 0), 100);
    setHeroForm(prev => ({ ...prev, focalX: newX, focalY: newY }));
  };

  const handleHeroPointerUp = (e: React.PointerEvent) => {
    setIsHeroDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleHeroWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setHeroForm(prev => ({
      ...prev,
      scale: Math.min(Math.max(Number(((prev.scale ?? 1) + delta).toFixed(2)), 1), 3)
    }));
  };

  // Direct In-Frame 2D Drag for Musical Journey & Riyaz Photo (Aspect 4:5 matching main page)
  const handleRiyazPointerDown = (e: React.PointerEvent) => {
    setIsRiyazDragging(true);
    riyazDragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initX: riyazForm.focalX,
      initY: riyazForm.focalY
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleRiyazPointerMove = (e: React.PointerEvent) => {
    if (!isRiyazDragging || !riyazSimulationRef.current) return;
    const rect = riyazSimulationRef.current.getBoundingClientRect();
    const deltaX = e.clientX - riyazDragStartRef.current.clientX;
    const deltaY = e.clientY - riyazDragStartRef.current.clientY;

    const newX = Math.min(Math.max(Math.round(riyazDragStartRef.current.initX - (deltaX / rect.width) * 100), 0), 100);
    const newY = Math.min(Math.max(Math.round(riyazDragStartRef.current.initY - (deltaY / rect.height) * 100), 0), 100);
    setRiyazForm(prev => ({ ...prev, focalX: newX, focalY: newY }));
  };

  const handleRiyazPointerUp = (e: React.PointerEvent) => {
    setIsRiyazDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleRiyazWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setRiyazForm(prev => ({
      ...prev,
      scale: Math.min(Math.max(Number(((prev.scale ?? 1) + delta).toFixed(2)), 1), 3)
    }));
  };

  const handleHeroFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError('');
    const previewUrl = URL.createObjectURL(file);
    setHeroForm(prev => ({ ...prev, image: previewUrl }));
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success && data.url) {
        setHeroForm(prev => ({ ...prev, image: data.url }));
        showToast('Hero portrait photo uploaded.');
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch {
      setUploadError('Network error uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRiyazFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError('');
    const previewUrl = URL.createObjectURL(file);
    setRiyazForm(prev => ({ ...prev, image: previewUrl }));
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success && data.url) {
        setRiyazForm(prev => ({ ...prev, image: data.url }));
        showToast('Musical journey photo uploaded.');
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch {
      setUploadError('Network error uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveHeroPortrait = async () => {
    setIsSavingSettings(true);
    try {
      const heroPayload = {
        image: heroForm.image,
        objectPosition: `${heroForm.focalX}% ${heroForm.focalY}%`,
        scale: heroForm.scale ?? 1,
        rotation: heroForm.rotation ?? 0
      };
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroPortrait: heroPayload })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(prev => ({ ...prev, heroPortrait: heroPayload }));
        showToast('Official Hero Portrait updated on live website!');
      } else {
        alert(data.error || 'Failed to update hero portrait');
      }
    } catch {
      alert('Error updating hero portrait.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveRiyazPhoto = async () => {
    setIsSavingSettings(true);
    try {
      const riyazPayload = {
        image: riyazForm.image,
        objectPosition: `${riyazForm.focalX}% ${riyazForm.focalY}%`,
        scale: riyazForm.scale ?? 1,
        rotation: riyazForm.rotation ?? 0,
        title: riyazForm.title,
        subtitle: riyazForm.subtitle
      };
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riyazPhoto: riyazPayload })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(prev => ({ ...prev, riyazPhoto: riyazPayload }));
        showToast('Musical Journey photo updated on live website!');
      } else {
        alert(data.error || 'Failed to update musical journey photo');
      }
    } catch {
      alert('Error updating musical journey photo.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Drag and Drop Gallery Cards Rearranging
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItemIndex !== index) {
      setDragOverItemIndex(index);
    }
  };

  const handleDragLeave = () => {
    // will reset on drop/dragEnd
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = draggedItemIndex !== null ? draggedItemIndex : parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
      setDraggedItemIndex(null);
      setDragOverItemIndex(null);
      return;
    }

    const updated = [...galleryItems];
    const [moved] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, moved);

    const renumbered = updated.map((it, idx) => ({
      ...it,
      number: String(idx + 1).padStart(2, '0')
    }));

    setGalleryItems(renumbered);
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);

    try {
      await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: renumbered })
      });
      showToast('Gallery sequence rearranged.');
    } catch (err) {
      console.error('Failed to save reordered items:', err);
    }
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
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

  // Gallery: Save item (Add or Edit) with 2D position, direct scale, and rotation
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      alert('Please provide both a Title and an Image URL.');
      return;
    }

    const payload = {
      ...formData,
      objectPosition: `${focalX}% ${focalY}%`,
      scale: modalScale,
      rotation: modalRotation
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
      objectPosition: '50% 20%',
      scale: 1,
      rotation: 0
    });
    setFocalX(50);
    setFocalY(20);
    setModalScale(1);
    setModalRotation(0);
    setUploadError('');
    setShowAddModal(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    let fx = 50, fy = 20;
    if (item.objectPosition) {
      const parts = item.objectPosition.split(' ');
      if (parts.length === 2) {
        fx = parseFloat(parts[0]) || 50;
        fy = parseFloat(parts[1]) || 20;
      } else {
        const match = item.objectPosition.match(/(\d+)%/);
        if (match) fy = parseInt(match[1], 10);
      }
    }
    setFormData({
      title: item.title,
      category: item.category,
      designation: item.designation,
      quote: item.quote,
      image: item.image,
      objectPosition: item.objectPosition || '50% 20%',
      scale: item.scale ?? 1,
      rotation: item.rotation ?? 0
    });
    setFocalX(fx);
    setFocalY(fy);
    setModalScale(item.scale ?? 1);
    setModalRotation(item.rotation ?? 0);
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
            onClick={() => setActiveTab('featured-photos')}
            className={`flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all ${
              activeTab === 'featured-photos'
                ? 'border-zinc-100 text-zinc-100'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Camera className="w-4 h-4 text-zinc-400" />
            <span>Featured Photos</span>
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
        {/* TAB: FEATURED KEY PHOTOS (HERO PORTRAIT 3:4 & MUSICAL RIYAZ 4:5)        */}
        {/* ========================================================================= */}
        {activeTab === 'featured-photos' && (
          <div className="space-y-8">
            <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800">
              <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#E5BE7A]" />
                <span>Featured Website Photos</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Directly adjust framing, pan 2D position by dragging, zoom/resize, and rotate the key portrait photos displayed on the main website. The frame sizes below match the exact proportions shown on the live site.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* PHOTO 1: HERO OFFICIAL PORTRAIT (ASPECT 3:4) */}
              <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-100">
                        Official Hero Portrait
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Hero section luxury presentation photo
                      </p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-[#E5BE7A] border border-amber-500/30">
                      3:4 Aspect Ratio
                    </span>
                  </div>

                  {/* Direct Draggable Frame in Exact 3:4 Ratio */}
                  <div className="flex justify-center py-2">
                    <div
                      ref={heroSimulationRef}
                      onPointerDown={handleHeroPointerDown}
                      onPointerMove={handleHeroPointerMove}
                      onPointerUp={handleHeroPointerUp}
                      onWheel={handleHeroWheel}
                      className="relative w-full max-w-[280px] aspect-[3/4] rounded-lg overflow-hidden bg-black border border-amber-500/40 shadow-2xl cursor-grab active:cursor-grabbing group select-none touch-none"
                      title="Drag directly on photo to pan (X & Y) • Scroll to zoom"
                    >
                      <img
                        src={heroForm.image}
                        alt="Hero Portrait Preview"
                        draggable={false}
                        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-75"
                        style={{
                          objectPosition: `${heroForm.focalX}% ${heroForm.focalY}%`,
                          transform: `scale(${heroForm.scale ?? 1}) rotate(${heroForm.rotation ?? 0}deg)`,
                          transformOrigin: `${heroForm.focalX}% ${heroForm.focalY}%`
                        }}
                      />

                      {/* Golden Registration Corners matching main page */}
                      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#E5BE7A] pointer-events-none" />
                      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#E5BE7A] pointer-events-none" />
                      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#E5BE7A] pointer-events-none" />
                      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#E5BE7A] pointer-events-none" />

                      {/* Guide badge */}
                      <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 rounded text-[10px] text-zinc-300 pointer-events-none flex items-center gap-1 backdrop-blur-sm border border-zinc-700/60">
                        <Move className="w-2.5 h-2.5 text-[#E5BE7A]" />
                        <span>Drag to pan</span>
                      </div>

                      {/* Center Hover Cue */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] font-medium bg-black/85 text-zinc-200 px-3 py-1 rounded-full border border-zinc-700 backdrop-blur-sm shadow-md flex items-center gap-1.5">
                          <Move className="w-3 h-3 text-[#E5BE7A]" />
                          <span>Drag in any direction</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Positioning & Zoom Bar */}
                  <div className="space-y-2.5 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono text-[11px]">
                        Focal: {heroForm.focalX}% X, {heroForm.focalY}% Y | Zoom: {(heroForm.scale ?? 1).toFixed(2)}x
                      </span>
                      <button
                        type="button"
                        onClick={() => setHeroForm(prev => ({ ...prev, rotation: ((prev.rotation ?? 0) + 90) % 360 }))}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#E5BE7A] border border-[#E5BE7A]/30 flex items-center gap-1.5 font-medium transition-colors text-xs active:scale-95 shadow-sm"
                        title="Rotate photo 90 degrees clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Rotate 90° ({heroForm.rotation ?? 0}°)</span>
                      </button>
                    </div>

                    {/* Zoom / Scale Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Resize / Zoom:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setHeroForm(prev => ({ ...prev, scale: Math.max(Number(((prev.scale ?? 1) - 0.1).toFixed(2)), 1) }))}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeroForm(prev => ({ ...prev, scale: 1 }))}
                            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px]"
                          >
                            1.0x
                          </button>
                          <button
                            type="button"
                            onClick={() => setHeroForm(prev => ({ ...prev, scale: Math.min(Number(((prev.scale ?? 1) + 0.1).toFixed(2)), 3) }))}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={heroForm.scale ?? 1}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                        className="w-full accent-[#E5BE7A] cursor-pointer"
                      />
                    </div>

                    {/* Presets */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 text-[11px]">Align:</span>
                        <button
                          type="button"
                          onClick={() => setHeroForm(prev => ({ ...prev, focalX: 50, focalY: 15 }))}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                        >
                          Head Focus
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroForm(prev => ({ ...prev, focalX: 50, focalY: 25 }))}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                        >
                          Upper Body
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroForm(prev => ({ ...prev, focalX: 50, focalY: 50 }))}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                        >
                          Center
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHeroForm(prev => ({ ...prev, focalX: 50, focalY: 20, scale: 1, rotation: 0 }))}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Image Source & Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300 block">
                      Hero Portrait Image URL / Upload
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={heroForm.image}
                        onChange={(e) => setHeroForm(prev => ({ ...prev, image: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-xs font-mono text-zinc-100"
                        placeholder="Image URL or upload..."
                      />
                      <input
                        type="file"
                        ref={heroFileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleHeroFileUpload(e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => heroFileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={handleSaveHeroPortrait}
                    disabled={isSavingSettings}
                    className="w-full py-2.5 bg-white hover:bg-zinc-200 active:scale-[0.98] text-zinc-950 font-medium text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Save Hero Portrait Changes</span>
                  </button>
                </div>
              </div>

              {/* PHOTO 2: MUSICAL JOURNEY & RIYAZ PHOTO (ASPECT 4:5) */}
              <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-100">
                        Musical Journey & Practice Photo
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Classical Riyaz & Academy presentation card
                      </p>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-[#E5BE7A] border border-amber-500/30">
                      4:5 Aspect Ratio
                    </span>
                  </div>

                  {/* Direct Draggable Frame in Exact 4:5 Ratio */}
                  <div className="flex justify-center py-2">
                    <div
                      ref={riyazSimulationRef}
                      onPointerDown={handleRiyazPointerDown}
                      onPointerMove={handleRiyazPointerMove}
                      onPointerUp={handleRiyazPointerUp}
                      onWheel={handleRiyazWheel}
                      className="relative w-full max-w-[280px] aspect-[4/5] rounded-xl overflow-hidden bg-black border border-amber-900/40 shadow-2xl cursor-grab active:cursor-grabbing group select-none touch-none"
                      title="Drag directly on photo to pan (X & Y) • Scroll to zoom"
                    >
                      <img
                        src={riyazForm.image}
                        alt="Riyaz Photo Preview"
                        draggable={false}
                        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-75"
                        style={{
                          objectPosition: `${riyazForm.focalX}% ${riyazForm.focalY}%`,
                          transform: `scale(${riyazForm.scale ?? 1}) rotate(${riyazForm.rotation ?? 0}deg)`,
                          transformOrigin: `${riyazForm.focalX}% ${riyazForm.focalY}%`
                        }}
                      />

                      {/* Main-Page Overlay Bar exactly like live site */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-6 pointer-events-none flex items-center justify-between text-[11px] border-t border-amber-900/20">
                        <span className="text-stone-300 font-sans tracking-wider uppercase text-[10px]">
                          {riyazForm.title || "Musical Journey & Practice"}
                        </span>
                        <span className="text-[#E5BE7A] font-serif font-medium text-[11px]">
                          {riyazForm.subtitle || "Classical Riyaz"}
                        </span>
                      </div>

                      {/* Guide badge */}
                      <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 rounded text-[10px] text-zinc-300 pointer-events-none flex items-center gap-1 backdrop-blur-sm border border-zinc-700/60">
                        <Move className="w-2.5 h-2.5 text-[#E5BE7A]" />
                        <span>Drag to pan</span>
                      </div>

                      {/* Center Hover Cue */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] font-medium bg-black/85 text-zinc-200 px-3 py-1 rounded-full border border-zinc-700 backdrop-blur-sm shadow-md flex items-center gap-1.5">
                          <Move className="w-3 h-3 text-[#E5BE7A]" />
                          <span>Drag in any direction</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Positioning & Zoom Bar */}
                  <div className="space-y-2.5 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-mono text-[11px]">
                        Focal: {riyazForm.focalX}% X, {riyazForm.focalY}% Y | Zoom: {(riyazForm.scale ?? 1).toFixed(2)}x
                      </span>
                      <button
                        type="button"
                        onClick={() => setRiyazForm(prev => ({ ...prev, rotation: ((prev.rotation ?? 0) + 90) % 360 }))}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#E5BE7A] border border-[#E5BE7A]/30 flex items-center gap-1.5 font-medium transition-colors text-xs active:scale-95 shadow-sm"
                        title="Rotate photo 90 degrees clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Rotate 90° ({riyazForm.rotation ?? 0}°)</span>
                      </button>
                    </div>

                    {/* Zoom / Scale Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Resize / Zoom:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRiyazForm(prev => ({ ...prev, scale: Math.max(Number(((prev.scale ?? 1) - 0.1).toFixed(2)), 1) }))}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRiyazForm(prev => ({ ...prev, scale: 1 }))}
                            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px]"
                          >
                            1.0x
                          </button>
                          <button
                            type="button"
                            onClick={() => setRiyazForm(prev => ({ ...prev, scale: Math.min(Number(((prev.scale ?? 1) + 0.1).toFixed(2)), 3) }))}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.05}
                        value={riyazForm.scale ?? 1}
                        onChange={(e) => setRiyazForm(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                        className="w-full accent-[#E5BE7A] cursor-pointer"
                      />
                    </div>

                    {/* Presets */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500 text-[11px]">Align:</span>
                        <button
                          type="button"
                          onClick={() => setRiyazForm(prev => ({ ...prev, focalX: 50, focalY: 15 }))}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                        >
                          Head Focus
                        </button>
                        <button
                          type="button"
                          onClick={() => setRiyazForm(prev => ({ ...prev, focalX: 50, focalY: 25 }))}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                        >
                          Upper Body
                        </button>
                        <button
                          type="button"
                          onClick={() => setRiyazForm(prev => ({ ...prev, focalX: 50, focalY: 50 }))}
                          className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                        >
                          Center
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRiyazForm(prev => ({ ...prev, focalX: 50, focalY: 20, scale: 1, rotation: 0 }))}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Image Source & Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300 block">
                      Musical Journey Image URL / Upload
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={riyazForm.image}
                        onChange={(e) => setRiyazForm(prev => ({ ...prev, image: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-lg text-xs font-mono text-zinc-100"
                        placeholder="Image URL or upload..."
                      />
                      <input
                        type="file"
                        ref={riyazFileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleRiyazFileUpload(e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => riyazFileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>

                  {/* Captions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-400 block">
                        Overlay Title
                      </label>
                      <input
                        type="text"
                        value={riyazForm.title}
                        onChange={(e) => setRiyazForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100"
                        placeholder="e.g. Musical Journey & Practice"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-zinc-400 block">
                        Overlay Subtitle
                      </label>
                      <input
                        type="text"
                        value={riyazForm.subtitle}
                        onChange={(e) => setRiyazForm(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100"
                        placeholder="e.g. Classical Riyaz"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={handleSaveRiyazPhoto}
                    disabled={isSavingSettings}
                    className="w-full py-2.5 bg-white hover:bg-zinc-200 active:scale-[0.98] text-zinc-950 font-medium text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isSavingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Save Musical Journey Photo Changes</span>
                  </button>
                </div>
              </div>

            </div>
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

            {/* Gallery Section Header & Tip */}
            <div>
              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 mb-3">
                <GripVertical className="w-3.5 h-3.5 text-[#E5BE7A]" />
                <span>Tip: Drag and drop cards to rearrange gallery order, or click &ldquo;Adjust Frame&rdquo; to crop and position.</span>
              </p>
            </div>

            {/* Gallery Grid with Drag & Drop Rearranging */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {galleryItems.map((item, index) => (
                <div 
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`rounded-xl bg-[#121215] border transition-all duration-200 overflow-hidden flex flex-col justify-between group shadow-sm ${
                    draggedItemIndex === index 
                      ? 'opacity-30 scale-95 border-dashed border-[#E5BE7A]' 
                      : dragOverItemIndex === index
                        ? 'border-2 border-[#E5BE7A] scale-[1.02] shadow-xl ring-2 ring-[#E5BE7A]/30'
                        : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Image with Focal Frame Position applied */}
                    <div className="relative aspect-[4/3] w-full bg-zinc-900 overflow-hidden cursor-grab active:cursor-grabbing">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                        style={{ objectPosition: item.objectPosition || 'center 20%' }}
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="font-mono text-xs bg-black/80 text-zinc-200 px-2 py-0.5 rounded-md backdrop-blur-sm border border-zinc-700/60 font-semibold flex items-center gap-1">
                          <GripVertical className="w-3 h-3 text-zinc-400" />
                          #{item.number}
                        </span>
                        <span className="text-[11px] bg-black/80 text-zinc-300 px-2 py-0.5 rounded-md backdrop-blur-sm border border-zinc-700/60">
                          {item.category}
                        </span>
                      </div>

                      {/* Quick Crop / Adjust Hover Overlay Button */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-auto">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 bg-[#E5BE7A] text-zinc-950 hover:bg-white rounded-lg text-xs font-semibold shadow-lg transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Crop className="w-3.5 h-3.5" />
                          <span>Crop & Adjust</span>
                        </button>
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
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="px-4 py-3 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="p-1.5 text-zinc-500 cursor-grab active:cursor-grabbing hover:text-zinc-300" title="Drag to reorder sequence">
                        <GripVertical className="w-4 h-4" />
                      </span>
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
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0]);
                        // Clear value so the same file can be re-selected if retried
                        e.target.value = '';
                      }
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

                  {/* Quick Reset Framing button when image is loaded */}
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => {
                        setFocalX(50);
                        setFocalY(20);
                        setModalScale(1);
                        setModalRotation(0);
                      }}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg text-xs font-medium transition-all shrink-0 active:scale-95"
                      title="Reset framing, zoom, and rotation"
                    >
                      Reset Frame
                    </button>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-400">{uploadError}</p>
                )}
              </div>

              {/* LIVE FRAME PREVIEW IN EXACT [4:3] MAIN-PAGE RATIO WITH DIRECT DRAGGING, RESIZING, AND ROTATION */}
              {formData.image && (
                <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Sliders className="w-3.5 h-3.5 text-[#E5BE7A]" />
                      <span>Live Frame Preview & Alignment (4:3 Stage Aspect Ratio)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-400 text-[11px]">
                        Focal: {focalX}% X, {focalY}% Y | Zoom: {modalScale.toFixed(2)}x
                      </span>
                      <button
                        type="button"
                        onClick={() => setModalRotation(prev => (prev + 90) % 360)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#E5BE7A] border border-[#E5BE7A]/30 flex items-center gap-1.5 font-medium transition-colors text-xs active:scale-95 shadow-sm"
                        title="Rotate photo 90 degrees clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Rotate 90° ({modalRotation}°)</span>
                      </button>
                    </div>
                  </div>

                  {/* Exact 4:3 Frame Container as seen on Live Website */}
                  <div className="flex justify-center">
                    <div
                      ref={simulationRef}
                      onPointerDown={handleFramePointerDown}
                      onPointerMove={handleFramePointerMove}
                      onPointerUp={handleFramePointerUp}
                      onWheel={handleFrameWheel}
                      className="relative w-full max-w-[420px] aspect-[4/3] rounded-xl overflow-hidden bg-black border border-amber-900/40 shadow-2xl cursor-grab active:cursor-grabbing group select-none touch-none"
                      title="Directly drag image to reposition • Scroll to zoom"
                    >
                      <img
                        src={formData.image}
                        alt="Stage frame preview"
                        draggable={false}
                        className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-75"
                        style={{
                          objectPosition: `${focalX}% ${focalY}%`,
                          transform: `scale(${modalScale}) rotate(${modalRotation}deg)`,
                          transformOrigin: `${focalX}% ${focalY}%`
                        }}
                      />

                      {/* Framing Guides */}
                      <div className="absolute inset-0 pointer-events-none border border-amber-500/20 rounded-xl" />
                      <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-zinc-300 pointer-events-none flex items-center gap-1 backdrop-blur-sm border border-zinc-700/60">
                        <Move className="w-2.5 h-2.5 text-[#E5BE7A]" />
                        <span>Drag to pan (X & Y)</span>
                      </div>
                      <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-zinc-300 pointer-events-none flex items-center gap-1 backdrop-blur-sm border border-zinc-700/60 font-mono">
                        <span>4:3 Live Frame</span>
                      </div>

                      {/* Hover drag cue */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-[11px] font-medium bg-black/85 text-zinc-200 px-3 py-1 rounded-full border border-zinc-700 backdrop-blur-sm shadow-md flex items-center gap-1.5">
                          <Move className="w-3 h-3 text-[#E5BE7A]" />
                          <span>Drag in any direction to adjust</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resizing / Zoom Controls */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <span>Resize / Zoom Image:</span>
                        <span className="text-zinc-200 font-mono">{modalScale.toFixed(2)}x</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setModalScale(prev => Math.max(Number((prev - 0.1).toFixed(2)), 1))}
                          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          title="Zoom Out"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalScale(1)}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px]"
                          title="Reset Zoom"
                        >
                          1.0x
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalScale(prev => Math.min(Number((prev + 0.1).toFixed(2)), 3))}
                          className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          title="Zoom In"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={modalScale}
                      onChange={(e) => setModalScale(parseFloat(e.target.value))}
                      className="w-full accent-[#E5BE7A] cursor-pointer"
                    />
                  </div>

                  {/* Quick Presets for Vertical Alignment */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500 text-[11px]">Align:</span>
                      <button
                        type="button"
                        onClick={() => { setFocalX(50); setFocalY(15); }}
                        className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] transition-colors"
                      >
                        Head Focus
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFocalX(50); setFocalY(30); }}
                        className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] transition-colors"
                      >
                        Upper Body
                      </button>
                      <button
                        type="button"
                        onClick={() => { setFocalX(50); setFocalY(50); }}
                        className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px] transition-colors"
                      >
                        Center
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setFocalX(50); setFocalY(20); setModalScale(1); setModalRotation(0); }}
                      className="text-[11px] text-zinc-400 hover:text-zinc-200 underline"
                    >
                      Reset Framing
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
