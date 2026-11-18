import { useEffect, useState } from 'react';
import { getIssues } from '../lib/api';
import { Issue, IssueCategory, IssueStatus } from '../lib/types';
import IssueCard from '../components/IssueCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const categories: { value: string; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'roads', label: '🚧 Roads' },
  { value: 'sanitation', label: '🗑️ Sanitation' },
  { value: 'lighting', label: '💡 Lighting' },
  { value: 'parks', label: '🌳 Parks' },
  { value: 'water', label: '💧 Water' },
  { value: 'electricity', label: '⚡ Electricity' },
  { value: 'other', label: '📋 Other' },
];

const statuses: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<'newest'|'votes'|'priority'>('newest');

  useEffect(() => {
    getIssues().then(d => { setIssues(d); setLoading(false); });
  }, []);

  const filtered = issues
    .filter(i =>
      (!search || i.title.toLowerCase().includes(search.toLowerCase()) || i.location.toLowerCase().includes(search.toLowerCase())) &&
      (!category || i.category === category) &&
      (!status || i.status === status)
    )
    .sort((a, b) => {
      if (sort === 'votes') return b.votes - a.votes;
      if (sort === 'priority') {
        const p = { critical: 4, high: 3, medium: 2, low: 1 };
        return (p[b.priority] || 0) - (p[a.priority] || 0);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">All Issues</h1>
        <p className="text-gray-500">Browse and vote on civic issues in your city</p>
      </div>

      {/* FILTERS */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search issues..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as any)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="newest">Newest first</option>
          <option value="votes">Most voted</option>
          <option value="priority">Priority</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} issues</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">Loading issues...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No issues match your filters.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(issue => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      )}
    </div>
  );
}
