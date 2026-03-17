import { 
  Twitter, 
  Youtube, 
  Instagram, 
  MessageSquare, // Discord
  Send, // Telegram
  Phone, 
  Globe, 
  Mail,
  Link as LinkIcon
} from "lucide-react";

export type SocialPlatform = 'x' | 'youtube' | 'instagram' | 'discord' | 'telegram' | 'phone' | 'website' | 'email' | 'other';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  name?: string;
}

export function detectPlatform(url: string): SocialPlatform {
  const lowUrl = url.toLowerCase();
  if (lowUrl.includes('x.com') || lowUrl.includes('twitter.com')) return 'x';
  if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) return 'youtube';
  if (lowUrl.includes('instagram.com')) return 'instagram';
  if (lowUrl.includes('discord.com') || lowUrl.includes('discord.gg')) return 'discord';
  if (lowUrl.includes('t.me') || lowUrl.includes('telegram.me')) return 'telegram';
  if (lowUrl.startsWith('tel:') || /^\+?[0-9\s-]{10,}$/.test(url)) return 'phone';
  if (lowUrl.startsWith('mailto:') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) return 'email';
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
    case 'phone': return Phone;
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
        case 'phone': return 'رقم الهاتف';
        case 'email': return 'البريد الإلكتروني';
        case 'website': return 'الموقع الشخصي';
        default: return 'رابط';
    }
}
