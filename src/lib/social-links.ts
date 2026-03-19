import { 
  Twitter, 
  Youtube, 
  Instagram, 
  MessageSquare, // Discord
  Send, // Telegram
  Phone, 
  Globe, 
  Mail,
  Link as LinkIcon,
  Linkedin,
  Github,
  Smartphone,
  MessageCircle, // WhatsApp
  Music2, // TikTok
  Camera, // Snapchat
} from "lucide-react";

export type SocialPlatform = 
  | 'x' | 'youtube' | 'instagram' | 'discord' | 'telegram' 
  | 'phone' | 'website' | 'email' | 'linkedin' | 'github' 
  | 'whatsapp' | 'tiktok' | 'snapchat' | 'pinterest' | 'other';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  name?: string;
}

export function detectPlatform(url: string): SocialPlatform {
  const lowUrl = url.toLowerCase().trim();
  
  // Social platforms
  if (lowUrl.includes('x.com') || lowUrl.includes('twitter.com')) return 'x';
  if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) return 'youtube';
  if (lowUrl.includes('instagram.com')) return 'instagram';
  if (lowUrl.includes('discord.com') || lowUrl.includes('discord.gg')) return 'discord';
  if (lowUrl.includes('t.me') || lowUrl.includes('telegram.me') || lowUrl.includes('telegram.org')) return 'telegram';
  if (lowUrl.includes('linkedin.com') || lowUrl.includes('linkedin.in')) return 'linkedin';
  if (lowUrl.includes('github.com')) return 'github';
  if (lowUrl.includes('tiktok.com') || lowUrl.includes('vm.tiktok.com')) return 'tiktok';
  if (lowUrl.includes('snapchat.com') || lowUrl.includes('snap.com')) return 'snapchat';
  if (lowUrl.includes('pinterest.com') || lowUrl.includes('pin.it')) return 'pinterest';
  
  // WhatsApp (wa.me links or whatsapp.com)
  if (lowUrl.includes('wa.me') || lowUrl.includes('whatsapp.com') || lowUrl.includes('api.whatsapp.com')) return 'whatsapp';
  
  // Phone numbers — starts with + or is mostly digits
  if (lowUrl.startsWith('tel:')) return 'phone';
  if (/^[\+]?[0-9\s\-\(\)]{8,}$/.test(url.trim())) {
    // Check if it looks like WhatsApp format (starts with +, common)
    if (lowUrl.startsWith('+')) return 'whatsapp';
    return 'phone';
  }
  
  // Email
  if (lowUrl.startsWith('mailto:') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url.trim())) return 'email';
  
  // Generic URL
  if (lowUrl.startsWith('http')) return 'website';
  
  return 'other';
}

export function getPlatformIcon(platform: SocialPlatform) {
  switch (platform) {
    case 'x': return Twitter;
    case 'youtube': return Youtube;
    case 'instagram': return Instagram;
    case 'discord': return MessageSquare;
    case 'telegram': return Send;
    case 'linkedin': return Linkedin;
    case 'github': return Github;
    case 'tiktok': return Music2;
    case 'snapchat': return Camera;
    case 'whatsapp': return MessageCircle;
    case 'pinterest': return Globe;
    case 'phone': return Smartphone;
    case 'email': return Mail;
    case 'website': return Globe;
    default: return LinkIcon;
  }
}

export function getPlatformColor(platform: SocialPlatform) {
  switch (platform) {
    case 'x': return '#000000';
    case 'youtube': return '#FF0000';
    case 'instagram': return '#E4405F';
    case 'discord': return '#5865F2';
    case 'telegram': return '#26A5E4';
    case 'linkedin': return '#0A66C2';
    case 'github': return '#181717';
    case 'tiktok': return '#000000';
    case 'snapchat': return '#FFFC00';
    case 'whatsapp': return '#25D366';
    case 'pinterest': return '#BD081C';
    case 'phone': return '#25D366';
    case 'email': return '#EA4335';
    case 'website': return '#3B82F6';
    default: return '#7C3AED';
  }
}

export function getPlatformLabel(platform: SocialPlatform) {
  switch (platform) {
    case 'x': return 'إكس (تويتر)';
    case 'youtube': return 'يوتيوب';
    case 'instagram': return 'إنستغرام';
    case 'discord': return 'ديسكورد';
    case 'telegram': return 'تلغرام';
    case 'linkedin': return 'لينكد إن';
    case 'github': return 'جيت هب';
    case 'tiktok': return 'تيك توك';
    case 'snapchat': return 'سناب شات';
    case 'whatsapp': return 'واتساب';
    case 'pinterest': return 'بنترست';
    case 'phone': return 'رقم الهاتف';
    case 'email': return 'البريد الإلكتروني';
    case 'website': return 'الموقع الشخصي';
    default: return 'رابط';
  }
}
