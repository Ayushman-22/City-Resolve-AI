import { LucideIcon } from 'lucide-react';

interface Props { label: string; value: string | number; sub?: string; icon: LucideIcon; color?: string; }

export default function StatsCard({ label, value, sub, icon: Icon, color = 'blue' }: Props) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
