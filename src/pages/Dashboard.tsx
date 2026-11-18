import { useEffect, useState } from 'react';
import { getIssues, getStats, getDepartments, updateIssueStatus } from '../lib/api';
import { Issue, StatsOverview, Department } from '../lib/types';
import StatsCard from '../components/StatsCard';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { AlertTriangle, CheckCircle2, Clock, Layers, TrendingUp, Building2 } from 'lucide-react';

export default function Dashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [depts, setDepts] = useState<Department[]>([]);
  const [tab, setTab] = useState<'issues'|'departments'>('issues');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getIssues().then(setIssues);
    getStats().then(setStats);
    getDepartments().then(setDepts);
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updateIssueStatus(id, status);
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: status as any } : i));
  };

  const filtered = filter ? issues.filter(i => i.status === filter) : issues;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Operations Dashboard</h1>
        <p className="text-gray-500">City-wide issue management and department overview</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Open Issues" value={stats.open} icon={AlertTriangle} color="orange" sub="Need attention" />
          <StatsCard label="In Progress" value={stats.in_progress} icon={Clock} color="blue" sub="Being resolved" />
          <StatsCard label="Resolved" value={stats.resolved.toLocaleString()} icon={CheckCircle2} color="green" sub="All time" />
          <StatsCard label="Avg Resolution" value={`${stats.avg_resolution_days}d`} icon={TrendingUp} color="blue" sub="Down 40% YoY" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {['issues', 'departments'].map(t => (
          <button key={t} onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{t}</button>
        ))}
      </div>

      {tab === 'issues' && (
        <>
          {/* Filter row */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[['', 'All'], ['open', 'Open'], ['in_progress', 'In Progress'], ['resolved', 'Resolved']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`text-sm px-3 py-1.5 rounded-lg border transition-all font-medium ${
                  filter === v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}>{l}</button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Issue', 'Location', 'Category', 'Priority', 'Status', 'Votes', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(issue => (
                    <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 max-w-xs truncate">{issue.title}</p>
                        <p className="text-xs text-gray-400">{issue.department}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{issue.location}</td>
                      <td className="px-4 py-3 capitalize text-gray-600 text-xs">{issue.category}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={issue.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                      <td className="px-4 py-3 text-gray-700 font-bold">{issue.votes}</td>
                      <td className="px-4 py-3">
                        <select value={issue.status} onChange={e => handleStatusChange(issue.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'departments' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depts.map(d => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{d.name}</h3>
                  <p className="text-xs text-gray-500">{d.head}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-extrabold text-orange-600">{d.open_issues}</p>
                  <p className="text-xs text-gray-500">Open</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-extrabold text-green-600">{d.resolved_issues}</p>
                  <p className="text-xs text-gray-500">Resolved</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">{d.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
