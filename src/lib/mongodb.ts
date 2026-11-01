import { MongoClient, ObjectId } from 'mongodb';

// Ensure Google DNS resolution for restrictive Windows / cloud environments
if (typeof process !== 'undefined') {
  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    // browser or edge runtime
  }
}

function getValidMongoUri(): string {
  const DEFAULT_URI =
    'mongodb+srv://gk1204kr:GbxiGEitN2W2p1U3@cluster0.yxtklsn.mongodb.net/kalipujaparora?retryWrites=true&w=majority';

  // Check MONGO_URL first, then DATABASE_URL
  const candidates = [process.env.MONGO_URL, process.env.DATABASE_URL];
  for (const cand of candidates) {
    if (cand && typeof cand === 'string') {
      const trimmed = cand.trim();
      if (trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://')) {
        return trimmed;
      }
    }
  }

  return DEFAULT_URI;
}

// Global connection caching across serverless invocations (Next.js & Vercel)
const globalForMongo = global as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoDb?: any;
};

export async function getDb() {
  if (globalForMongo._mongoDb) {
    return globalForMongo._mongoDb;
  }

  const uri = getValidMongoUri();

  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      retryWrites: true,
    });
    globalForMongo._mongoClientPromise = client.connect();
  }

  const connectedClient = await globalForMongo._mongoClientPromise;
  globalForMongo._mongoDb = connectedClient.db('kalipujaparora');
  return globalForMongo._mongoDb;
}

/**
 * Normalizes MongoDB documents: _id -> id
 */
export function normalizeDoc(doc: any): any {
  if (!doc) return null;
  if (Array.isArray(doc)) return doc.map(normalizeDoc);
  const { _id, ...rest } = doc;
  return {
    id: _id ? _id.toString() : doc.id,
    ...rest,
  };
}

/**
 * Normalizes input ID into string or ObjectId
 */
function toMongoId(val: any): any {
  if (typeof val === 'string' && ObjectId.isValid(val)) {
    return new ObjectId(val);
  }
  return val;
}

/**
 * Converts Prisma-like `where` filter into MongoDB query object
 */
export function buildMongoFilter(where: any = {}): any {
  if (!where) return {};
  const filter: any = {};

  for (const [key, val] of Object.entries(where)) {
    if (val === undefined) continue;

    if (key === 'id') {
      if (typeof val === 'string') {
        filter._id = toMongoId(val);
      } else if (typeof val === 'object' && val !== null) {
        if ((val as any).in && Array.isArray((val as any).in)) {
          filter._id = { $in: (val as any).in.map(toMongoId) };
        }
      } else {
        filter._id = val;
      }
    } else if (key.includes('_') && typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date)) {
      // Handles Prisma composite unique keys, e.g. budgetId_categoryId: { budgetId: '...', categoryId: '...' }
      const isOperator = Object.keys(val).some((k) =>
        ['in', 'nin', 'gte', 'lte', 'gt', 'lt', 'contains', 'mode', 'not'].includes(k)
      );
      if (!isOperator) {
        for (const [subKey, subVal] of Object.entries(val)) {
          if (subKey.endsWith('Id') && typeof subVal === 'string' && ObjectId.isValid(subVal)) {
            filter[subKey] = { $in: [subVal, new ObjectId(subVal)] };
          } else {
            filter[subKey] = subVal;
          }
        }
        continue;
      }
    } else if (key.endsWith('Id') && typeof val === 'string' && ObjectId.isValid(val)) {
      // Handles foreign keys stored as ObjectId or string
      filter[key] = { $in: [val, new ObjectId(val)] };
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val) && !(val instanceof Date)) {
      const conditionObj: any = {};
      const obj = val as Record<string, any>;

      if (obj.in && Array.isArray(obj.in)) {
        conditionObj.$in = obj.in;
      }
      if (obj.notIn && Array.isArray(obj.notIn)) {
        conditionObj.$nin = obj.notIn;
      }
      if (obj.gte !== undefined) conditionObj.$gte = obj.gte;
      if (obj.lte !== undefined) conditionObj.$lte = obj.lte;
      if (obj.gt !== undefined) conditionObj.$gt = obj.gt;
      if (obj.lt !== undefined) conditionObj.$lt = obj.lt;
      if (obj.contains !== undefined) {
        conditionObj.$regex = obj.contains;
        conditionObj.$options = obj.mode === 'insensitive' ? 'i' : '';
      }
      if (obj.not !== undefined) {
        conditionObj.$ne = obj.not;
      }

      if (Object.keys(conditionObj).length > 0) {
        filter[key] = conditionObj;
      } else {
        filter[key] = val;
      }
    } else {
      filter[key] = val;
    }
  }

  return filter;
}

/**
 * Converts Prisma-like `orderBy` into MongoDB sort object
 */
export function buildMongoSort(orderBy: any): any {
  if (!orderBy) return undefined;
  const sort: any = {};

  if (Array.isArray(orderBy)) {
    for (const item of orderBy) {
      for (const [k, v] of Object.entries(item)) {
        sort[k] = v === 'desc' ? -1 : 1;
      }
    }
  } else if (typeof orderBy === 'object') {
    for (const [k, v] of Object.entries(orderBy)) {
      sort[k] = v === 'desc' ? -1 : 1;
    }
  }

  return sort;
}

/**
 * Hydrates relational data for `include`
 */
async function hydrateRelations(database: any, collectionName: string, doc: any, include: any): Promise<any> {
  if (!doc || !include) return doc;

  // 1. Hydrate Category (Expense, Bill, BudgetAllocation -> ExpenseCategory; Event -> EventCategory)
  if (include.category) {
    const isExpenseRel = ['Expense', 'Bill', 'BudgetAllocation'].includes(collectionName);
    const catColl = isExpenseRel ? 'ExpenseCategory' : 'EventCategory';
    const defaultNameHindi = isExpenseRel ? 'सामान्य व्यय' : 'सामान्य कार्यक्रम';

    if (doc.categoryId) {
      const cat = await database.collection(catColl).findOne({
        _id: toMongoId(doc.categoryId),
      });
      doc.category = normalizeDoc(cat) || {
        id: String(doc.categoryId),
        name: 'General',
        nameHindi: defaultNameHindi,
        slug: 'general',
      };
    } else {
      doc.category = {
        id: 'default',
        name: 'General',
        nameHindi: defaultNameHindi,
        slug: 'general',
      };
    }
  }

  // 2. Hydrate Vendor for Expense / Bill
  if (include.vendor) {
    if (doc.vendorId) {
      const v = await database.collection('Vendor').findOne({
        _id: toMongoId(doc.vendorId),
      });
      doc.vendor = normalizeDoc(v);
    } else {
      doc.vendor = null;
    }
  }

  // 3. Hydrate FestivalYear
  if (include.festivalYear && doc.festivalYearId) {
    const fy = await database.collection('FestivalYear').findOne({
      _id: toMongoId(doc.festivalYearId),
    });
    doc.festivalYear = normalizeDoc(fy);
  }

  // 4. Hydrate Event for Registration
  if (include.event && doc.eventId) {
    const ev = await database.collection('Event').findOne({
      _id: toMongoId(doc.eventId),
    });
    const normEv = normalizeDoc(ev);
    if (normEv) {
      if (include.event?.include?.category || !normEv.category) {
        if (normEv.categoryId) {
          const cat = await database.collection('EventCategory').findOne({
            _id: toMongoId(normEv.categoryId),
          });
          normEv.category = normalizeDoc(cat) || { name: 'General', nameHindi: 'सामान्य कार्यक्रम' };
        } else {
          normEv.category = { name: 'General', nameHindi: 'सामान्य कार्यक्रम' };
        }
      }
    }
    doc.event = normEv;
  }

  // 5. Hydrate Registrations for Event
  if (include.registrations) {
    const regs = await database.collection('EventRegistration').find({
      eventId: { $in: [doc.id, toMongoId(doc.id)] },
    }).toArray();
    doc.registrations = normalizeDoc(regs) || [];
  }

  // 6. Hydrate Players for Kabaddi Team
  if (include.players) {
    const players = await database
      .collection('KabaddiPlayer')
      .find({
        $or: [
          { teamId: doc.id },
          { teamId: String(doc.id) },
          { teamId: toMongoId(doc.id) },
        ],
      })
      .toArray();
    doc.players = normalizeDoc(players) || [];
  }

  // 7. Hydrate Teams for Kabaddi Match
  if (include.teamA && doc.teamAId) {
    const teamA = await database.collection('KabaddiTeam').findOne({
      _id: toMongoId(doc.teamAId),
    });
    doc.teamA = normalizeDoc(teamA);
  }
  if (include.teamB && doc.teamBId) {
    const teamB = await database.collection('KabaddiTeam').findOne({
      _id: toMongoId(doc.teamBId),
    });
    doc.teamB = normalizeDoc(teamB);
  }

  // 8. Hydrate Media for Gallery
  if (include.media) {
    let cursor = database.collection('GalleryMedia').find({
      galleryId: { $in: [doc.id, toMongoId(doc.id)] },
    });
    if (include.media.take) {
      cursor = cursor.limit(include.media.take);
    }
    const media = await cursor.toArray();
    doc.media = normalizeDoc(media) || [];
  }

  // 9. Hydrate BudgetAllocations for ExpenseCategory
  if (include.budgetAllocations) {
    const allocs = await database.collection('BudgetAllocation').find({
      categoryId: { $in: [doc.id, toMongoId(doc.id)] },
    }).toArray();
    doc.budgetAllocations = normalizeDoc(allocs) || [];
  }

  // 10. Hydrate Expenses for ExpenseCategory
  if (include.expenses && collectionName === 'ExpenseCategory') {
    const exps = await database.collection('Expense').find({
      categoryId: { $in: [doc.id, toMongoId(doc.id)] },
    }).toArray();
    doc.expenses = normalizeDoc(exps) || [];
  }

  // 11. Hydrate Bills for Expense
  if (include.bills) {
    const bills = await database.collection('Bill').find({
      expenseId: { $in: [doc.id, toMongoId(doc.id)] },
    }).toArray();
    doc.bills = normalizeDoc(bills) || [];
  }

  // 12. Hydrate Team for Kabaddi Player
  if (include.team && doc.teamId) {
    const team = await database.collection('KabaddiTeam').findOne({
      $or: [
        { _id: toMongoId(doc.teamId) },
        { id: String(doc.teamId) },
      ],
    });
    doc.team = normalizeDoc(team) || { teamName: 'टीम' };
  }

  // 12. Hydrate Festival Year Children (events, matches, achievements, sponsors, donations, galleries, expenses)
  if (collectionName === 'FestivalYear') {
    const yearIdFilter = { festivalYearId: { $in: [doc.id, toMongoId(doc.id)] } };

    if (include.events) {
      let cursor = database.collection('Event').find(yearIdFilter);
      if (include.events.take) cursor = cursor.limit(include.events.take);
      const events = await cursor.toArray();
      const normEvents = normalizeDoc(events) || [];
      // Always hydrate event categories safely
      for (const ev of normEvents) {
        if (ev.categoryId) {
          const cat = await database.collection('EventCategory').findOne({ _id: toMongoId(ev.categoryId) });
          ev.category = normalizeDoc(cat) || { name: 'General', nameHindi: 'सामान्य कार्यक्रम' };
        } else {
          ev.category = { name: 'General', nameHindi: 'सामान्य कार्यक्रम' };
        }
      }
      doc.events = normEvents;
    }

    if (include.kabaddiMatches) {
      let cursor = database.collection('KabaddiMatch').find(yearIdFilter);
      if (include.kabaddiMatches.take) cursor = cursor.limit(include.kabaddiMatches.take);
      const matches = await cursor.toArray();
      const normMatches = normalizeDoc(matches) || [];
      if (include.kabaddiMatches.include?.teamA || include.kabaddiMatches.include?.teamB) {
        for (const m of normMatches) {
          if (m.teamAId) {
            const tA = await database.collection('KabaddiTeam').findOne({ _id: toMongoId(m.teamAId) });
            m.teamA = normalizeDoc(tA);
          }
          if (m.teamBId) {
            const tB = await database.collection('KabaddiTeam').findOne({ _id: toMongoId(m.teamBId) });
            m.teamB = normalizeDoc(tB);
          }
        }
      }
      doc.kabaddiMatches = normMatches;
    }

    if (include.studentAchievements) {
      let cursor = database.collection('StudentAchievement').find(yearIdFilter);
      if (include.studentAchievements.take) cursor = cursor.limit(include.studentAchievements.take);
      const achievements = await cursor.toArray();
      doc.studentAchievements = normalizeDoc(achievements) || [];
    }

    if (include.sponsors) {
      let cursor = database.collection('Sponsor').find(yearIdFilter);
      if (include.sponsors.take) cursor = cursor.limit(include.sponsors.take);
      const sponsors = await cursor.toArray();
      doc.sponsors = normalizeDoc(sponsors) || [];
    }

    if (include.donations) {
      let cursor = database.collection('Donation').find(yearIdFilter);
      if (include.donations.take) cursor = cursor.limit(include.donations.take);
      const donations = await cursor.toArray();
      doc.donations = normalizeDoc(donations) || [];
    }

    if (include.expenses) {
      let cursor = database.collection('Expense').find(yearIdFilter);
      if (include.expenses.take) cursor = cursor.limit(include.expenses.take);
      const expenses = await cursor.toArray();
      const normExp = normalizeDoc(expenses) || [];
      for (const e of normExp) {
        if (e.categoryId) {
          const cat = await database.collection('ExpenseCategory').findOne({ _id: toMongoId(e.categoryId) });
          e.category = normalizeDoc(cat) || { name: 'General', nameHindi: 'सामान्य व्यय' };
        } else {
          e.category = { name: 'General', nameHindi: 'सामान्य व्यय' };
        }
      }
      doc.expenses = normExp;
    }

    if (include.galleries) {
      let cursor = database.collection('Gallery').find(yearIdFilter);
      if (include.galleries.take) cursor = cursor.limit(include.galleries.take);
      const galleries = await cursor.toArray();
      const normGalleries = normalizeDoc(galleries) || [];
      if (include.galleries.include?.media) {
        for (const g of normGalleries) {
          const media = await database.collection('GalleryMedia').find({ galleryId: { $in: [g._id, g._id.toString()] } }).limit(1).toArray();
          g.media = normalizeDoc(media) || [];
        }
      }
      doc.galleries = normGalleries;
    }

    if (include.announcements) {
      let cursor = database.collection('Announcement').find(yearIdFilter);
      if (include.announcements.take) cursor = cursor.limit(include.announcements.take);
      const announcements = await cursor.toArray();
      doc.announcements = normalizeDoc(announcements) || [];
    }
  }

  return doc;
}

/**
 * Creates a collection handler mimicking Prisma Client API with pure native MongoDB calls
 */
function createCollectionHandler(collectionName: string) {
  return {
    async findUnique({ where, include, select }: any = {}) {
      const database = await getDb();
      const filter = buildMongoFilter(where);
      const doc = await database.collection(collectionName).findOne(filter);
      const normalized = normalizeDoc(doc);
      if (normalized && include) {
        await hydrateRelations(database, collectionName, normalized, include);
      }
      return normalized;
    },

    async findFirst({ where, include, orderBy }: any = {}) {
      const database = await getDb();
      const filter = buildMongoFilter(where);
      const sort = buildMongoSort(orderBy);
      let cursor = database.collection(collectionName).find(filter);
      if (sort) cursor = cursor.sort(sort);
      const doc = await cursor.limit(1).next();
      const normalized = normalizeDoc(doc);
      if (normalized && include) {
        await hydrateRelations(database, collectionName, normalized, include);
      }
      return normalized;
    },

    async findMany({ where, include, orderBy, take, skip, select }: any = {}) {
      const database = await getDb();
      const filter = buildMongoFilter(where);
      const sort = buildMongoSort(orderBy);
      let cursor = database.collection(collectionName).find(filter);
      if (sort) cursor = cursor.sort(sort);
      if (skip) cursor = cursor.skip(skip);
      if (take) cursor = cursor.limit(take);
      const docs = await cursor.toArray();
      const normalized = normalizeDoc(docs);

      if (include && Array.isArray(normalized)) {
        for (const item of normalized) {
          await hydrateRelations(database, collectionName, item, include);
        }
      }

      return normalized;
    },

    async create({ data, select, include }: any = {}) {
      const database = await getDb();
      const insertData = { ...data };
      if (!insertData.createdAt) insertData.createdAt = new Date();
      if (!insertData.updatedAt) insertData.updatedAt = new Date();
      const result = await database.collection(collectionName).insertOne(insertData);
      const created = { id: result.insertedId.toString(), ...insertData };
      if (include) {
        await hydrateRelations(database, collectionName, created, include);
      }
      return created;
    },

    async createMany({ data }: any = {}) {
      const database = await getDb();
      const items = Array.isArray(data) ? data : [data];
      const withDates = items.map((item: any) => ({
        ...item,
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date(),
      }));
      const result = await database.collection(collectionName).insertMany(withDates);
      return { count: result.insertedCount };
    },

    async update({ where, data, include }: any = {}) {
      const database = await getDb();
      const filter = buildMongoFilter(where);
      const setFields: any = { updatedAt: new Date() };
      const incFields: any = {};

      for (const [k, v] of Object.entries(data || {})) {
        if (k === 'id' || k === '_id' || v === undefined) continue;
        if (v && typeof v === 'object' && 'increment' in (v as any)) {
          incFields[k] = (v as any).increment;
        } else if (v && typeof v === 'object' && 'decrement' in (v as any)) {
          incFields[k] = -(v as any).decrement;
        } else {
          setFields[k] = v;
        }
      }

      const updateOp: any = { $set: setFields };
      if (Object.keys(incFields).length > 0) {
        updateOp.$inc = incFields;
      }

      await database.collection(collectionName).updateOne(filter, updateOp);
      const updated = await database.collection(collectionName).findOne(filter);
      const normalized = normalizeDoc(updated);
      if (normalized && include) {
        await hydrateRelations(database, collectionName, normalized, include);
      }
      return normalized;
    },

    async updateMany({ where, data }: any = {}) {
      const database = await getDb();
      const filter = buildMongoFilter(where);
      const updateData = { ...data, updatedAt: new Date() };
      delete updateData.id;
      delete updateData._id;

      const result = await database.collection(collectionName).updateMany(filter, { $set: updateData });
      return { count: result.modifiedCount };
    },

    async delete({ where }: any = {}) {
      const database = await getDb();
      const filter = buildMongoFilter(where);
      const existing = await database.collection(collectionName).findOne(filter);
      await database.collection(collectionName).deleteOne(filter);
      return normalizeDoc(existing);
    },

    async deleteMany({ where = {} }: any = {}) {
      const database = await getDb();
      const filter = buildMongoFilter(where);
      const res = await database.collection(collectionName).deleteMany(filter);
      return { count: res.deletedCount };
    },

    async count({ where }: any = {}) {
      const database = await getDb();
      const filter = buildMongoFilter(where);
      return await database.collection(collectionName).countDocuments(filter);
    },

    async upsert({ where, update, create }: any = {}) {
      const database = await getDb();
      const filter = buildMongoFilter(where);
      const existing = await database.collection(collectionName).findOne(filter);
      if (existing) {
        const updateData = { ...update, updatedAt: new Date() };
        delete updateData.id;
        delete updateData._id;
        await database.collection(collectionName).updateOne(filter, { $set: updateData });
        const updated = await database.collection(collectionName).findOne(filter);
        return normalizeDoc(updated);
      } else {
        const insertData = { ...create, createdAt: new Date(), updatedAt: new Date() };
        const result = await database.collection(collectionName).insertOne(insertData);
        return { id: result.insertedId.toString(), ...insertData };
      }
    },
  };
}

// Maps model keys to MongoDB collection names
const COLLECTION_MAPPING: Record<string, string> = {
  user: 'User',
  auditLog: 'AuditLog',
  websiteSetting: 'WebsiteSetting',
  festivalYear: 'FestivalYear',
  eventCategory: 'EventCategory',
  event: 'Event',
  eventRegistration: 'EventRegistration',
  kabaddiTeam: 'KabaddiTeam',
  kabaddiPlayer: 'KabaddiPlayer',
  kabaddiMatch: 'KabaddiMatch',
  studentAchievement: 'StudentAchievement',
  sponsor: 'Sponsor',
  donation: 'Donation',
  expenseCategory: 'ExpenseCategory',
  incomeCategory: 'IncomeCategory',
  vendor: 'Vendor',
  expense: 'Expense',
  bill: 'Bill',
  payment: 'Payment',
  budget: 'Budget',
  budgetAllocation: 'BudgetAllocation',
  cashLedger: 'CashLedger',
  bankLedger: 'BankLedger',
  financialTransaction: 'FinancialTransaction',
  ledgerEntry: 'LedgerEntry',
  gallery: 'Gallery',
  galleryMedia: 'GalleryMedia',
  announcement: 'Announcement',
  notice: 'Notice',
  quizQuestion: 'QuizQuestion',
  pollVote: 'PollVote',
  committeeMember: 'CommitteeMember',
  volunteer: 'Volunteer',
  cmsBanner: 'CmsBanner',
  cmsContentSection: 'CmsContentSection',
};

/**
 * Pure Native MongoDB Client
 * Replaces Prisma entirely with 100% native driver calls
 */
export const mongodb = new Proxy(
  {},
  {
    get(target, prop) {
      if (typeof prop !== 'string') return (target as any)[prop];

      if (prop === '$disconnect') {
        return async () => {
          if (globalForMongo._mongoClientPromise) {
            const cl = await globalForMongo._mongoClientPromise;
            await cl.close();
            delete globalForMongo._mongoClientPromise;
            delete globalForMongo._mongoDb;
          }
        };
      }

      if (prop === '$connect') {
        return async () => {
          await getDb();
        };
      }

      if (prop === '$transaction') {
        return async (arg: any) => {
          if (typeof arg === 'function') {
            return await arg(mongodb);
          }
          if (Array.isArray(arg)) {
            return await Promise.all(arg);
          }
          return arg;
        };
      }

      const collectionName =
        COLLECTION_MAPPING[prop] ||
        (COLLECTION_MAPPING[prop.toLowerCase()] ?? prop.charAt(0).toUpperCase() + prop.slice(1));

      return createCollectionHandler(collectionName);
    },
  }
) as any;

export default mongodb;

