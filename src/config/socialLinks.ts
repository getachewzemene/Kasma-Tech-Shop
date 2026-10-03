export type SocialIconKey = 'telegram' | 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'whatsapp';

export interface SocialPlatformConfig {
  id: string;
  name: string;
  handle: string;
  url: string;
  followerCount: string;
  badgeLabel?: string;
  iconKey: SocialIconKey;
  brandColor: string;
  bgClass: string;
  badgeClass: string;
  hoverGlow: string;
  descriptionEn?: string;
  descriptionAm?: string;
  animationTrigger?: 'bounce' | 'pulse' | 'rotate' | 'slide' | 'wave';
}

export const SOCIAL_PLATFORMS_CONFIG: SocialPlatformConfig[] = [
  {
    id: 'telegram',
    name: 'Telegram',
    handle: '@KasmaShop',
    url: 'https://t.me/kasma_shop',
    followerCount: '48k',
    badgeLabel: 'Channel',
    iconKey: 'telegram',
    brandColor: '#229ED9',
    bgClass: 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20',
    badgeClass: 'bg-sky-500/20 text-sky-700 dark:text-sky-300',
    hoverGlow: 'hover:shadow-sky-500/20 hover:shadow-lg',
    descriptionEn: 'Instant flash sales & drop alerts',
    descriptionAm: 'የቅናሽ እና የአዲስ ምርት ማሳወቂያዎች',
    animationTrigger: 'bounce'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@kasma_ethiopia',
    url: 'https://instagram.com/kasma_ethiopia',
    followerCount: '22k',
    badgeLabel: 'Official',
    iconKey: 'instagram',
    brandColor: 'gradient',
    bgClass: 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20',
    badgeClass: 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
    hoverGlow: 'hover:shadow-rose-500/20 hover:shadow-lg',
    descriptionEn: 'Product showcases & video demos',
    descriptionAm: 'የምርት ቪዲዮዎች እና አጫጭር ምስሎች',
    animationTrigger: 'rotate'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@kasma.official',
    url: 'https://tiktok.com/@kasma.official',
    followerCount: '110k',
    badgeLabel: 'Trending',
    iconKey: 'tiktok',
    brandColor: '#000000',
    bgClass: 'bg-zinc-900/10 dark:bg-zinc-800/60 hover:bg-zinc-900/20 border-zinc-300 dark:border-zinc-700',
    badgeClass: 'bg-zinc-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200',
    hoverGlow: 'hover:shadow-zinc-500/20 hover:shadow-lg',
    descriptionEn: 'Unboxing reviews & viral drops',
    descriptionAm: 'የምርት ሙከራዎች እና ቫይራል ቪዲዮዎች',
    animationTrigger: 'pulse'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: 'Kasma Commerce',
    url: 'https://youtube.com/@kasmashop',
    followerCount: '15k',
    badgeLabel: 'Live',
    iconKey: 'youtube',
    brandColor: '#FF0000',
    bgClass: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20',
    badgeClass: 'bg-red-500/20 text-red-700 dark:text-red-300',
    hoverGlow: 'hover:shadow-red-500/20 hover:shadow-lg',
    descriptionEn: 'Tech guides & merchant stories',
    descriptionAm: 'የቴክኖሎጂ መመሪያዎች እና ትምህርቶች',
    animationTrigger: 'wave'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: 'Kasma Ethiopia',
    url: 'https://facebook.com/kasma.ethiopia',
    followerCount: '35k',
    badgeLabel: 'Page',
    iconKey: 'facebook',
    brandColor: '#1877F2',
    bgClass: 'bg-blue-600/10 hover:bg-blue-600/20 border-blue-600/20',
    badgeClass: 'bg-blue-600/20 text-blue-700 dark:text-blue-300',
    hoverGlow: 'hover:shadow-blue-600/20 hover:shadow-lg',
    descriptionEn: 'Community discussions & updates',
    descriptionAm: 'የማህበረሰብ ውይይቶች እና መረጃዎች',
    animationTrigger: 'slide'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Care',
    handle: '+251 911 223 344',
    url: 'https://wa.me/251911223344',
    followerCount: '24/7',
    badgeLabel: 'Support',
    iconKey: 'whatsapp',
    brandColor: '#25D366',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
    badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
    hoverGlow: 'hover:shadow-emerald-500/20 hover:shadow-lg',
    descriptionEn: 'Direct customer support desk',
    descriptionAm: 'የቀጥታ የደንበኞች ድጋፍ',
    animationTrigger: 'pulse'
  }
];
