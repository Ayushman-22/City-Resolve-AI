export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'rejected';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory =
  | 'roads'
  | 'sanitation'
  | 'lighting'
  | 'parks'
  | 'water'
  | 'electricity'
  | 'noise'
  | 'other';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: string;
  latitude?: number;
  longitude?: number;
  votes: number;
  reporter_name: string;
  reporter_email: string;
  department: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  issue_id: string;
  author: string;
  author_role: 'citizen' | 'department' | 'admin';
  content: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  categories: IssueCategory[];
  head: string;
  email: string;
  open_issues: number;
  resolved_issues: number;
}

export interface StatsOverview {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  avg_resolution_days: number;
  satisfaction: number;
}
