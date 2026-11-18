import { IssueStatus, IssuePriority } from '../lib/types';

const statusMap: Record<IssueStatus, { label: string; cls: string }> = {
  open: { label: 'Open', cls: 'bg-orange-100 text-orange-700' },
  in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700' },
  resolved: { label: 'Resolved', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
};

const priorityMap: Record<IssuePriority, { label: string; cls: string }> = {
  low: { label: 'Low', cls: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', cls: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', cls: 'bg-red-100 text-red-700' },
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  const s = statusMap[status];
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const p = priorityMap[priority];
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.cls}`}>{p.label}</span>;
}
