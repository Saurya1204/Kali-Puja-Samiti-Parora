import React from 'react';
import prisma from '@/lib/prisma';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import { getSessionUser } from '@/lib/auth';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  HelpCircle,
  HeartHandshake,
  Award,
  Navigation,
  ExternalLink,
  Edit3,
  Camera,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  Trophy,
  Flame,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  let activeYear: any = null;
  let members: any[] = [];
  let cmsSections: any[] = [];
  let user: any = null;

  try {
    user = await getSessionUser();

    activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });

    members = await prisma.committeeMember.findMany({
      where: activeYear ? { festivalYearId: activeYear.id } : {},
      orderBy: { sortOrder: 'asc' },
    });

    cmsSections = await prisma.cmsContentSection.findMany({
      where: { isPublished: true },
      orderBy: { sectionKey: 'asc' },
    });
  } catch (err) {
    console.error('Error fetching about page data:', err);
  }

  // Map CMS sections by key
  const sectionMap = new Map(cmsSections.map((s) => [s.sectionKey, s]));
  const dynamicHistory = sectionMap.get('ABOUT_HISTORY');
  const dynamicTemple = sectionMap.get('ABOUT_CHANDIKA_ASTHAN');
  const dynamicRituals = sectionMap.get('ABOUT_RITUALS');
  const dynamicLocation = sectionMap.get('ABOUT_LOCATION');

  // Any custom sections created by admin with ABOUT_ prefix
  const customAboutSections = cmsSections.filter(
    (s) =>
      s.sectionKey.startsWith('ABOUT_') &&
      !['ABOUT_HISTORY', 'ABOUT_CHANDIKA_ASTHAN', 'ABOUT_RITUALS', 'ABOUT_LOCATION'].includes(s.sectionKey)
  );

  const faqs = [
    {
      q: 'काली पूजा महोत्सव का मुख्य मंदिर एवं सटीक स्थान क्या है?',
      a: 'माँ काली का पावन मंदिर ऐतिहासिक "माँ चंडिका स्थान", ग्राम - परोरा, प्रखंड व जिला - बेगूसराय (बिहार - 851217) में अवस्थित है। यह बेगूसराय जिला मुख्यालय से लगभग 28 किमी की दूरी पर NH-31 के समीप स्थित है।',
    },
    {
      q: 'काली पूजा महोत्सव 2026 की मुख्य तिथियां क्या हैं?',
      a: 'वार्षिक महोत्सव प्रतिवर्ष दीपावली के पावन अवसर पर कार्तिक अमावस्या एवं प्रतिपदा तिथि को आयोजित होता है। इस वर्ष 9 एवं 10 नवंबर 2026 को मध्यरात्रि की तांत्रोक्त निशा पूजा, अखण्ड दीप महाआरती, सांस्कृतिक संध्या एवं राज्यस्तरीय खेलकूद का आयोजन होगा।',
    },
    {
      q: 'अखिल बिहार राज्य स्तरीय कबड्डी प्रतियोगिता कब और कहाँ होगी?',
      a: 'कबड्डी प्रतियोगिता महोत्सव के अभिन्न खेल आयोजन के रूप में 9 एवं 10 नवंबर 2026 को उच्च विद्यालय खेल मैदान, परोरा में अत्याधुनिक प्रो-मैट एवं डे-नाईट फ्लडलाइट्स कोर्ट पर आयोजित होगी।',
    },
    {
      q: 'मेधावी छात्र सम्मान (Pratibha Samman) के लिए कौन आवेदन कर सकता है?',
      a: 'परोरा पंचायत एवं समीपवर्ती गांवों के 10वीं, 12वीं, स्नातक, प्रतियोगी परीक्षा (JEE/NEET/UPSC/BPSC/SSC) उत्तीर्ण अथवा खेलकूद में उत्कृष्ट प्रदर्शन करने वाले छात्र-छात्राएं वेबसाइट के Achievers पेज से ऑनलाइन आवेदन कर सकते हैं।',
    },
    {
      q: 'दान या चंदा समर्पित करने पर रसीद कैसे प्राप्त होगी?',
      a: 'वेबसाइट के Donations पेज पर जाकर अधिकृत UPI QR कोड स्कैन करें या बैंक खाते में सहयोग राशि भेजकर फॉर्म भरें। सबमिट करते ही तुरंत बारकोड युक्त डिजिटल पावती रसीद जनरेट होगी।',
    },
    {
      q: 'क्या आम श्रद्धालु एवं स्वयंसेवक समिति से जुड़ सकते हैं?',
      a: 'हाँ, परोरा एवं आसपास के सभी श्रद्धालु व युवा "Register" पेज पर जाकर स्वयंसेवक (Volunteer Seva) के रूप में निःशुल्क पंजीकरण करा सकते हैं।',
    },
  ];

  // Visual Photo Showcase
  const photoGallery = [
    {
      title: 'माँ काली दिव्य विग्रह व निशा पूजा',
      subtitle: 'कार्तिक अमावस्या मध्यरात्रि की अलौकिक निशा पूजा दर्शन',
      imageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
      badge: 'अलौकिक दर्शन',
    },
    {
      title: 'माँ चंडिका स्थान मंदिर प्रांगण',
      subtitle: 'परोरा स्थित सिद्ध पीठ माँ चंडिका स्थान की भव्य विद्युत व मंडप सज्जा',
      imageUrl: 'https://images.unsplash.com/photo-1567591414240-e17f09325965?auto=format&fit=crop&w=800&q=80',
      badge: 'चंडिका स्थान परोरा',
    },
    {
      title: '108 दीप महाआरती व अखण्ड ज्योति',
      subtitle: 'हजारों दीपों की दिव्य ज्योति से जगमगाता पावन धाम',
      imageUrl: 'https://images.unsplash.com/photo-1514894780887-121968d00567?auto=format&fit=crop&w=800&q=80',
      badge: 'महाआरती',
    },
    {
      title: 'महाप्रसाद भंडारा एवं सर्वजन समरसता',
      subtitle: 'जाति-पांति से परे समरसता का प्रतीक महाप्रसाद वितरण',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      badge: 'महाप्रसाद भंडारा',
    },
    {
      title: 'मेधावी छात्र प्रतिभा सम्मान',
      subtitle: 'गाँव की भावी पीढ़ी को शील्ड, मेडल व छात्रवृत्ति प्रोत्साहन',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      badge: 'नागरिक अभिनंदन',
    },
    {
      title: 'वार्षिक कबड्डी प्रतियोगिता (9-10 Nov)',
      subtitle: 'महोत्सव का पारंपरिक खेल आयोजन • अत्याधुनिक प्रो मैट व फ्लडलाइट्स',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      badge: 'खेल आयोजन',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* HEADER SECTION */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Sacred Heritage & Divine Legacy Since 1984
          </span>
          <DiyaAnimation size="sm" />
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-amber-200 font-serif leading-tight">
          श्री श्री 108 काली पूजा समिति परोरा
        </h1>

        <div className="inline-block bg-gradient-to-r from-amber-500/20 via-red-600/20 to-amber-500/20 border border-amber-500/40 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-300">
          📍 पावन धाम: माँ चंडिका स्थान, परोरा, बेगूसराय (बिहार - 851217)
        </div>

        <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-3xl mx-auto">
          आस्था, अध्यात्म, सामाजिक समरसता, खेल संवर्धन और ग्रामीण युवा उत्थान का चार दशकों (1984) से अनवरत संगम।
          बिहार सरकार द्वारा विधिवत निबंधित संस्था (Reg No: BR-PUR-2012/KP-042)।
        </p>
      </div>

      {/* EXACT LOCATION & HOW TO REACH CHANDIKA ASTHAN */}
      <div className="bg-gradient-to-br from-black via-maroon-950/80 to-[#190404] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-600/20 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>सटीक मंदिर अवस्थिति (Exact Sacred Location)</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-amber-100 font-serif leading-tight">
              {dynamicLocation?.title || 'माँ चंडिका स्थान, परोरा – जागृत एवं सिद्ध तपोभूमि'}
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {dynamicLocation?.content ||
                'माँ काली का यह पावन धाम बेगूसराय जिले के सुप्रसिद्ध "माँ चंडिका स्थान, परोरा" में अवस्थित है। यह स्थान सदियों से अंचलवासियों की गहरी आस्था और मनोकामना पूर्ति का दिव्य केंद्र रहा है। प्रतिवर्ष कार्तिक अमावस्या (दीपावली) की रात्रि को यहाँ तांत्रोक्त विधि से माँ काली की विशेष निशा पूजा, अखण्ड दीप प्रज्वलन व महाआरती का पावन अनुष्ठान संपन्न होता है।'}
            </p>

            {/* Quick connectivity pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-black/60 border border-amber-900/60 p-3 rounded-xl">
                <span className="text-amber-400 font-bold block mb-0.5">📍 पूर्ण पता:</span>
                <span className="text-stone-300">माँ चंडिका स्थान, परोरा, बेगूसराय, बिहार - 851217</span>
              </div>
              <div className="bg-black/60 border border-amber-900/60 p-3 rounded-xl">
                <span className="text-amber-400 font-bold block mb-0.5">🚂 निकटतम स्टेशन:</span>
                <span className="text-stone-300">बेगूसराय जंक्शन (लगभग 28 किमी), बरौनी जंक्शन (लगभग 32 किमी)</span>
              </div>
              <div className="bg-black/60 border border-amber-900/60 p-3 rounded-xl">
                <span className="text-amber-400 font-bold block mb-0.5">🛣️ सड़क संपर्क:</span>
                <span className="text-stone-300">राष्ट्रीय राजमार्ग NH-31 से परोरा मुख्य मार्ग</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Chandika+Asthan+Parora+Begusarai+851217"
                target="_blank"
                rel="noopener noreferrer"
                className="festive-btn-gold text-xs px-5 py-2.5 flex items-center gap-2 font-bold shadow-lg"
              >
                <Compass className="w-4 h-4 text-maroon-950" />
                <span>Google Maps पर लोकेशन देखें (Open Map)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link
                href="/events"
                className="bg-black/60 hover:bg-black/80 text-amber-200 border border-amber-500/40 text-xs px-4 py-2.5 rounded-full font-bold flex items-center gap-1.5"
              >
                <span>महोत्सव समय-सारणी</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl bg-black">
              <img
                src={
                  dynamicLocation?.mediaUrl ||
                  'https://images.unsplash.com/photo-1567591414240-e17f09325965?auto=format&fit=crop&w=800&q=80'
                }
                alt="माँ चंडिका स्थान परोरा"
                className="w-full h-72 sm:h-80 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-950 via-transparent to-black/40" />
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-black/80 backdrop-blur-md rounded-2xl border border-amber-500/40">
                <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">
                  CHANDIKA ASTHAN PARORA
                </span>
                <h4 className="text-sm font-bold text-stone-100 font-serif">
                  माँ चंडिका स्थान मंदिर प्रांगण, परोरा (बेगूसराय)
                </h4>
                <p className="text-[11px] text-stone-300">पिन कोड: 851217 • आस्था एवं शक्ति का पावन केंद्र</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 40+ YEARS HISTORY & FOUNDATION (1984 SE AVIRAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left: Historical Narrative */}
        <div className="festive-card p-6 sm:p-10 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                स्थापना वर्ष 1984 से अविरल
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold">
                40+ स्वर्णिम वर्ष
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif leading-tight">
              {dynamicHistory?.title || 'परंपरा, सामाजिक समरसता व जन-सहयोग की अनूठी मिसाल'}
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {dynamicHistory?.content ||
                'परोरा ग्राम में माँ काली की आराधना का इतिहास अत्यंत गौरवशाली एवं प्रेरणास्पद है। वर्ष 1984 में गांव के प्रबुद्ध बुजुर्गों, समाजसेवियों एवं उत्साही युवाओं ने मिलकर इस समिति की नींव रखी थी। वर्तमान में यह समिति बिहार सरकार द्वारा विधिवत निबंधित (Reg No: BR-PUR-2012/KP-042) संस्था के रूप में संचालित है।'}
            </p>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {dynamicRituals?.content ||
                'समिति द्वारा धार्मिक अनुष्ठान के साथ-साथ सर्वजन समरसता महाप्रसाद भंडारा, भव्य सांस्कृतिक जागरण, मेधावी छात्र अभिनंदन और पारंपरिक खेलकूद के रूप में "अखिल बिहार राज्य स्तरीय कबड्डी प्रतियोगिता" का भव्य आयोजन किया जाता है। समिति का संपूर्ण वित्तीय लेखा-जोखा 100% पारदर्शी डिजिटल लेजर में दर्ज रहता है।'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-amber-900/40 text-center">
            <div className="p-3 rounded-2xl bg-black/50 border border-amber-900/40">
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-amber-300 block">40+</span>
              <span className="text-[10px] text-stone-400 font-medium">गौरवशाली वर्ष</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-amber-900/40">
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-amber-300 block">15,000+</span>
              <span className="text-[10px] text-stone-400 font-medium">वार्षिक श्रद्धालु</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/50 border border-amber-900/40">
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-amber-300 block">100%</span>
              <span className="text-[10px] text-stone-400 font-medium">पारदर्शी लेजर</span>
            </div>
          </div>
        </div>

        {/* Right: Pillars & Mission */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200 text-base">सर्वजन समरसता एवं बंधुत्व</h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                जाति, पंथ व वर्ग भेद से परे संपूर्ण ग्रामीण समाज को एक जाजम पर लाकर एकता का संदेश देना ही समिति का प्रथम संकल्प है।
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/40">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200 text-base">खेल संवर्धन व युवा उत्थान (कबड्डी)</h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                काली पूजा महोत्सव के अंतर्गत 9 व 10 नवंबर को राज्यस्तरीय कबड्डी प्रतियोगिता आयोजित कर ग्रामीण युवाओं को राष्ट्रीय मंच प्रदान करना।
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200 text-base">मेधावी छात्र सम्मान (प्रतिभा प्रोत्साहन)</h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                10वीं, 12वीं, प्रतियोगी परीक्षाओं व खेलकूद में उत्कृष्ट प्रदर्शन करने वाले ग्रामीण छात्र-छात्राओं का सार्वजनिक अभिनंदन व शील्ड सम्मान।
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200 text-base">पूर्ण वित्तीय पारदर्शिता व जन-जवाबदेही</h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                दानदाताओं से प्राप्त प्रत्येक रुपये का डिजिटल लेजर व वाउचर संधारण कर आम सभा में सार्वजनिक प्रस्तुतीकरण।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RELEVANT PICTURES & VISUAL STORY GALLERY */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Camera className="w-4 h-4" />
            <span>Visual Glimpses of Festival & Chandika Asthan</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-amber-200 font-serif">
            माँ काली पूजा एवं चंडिका स्थान की पावन छवियां
          </h3>
          <p className="text-xs sm:text-sm text-stone-400">
            पूजा, भव्य महाआरती, सर्वजन भंडारा, प्रतिभा सम्मान एवं वार्षिक खेलकूद के यादगार क्षण
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photoGallery.map((photo, idx) => (
            <div
              key={idx}
              className="group bg-maroon-950/60 border border-amber-600/30 rounded-3xl overflow-hidden shadow-xl hover:border-amber-400 transition-all flex flex-col justify-between"
            >
              <div className="relative h-56 sm:h-64 w-full bg-black overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-950 via-transparent to-black/40" />
                <span className="absolute top-3 left-3 bg-amber-500 text-maroon-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase shadow">
                  {photo.badge}
                </span>
              </div>

              <div className="p-5 space-y-1.5">
                <h4 className="font-bold text-amber-100 text-base font-serif group-hover:text-amber-300 transition-colors">
                  {photo.title}
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {photo.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            href="/gallery"
            className="festive-btn-gold text-xs px-6 py-3 inline-flex items-center gap-2 font-bold shadow-lg"
          >
            <span>संपूर्ण फोटो गैलरी देखें (View All Photos)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* DYNAMIC CUSTOM CMS SECTIONS (ADDED BY ADMIN) */}
      {customAboutSections.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-amber-900/40">
          {customAboutSections.map((sec) => (
            <div
              key={sec.sectionKey}
              className="festive-card p-6 sm:p-8 space-y-3 bg-gradient-to-br from-black to-maroon-950/60"
            >
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-black/50 border border-amber-500/30">
                {sec.subtitle || 'विशेष विवरण'}
              </span>
              <h3 className="text-2xl font-bold text-amber-200 font-serif">{sec.title}</h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>
              {sec.mediaUrl && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-amber-500/40 max-h-96">
                  <img src={sec.mediaUrl} alt={sec.title} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* COMMITTEE MEMBERS DIRECTORY */}
      <div className="space-y-8 pt-4 border-t border-amber-900/50">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Users className="w-4 h-4" />
            <span>Dedicated Committee Leadership</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-amber-200 font-serif">
            कार्यकारिणी एवं सम्मानित पदाधिकारी मंडल
          </h3>
          <p className="text-xs sm:text-sm text-stone-400">
            काली पूजा महोत्सव एवं समाज सेवा के कुशल संचालन हेतु समर्पित समिति के सम्मानित सदस्य
          </p>
        </div>

        {/* Leadership Spotlight Cards: Chief Mentor & President */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Chief Mentor Shri Amarnath Prasad */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-red-950/80 via-black to-maroon-950 border-2 border-amber-500/60 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-maroon-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                AP
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block bg-amber-500/20 px-2 py-0.5 rounded w-fit border border-amber-500/30 mb-1">
                  मुख्य संरक्षक व खेल मार्गदर्शक
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-white font-serif">
                  श्री अमरनाथ प्रसाद (Amarnath Prasad)
                </h4>
                <p className="text-xs text-stone-300">पूर्व कबड्डी खिलाड़ी, राज्य बॉक्सर एवं ब्लैक बेल्ट</p>
              </div>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-stone-800">
              "माँ भगवती काली की कृपा से परोरा की धरती ने पूरे बिहार को खेल, समरसता और संस्कारों की नई दिशा दी है।"
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-amber-300 border-t border-amber-900/60">
              <span className="text-stone-400">मार्गदर्शन व संपर्क:</span>
              <a href="tel:6203510983" className="flex items-center gap-1.5 font-bold hover:underline font-mono">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>6203510983</span>
              </a>
            </div>
          </div>

          {/* Current President Shri Sillu Kumar */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/80 via-black to-maroon-950 border-2 border-amber-500/60 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-maroon-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                SK
              </div>
              <div>
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider block bg-amber-500/20 px-2 py-0.5 rounded w-fit border border-amber-500/30 mb-1">
                  अध्यक्ष (Current President)
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-white font-serif">
                  श्री सिल्लू कुमार (Sillu Kumar)
                </h4>
                <p className="text-xs text-stone-300">अध्यक्ष, श्री श्री 108 काली पूजा समिति परोरा</p>
              </div>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-stone-800">
              "समिति का प्रत्येक कार्यकर्ता माँ की सेवा और ग्राम समाज के कल्याण हेतु 24x7 समर्पित भाव से तत्पर है।"
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-amber-300 border-t border-amber-900/60">
              <span className="text-stone-400">समिति कार्यालय:</span>
              <span className="font-semibold text-stone-200">परोरा, बेगूसराय</span>
            </div>
          </div>
        </div>

        {/* Full Committee Grid (Dynamic from DB) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <div
              key={m.id}
              className="festive-card p-6 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-maroon-950 font-bold flex items-center justify-center text-lg shadow-md shrink-0 overflow-hidden border border-amber-400/40">
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{m.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-100 text-base">{m.nameHindi || m.name}</h4>
                    <span className="text-xs text-amber-300 font-semibold block">
                      {m.designationHindi || m.designation}
                    </span>
                  </div>
                </div>

                {m.message && (
                  <p className="text-xs text-stone-300 italic bg-black/40 p-3 rounded-xl border border-amber-900/30 leading-relaxed">
                    "{m.message}"
                  </p>
                )}
              </div>

              {m.phone && (
                <div className="pt-3 border-t border-amber-900/40 flex items-center justify-between text-xs text-stone-400">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{m.phone}</span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                    पदाधिकारी
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <div className="festive-card p-6 sm:p-10 space-y-6">
        <div className="flex items-center gap-2 border-b border-amber-900/50 pb-3">
          <HelpCircle className="w-6 h-6 text-amber-400 shrink-0" />
          <h3 className="text-2xl font-extrabold text-amber-200 font-serif">
            अक्सर पूछे जाने वाले प्रश्न (FAQ)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-black/50 border border-amber-900/40 rounded-2xl p-5 space-y-2 hover:border-amber-500/40 transition-colors"
            >
              <h4 className="font-bold text-amber-200 text-sm sm:text-base flex items-start gap-2">
                <span className="text-amber-500 font-mono shrink-0">Q{idx + 1}.</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
