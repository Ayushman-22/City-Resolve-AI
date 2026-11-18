import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, Clock, User } from 'lucide-react';
import { Issue } from '../lib/types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { voteIssue } from '../lib/api';
import { useState } from 'react';

const categoryIcons: Record<string, string> = {
  roads: '🚧', sanitation: '🗑️', lighting: '💡', parks: '🌳',
  water: '💧', electricity: '⚡', noise: '🔊', other: '📋',
};

export default function IssueCard({ issue, onVote }: { issue: Issue; onVote?: () => void }) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(issue.votes);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (voted) return;
    await voteIssue(issue.id);
    setVotes(v => v + 1);
    setVoted(true);
    onVote?.();
  };

  return (
    <Link to={`/issues/${issue.id}`} className="block group">
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
            {categoryIcons[issue.category] || '📋'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                {issue.title}
              </h3>
              <StatusBadge status={issue.status} />
            </div>
            <p className="text-gray-500 text-xs line-clamp-2 mb-3">{issue.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
              <span className="flex items-center gap-1"><MapPin size={11} />{issue.location}</span>
              <span className="flex items-center gap-1"><User size={11} />{issue.department}</span>
              <span className="flex items-center gap-1"><Clock size={11} />{new Date(issue.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button onClick={handleVote}
              className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                voted ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-400 hover:text-blue-600'
              }`}>
              <ThumbsUp size={14} />
              <span className="text-xs font-bold mt-0.5">{votes}</span>
            </button>
            <PriorityBadge priority={issue.priority} />
          </div>
        </div>
      </div>
    </Link>
  );
}
