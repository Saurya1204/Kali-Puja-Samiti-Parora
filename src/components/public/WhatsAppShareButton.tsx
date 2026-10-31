'use client';

import React from 'react';
import { Share2 } from 'lucide-react';

interface WhatsAppShareProps {
  title?: string;
  url?: string;
  customText?: string;
}

export default function WhatsAppShareButton({
  title = 'Kali Puja Samiti Parora 2026',
  url,
  customText,
}: WhatsAppShareProps) {
  const handleShare = () => {
    const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://kalipujaparora.org');
    const defaultText = `🙏 जय माँ काली! \n\nश्री श्री 108 काली पूजा समिति परोरा (पूर्णिया) के वार्षिक महोत्सव (9-10 नवंबर 2026) में आप सादर आमंत्रित हैं।\n\nकबड्डी टूर्नामेंट, सांस्कृतिक संध्या, एवं मेधावी छात्र सम्मान के संपूर्ण विवरण एवं ऑनलाइन पंजीकरण हेतु लिंक देखें:\n${pageUrl}`;

    const textToShare = customText || defaultText;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-full shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
      title="Share on WhatsApp"
    >
      <Share2 className="w-4 h-4" />
      <span>WhatsApp पर शेयर करें</span>
    </button>
  );
}

