import type { Report } from '@/lib/types';
import { DEPARTMENTS, STATUS_CONFIG } from '@/lib/constants';
import { formatDate, timeAgo, mapLink } from '@/lib/geo';
import { MapPin, Clock } from 'lucide-react';

interface Props {
  report: Report;
  showStatusSelector?: boolean;
  onStatusChange?: (id: string, status: Report['status']) => void;
}

export default function ReportCard({
  report,
  showStatusSelector,
  onStatusChange,
}: Props) {
  const dept = DEPARTMENTS.find((d) => d.key === report.department);
  const statusCfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG['Pending'];
  const Icon = dept?.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-3 p-3">
        <img
          src={report.photo_url}
          alt={report.department}
          className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${dept?.bgColor ?? 'bg-slate-100'} ${dept?.textColor ?? 'text-slate-700'} ${dept?.borderColor ?? 'border-slate-200'}`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {report.department}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusCfg.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
              {statusCfg.label}
            </span>
          </div>

          <a
            href={mapLink(report.latitude, report.longitude)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-start gap-1 text-sm text-slate-600 hover:text-slate-900"
          >
            <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
            <span className="line-clamp-2">{report.address}</span>
          </a>

          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            {formatDate(report.created_at)} · {timeAgo(report.created_at)}
          </p>
        </div>
      </div>

      {showStatusSelector && onStatusChange && (
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-2.5">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
            Update status
            <select
              value={report.status}
              onChange={(e) =>
                onStatusChange(report.id, e.target.value as Report['status'])
              }
              className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
