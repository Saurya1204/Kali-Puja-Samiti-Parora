import React from 'react';
import prisma from '@/lib/prisma';
import { formatDateTime } from '@/lib/utils';
import { History, Shield, User, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-amber-900/40 pb-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 block">
          Immutable Activity Trail & Security Logs
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-200 font-serif">
          प्रशासनिक ऑडिट लॉग्स (System Audit Trail)
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          वित्तीय लेनदेन, व्यय संपादन, छात्र सत्यापन, स्कोर संशोधन एवं उपयोगकर्ता गतिविधियों का अपरिवर्तनीय इतिहास
        </p>
      </div>

      <div className="bg-black/50 border border-amber-600/30 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-amber-900/60 bg-maroon-950/80 text-amber-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-4">समय (Timestamp)</th>
                <th className="py-3 px-4">उपयोगकर्ता (User)</th>
                <th className="py-3 px-4">मॉड्यूल (Module)</th>
                <th className="py-3 px-4">कार्रवाई (Action)</th>
                <th className="py-3 px-4">विवरण (Details)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-950/60 text-stone-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-amber-500/5">
                  <td className="py-3 px-4 font-mono text-stone-400">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-200">
                    {log.userName || 'System'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-stone-300 text-xs">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

