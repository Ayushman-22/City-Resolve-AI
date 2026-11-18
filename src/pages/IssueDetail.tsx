import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getIssueById, voteIssue, updateIssueStatus } from '../lib/api';
import { Issue } from '../lib/types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { ArrowLeft, MapPin, ThumbsUp, Clock, User, Building2 } from 'lucide-react';

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(0);

  useEffect(() => {
    if (id) getIssueById(id).then(d => { setIssue(d); if (d) setVotes(d.votes); });
  }, [id]);

  const handleVote = async () => {
    if (!issue || voted) return;
    await voteIssue(issue.id);
    setVotes(v => v + 1);
    setVoted(true);
  };

  if (!issue) return <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading...</div>;

  const categoryIcons: Record<string, string> = {
    roads: '🚧', sanitation: '🗑️', lighting: '💡', parks: '🌳',
    water: '💧', electricity: '⚡', noise: '🔊', other: '📋',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to issues
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
              {categoryIcons[issue.category] || '📋'}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h1 className="text-xl font-extrabold text-gray-900">{issue.title}</h1>
                <StatusBadge status={issue.status} />
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={11} />{issue.location}</span>
                <span className="flex items-center gap-1"><Building2 size={11} />{issue.department}</span>
                <span className="flex items-center gap-1"><User size={11} />{issue.reporter_name}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{new Date(issue.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 leading-relaxed mb-6">{issue.description}</p>

          <div className="flex items-center gap-3 mb-6">
            <PriorityBadge priority={issue.priority} />
            <span className="text-xs text-gray-400">#{issue.id}</span>
          </div>

          <button onClick={handleVote} disabled={voted}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
              voted ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600'
            }`}>
            <ThumbsUp size={16} /> {voted ? 'Voted!' : 'Upvote'} <span className="font-extrabold">{votes}</span>
          </button>
        </div>

        {/* Timeline */}
        <div className="px-6 pb-6">
          <h3 className="font-bold text-gray-900 mb-4">Status Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Issue Reported</p>
                <p className="text-xs text-gray-400">{new Date(issue.created_at).toLocaleString()}</p>
              </div>
            </div>
            {issue.status !== 'open' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Assigned to {issue.department}</p>
                  <p className="text-xs text-gray-400">{new Date(issue.updated_at).toLocaleString()}</p>
                </div>
              </div>
            )}
            {issue.resolved_at && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Resolved</p>
                  <p className="text-xs text-gray-400">{new Date(issue.resolved_at).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        {issue.comments && issue.comments.length > 0 && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-5">
            <h3 className="font-bold text-gray-900 mb-4">Department Updates</h3>
            <div className="space-y-3">
              {issue.comments.map(c => (
                <div key={c.id} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-700">{c.author}</span>
                    <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
