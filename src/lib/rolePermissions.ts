export interface AdminSection {
  id: string;
  label: string;
  labelEn: string;
  iconName: string;
}

export interface RoleConfig {
  key: string;
  name: string;
  nameHindi: string;
  color: string;
  description: string;
  isSystem?: boolean;
  visibleModules: string[];
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { id: '/admin', label: 'डैशबोर्ड अवलोकन (Overview)', labelEn: 'Dashboard Overview', iconName: 'LayoutDashboard' },
  { id: '/admin/kabaddi', label: 'कबड्डी मैच व स्कोर (Kabaddi)', labelEn: 'Kabaddi Arena & Scores', iconName: 'Trophy' },
  { id: '/admin/students', label: 'मेधावी छात्र व पुरस्कार (Awards)', labelEn: 'Achievers & Awards', iconName: 'GraduationCap' },
  { id: '/admin/expenses', label: 'व्यय व बिल प्रबंधन (Expenses)', labelEn: 'Expenses & Bills', iconName: 'Receipt' },
  { id: '/admin/budget', label: 'बजट आवंटन (Budget)', labelEn: 'Budget Allocation', iconName: 'PieChart' },
  { id: '/admin/donations', label: 'दान व रसीदें (Donations)', labelEn: 'Donations & Receipts', iconName: 'HeartHandshake' },
  { id: '/admin/ledger', label: 'वित्तीय लेजर (Ledger)', labelEn: 'Financial Ledger', iconName: 'BookOpen' },
  { id: '/admin/vendors', label: 'वेंडर डायरेक्टरी (Vendors)', labelEn: 'Vendor Directory', iconName: 'Store' },
  { id: '/admin/events', label: 'महोत्सव कार्यक्रम (Events)', labelEn: 'Festival Events', iconName: 'Calendar' },
  { id: '/admin/registrations', label: 'पंजीकरण सूची (Registrations)', labelEn: 'Event Registrations', iconName: 'ClipboardList' },
  { id: '/admin/notices', label: 'सूचनाएं व सर्कुलर (Notices)', labelEn: 'Notices & Announcements', iconName: 'Bell' },
  { id: '/admin/gallery', label: 'फोटो व वीडियो गैलरी (Gallery)', labelEn: 'Photo & Video Gallery', iconName: 'Image' },
  { id: '/admin/cms', label: 'वेबसाइट पेज व सामग्री (CMS)', labelEn: 'CMS & Page Content', iconName: 'Layers' },
  { id: '/admin/committee', label: 'कार्यकारिणी व वालंटियर (Committee)', labelEn: 'Committee & Volunteers', iconName: 'Users' },
  { id: '/admin/reports', label: 'वार्षिक वित्तीय रिपोर्ट (Reports)', labelEn: 'Financial Reports', iconName: 'FileSpreadsheet' },
  { id: '/admin/users', label: 'प्रशासक व रोल्स (Admin Users & Roles)', labelEn: 'Admin Users & Roles', iconName: 'ShieldCheck' },
  { id: '/admin/audit-logs', label: 'ऑडिट लॉग्स (Audit Trail)', labelEn: 'Security Audit Logs', iconName: 'History' },
  { id: '/admin/settings', label: 'सिस्टम व सेटिंग्स (Settings)', labelEn: 'System Settings', iconName: 'Settings' },
];

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    key: 'SUPER_ADMIN',
    name: 'Super Admin',
    nameHindi: 'सर्वोच्च व्यवस्थापक (Super Admin)',
    color: 'bg-red-900/60 text-red-200 border-red-500/50',
    description: 'समस्त मॉड्यूल, वित्तीय नियंत्रण, सेटिंग्स, यूजर प्रबंधन व ऑडिट लॉग्स का पूर्ण नियंत्रण।',
    isSystem: true,
    visibleModules: ADMIN_SECTIONS.map((s) => s.id),
  },
  {
    key: 'PRESIDENT',
    name: 'President',
    nameHindi: 'समिति अध्यक्ष (President)',
    color: 'bg-amber-900/60 text-amber-200 border-amber-500/50',
    description: 'कार्यकारिणी नेतृत्व, बिल स्वीकृति, मेधावी छात्र पुरस्कार अनुमोदन एवं समस्त मॉड्यूल्स की समीक्षा।',
    isSystem: false,
    visibleModules: [
      '/admin',
      '/admin/kabaddi',
      '/admin/students',
      '/admin/expenses',
      '/admin/budget',
      '/admin/donations',
      '/admin/ledger',
      '/admin/vendors',
      '/admin/events',
      '/admin/registrations',
      '/admin/notices',
      '/admin/gallery',
      '/admin/cms',
      '/admin/committee',
      '/admin/reports',
    ],
  },
  {
    key: 'SECRETARY',
    name: 'Secretary',
    nameHindi: 'महासचिव (Secretary)',
    color: 'bg-purple-900/60 text-purple-200 border-purple-500/50',
    description: 'कार्यक्रम प्रबंधन, सूचनाएं, आधिकारिक सर्कुलर, पंजीकरण व समिति संचालन।',
    isSystem: false,
    visibleModules: [
      '/admin',
      '/admin/kabaddi',
      '/admin/students',
      '/admin/events',
      '/admin/registrations',
      '/admin/notices',
      '/admin/gallery',
      '/admin/cms',
      '/admin/committee',
    ],
  },
  {
    key: 'TREASURER',
    name: 'Treasurer',
    nameHindi: 'कोषाध्यक्ष (Treasurer)',
    color: 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50',
    description: 'व्यय, बिल, भुगतान, बजट आवंटन, दान रसीदें, वेंडर बकाया व वित्तीय लेजर का पूर्ण नियंत्रण।',
    isSystem: false,
    visibleModules: [
      '/admin',
      '/admin/expenses',
      '/admin/budget',
      '/admin/donations',
      '/admin/ledger',
      '/admin/vendors',
      '/admin/reports',
    ],
  },
  {
    key: 'FINANCE_ADMIN',
    name: 'Finance Admin',
    nameHindi: 'वित्त व्यवस्थापक (Finance Admin)',
    color: 'bg-teal-900/60 text-teal-200 border-teal-500/50',
    description: 'समस्त वित्तीय लेखा-जोखा, व्यय वाउचर, वेंडर डायरेक्टरी व दान प्रविष्टियां।',
    isSystem: false,
    visibleModules: [
      '/admin',
      '/admin/expenses',
      '/admin/budget',
      '/admin/donations',
      '/admin/ledger',
      '/admin/vendors',
      '/admin/reports',
    ],
  },
  {
    key: 'KABADDI_ADMIN',
    name: 'Kabaddi Admin',
    nameHindi: 'कबड्डी मैच व्यवस्थापक (Kabaddi Admin)',
    color: 'bg-blue-900/60 text-blue-200 border-blue-500/50',
    description: 'कबड्डी टीमें, खिलाड़ी, मैच शेड्यूल, फिक्सचर्स, लाइव स्कोरिंग कंसोल व अंक तालिका का पूर्ण नियंत्रण।',
    isSystem: false,
    visibleModules: ['/admin', '/admin/kabaddi', '/admin/registrations'],
  },
  {
    key: 'AWARDS_ADMIN',
    name: 'Awards Admin',
    nameHindi: 'मेधावी छात्र पुरस्कार व्यवस्थापक (Awards Admin)',
    color: 'bg-yellow-900/60 text-yellow-200 border-yellow-500/50',
    description: 'छात्र उपलब्धि आवेदन, अंक सत्यापन, प्रमाण-पत्र समीक्षा, पुरस्कार श्रेणीकरण व पब्लिक वॉल ऑफ अचीवर्स।',
    isSystem: false,
    visibleModules: ['/admin', '/admin/students', '/admin/registrations'],
  },
  {
    key: 'EVENT_MANAGER',
    name: 'Event Manager',
    nameHindi: 'कार्यक्रम समन्वयक (Event Manager)',
    color: 'bg-pink-900/60 text-pink-200 border-pink-500/50',
    description: 'सांस्कृतिक कार्यक्रम, धार्मिक अनुष्ठान, प्रतियोगिताएं, फोटो/वीडियो गैलरी व पब्लिक नोटिस।',
    isSystem: false,
    visibleModules: [
      '/admin',
      '/admin/events',
      '/admin/registrations',
      '/admin/notices',
      '/admin/gallery',
    ],
  },
  {
    key: 'VOLUNTEER',
    name: 'Volunteer',
    nameHindi: 'सहयोगी / स्वयंसेवक (Volunteer)',
    color: 'bg-stone-800 text-stone-300 border-stone-600',
    description: 'पंजीकरण जांच, उपस्थिति एवं आयोजन सहयोग हेतु सीमित एक्सेस।',
    isSystem: false,
    visibleModules: ['/admin', '/admin/registrations'],
  },
];

