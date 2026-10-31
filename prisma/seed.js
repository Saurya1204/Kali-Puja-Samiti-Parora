const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Kali Puja Samiti Parora...');

  // 1. Clean existing records in sequence
  await prisma.auditLog.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.committeeMember.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.galleryMedia.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.incomeCategory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budgetAllocation.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.studentAchievement.deleteMany();
  await prisma.kabaddiMatch.deleteMany();
  await prisma.kabaddiPlayer.deleteMany();
  await prisma.kabaddiTeam.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.websiteSetting.deleteMany();
  await prisma.festivalYear.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing tables.');

  // 2. Create Users & Roles
  const passwordHash = await bcrypt.hash('admin123', 10);
  const users = [
    {
      name: 'Dr. Rameshwar Prasad Singh',
      email: 'admin@kalipujaparora.org',
      passwordHash,
      role: 'SUPER_ADMIN',
      phone: '+91 94312 88491',
    },
    {
      name: 'Shri Birendra Kumar Yadav',
      email: 'president@kalipujaparora.org',
      passwordHash,
      role: 'PRESIDENT',
      phone: '+91 98350 21478',
    },
    {
      name: 'Er. Gaurav Singh',
      email: 'secretary@kalipujaparora.org',
      passwordHash,
      role: 'SECRETARY',
      phone: '+91 97714 55321',
    },
    {
      name: 'Shri Manoj Sharma',
      email: 'treasurer@kalipujaparora.org',
      passwordHash,
      role: 'TREASURER',
      phone: '+91 91223 44589',
    },
    {
      name: 'Rajesh Kumar Mehta',
      email: 'finance@kalipujaparora.org',
      passwordHash,
      role: 'FINANCE_ADMIN',
      phone: '+91 94314 77123',
    },
    {
      name: 'Shri Amarjeet Singh (Kabaddi Chief)',
      email: 'kabaddi@kalipujaparora.org',
      passwordHash,
      role: 'KABADDI_ADMIN',
      phone: '+91 98352 11984',
    },
    {
      name: 'Prof. Alok Nath Jha (Pratibha Samman Head)',
      email: 'awards@kalipujaparora.org',
      passwordHash,
      role: 'AWARDS_ADMIN',
      phone: '+91 94702 33456',
    },
    {
      name: 'Vikash Kumar Mandal',
      email: 'events@kalipujaparora.org',
      passwordHash,
      role: 'EVENT_MANAGER',
      phone: '+91 99341 66723',
    },
    {
      name: 'Pankaj Kumar',
      email: 'volunteer@kalipujaparora.org',
      passwordHash,
      role: 'VOLUNTEER',
      phone: '+91 82103 99124',
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log(`Created ${users.length} administrative users.`);

  // 3. Create Festival Years
  const year2026 = await prisma.festivalYear.create({
    data: {
      year: 2026,
      name: 'Kali Puja Utsav 2026',
      startDate: new Date('2026-11-09T08:00:00Z'),
      endDate: new Date('2026-11-10T23:59:59Z'),
      venue: 'Maa Kali Mandir Parisar & High School Ground, Parora, Purnea',
      theme: 'आस्था, एकता, खेल एवं युवा उत्थान',
      isActive: true,
      isArchived: false,
    },
  });

  const year2025 = await prisma.festivalYear.create({
    data: {
      year: 2025,
      name: 'Kali Puja Utsav 2025',
      startDate: new Date('2025-11-01T08:00:00Z'),
      endDate: new Date('2025-11-02T23:59:59Z'),
      venue: 'Maa Kali Mandir Parisar, Parora',
      theme: 'सांस्कृतिक धरोहर एवं ग्राम विकास',
      isActive: false,
      isArchived: true,
    },
  });

  const year2024 = await prisma.festivalYear.create({
    data: {
      year: 2024,
      name: 'Kali Puja Utsav 2024',
      startDate: new Date('2024-11-02T08:00:00Z'),
      endDate: new Date('2024-11-03T23:59:59Z'),
      venue: 'Maa Kali Mandir Parisar, Parora',
      theme: 'ग्रामीण एकता एवं खेल महोत्सव',
      isActive: false,
      isArchived: true,
    },
  });

  // 4. Create Website Settings
  const settings = [
    { key: 'SAMITI_NAME', value: 'Kali Puja Samiti Parora', description: 'Official Organization Name' },
    { key: 'SAMITI_NAME_HINDI', value: 'श्री श्री 108 काली पूजा समिति, परोरा', description: 'Hindi Name' },
    { key: 'REGISTRATION_NO', value: 'BR-PUR-2012/KP-042', description: 'Govt Reg No.' },
    { key: 'ESTABLISHED_YEAR', value: '1984', description: 'Year Established' },
    { key: 'UPI_ID', value: 'samitiparora@sbi', description: 'Samiti UPI VPA' },
    { key: 'UPI_NAME', value: 'Kali Puja Samiti Parora', description: 'Account Name for UPI QR' },
    { key: 'BANK_NAME', value: 'State Bank of India', description: 'Bank Name' },
    { key: 'BANK_ACCOUNT_NO', value: '38920194829', description: 'Account Number' },
    { key: 'BANK_IFSC', value: 'SBIN0001234', description: 'Bank IFSC Code' },
    { key: 'BANK_BRANCH', value: 'Kasba Branch, Purnea', description: 'Bank Branch' },
    { key: 'CONTACT_PHONE_1', value: '+91 94312 88491', description: 'President Phone' },
    { key: 'CONTACT_PHONE_2', value: '+91 97714 55321', description: 'Secretary Phone' },
    { key: 'CONTACT_EMAIL', value: 'contact@kalipujaparora.org', description: 'Contact Email' },
    { key: 'MARQUEE_ANNOUNCEMENT', value: 'श्री श्री 108 काली पूजा महोत्सव 2026: 9 एवं 10 नवंबर को भव्य आयोजन! कबड्डी प्रतियोगिता एवं मेधावी छात्र सम्मान हेतु ऑनलाइन पंजीकरण प्रारंभ।', description: 'Top Header Announcement' },
  ];

  for (const s of settings) {
    await prisma.websiteSetting.create({ data: s });
  }

  // 5. Create Event Categories
  const categoriesData = [
    { name: 'Religious Ceremonies', nameHindi: 'धार्मिक अनुष्ठान', slug: 'religious-ceremonies', icon: 'Flame', sortOrder: 1 },
    { name: 'Kabaddi Tournament', nameHindi: 'कबड्डी प्रतियोगिता', slug: 'kabaddi-tournament', icon: 'Trophy', sortOrder: 2 },
    { name: 'Cultural Programs', nameHindi: 'सांस्कृतिक कार्यक्रम', slug: 'cultural-programs', icon: 'Music', sortOrder: 3 },
    { name: 'Dance & Singing', nameHindi: 'नृत्य एवं गायन', slug: 'dance-singing', icon: 'Sparkles', sortOrder: 4 },
    { name: 'Student Recognition', nameHindi: 'मेधावी छात्र सम्मान', slug: 'student-recognition', icon: 'GraduationCap', sortOrder: 5 },
    { name: 'Sports Activities', nameHindi: 'खेलकूद प्रतियोगिता', slug: 'sports-activities', icon: 'Activity', sortOrder: 6 },
    { name: 'Community Activities', nameHindi: 'सामुदायिक सेवा व भंडारा', slug: 'community-activities', icon: 'Users', sortOrder: 7 },
  ];

  const categories = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.eventCategory.create({ data: c });
  }

  // 6. Create Events for 2026
  const events2026 = [
    {
      festivalYearId: year2026.id,
      categoryId: categories['religious-ceremonies'].id,
      title: 'Maa Kali Pratima Sthapana & Maha Aaradhana',
      titleHindi: 'माँ काली प्रतिमा स्थापना एवं महा निशा पूजा',
      description: 'वैदिक मंत्रोच्चारण एवं पारंपरिक विधि-विधान के साथ मध्यरात्रि में माँ काली की भव्य प्रतिमा की स्थापना एवं विशेष तांत्रिक पूजा अर्चना।',
      date: new Date('2026-11-09T23:00:00Z'),
      startTime: '11:00 PM',
      endTime: '04:00 AM',
      venue: 'मुख्य मंदिर परिसर, परोरा',
      bannerUrl: '/images/events/puja.jpg',
      organizerName: 'पंडित विद्याधर झा (मुख्य पुरोहित)',
      organizerContact: '+91 94301 22345',
      rules: 'सभी श्रद्धालु शांति एवं स्वच्छता बनाए रखें। पूजा के समय गर्भगृह में अनुशासन का पालन करें।',
      prizeDetails: 'महाप्रसाद एवं रक्षा सूत्र वितरण',
      status: 'UPCOMING',
    },
    {
      festivalYearId: year2026.id,
      categoryId: categories['kabaddi-tournament'].id,
      title: 'All-Bihar Open Kabaddi Championship (Day 1)',
      titleHindi: 'अखिल बिहार राज्यस्तरीय आमंत्रण कबड्डी प्रतियोगिता',
      description: 'बिहार के 16 शीर्ष ग्रामीण एवं जिलास्तरीय टीमों के मध्य रोमांचक मैट कबड्डी प्रतियोगिता का भव्य शुभारंभ। नॉकआउट एवं लीग मुकाबले।',
      date: new Date('2026-11-09T14:00:00Z'),
      startTime: '02:00 PM',
      endTime: '08:00 PM',
      venue: 'उच्च विद्यालय खेल मैदान, परोरा',
      bannerUrl: '/images/events/kabaddi.jpg',
      organizerName: 'सुधीर कुमार सिंह (खेल संयोजक)',
      organizerContact: '+91 99314 77812',
      rules: 'AKFI अधिकृत मैट नियम लागू। प्रत्येक टीम में अधिकतम 10 खिलाड़ी (7 प्लेइंग + 3 सब्स्टीट्यूट)। आधार कार्ड अनिवार्य।',
      prizeDetails: 'प्रथम पुरस्कार: ₹25,000 + भव्य शील्ड | उपविजेता: ₹15,000 + शील्ड | मैन ऑफ द सीरीज: ₹3,100',
      status: 'UPCOMING',
    },
    {
      festivalYearId: year2026.id,
      categoryId: categories['cultural-programs'].id,
      title: 'Bhakti Sangeet Sandhya & Jagran',
      titleHindi: 'भव्य भक्ति जागरण एवं संगीत संध्या',
      description: 'प्रसिद्ध लोक एवं भजन गायकों द्वारा माँ काली के चरणों में भक्ति गीतों की सुरमयी प्रस्तुति एवं भव्य झांकी दर्शन।',
      date: new Date('2026-11-09T20:00:00Z'),
      startTime: '08:00 PM',
      endTime: '02:00 AM',
      venue: 'मुख्य सांस्कृतिक मंच, परोरा',
      bannerUrl: '/images/events/cultural.jpg',
      organizerName: 'सत्यनारायण भगत (सांस्कृतिक सचिव)',
      organizerContact: '+91 91220 33451',
      rules: 'पारिवारिक एवं गरिमामय माहौल बनाए रखें। दर्शक दीर्घा में वरिष्ठ नागरिकों का सम्मान करें।',
      prizeDetails: 'उत्कृष्ट प्रस्तुति कलाकारों को सम्मान स्मृति चिन्ह',
      status: 'UPCOMING',
    },
    {
      festivalYearId: year2026.id,
      categoryId: categories['kabaddi-tournament'].id,
      title: 'Kabaddi Grand Semis & Mega Final',
      titleHindi: 'कबड्डी महामुकाबला: सेमीफाइनल एवं फाइनल',
      description: 'शीर्ष 4 टीमों के मध्य खिताबी भिड़ंत एवं भव्य समापन समारोह। मुख्य अतिथियों द्वारा पुरस्कार वितरण।',
      date: new Date('2026-11-10T15:00:00Z'),
      startTime: '03:00 PM',
      endTime: '07:30 PM',
      venue: 'उच्च विद्यालय खेल मैदान, परोरा',
      bannerUrl: '/images/events/kabaddi-final.jpg',
      organizerName: 'सुधीर कुमार सिंह',
      organizerContact: '+91 99314 77812',
      rules: 'विजेता टीम को तत्काल नकद पुरस्कार एवं ट्रॉफी प्रदान की जाएगी।',
      prizeDetails: 'विजेता एवं उपविजेता शील्ड, सर्वश्रेष्ठ रेडर व कैचर पुरस्कार',
      status: 'UPCOMING',
    },
    {
      festivalYearId: year2026.id,
      categoryId: categories['student-recognition'].id,
      title: 'Parora Pratibha Samman Samaroh 2026',
      titleHindi: 'परोरा प्रतिभा सम्मान एवं मेधावी छात्र पुरस्कार वितरण',
      description: '10वीं, 12वीं, स्नातक, प्रतियोगी परीक्षाओं (UPSC/BPSC/SSC) एवं खेल में उत्कृष्ट प्रदर्शन करने वाले ग्रामीण छात्र-छात्राओं का सार्वजनिक नागरिक अभिनंदन।',
      date: new Date('2026-11-10T17:30:00Z'),
      startTime: '05:30 PM',
      endTime: '08:30 PM',
      venue: 'माँ काली मुक्ताकाशी मंच, परोरा',
      bannerUrl: '/images/events/student.jpg',
      organizerName: 'प्रो. अशोक कुमार चौधरी (शिक्षा प्रकोष्ठ)',
      organizerContact: '+91 94318 90123',
      rules: 'पंजीकृत एवं सत्यापित छात्र-छात्राएं मूल अंकपत्र/प्रमाणपत्र एवं एक फोटो साथ लेकर आएं।',
      prizeDetails: 'मेडल, प्रशस्ति पत्र, स्मृति चिन्ह एवं प्रोत्साहन शैक्षणिक किट',
      status: 'UPCOMING',
    },
    {
      festivalYearId: year2026.id,
      categoryId: categories['community-activities'].id,
      title: 'Maha Khichdi Bhandara & Prasad Vitran',
      titleHindi: 'सर्वजन समरसता महाप्रसाद भंडारा',
      description: 'समस्त ग्रामवासियों एवं दूर-दराज से पधारे हजारों श्रद्धालुओं के लिए शुद्ध देसी घी में निर्मित महाप्रसाद का अटूट लंगर वितरण।',
      date: new Date('2026-11-10T11:00:00Z'),
      startTime: '11:00 AM',
      endTime: '04:00 PM',
      venue: 'भंडारा प्रांगण, परोरा',
      bannerUrl: '/images/events/prasad.jpg',
      organizerName: 'भोला साह (भंडारा प्रभारी)',
      organizerContact: '+91 98352 11982',
      rules: 'पंक्तिबद्ध होकर प्रसाद ग्रहण करें। भोजन की बर्बादी न करें। स्वच्छता का विशेष ध्यान रखें।',
      prizeDetails: 'माँ का पावन आशीर्वाद',
      status: 'UPCOMING',
    },
  ];

  for (const ev of events2026) {
    await prisma.event.create({ data: ev });
  }

  // 7. Create Kabaddi Teams & Players for 2026
  const teamsData = [
    { teamName: 'Parora Tigers (Host)', villageOrClub: 'Parora', captainName: 'Amit Singh', captainPhone: '+91 98765 11221', points: 6, matchesPlayed: 2, matchesWon: 2, matchesLost: 0, status: 'CONFIRMED' },
    { teamName: 'Kasba Warriors', villageOrClub: 'Kasba', captainName: 'Ravi Kumar', captainPhone: '+91 98765 22332', points: 4, matchesPlayed: 2, matchesWon: 1, matchesLost: 1, status: 'CONFIRMED' },
    { teamName: 'K. Nagar Stars', villageOrClub: 'Krityanand Nagar', captainName: 'Mohit Yadav', captainPhone: '+91 98765 33443', points: 4, matchesPlayed: 2, matchesWon: 1, matchesLost: 1, status: 'CONFIRMED' },
    { teamName: 'Dhamdaha Champions', villageOrClub: 'Dhamdaha', captainName: 'Sunil Soren', captainPhone: '+91 98765 44554', points: 6, matchesPlayed: 2, matchesWon: 2, matchesLost: 0, status: 'CONFIRMED' },
    { teamName: 'Banmankhi Panthers', villageOrClub: 'Banmankhi', captainName: 'Deepak Jha', captainPhone: '+91 98765 55665', points: 2, matchesPlayed: 2, matchesWon: 0, matchesLost: 2, status: 'CONFIRMED' },
    { teamName: 'Purnea City Club', villageOrClub: 'Purnea City', captainName: 'Gaurav Roy', captainPhone: '+91 98765 66776', points: 4, matchesPlayed: 2, matchesWon: 1, matchesLost: 1, status: 'CONFIRMED' },
    { teamName: 'Maranga Strikers', villageOrClub: 'Maranga', captainName: 'Manish Paswan', captainPhone: '+91 98765 77887', points: 0, matchesPlayed: 2, matchesWon: 0, matchesLost: 2, status: 'CONFIRMED' },
    { teamName: 'Madhubani Kings', villageOrClub: 'Madhubani, Purnea', captainName: 'Sanjay Sahni', captainPhone: '+91 98765 88998', points: 4, matchesPlayed: 2, matchesWon: 1, matchesLost: 1, status: 'CONFIRMED' },
  ];

  const createdTeams = [];
  for (const t of teamsData) {
    const team = await prisma.kabaddiTeam.create({
      data: {
        ...t,
        festivalYearId: year2026.id,
      },
    });
    createdTeams.push(team);

    // Add players
    const roles = ['RAIDER', 'DEFENDER', 'ALL_ROUNDER'];
    for (let i = 1; i <= 7; i++) {
      await prisma.kabaddiPlayer.create({
        data: {
          teamId: team.id,
          name: i === 1 ? team.captainName : `Player ${i} (${team.villageOrClub})`,
          jerseyNumber: i,
          role: roles[i % 3],
          isCaptain: i === 1,
          phone: i === 1 ? team.captainPhone : null,
        },
      });
    }
  }

  // Matches for Kabaddi
  if (createdTeams.length >= 4) {
    await prisma.kabaddiMatch.create({
      data: {
        festivalYearId: year2026.id,
        matchNumber: 1,
        stage: 'GROUP_STAGE',
        teamAId: createdTeams[0].id,
        teamBId: createdTeams[1].id,
        teamAScore: 38,
        teamBScore: 31,
        status: 'COMPLETED',
        winnerId: createdTeams[0].id,
        scheduledTime: new Date('2026-11-09T14:30:00Z'),
        venue: 'Court 1, High School Ground',
        commentary: 'Parora Tigers dominated the second half with 2 super tackles and an all-out.',
      },
    });

    await prisma.kabaddiMatch.create({
      data: {
        festivalYearId: year2026.id,
        matchNumber: 2,
        stage: 'GROUP_STAGE',
        teamAId: createdTeams[2].id,
        teamBId: createdTeams[3].id,
        teamAScore: 29,
        teamBScore: 42,
        status: 'COMPLETED',
        winnerId: createdTeams[3].id,
        scheduledTime: new Date('2026-11-09T16:00:00Z'),
        venue: 'Court 1, High School Ground',
        commentary: 'Dhamdaha raiders executed high-scoring multi-point raids.',
      },
    });

    await prisma.kabaddiMatch.create({
      data: {
        festivalYearId: year2026.id,
        matchNumber: 3,
        stage: 'SEMI_FINAL',
        teamAId: createdTeams[0].id,
        teamBId: createdTeams[3].id,
        teamAScore: 24,
        teamBScore: 22,
        status: 'LIVE',
        scheduledTime: new Date('2026-11-10T16:30:00Z'),
        venue: 'Main Floodlit Arena, Parora Ground',
        commentary: 'High tension thriller! Parora leads by 2 points with 4 minutes remaining on clock.',
      },
    });
  }

  // 8. Create Student Achievements
  const studentData = [
    {
      studentName: 'Anjali Kumari',
      guardianName: 'Shri Ramakant Singh',
      village: 'Parora (Tola Purab)',
      schoolOrCollege: 'Zila School Purnea',
      courseOrClass: '10th Board (BSEB)',
      category: 'CLASS_10',
      examOrCompetitionName: 'Bihar Board Matric Examination 2026',
      marksPercentageOrRank: '472 / 500 (94.4%) - Block Rank 1',
      yearOfPassing: 2026,
      contactNumber: '+91 98350 44123',
      status: 'APPROVED',
      prizeAssigned: 'Gold Medal + Laptop Bag + ₹2,100 Cash Award',
      prizeGiven: false,
      isPublished: true,
      remarks: 'Highest marks in the Panchayat. Exceptional achievement.',
    },
    {
      studentName: 'Aditya Kumar Jha',
      guardianName: 'Late B. K. Jha',
      village: 'Parora',
      schoolOrCollege: 'Purnea College, Purnea',
      courseOrClass: '12th Science (BSEB)',
      category: 'CLASS_12',
      examOrCompetitionName: 'Bihar Intermediate Examination 2026',
      marksPercentageOrRank: '458 / 500 (91.6%) - District Top 10',
      yearOfPassing: 2026,
      contactNumber: '+91 94318 66521',
      status: 'APPROVED',
      prizeAssigned: 'Silver Medal + Certificate of Excellence + Study Kit',
      prizeGiven: false,
      isPublished: true,
      remarks: 'Science topper from Parora village.',
    },
    {
      studentName: 'Priya Sharma',
      guardianName: 'Dinesh Sharma',
      village: 'Parora',
      schoolOrCollege: 'Patna University',
      courseOrClass: 'Civil Services Preparation',
      category: 'GOVT_JOB',
      examOrCompetitionName: 'BPSC 69th Combined Competitive Examination',
      marksPercentageOrRank: 'Rank 142 - Selected as Revenue Officer',
      yearOfPassing: 2025,
      contactNumber: '+91 97711 88902',
      status: 'APPROVED',
      prizeAssigned: 'Pride of Parora Special Memento & Shawl',
      prizeGiven: true,
      isPublished: true,
      remarks: 'First female officer from Parora in BPSC state service.',
    },
    {
      studentName: 'Rahul Kumar Yadav',
      guardianName: 'Suresh Yadav',
      village: 'Parora',
      schoolOrCollege: 'NIT Patna',
      courseOrClass: 'B.Tech Computer Science',
      category: 'COMPETITIVE_EXAM',
      examOrCompetitionName: 'JEE Main & Advanced 2026',
      marksPercentageOrRank: 'JEE Advanced AIR 3210 (99.2 Percentile)',
      yearOfPassing: 2026,
      contactNumber: '+91 91228 33411',
      status: 'APPROVED',
      prizeAssigned: 'Excellence Trophy + ₹3,100 Scholastic Grant',
      prizeGiven: false,
      isPublished: true,
      remarks: 'Admitted to prestigious engineering institution.',
    },
    {
      studentName: 'Suraj Kumar Rishi',
      guardianName: 'Shambhu Rishi',
      village: 'Parora (Rishi Tola)',
      schoolOrCollege: 'State Sports Academy, Rajgir',
      courseOrClass: 'Intermediate Arts',
      category: 'SPORTS',
      examOrCompetitionName: 'Bihar State Junior Athletics Championship',
      marksPercentageOrRank: 'Gold Medal in 1500m Track Event',
      yearOfPassing: 2026,
      contactNumber: '+91 82101 22891',
      status: 'APPROVED',
      prizeAssigned: 'Sports Champion Trophy + Professional Running Shoes Kit',
      prizeGiven: false,
      isPublished: true,
      remarks: 'Qualified for National Junior Athletics Meet.',
    },
  ];

  for (const s of studentData) {
    await prisma.studentAchievement.create({
      data: {
        ...s,
        festivalYearId: year2026.id,
      },
    });
  }

  // 9. Create 19 Standard Expense Categories
  const expenseCategoriesData = [
    { name: 'Tent and Pandal Expenses', nameHindi: 'तंबू एवं पंडाल व्यवस्था', description: 'Waterproof tent, VIP lounge, barricading, seating, carpets', isDefault: true, sortOrder: 1 },
    { name: 'Decoration and Lighting', nameHindi: 'सजावट एवं प्रकाश व्यवस्था', description: 'LED gates, halogen, floral mandap decor, temple illumination', isDefault: true, sortOrder: 2 },
    { name: 'Sound System and DJ', nameHindi: 'साउंड सिस्टम एवं डीजे', description: 'Line array speakers, audio mixing, operator, microphones', isDefault: true, sortOrder: 3 },
    { name: 'Stage Construction', nameHindi: 'मंच निर्माण एवं पोडियम', description: 'Main cultural stage, truss setup, green rooms, backdrop', isDefault: true, sortOrder: 4 },
    { name: 'Electrical Arrangements', nameHindi: 'विद्युत एवं जनरेटर व्यवस्था', description: 'High-power silent DG gensets, wiring, backup diesel fuel', isDefault: true, sortOrder: 5 },
    { name: 'Kali Puja Religious Arrangements', nameHindi: 'माँ काली पूजा धार्मिक सामग्री', description: 'Puja samagri, purohit dakshina, havan items, flowers, ghee', isDefault: true, sortOrder: 6 },
    { name: 'Prasad and Food Arrangements', nameHindi: 'महाप्रसाद एवं भंडारा सामग्री', description: 'Ration, desi ghee, sweets, vegetables, cook honorarium', isDefault: true, sortOrder: 7 },
    { name: 'Kabaddi Tournament', nameHindi: 'कबड्डी मैच व्यवस्था एवं मैट', description: 'Official mats, referee fees, line markings, match kits', isDefault: true, sortOrder: 8 },
    { name: 'Sports Equipment', nameHindi: 'खेल सामग्री एवं किट्स', description: 'Footballs, nets, boundary cones, whistle, first aid kits', isDefault: true, sortOrder: 9 },
    { name: 'Cultural Programs', nameHindi: 'सांस्कृतिक कार्यक्रम मंच व्यवस्था', description: 'Musicians, drama artists, makeup, costume rentals', isDefault: true, sortOrder: 10 },
    { name: 'Dance and Music Performances', nameHindi: 'कलाकार एवं संगीत मानदेय', description: 'Renowned bhajan singers, orchestra group, folk troupes', isDefault: true, sortOrder: 11 },
    { name: 'Prize Distribution Ceremony', nameHindi: 'पुरस्कार, मेडल एवं शील्ड', description: 'Trophies, certificates, medals, cash prize envelopes', isDefault: true, sortOrder: 12 },
    { name: 'Student Awards and Trophies', nameHindi: 'छात्र सम्मान शील्ड एवं स्टेशनरी', description: 'Educational gift hampers, student shields, citation plaques', isDefault: true, sortOrder: 13 },
    { name: 'Printing and Banners', nameHindi: 'होर्डिंग, फ्लेक्स एवं प्रचार', description: 'Main roadside hoardings, flex banners, invitation cards, receipts', isDefault: true, sortOrder: 14 },
    { name: 'Transportation', nameHindi: 'परिवहन एवं वाहन किराया', description: 'Goods carriage, pickup vans, artist travel reimbursements', isDefault: true, sortOrder: 15 },
    { name: 'Water and Refreshments', nameHindi: 'पेयजल एवं जलपान व्यवस्था', description: 'Water tanker, sealed water jars, tea & snacks for guests/volunteers', isDefault: true, sortOrder: 16 },
    { name: 'Security Arrangements', nameHindi: 'सुरक्षा एवं वालंटियर व्यवस्था', description: 'CCTV cameras, walkie-talkies, reflective jackets, badges', isDefault: true, sortOrder: 17 },
    { name: 'Cleaning and Maintenance', nameHindi: 'सफाई एवं स्वच्छता प्रबंधन', description: 'Waste bins, sanitation workers wages, bleaching powder, sweeping', isDefault: true, sortOrder: 18 },
    { name: 'Miscellaneous Expenses', nameHindi: 'विविध आकस्मिक व्यय', description: 'Contingency, hardware items, local miscellaneous village expenses', isDefault: true, sortOrder: 19 },
  ];

  const createdExpCats = {};
  for (const ec of expenseCategoriesData) {
    createdExpCats[ec.name] = await prisma.expenseCategory.create({ data: ec });
  }

  // 10. Create Vendors
  const vendorsData = [
    {
      name: 'Rameshwar Tent & Event House',
      businessName: 'Maa Durga Tent & Light Works',
      phone: '+91 94314 11200',
      address: 'Main Road Kasba, Near Railway Crossing, Purnea',
      serviceCategory: 'Tent, Stage & Pandal',
      upiId: 'rameshwartent@paytm',
      bankAccountNumber: '20194829104',
      ifscCode: 'PUNB0201900',
      totalBilled: 65000,
      totalPaid: 45000,
      outstandingBalance: 20000,
      notes: 'Trusted vendor since 2018. Quality waterproof German hanger setup.',
    },
    {
      name: 'Sunil Kumar Sharma',
      businessName: 'Swar Sangam Sound & DJ Systems',
      phone: '+91 98351 99281',
      address: 'Line Bazar, Purnea',
      serviceCategory: 'Sound & Audio Systems',
      upiId: 'swarsangam@okaxis',
      bankAccountNumber: '91827364512',
      ifscCode: 'SBIN0000412',
      totalBilled: 32000,
      totalPaid: 32000,
      outstandingBalance: 0,
      notes: 'Line array J-series system with digital mixer.',
    },
    {
      name: 'Rakesh Prasad Roy',
      businessName: 'Shree Krishna Sweets & Catering Services',
      phone: '+91 91223 88192',
      address: 'Parora Market, Purnea',
      serviceCategory: 'Food, Prasad & Catering',
      upiId: 'shreekrishnasweets@icici',
      totalBilled: 42000,
      totalPaid: 30000,
      outstandingBalance: 12000,
      notes: 'Pure ghee sweets and Bhandara materials.',
    },
    {
      name: 'Alok Kumar Verma',
      businessName: 'National Flex Printers & Advertising',
      phone: '+91 99341 55421',
      address: 'Court Station Road, Purnea',
      serviceCategory: 'Printing & Banners',
      upiId: 'nationalflex@sbi',
      totalBilled: 14500,
      totalPaid: 14500,
      outstandingBalance: 0,
      notes: 'High resolution outdoor star flex banners.',
    },
    {
      name: 'Pramod Kumar Saha',
      businessName: 'Champion Sports & Trophies World',
      phone: '+91 94308 77219',
      address: 'Bhatta Bazar, Purnea',
      serviceCategory: 'Sports & Trophies',
      upiId: 'championsports@upi',
      totalBilled: 21000,
      totalPaid: 21000,
      outstandingBalance: 0,
      notes: 'Official Kabaddi mats on rental + customized wooden trophies.',
    },
  ];

  const createdVendors = [];
  for (const v of vendorsData) {
    const ven = await prisma.vendor.create({ data: v });
    createdVendors.push(ven);
  }

  // 11. Create Budget & Allocations for 2026
  const budget2026 = await prisma.budget.create({
    data: {
      festivalYearId: year2026.id,
      totalAllocated: 350000,
      notes: 'Approved in Samiti General Body Meeting dated 15th October 2026.',
    },
  });

  const budgetAllocations = [
    { cat: 'Tent and Pandal Expenses', amount: 70000 },
    { cat: 'Decoration and Lighting', amount: 45000 },
    { cat: 'Sound System and DJ', amount: 35000 },
    { cat: 'Stage Construction', amount: 25000 },
    { cat: 'Electrical Arrangements', amount: 20000 },
    { cat: 'Kali Puja Religious Arrangements', amount: 30000 },
    { cat: 'Prasad and Food Arrangements', amount: 50000 },
    { cat: 'Kabaddi Tournament', amount: 35000 },
    { cat: 'Prize Distribution Ceremony', amount: 15000 },
    { cat: 'Student Awards and Trophies', amount: 10000 },
    { cat: 'Printing and Banners', amount: 15000 },
  ];

  for (const ba of budgetAllocations) {
    if (createdExpCats[ba.cat]) {
      await prisma.budgetAllocation.create({
        data: {
          budgetId: budget2026.id,
          categoryId: createdExpCats[ba.cat].id,
          allocatedAmount: ba.amount,
        },
      });
    }
  }

  // 12. Create Expenses & Bills
  const sampleExpenses = [
    {
      festivalYearId: year2026.id,
      categoryId: createdExpCats['Tent and Pandal Expenses'].id,
      vendorId: createdVendors[0].id,
      title: 'Waterproof German Hanger Pandal & VIP Seating',
      billNumber: 'MDT-2026/89',
      billDate: new Date('2026-10-25'),
      paymentDate: new Date('2026-10-26'),
      amount: 65000,
      paymentMethod: 'BANK_TRANSFER',
      paymentStatus: 'PARTIAL',
      advanceAmount: 45000,
      paidAmount: 45000,
      outstandingAmount: 20000,
      description: 'Advance payment of ₹45,000 made via NEFT for 60x120 ft waterproof pandal.',
      approvalStatus: 'APPROVED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdExpCats['Sound System and DJ'].id,
      vendorId: createdVendors[1].id,
      title: '2-Day JBL Line Array Audio & Stage Microphones',
      billNumber: 'SS-2026-114',
      billDate: new Date('2026-10-28'),
      paymentDate: new Date('2026-10-28'),
      amount: 32000,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      advanceAmount: 32000,
      paidAmount: 32000,
      outstandingAmount: 0,
      description: 'Full payment made for high power sound setup for religious jagran and kabaddi arena.',
      approvalStatus: 'APPROVED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdExpCats['Prasad and Food Arrangements'].id,
      vendorId: createdVendors[2].id,
      title: 'Desi Ghee, Dry Fruits, Khichdi & Maha Bhandara Supplies',
      billNumber: 'SKS-PUR-401',
      billDate: new Date('2026-10-29'),
      paymentDate: new Date('2026-10-29'),
      amount: 42000,
      paymentMethod: 'CASH',
      paymentStatus: 'PARTIAL',
      advanceAmount: 30000,
      paidAmount: 30000,
      outstandingAmount: 12000,
      description: 'First installment paid for Bhandara ration. Balance due on 11th Nov.',
      approvalStatus: 'APPROVED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdExpCats['Printing and Banners'].id,
      vendorId: createdVendors[3].id,
      title: '15 Main Hoardings, 40 Road Banners & Invitation Folders',
      billNumber: 'NF-PR-881',
      billDate: new Date('2026-10-27'),
      paymentDate: new Date('2026-10-27'),
      amount: 14500,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      advanceAmount: 14500,
      paidAmount: 14500,
      outstandingAmount: 0,
      description: 'Full payment cleared upon delivery and inspection of printing materials.',
      approvalStatus: 'APPROVED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdExpCats['Kabaddi Tournament'].id,
      vendorId: createdVendors[4].id,
      title: 'Tournament Mat Rental, Match Balls & Winner Trophies',
      billNumber: 'CSP-992',
      billDate: new Date('2026-10-30'),
      paymentDate: new Date('2026-10-30'),
      amount: 21000,
      paymentMethod: 'BANK_TRANSFER',
      paymentStatus: 'PAID',
      advanceAmount: 21000,
      paidAmount: 21000,
      outstandingAmount: 0,
      description: 'Payment made for AKFI standard kabaddi mats and tournament awards.',
      approvalStatus: 'APPROVED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdExpCats['Kali Puja Religious Arrangements'].id,
      title: 'Vedic Puja Samagri, Havan Wood, Flowers, Ganga Jal & Purohit Dakshina',
      billNumber: 'SAMAGRI-CASH-01',
      billDate: new Date('2026-10-31'),
      paymentDate: new Date('2026-10-31'),
      amount: 22500,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      paidAmount: 22500,
      outstandingAmount: 0,
      description: 'Purchased directly from local Varanasi Ayurvedic & Religious Store.',
      approvalStatus: 'APPROVED',
    },
  ];

  for (const exp of sampleExpenses) {
    const createdExp = await prisma.expense.create({ data: exp });
    // Add bill
    await prisma.bill.create({
      data: {
        expenseId: createdExp.id,
        invoiceNumber: exp.billNumber,
        billDate: exp.billDate,
        amount: exp.amount,
        notes: exp.description,
      },
    });
    // Add payment
    if (exp.paidAmount > 0) {
      await prisma.payment.create({
        data: {
          expenseId: createdExp.id,
          vendorId: exp.vendorId,
          amount: exp.paidAmount,
          paymentDate: exp.paymentDate || new Date(),
          paymentMethod: exp.paymentMethod,
          transactionRef: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          notes: `Payment for ${exp.title}`,
        },
      });
    }
  }

  // 13. Create Income Categories & Donations
  const incCats = [
    { name: 'Individual Public Donations', nameHindi: 'व्यक्तिगत जन-सहयोग', description: 'Voluntary donations by devotees and villagers' },
    { name: 'Business Sponsorships', nameHindi: 'व्यापारिक प्रायोजन', description: 'Commercial banners and event sponsorships' },
    { name: 'Committee Member Contributions', nameHindi: 'समिति सदस्य सहयोग', description: 'Annual mandatory and voluntary contribution by members' },
    { name: 'Special Project / Chanda', nameHindi: 'विशेष चंदा संग्रह', description: 'Tola-wise household contribution' },
  ];

  const createdIncCats = {};
  for (const ic of incCats) {
    createdIncCats[ic.name] = await prisma.incomeCategory.create({ data: ic });
  }

  const donations = [
    {
      festivalYearId: year2026.id,
      categoryId: createdIncCats['Business Sponsorships'].id,
      donorName: 'Parora Modern Agro Industries',
      donorPhone: '+91 94310 11999',
      donorAddressOrVillage: 'Industrial Area, Parora',
      amount: 51000,
      donationDate: new Date('2026-10-20'),
      paymentMethod: 'BANK_TRANSFER',
      transactionRef: 'NEFT9201948102',
      receiptNumber: 'KPS-2026-001',
      purpose: 'Title Sponsor - Kali Puja Utsav 2026',
      isPubliclyVisible: true,
      status: 'CONFIRMED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdIncCats['Business Sponsorships'].id,
      donorName: 'Maa Kali Modern Rice Mills',
      donorPhone: '+91 98350 44219',
      donorAddressOrVillage: 'Kasba Road, Parora',
      amount: 31000,
      donationDate: new Date('2026-10-22'),
      paymentMethod: 'UPI',
      transactionRef: 'UPI20261022091',
      receiptNumber: 'KPS-2026-002',
      purpose: 'Kabaddi Tournament Gold Sponsor',
      isPubliclyVisible: true,
      status: 'CONFIRMED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdIncCats['Individual Public Donations'].id,
      donorName: 'Shri Birendra Singh (Retd. Subedar Major)',
      donorPhone: '+91 94312 88123',
      donorAddressOrVillage: 'Parora Khas',
      amount: 21000,
      donationDate: new Date('2026-10-23'),
      paymentMethod: 'UPI',
      transactionRef: 'UPI20261023101',
      receiptNumber: 'KPS-2026-003',
      purpose: 'Prasad & Bhandara Seva',
      isPubliclyVisible: true,
      status: 'CONFIRMED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdIncCats['Individual Public Donations'].id,
      donorName: 'Er. Alok Ranjan (Bangalore / Parora)',
      donorPhone: '+91 98860 12450',
      donorAddressOrVillage: 'Bangalore (Origin: Parora)',
      amount: 25000,
      donationDate: new Date('2026-10-25'),
      paymentMethod: 'BANK_TRANSFER',
      transactionRef: 'IMPS20261025781',
      receiptNumber: 'KPS-2026-004',
      purpose: 'Student Recognition Awards & Medals',
      isPubliclyVisible: true,
      status: 'CONFIRMED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdIncCats['Committee Member Contributions'].id,
      donorName: 'Manoj Sharma (Treasurer)',
      donorPhone: '+91 91223 44589',
      donorAddressOrVillage: 'Parora',
      amount: 11000,
      donationDate: new Date('2026-10-26'),
      paymentMethod: 'CASH',
      receiptNumber: 'KPS-2026-005',
      purpose: 'Samiti Member Seva',
      isPubliclyVisible: true,
      status: 'CONFIRMED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdIncCats['Special Project / Chanda'].id,
      donorName: 'Ward No. 04 Gramvasi (Consolidated)',
      donorPhone: '+91 97714 55321',
      donorAddressOrVillage: 'Ward 4, Parora',
      amount: 38400,
      donationDate: new Date('2026-10-28'),
      paymentMethod: 'CASH',
      receiptNumber: 'KPS-2026-006',
      purpose: 'Household Collection Chanda',
      isPubliclyVisible: true,
      status: 'CONFIRMED',
    },
    {
      festivalYearId: year2026.id,
      categoryId: createdIncCats['Individual Public Donations'].id,
      donorName: 'Dr. S. K. Choudhary (Civil Surgeon Retd.)',
      donorPhone: '+91 94318 77610',
      donorAddressOrVillage: 'Purnea / Parora',
      amount: 15000,
      donationDate: new Date('2026-10-29'),
      paymentMethod: 'UPI',
      transactionRef: 'UPI20261029441',
      receiptNumber: 'KPS-2026-007',
      purpose: 'Religious Puja Ceremony Support',
      isPubliclyVisible: true,
      status: 'CONFIRMED',
    },
  ];

  for (const d of donations) {
    await prisma.donation.create({ data: d });
  }

  // 14. Create Sponsors
  const sponsors = [
    {
      festivalYearId: year2026.id,
      name: 'Parora Modern Agro Industries',
      brandName: 'Purnea Shuddh Mustard Oil & Atta',
      sponsorTier: 'PLATINUM',
      contributionAmount: 51000,
      isAmountPublic: true,
      contactPerson: 'Shri Navin Agrawal',
      phone: '+91 94310 11999',
      websiteUrl: 'https://purneaagro.example.com',
      logoUrl: '/images/sponsors/sponsor-agro.svg',
      sortOrder: 1,
    },
    {
      festivalYearId: year2026.id,
      name: 'Maa Kali Modern Rice Mills',
      brandName: 'Royal Katarni & Basmati Rice',
      sponsorTier: 'GOLD',
      contributionAmount: 31000,
      isAmountPublic: true,
      contactPerson: 'Shri R. K. Sah',
      phone: '+91 98350 44219',
      logoUrl: '/images/sponsors/sponsor-rice.svg',
      sortOrder: 2,
    },
    {
      festivalYearId: year2026.id,
      name: 'Kisan Seva Kendra & Fertilizer Store',
      brandName: 'Kisan Samriddhi Center',
      sponsorTier: 'SILVER',
      contributionAmount: 15000,
      isAmountPublic: true,
      contactPerson: 'Shri Santosh Kumar',
      phone: '+91 99314 22109',
      logoUrl: '/images/sponsors/sponsor-kisan.svg',
      sortOrder: 3,
    },
    {
      festivalYearId: year2026.id,
      name: 'Parora Youth & Sports Welfare Club',
      brandName: 'Yuva Shakti Parora',
      sponsorTier: 'BRONZE',
      contributionAmount: 11000,
      isAmountPublic: true,
      contactPerson: 'Mukesh Kumar Singh',
      phone: '+91 82103 44512',
      logoUrl: '/images/sponsors/sponsor-youth.svg',
      sortOrder: 4,
    },
  ];

  for (const sp of sponsors) {
    await prisma.sponsor.create({ data: sp });
  }

  // 15. Create Financial Transactions & Ledger Entries
  // Calculate Totals:
  // Income = 51000 + 31000 + 21000 + 25000 + 11000 + 38400 + 15000 = 192,400
  // Expenses Paid = 45000 + 32000 + 30000 + 14500 + 21000 + 22500 = 165,000
  // Opening Balance from 2025 carry forward = 45,000
  // Balance = 45,000 + 192,400 - 165,000 = 72,400
  await prisma.financialTransaction.create({
    data: {
      festivalYearId: year2026.id,
      type: 'INCOME',
      referenceType: 'OPENING_BALANCE',
      amount: 45000,
      paymentMethod: 'BANK_TRANSFER',
      transactionDate: new Date('2026-10-01'),
      description: 'Opening balance carried forward from Kali Puja 2025 reserves',
      runningBalance: 45000,
    },
  });

  await prisma.financialTransaction.create({
    data: {
      festivalYearId: year2026.id,
      type: 'INCOME',
      referenceType: 'DONATION',
      amount: 192400,
      paymentMethod: 'UPI',
      transactionDate: new Date('2026-10-29'),
      description: 'Total collections from sponsors and voluntary donations up to 29th Oct',
      runningBalance: 237400,
    },
  });

  await prisma.financialTransaction.create({
    data: {
      festivalYearId: year2026.id,
      type: 'EXPENSE',
      referenceType: 'EXPENSE',
      amount: 165000,
      paymentMethod: 'BANK_TRANSFER',
      transactionDate: new Date('2026-10-31'),
      description: 'Approved vendor payments, advance pandal fees, sound, and religious items',
      runningBalance: 72400,
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      festivalYearId: year2026.id,
      accountType: 'BANK_UPI',
      debit: 0,
      credit: 122000,
      balance: 122000,
      description: 'Total UPI and Bank transfer collections received in SBI account',
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      festivalYearId: year2026.id,
      accountType: 'CASH',
      debit: 0,
      credit: 70400,
      balance: 70400,
      description: 'Total cash donations received by Treasurer',
    },
  });

  // 16. Create Announcements & Notices
  const announcements = [
    {
      festivalYearId: year2026.id,
      title: 'Kabaddi Tournament Team Registrations Closing Soon!',
      titleHindi: 'कबड्डी प्रतियोगिता हेतु टीमों का ऑनलाइन पंजीकरण 5 नवंबर तक खुला है!',
      message: 'बिहार एवं पड़ोसी जिलों की शीर्ष टीमें अपना पंजीकरण तत्काल पूर्ण करें। केवल 16 चयनित टीमों को प्रवेश दिया जाएगा।',
      messageHindi: 'बिहार एवं पड़ोसी जिलों की शीर्ष टीमें अपना पंजीकरण तत्काल पूर्ण करें। केवल 16 चयनित टीमों को प्रवेश दिया जाएगा।',
      category: 'EVENT_UPDATE',
      isPinned: true,
      isUrgent: true,
    },
    {
      festivalYearId: year2026.id,
      title: 'Parora Pratibha Samman 2026 Application Verification',
      titleHindi: 'मेधावी छात्र सम्मान 2026: आवेदन एवं प्रमाणपत्र सत्यापन जारी',
      message: '10वीं, 12वीं एवं सरकारी नौकरी में चयनित छात्र-छात्राएं अपना अंकपत्र व विवरण पोर्टल पर अपलोड करें।',
      messageHindi: '10वीं, 12वीं एवं सरकारी नौकरी में चयनित छात्र-छात्राएं अपना अंकपत्र व विवरण पोर्टल पर अपलोड करें।',
      category: 'GENERAL',
      isPinned: true,
      isUrgent: false,
    },
    {
      festivalYearId: year2026.id,
      title: 'Live Prasad & Bhandara Schedule Announced',
      titleHindi: 'महाप्रसाद एवं भंडारा समय सारणी जारी',
      message: '10 नवंबर प्रातः 11 बजे से मुख्य प्रांगण में महाप्रसाद वितरण आरंभ होगा।',
      messageHindi: '10 नवंबर प्रातः 11 बजे से मुख्य प्रांगण में महाप्रसाद वितरण आरंभ होगा।',
      category: 'GENERAL',
      isPinned: false,
      isUrgent: false,
    },
  ];

  for (const an of announcements) {
    await prisma.announcement.create({ data: an });
  }

  const notices = [
    {
      festivalYearId: year2026.id,
      title: 'Official Notification: Festival Code of Conduct & Vehicle Parking Plan',
      titleHindi: 'आधिकारिक सूचना: पूजा महोत्सव आचार संहिता एवं वाहन पार्किंग व्यवस्था',
      circularNumber: 'KPS/NOT/2026/01',
      content: 'समस्त ग्रामवासियों एवं आगंतुकों की सुविधा हेतु उच्च विद्यालय के पश्चिमी भाग में दोपहिया एवं चारपहिया वाहनों हेतु निशुल्क पार्किंग स्थल निर्धारित किया गया है। मंदिर परिसर में भारी वाहनों का प्रवेश पूर्णतः वर्जित है।',
      isPublished: true,
    },
    {
      festivalYearId: year2026.id,
      title: 'Invitation: General Body Meeting and Volunteer Duty Allocation',
      titleHindi: 'आमंत्रण: आम सभा बैठक एवं वालंटियर दायित्व वितरण',
      circularNumber: 'KPS/NOT/2026/02',
      content: 'दिनांक 3 नवंबर को संध्या 6:00 बजे मंदिर परिसर में अंतिम समीक्षा बैठक आयोजित होगी। सभी सम्मानित सदस्य एवं वालंटियर साथी अनिवार्य रूप से उपस्थित रहें।',
      isPublished: true,
    },
  ];

  for (const n of notices) {
    await prisma.notice.create({ data: n });
  }

  // 17. Create Committee Members
  const committee = [
    {
      festivalYearId: year2026.id,
      name: 'Dr. Rameshwar Prasad Singh',
      nameHindi: 'डॉ. रामेश्वर प्रसाद सिंह',
      designation: 'Patron & Chief Advisor',
      designationHindi: 'संरक्षक एवं मुख्य मार्गदर्शक',
      roleCategory: 'ADVISORY_BOARD',
      phone: '+91 94312 88491',
      photoUrl: '/images/committee/rameshwar.jpg',
      sortOrder: 1,
      message: 'माँ काली के पावन आशीर्वाद से हमारा परोरा गांव निरंतर प्रगति एवं भाईचारे के मार्ग पर अग्रसर रहे।',
    },
    {
      festivalYearId: year2026.id,
      name: 'Shri Birendra Kumar Yadav',
      nameHindi: 'श्री बीरेंद्र कुमार यादव',
      designation: 'President',
      designationHindi: 'अध्यक्ष',
      roleCategory: 'OFFICE_BEARER',
      phone: '+91 98350 21478',
      photoUrl: '/images/committee/birendra.jpg',
      sortOrder: 2,
      message: 'हमारा संकल्प हर वर्ष इस पावन उत्सव को और अधिक भव्य, पारदर्शी एवं जन-कल्याणकारी बनाना है।',
    },
    {
      festivalYearId: year2026.id,
      name: 'Er. Gaurav Singh',
      nameHindi: 'ई. गौरव सिंह',
      designation: 'Secretary',
      designationHindi: 'सचिव',
      roleCategory: 'OFFICE_BEARER',
      phone: '+91 97714 55321',
      photoUrl: '/images/committee/gaurav.jpg',
      sortOrder: 3,
      message: 'डिजिटल पारदर्शिता, खेल महोत्सव और युवा प्रतिभाओं को आगे बढ़ाना हमारी समिति की सर्वोच्च प्राथमिकता है।',
    },
    {
      festivalYearId: year2026.id,
      name: 'Shri Manoj Sharma',
      nameHindi: 'श्री मनोज शर्मा',
      designation: 'Treasurer',
      designationHindi: 'कोषाध्यक्ष',
      roleCategory: 'OFFICE_BEARER',
      phone: '+91 91223 44589',
      photoUrl: '/images/committee/manoj.jpg',
      sortOrder: 4,
      message: 'एक-एक पैसे का हिसाब-किताब सार्वजनिक एवं पूर्णतः पारदर्शी रखना ही हमारी समिति की असली ताकत है।',
    },
    {
      festivalYearId: year2026.id,
      name: 'Shri Sudhir Kumar Singh',
      nameHindi: 'श्री सुधीर कुमार सिंह',
      designation: 'Sports Convener (Kabaddi)',
      designationHindi: 'खेल संयोजक (कबड्डी)',
      roleCategory: 'EVENT_COORDINATOR',
      phone: '+91 99314 77812',
      sortOrder: 5,
    },
    {
      festivalYearId: year2026.id,
      name: 'Prof. Ashok Kumar Choudhary',
      nameHindi: 'प्रो. अशोक कुमार चौधरी',
      designation: 'Education Cell Convener',
      designationHindi: 'शिक्षा एवं प्रतिभा प्रकोष्ठ प्रमुख',
      roleCategory: 'EVENT_COORDINATOR',
      phone: '+91 94318 90123',
      sortOrder: 6,
    },
  ];

  for (const c of committee) {
    await prisma.committeeMember.create({ data: c });
  }

  // 18. Create Gallery Albums and Media
  const galleryPuja = await prisma.gallery.create({
    data: {
      festivalYearId: year2026.id,
      title: 'Maa Kali Grand Mandap & Illumination 2026',
      titleHindi: 'माँ काली भव्य मंडप एवं प्रकाश सज्जा 2026',
      category: 'PUJA',
      coverImageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const galleryKabaddi = await prisma.gallery.create({
    data: {
      festivalYearId: year2026.id,
      title: 'All-Bihar Kabaddi Tournament Thrilling Moments',
      titleHindi: 'कबड्डी महाकुंभ के रोमांचक दृश्य',
      category: 'KABADDI',
      coverImageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const galleryAwards = await prisma.gallery.create({
    data: {
      festivalYearId: year2026.id,
      title: 'Pratibha Samman & Prize Distribution',
      titleHindi: 'प्रतिभा सम्मान एवं पुरस्कार वितरण समारोह',
      category: 'PRIZE_DISTRIBUTION',
      coverImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const mediaItems = [
    {
      galleryId: galleryPuja.id,
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80',
      caption: 'Main Kali Mandir sanctum illuminated with festive lamps',
      sortOrder: 1,
    },
    {
      galleryId: galleryPuja.id,
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      caption: 'Grand entrance archway at Parora main crossing',
      sortOrder: 2,
    },
    {
      galleryId: galleryKabaddi.id,
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80',
      caption: 'Spectacular tackle during Parora Tigers vs Kasba Warriors match',
      sortOrder: 1,
    },
    {
      galleryId: galleryAwards.id,
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      caption: 'Felicitation of meritorious students of Parora Panchayat',
      sortOrder: 1,
    },
  ];

  for (const m of mediaItems) {
    await prisma.galleryMedia.create({ data: m });
  }

  // 19. Create Sample Volunteers
  const volunteers = [
    {
      festivalYearId: year2026.id,
      name: 'Rakesh Roshan',
      phone: '+91 99311 00221',
      village: 'Parora',
      preferredRole: 'Kabaddi Ground Management',
      availability: 'Both Days (9 & 10 Nov)',
      status: 'ASSIGNED',
      assignedTask: 'Player refreshments and line judging coordination',
    },
    {
      festivalYearId: year2026.id,
      name: 'Sumit Kumar Singh',
      phone: '+91 98354 77890',
      village: 'Parora',
      preferredRole: 'Prasad & Bhandara Service',
      availability: '10th November Full Day',
      status: 'ASSIGNED',
      assignedTask: 'Guest seating and queue discipline in Prasad arena',
    },
    {
      festivalYearId: year2026.id,
      name: 'Chandan Kumar Jha',
      phone: '+91 91220 88992',
      village: 'Parora',
      preferredRole: 'Crowd & Parking Assistance',
      availability: '9th November Night & 10th Evening',
      status: 'ASSIGNED',
      assignedTask: 'Vehicle parking supervision at High School Ground',
    },
  ];

  for (const v of volunteers) {
    await prisma.volunteer.create({ data: v });
  }

  // 20. Audit Log
  await prisma.auditLog.create({
    data: {
      userName: 'Dr. Rameshwar Prasad Singh',
      action: 'SYSTEM_INITIALIZATION',
      module: 'SYSTEM',
      details: 'Kali Puja Samiti Parora complete database seeded with 2026, 2025, and 2024 records.',
    },
  });

  console.log('Seeding completed successfully with rich relational data!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

