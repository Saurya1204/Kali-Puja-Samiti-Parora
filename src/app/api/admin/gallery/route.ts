import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, albumData, mediaData } = body;

    const activeYear = await prisma.festivalYear.findFirst({
      where: { isActive: true },
    });
    if (!activeYear) return NextResponse.json({ error: 'Active festival year not found' }, { status: 400 });

    if (action === 'CREATE_ALBUM') {
      const gallery = await prisma.gallery.create({
        data: {
          festivalYearId: activeYear.id,
          title: albumData.title,
          titleHindi: albumData.titleHindi,
          category: albumData.category || 'PUJA',
          coverImageUrl: albumData.coverImageUrl || 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80',
        },
      });

      // If initial photo provided
      if (albumData.coverImageUrl) {
        await prisma.galleryMedia.create({
          data: {
            galleryId: gallery.id,
            mediaType: 'IMAGE',
            mediaUrl: albumData.coverImageUrl,
            caption: albumData.titleHindi || albumData.title,
          },
        });
      }

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'CREATE_GALLERY_ALBUM',
        module: 'GALLERY',
        recordId: gallery.id,
        details: `${user.name} created photo album: ${gallery.title}`,
      });

      return NextResponse.json({ success: true, gallery });
    }

    if (action === 'ADD_MEDIA') {
      const media = await prisma.galleryMedia.create({
        data: {
          galleryId: mediaData.galleryId,
          mediaType: mediaData.mediaType || 'IMAGE',
          mediaUrl: mediaData.mediaUrl,
          caption: mediaData.caption,
        },
      });

      return NextResponse.json({ success: true, media });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

