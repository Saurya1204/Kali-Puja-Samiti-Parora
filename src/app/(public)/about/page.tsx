import React from 'react';
import prisma from '@/lib/prisma';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import {
  Users,
  ShieldCheck,
  Calendar,
  MapPin,
  Phone,
  HelpCircle,
  HeartHandshake,
  Award,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const activeYear = await prisma.festivalYear.findFirst({
    where: { isActive: true },
  });

  const members = await prisma.committeeMember.findMany({
    where: activeYear ? { festivalYearId: activeYear.id } : {},
    orderBy: { sortOrder: 'asc' },
  });

  const faqs = [
    {
      q: 'काली पूजा महोत्सव का आयोजन कब और कहाँ होता है?',
      a: 'प्रतिवर्ष दीपावली के तुरंत बाद कार्तिक अमावस्या एवं प्रतिपदा तिथि (9 व 10 नवंबर 2026) को माँ काली मंदिर परिसर एवं उच्च विद्यालय खेल मैदान, परोरा (पूर्णिया, बिहार) में आयोजित होता है।',
    },
    {
      q: 'कबड्डी प्रतियोगिता में भाग लेने की पात्रता क्या है?',
      a: 'अखिल बिहार राज्यस्तरीय आमंत्रण कबड्डी प्रतियोगिता में किसी भी मान्यता प्राप्त क्लब या ग्रामीण टीम भाग ले सकती है। टीम में अधिकतम 10 खिलाड़ी (7 प्लेइंग + 3 सब्स्टीट्यूट) होंगे और AKFI मैट नियम लागू होंगे।',
    },
    {
      q: 'मेधावी छात्र सम्मान के लिए कौन आवेदन कर सकता है?',
      a: 'परोरा पंचायत एवं समीपवर्ती गांवों के 10वीं, 12वीं, स्नातक, प्रतियोगी परीक्षा (JEE/NEET/UPSC/BPSC) उत्तीर्ण अथवा खेलकूद में पदक प्राप्त करने वाले छात्र-छात्राएं वेबसाइट के Achievers पेज से ऑनलाइन आवेदन कर सकते हैं।',
    },
    {
      q: 'सहयोग राशि समर्पित करने पर रसीद कैसे प्राप्त होगी?',
      a: 'UPI QR कोड स्कैन करके अथवा बैंक खाते में सीधे धनराशि प्रेषित कर वेबसाइट पर रसीद फॉर्म भरें। सबमिट करते ही अधिकृत डिजिटल पावती रसीद जनरेट होगी जिसे आप तत्काल डाउनलोड अथवा प्रिंट कर सकते हैं।',
    },
    {
      q: 'स्वयंसेवक (Volunteer) के रूप में सेवा देने हेतु क्या प्रक्रिया है?',
      a: 'पंजीकरण (Register) पेज पर जाकर "Volunteer Seva" श्रेणी चुनकर अपना नाम, मोबाइल व पसंदीदा कार्यक्षेत्र दर्ज करें। समिति द्वारा आपको अधिकृत बैच एवं दायित्व सौंपा जाएगा।',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            About Our Heritage
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-300 font-serif">
          समिति परिचय एवं गौरवशाली इतिहास
        </h1>
        <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
          श्री श्री 108 काली पूजा समिति परोरा (पूर्णिया, बिहार) – आस्था, सामाजिक समरसता, खेल संवर्धन और ग्रामीण युवा उत्थान का चार दशकों से अनवरत संगम।
        </p>
      </div>

      {/* History & Mission */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="festive-card p-6 sm:p-8 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            स्थापना वर्ष 1984 से अविरल
          </span>
          <h2 className="text-2xl font-bold text-amber-200 font-serif">
            परंपरा, आस्था एवं जन-सहयोग की अनूठी मिसाल
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            परोरा ग्राम में माँ काली की पूजा अर्चना का इतिहास अत्यंत पावन एवं प्राचीन है। वर्ष 1984 में गांव के प्रबुद्ध बुजुर्गों एवं उत्साही युवाओं ने मिलकर इस समिति की नींव रखी थी। वर्तमान में यह समिति बिहार सरकार द्वारा विधिवत पंजीकृत संस्था (Reg No: BR-PUR-2012/KP-042) है।
          </p>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            धार्मिक निशा पूजा के अतिरिक्त समिति द्वारा विशाल राज्यस्तरीय कबड्डी महाकुंभ, सर्वजन समरसता महाप्रसाद भंडारा, भव्य सांस्कृतिक जागरण संध्या एवं मेधावी छात्र-छात्राओं का सार्वजनिक नागरिक अभिनंदन प्रतिवर्ष गरिमापूर्ण ढंग से किया जाता है।
          </p>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-amber-900/40 text-center">
            <div className="p-2 rounded-xl bg-black/40">
              <span className="text-lg font-mono font-extrabold text-amber-300">40+</span>
              <span className="text-[10px] text-stone-400 block">वर्षों का इतिहास</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40">
              <span className="text-lg font-mono font-extrabold text-amber-300">10,000+</span>
              <span className="text-[10px] text-stone-400 block">वार्षिक श्रद्धालु</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40">
              <span className="text-lg font-mono font-extrabold text-amber-300">100%</span>
              <span className="text-[10px] text-stone-400 block">पारदर्शी लेजर</span>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-100 text-sm">सर्वजन समरसता एवं एकता</h4>
              <p className="text-xs text-stone-400 mt-1">
                जाति, पंथ व वर्ग से ऊपर उठकर संपूर्ण ग्राम समाज को एक सूत्र में पिरोना ही समिति का परम ध्येय है।
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-100 text-sm">खेल प्रतिभा एवं शारीरिक संवर्धन</h4>
              <p className="text-xs text-stone-400 mt-1">
                पारंपरिक भारतीय खेल कबड्डी को अंतरराष्ट्रीय मैट मानकों पर आयोजित कर ग्रामीण खिलाड़ियों को मंच प्रदान करना।
              </p>
            </div>
          </div>

          <div className="bg-black/40 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-100 text-sm">पूर्ण वित्तीय पारदर्शिता</h4>
              <p className="text-xs text-stone-400 mt-1">
                दानदाताओं से प्राप्त प्रत्येक रुपये का डिजिटल लेजर व वाउचर संधारण कर आम सभा में सार्वजनिक प्रस्तुतीकरण।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COMMITTEE MEMBERS DIRECTORY */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif">
            कार्यकारिणी एवं पदाधिकारी मंडल
          </h3>
          <p className="text-xs sm:text-sm text-stone-400">
            आयोजन के कुशल प्रबंधन एवं अनुशासन हेतु समर्पित समिति के सम्मानित सदस्य
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <div
              key={m.id}
              className="festive-card p-6 flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-maroon-950 font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-100 text-base">{m.nameHindi || m.name}</h4>
                    <span className="text-xs text-amber-300 font-semibold block">
                      {m.designationHindi || m.designation}
                    </span>
                  </div>
                </div>

                {m.message && (
                  <p className="text-xs text-stone-300 italic bg-black/30 p-3 rounded-xl border border-amber-900/30">
                    "{m.message}"
                  </p>
                )}
              </div>

              {m.phone && (
                <div className="pt-3 border-t border-amber-900/40 flex items-center justify-between text-xs text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{m.phone}</span>
                  </div>
                  <span className="text-[10px] text-amber-500/80 font-mono">पदाधिकारी</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <div className="festive-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-amber-900/50 pb-3">
          <HelpCircle className="w-6 h-6 text-amber-400" />
          <h3 className="text-2xl font-extrabold text-amber-300 font-serif">
            अक्सर पूछे जाने वाले प्रश्न (FAQ)
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-black/40 border border-amber-900/40 rounded-2xl p-5 space-y-2"
            >
              <h4 className="font-bold text-amber-200 text-sm sm:text-base flex items-start gap-2">
                <span className="text-amber-500 font-mono">Q{idx + 1}.</span>
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
