import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
import { z } from 'zod';

const BannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'बैनर शीर्षक आवश्यक है'),
  subtitle: z.string().optional().nullable(),
  page: z.enum(['HOMEPAGE', 'KABADDI', 'ABOUT', 'EVENTS', 'GALLERY']).default('HOMEPAGE'),
  bannerType: z.enum(['HERO_SLIDER', 'PROMO_BANNER', 'POPUP_ALERT', 'SPOTLIGHT']).default('HERO_SLIDER'),
  imageUrl: z.string().min(3, 'इमेज URL आवश्यक है'),
  linkUrl: z.string().optional().nullable(),
  buttonText: z.string().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');

    const banners = await prisma.cmsBanner.findMany({
      where: page ? { page } : {},
      orderBy: { sortOrder: 'asc' },
    });

    const sections = await prisma.cmsContentSection.findMany({
      orderBy: { sectionKey: 'asc' },
    });

    return NextResponse.json({ success: true, banners, sections });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.PRESIDENT) {
      return NextResponse.json({ error: 'केवल सुपर एडमिन ही CMS सामग्री प्रबंधित कर सकते हैं' }, { status: 403 });
    }

    const body = await req.json();

    if (body.action === 'SAVE_SECTION') {
      const section = await prisma.cmsContentSection.upsert({
        where: { sectionKey: body.sectionKey },
        create: {
          sectionKey: body.sectionKey,
          title: body.title,
          subtitle: body.subtitle,
          content: body.content,
          mediaUrl: body.mediaUrl,
          isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
        },
        update: {
          title: body.title,
          subtitle: body.subtitle,
          content: body.content,
          mediaUrl: body.mediaUrl,
          isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
        },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'UPDATE_CMS_SECTION',
        module: 'CMS',
        recordId: section.id,
        details: `${user.name} updated CMS section "${section.sectionKey}"`,
      });

      return NextResponse.json({ success: true, section });
    }

    // Default: SAVE_BANNER
    const validated = BannerSchema.parse(body);

    let banner;
    if (validated.id) {
      banner = await prisma.cmsBanner.update({
        where: { id: validated.id },
        data: validated,
      });
    } else {
      banner = await prisma.cmsBanner.create({
        data: validated,
      });
    }

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: validated.id ? 'UPDATE_CMS_BANNER' : 'CREATE_CMS_BANNER',
      module: 'CMS',
      recordId: banner.id,
      details: `${user.name} saved banner "${banner.title}" for ${banner.page}`,
    });

    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.errors?.[0]?.message || err.message || 'CMS सामग्री सहेजने में त्रुटि' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'केवल सुपर एडमिन ही बैनर हटा सकते हैं' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'बैनर ID आवश्यक है' }, { status: 400 });

    const banner = await prisma.cmsBanner.findUnique({ where: { id } });
    if (!banner) return NextResponse.json({ error: 'बैनर नहीं मिला' }, { status: 404 });

    await prisma.cmsBanner.delete({ where: { id } });

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      action: 'DELETE_CMS_BANNER',
      module: 'CMS',
      recordId: id,
      details: `${user.name} deleted CMS banner: "${banner.title}"`,
    });

    return NextResponse.json({ success: true, message: 'बैनर सफलतापूर्वक हटा दिया गया' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

