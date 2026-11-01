import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, createAuditLog, ROLES } from '@/lib/auth';
import { DEFAULT_ROLES, RoleConfig, ADMIN_SECTIONS } from '@/lib/rolePermissions';

const ROLES_SETTING_KEY = 'ROLE_PERMISSIONS_CONFIG';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const setting = await prisma.websiteSetting.findUnique({
      where: { key: ROLES_SETTING_KEY },
    });

    let roles: RoleConfig[] = DEFAULT_ROLES;
    if (setting?.value) {
      try {
        roles = JSON.parse(setting.value);
      } catch {
        roles = DEFAULT_ROLES;
      }
    }

    // Ensure SUPER_ADMIN always has all modules
    const superAdminRole = roles.find((r) => r.key === 'SUPER_ADMIN');
    if (superAdminRole) {
      superAdminRole.visibleModules = ADMIN_SECTIONS.map((s) => s.id);
    }

    return NextResponse.json({ success: true, roles, sections: ADMIN_SECTIONS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'केवल सुपर एडमिन ही रोल्स एवं अनुमतियां बदल सकते हैं' }, { status: 403 });
    }

    const body = await req.json();
    const { action, roleData, roles: newRolesList } = body;

    // Load current roles
    const setting = await prisma.websiteSetting.findUnique({
      where: { key: ROLES_SETTING_KEY },
    });
    let currentRoles: RoleConfig[] = DEFAULT_ROLES;
    if (setting?.value) {
      try {
        currentRoles = JSON.parse(setting.value);
      } catch {
        currentRoles = DEFAULT_ROLES;
      }
    }

    if (action === 'RESET_DEFAULTS') {
      await prisma.websiteSetting.upsert({
        where: { key: ROLES_SETTING_KEY },
        update: { value: JSON.stringify(DEFAULT_ROLES) },
        create: {
          key: ROLES_SETTING_KEY,
          value: JSON.stringify(DEFAULT_ROLES),
          description: 'Dynamic Role definitions and section visibility mapping',
        },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'RESET_ROLES_PERMISSIONS',
        module: 'ROLES',
        details: `${user.name} reset all role permissions to system defaults`,
      });

      return NextResponse.json({ success: true, roles: DEFAULT_ROLES });
    }

    if (action === 'CREATE_ROLE') {
      const { key, name, nameHindi, description, color, visibleModules } = roleData;
      const formattedKey = key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');

      if (!formattedKey) {
        return NextResponse.json({ error: 'रोल कोड / Key आवश्यक है' }, { status: 400 });
      }

      if (currentRoles.some((r) => r.key === formattedKey)) {
        return NextResponse.json({ error: `रोल '${formattedKey}' पहले से मौजूद है` }, { status: 400 });
      }

      const newRole: RoleConfig = {
        key: formattedKey,
        name: name.trim() || formattedKey,
        nameHindi: nameHindi.trim() || name.trim() || formattedKey,
        description: description.trim() || 'कस्टम प्रशासनिक भूमिका',
        color: color || 'bg-stone-800 text-stone-200 border-stone-600',
        isSystem: false,
        visibleModules: Array.isArray(visibleModules) ? visibleModules : ['/admin'],
      };

      const updatedList = [...currentRoles, newRole];
      await prisma.websiteSetting.upsert({
        where: { key: ROLES_SETTING_KEY },
        update: { value: JSON.stringify(updatedList) },
        create: {
          key: ROLES_SETTING_KEY,
          value: JSON.stringify(updatedList),
          description: 'Dynamic Role definitions and section visibility mapping',
        },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'CREATE_ROLE',
        module: 'ROLES',
        details: `${user.name} created role "${newRole.name}" (${newRole.key}) with ${newRole.visibleModules.length} visible sections`,
      });

      return NextResponse.json({ success: true, roles: updatedList });
    }

    if (action === 'UPDATE_ROLE') {
      const { key, name, nameHindi, description, color, visibleModules } = roleData;

      const idx = currentRoles.findIndex((r) => r.key === key);
      if (idx === -1) {
        return NextResponse.json({ error: 'रोल नहीं मिला' }, { status: 404 });
      }

      const existing = currentRoles[idx];
      const updatedRole: RoleConfig = {
        ...existing,
        name: name?.trim() || existing.name,
        nameHindi: nameHindi?.trim() || existing.nameHindi,
        description: description?.trim() ?? existing.description,
        color: color || existing.color,
        visibleModules:
          existing.key === 'SUPER_ADMIN'
            ? ADMIN_SECTIONS.map((s) => s.id)
            : Array.isArray(visibleModules)
            ? visibleModules
            : existing.visibleModules,
      };

      currentRoles[idx] = updatedRole;

      await prisma.websiteSetting.upsert({
        where: { key: ROLES_SETTING_KEY },
        update: { value: JSON.stringify(currentRoles) },
        create: {
          key: ROLES_SETTING_KEY,
          value: JSON.stringify(currentRoles),
          description: 'Dynamic Role definitions and section visibility mapping',
        },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'UPDATE_ROLE',
        module: 'ROLES',
        details: `${user.name} updated role "${updatedRole.name}" (${updatedRole.key}) and section visibility`,
      });

      return NextResponse.json({ success: true, roles: currentRoles });
    }

    if (action === 'DELETE_ROLE') {
      const roleKey = roleData?.key;
      if (!roleKey) return NextResponse.json({ error: 'रोल Key आवश्यक है' }, { status: 400 });

      if (roleKey === 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Super Admin रोल को हटाया नहीं जा सकता' }, { status: 400 });
      }

      // Check if any user is currently assigned this role
      const userCount = await prisma.user.count({ where: { role: roleKey } });
      if (userCount > 0) {
        return NextResponse.json(
          { error: `यह रोल ${userCount} उपयोगकर्ताओं को आवंटित है। पहले उनके रोल बदलें।` },
          { status: 400 }
        );
      }

      const filteredList = currentRoles.filter((r) => r.key !== roleKey);
      await prisma.websiteSetting.upsert({
        where: { key: ROLES_SETTING_KEY },
        update: { value: JSON.stringify(filteredList) },
        create: {
          key: ROLES_SETTING_KEY,
          value: JSON.stringify(filteredList),
          description: 'Dynamic Role definitions and section visibility mapping',
        },
      });

      await createAuditLog({
        userId: user.id,
        userName: user.name,
        action: 'DELETE_ROLE',
        module: 'ROLES',
        details: `${user.name} deleted role "${roleKey}"`,
      });

      return NextResponse.json({ success: true, roles: filteredList });
    }

    if (newRolesList && Array.isArray(newRolesList)) {
      await prisma.websiteSetting.upsert({
        where: { key: ROLES_SETTING_KEY },
        update: { value: JSON.stringify(newRolesList) },
        create: {
          key: ROLES_SETTING_KEY,
          value: JSON.stringify(newRolesList),
          description: 'Dynamic Role definitions and section visibility mapping',
        },
      });

      return NextResponse.json({ success: true, roles: newRolesList });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

