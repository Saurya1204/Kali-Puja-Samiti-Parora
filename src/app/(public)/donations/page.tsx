import React from 'react';
import prisma from '@/lib/prisma';
import DiyaAnimation from '@/components/public/DiyaAnimation';
import DonationForm from './DonationForm';
import { formatINR, formatDate } from '@/lib/utils';
import {
  Heart,
  QrCode,
  Building,
  CreditCard,
  ShieldCheck,
  Trophy,
  Users,
  CheckCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DonationsPage() {
  const activeYear = await prisma.festivalYear.findFirst({
    where: { isActive: true },
  });

  const sponsors = await prisma.sponsor.findMany({
    where: {
      isPublished: true,
      ...(activeYear ? { festivalYearId: activeYear.id } : {}),
    },
    orderBy: { sortOrder: 'asc' },
  });

  const publicDonors = await prisma.donation.findMany({
    where: {
      isPubliclyVisible: true,
      status: 'CONFIRMED',
      ...(activeYear ? { festivalYearId: activeYear.id } : {}),
    },
    orderBy: [{ amount: 'desc' }, { donationDate: 'desc' }],
    take: 20,
  });

  const settingsRecords = await prisma.websiteSetting.findMany();
  const settings: Record<string, string> = {};
  settingsRecords.forEach((s) => {
    settings[s.key] = s.value;
  });

  const upiId = settings['UPI_ID'] || 'samitiparora@sbi';
  const upiName = settings['UPI_NAME'] || 'Kali Puja Samiti Parora';
  const bankName = settings['BANK_NAME'] || 'State Bank of India';
  const accountNo = settings['BANK_ACCOUNT_NO'] || '38920194829';
  const ifsc = settings['BANK_IFSC'] || 'SBIN0001234';
  const branch = settings['BANK_BRANCH'] || 'Main Branch, Begusarai (851217)';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <DiyaAnimation size="sm" />
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
            Devotional Contribution & Chanda
          </span>
          <DiyaAnimation size="sm" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-amber-300 font-serif">
          सहयोग राशि एवं चंदा समर्पण
        </h1>
        <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
          श्री श्री 108 काली पूजा महोत्सव {activeYear?.year || 2026} के पावन अनुष्ठान, महाप्रसाद भंडारा, खेल महाकुंभ एवं प्रतिभा सम्मान में अपनी सामर्थ्यानुसार सहयोग राशि समर्पित करें और ऑनलाइन रसीद प्राप्त करें।
        </p>
      </div>

      {/* UPI QR & BANK DETAILS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* UPI QR Code Box */}
        <div className="festive-card p-6 sm:p-8 flex flex-col justify-between items-center text-center space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
              <QrCode className="w-4 h-4" />
              <span>तत्काल UPI भुगतान (Instant UPI QR)</span>
            </span>
            <h3 className="text-xl font-bold text-stone-100">
              किसी भी UPI ऐप से स्कैन करके सहयोग करें
            </h3>
            <p className="text-xs text-stone-400">
              Google Pay, PhonePe, Paytm, BHIM UPI आदि समर्थित
            </p>
          </div>

          {/* QR Code Simulation Visual */}
          <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-amber-500 inline-block">
            {/* Generate SVG QR placeholder visual */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-stone-900 rounded-lg flex flex-col items-center justify-center p-3 text-center text-white relative">
              <QrCode className="w-32 h-32 text-amber-400" />
              <div className="text-[10px] text-amber-300 font-mono mt-1 font-bold">
                {upiId}
              </div>
            </div>
          </div>

          <div className="bg-black/50 border border-amber-500/30 rounded-xl p-3 w-full max-w-sm text-xs">
            <span className="text-stone-400 block">आधिकारिक UPI VPA:</span>
            <span className="text-amber-300 font-mono font-bold text-sm select-all">
              {upiId}
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">({upiName})</span>
          </div>
        </div>

        {/* Bank Account Details Box */}
        <div className="festive-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              <span>आधिकारिक बैंक खाता विवरण (Official Bank A/C)</span>
            </span>
            <h3 className="text-xl font-bold text-stone-100">
              NEFT / RTGS / IMPS / बैंक शाखा द्वारा सहयोग
            </h3>
            <p className="text-xs text-stone-400">
              समिति के अधिकृत राष्ट्रीयकृत बैंक खाते में सीधे धनराशि प्रेषित करें
            </p>
          </div>

          <div className="space-y-3 bg-black/40 border border-amber-900/60 rounded-2xl p-5 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-amber-900/40 pb-2">
              <span className="text-stone-400">खाता धारक (Account Name):</span>
              <strong className="text-amber-200">{upiName}</strong>
            </div>
            <div className="flex justify-between items-center border-b border-amber-900/40 pb-2">
              <span className="text-stone-400">बैंक का नाम (Bank):</span>
              <strong className="text-stone-200">{bankName}</strong>
            </div>
            <div className="flex justify-between items-center border-b border-amber-900/40 pb-2">
              <span className="text-stone-400">खाता संख्या (A/C No):</span>
              <strong className="text-amber-300 font-mono text-base select-all">{accountNo}</strong>
            </div>
            <div className="flex justify-between items-center border-b border-amber-900/40 pb-2">
              <span className="text-stone-400">आईएफएससी कोड (IFSC):</span>
              <strong className="text-amber-300 font-mono text-base select-all">{ifsc}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">शाखा (Branch):</span>
              <strong className="text-stone-300">{branch}</strong>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>सभी सहयोग राशि का पूर्ण हिसाब-किताब सार्वजनिक वित्तीय लेजर में दर्ज किया जाता है।</span>
          </div>
        </div>
      </div>

      {/* ONLINE DONATION & INSTANT RECEIPT FORM */}
      <DonationForm />

      {/* SPONSORS SHOWCASE */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif">
            महोत्सव प्रायोजक मंडल (Festival Sponsors)
          </h3>
          <p className="text-xs sm:text-sm text-stone-400">
            आयोजन को सफल बनाने में महत्वपूर्ण भूमिका निभाने वाले हमारे कॉरपोरेट एवं स्थानीय व्यापारिक बंधु
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sponsors.map((sp) => (
            <div
              key={sp.id}
              className="bg-black/40 border border-amber-500/30 rounded-2xl p-6 text-center space-y-2 hover:border-amber-400 transition-all"
            >
              <span className="text-[10px] font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase">
                {sp.sponsorTier} TIER
              </span>
              <h4 className="font-bold text-stone-100 text-base">{sp.name}</h4>
              {sp.brandName && (
                <div className="text-xs text-stone-400 font-medium">{sp.brandName}</div>
              )}
              {sp.isAmountPublic && sp.contributionAmount && (
                <div className="text-amber-300 font-extrabold text-base font-mono pt-1">
                  {formatINR(sp.contributionAmount)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* DEVOTEES & PUBLIC DONOR RECOGNITION WALL */}
      <div className="festive-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-900/50 pb-4">
          <div>
            <h3 className="text-2xl font-extrabold text-amber-300 font-serif flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              <span>दानदाता सम्मान दीवार (Donors Wall of Gratitude)</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              सार्वजनिक प्रदर्शन हेतु अधिकृत सहयोगियों की सम्मान सूची
            </p>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-bold">
            कुल दानदाता: {publicDonors.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicDonors.map((don) => (
            <div
              key={don.id}
              className="bg-black/50 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between hover:border-amber-500/50 transition-all"
            >
              <div>
                <h4 className="font-bold text-stone-100 text-sm">{don.donorName}</h4>
                <div className="text-[11px] text-stone-400">
                  {don.donorAddressOrVillage || 'परोरा'} • {don.purpose || 'दान'}
                </div>
                <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                  रसीद: {don.receiptNumber}
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-amber-300 font-mono">
                  {formatINR(don.amount)}
                </span>
                <span className="block text-[10px] text-stone-400">
                  {formatDate(don.donationDate)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

