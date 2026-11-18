import { Issue, Department, StatsOverview } from './types';

export const mockIssues: Issue[] = [
  {
    id: '1', title: 'Large pothole on Main St & 4th Ave', description: 'Dangerous pothole causing vehicle damage. Multiple accidents reported.',
    category: 'roads', status: 'open', priority: 'critical', location: 'Main St & 4th Ave, Downtown',
    latitude: 28.6139, longitude: 77.2090, votes: 47, reporter_name: 'Priya Sharma',
    reporter_email: 'priya@example.com', department: 'Roads & Transport',
    created_at: '2026-09-01T09:00:00Z', updated_at: '2026-09-01T09:00:00Z',
    comments: [
      { id: 'c1', issue_id: '1', author: 'Roads Dept', author_role: 'department', content: 'Assigned to repair crew. Expected fix within 48 hours.', created_at: '2026-09-02T10:00:00Z' }
    ]
  },
  {
    id: '2', title: 'Street light out — Oak Avenue block 3', description: 'Entire stretch dark for 2 weeks. Safety hazard at night.',
    category: 'lighting', status: 'in_progress', priority: 'high', location: 'Oak Avenue, Block 3',
    latitude: 28.6200, longitude: 77.2100, votes: 31, reporter_name: 'Arjun Mehta',
    reporter_email: 'arjun@example.com', department: 'Electricity Board',
    created_at: '2026-08-28T14:00:00Z', updated_at: '2026-09-03T11:00:00Z',
  },
  {
    id: '3', title: 'Fallen tree blocking park jogging path', description: 'Tree fell after storm. Path completely blocked.',
    category: 'parks', status: 'resolved', priority: 'medium', location: 'Central Park, North Path',
    latitude: 28.6300, longitude: 77.2200, votes: 18, reporter_name: 'Sunita Rao',
    reporter_email: 'sunita@example.com', department: 'Parks & Recreation',
    created_at: '2026-08-25T08:00:00Z', updated_at: '2026-08-25T18:00:00Z', resolved_at: '2026-08-25T18:00:00Z',
  },
  {
    id: '4', title: 'Overflowing garbage bins near market', description: 'Bins not emptied for 5 days. Foul smell and rats visible.',
    category: 'sanitation', status: 'open', priority: 'high', location: 'Lajpat Nagar Market, Gate 2',
    votes: 62, reporter_name: 'Rohit Kumar', reporter_email: 'rohit@example.com',
    department: 'Sanitation', created_at: '2026-09-05T07:30:00Z', updated_at: '2026-09-05T07:30:00Z',
  },
  {
    id: '5', title: 'Water pipe burst on Ring Road', description: 'Major leak flooding road. Water supply disrupted for 200 homes.',
    category: 'water', status: 'in_progress', priority: 'critical', location: 'Ring Road, Near Flyover',
    votes: 88, reporter_name: 'Anita Joshi', reporter_email: 'anita@example.com',
    department: 'Water Works', created_at: '2026-09-06T06:00:00Z', updated_at: '2026-09-06T08:00:00Z',
  },
  {
    id: '6', title: 'Damaged footpath tiles — Nehru Colony', description: 'Broken tiles causing trips. Elderly residents affected.',
    category: 'roads', status: 'open', priority: 'medium', location: 'Nehru Colony, Sector 4',
    votes: 22, reporter_name: 'Vijay Singh', reporter_email: 'vijay@example.com',
    department: 'Roads & Transport', created_at: '2026-09-04T12:00:00Z', updated_at: '2026-09-04T12:00:00Z',
  },
];

export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Roads & Transport', categories: ['roads'], head: 'Rajesh Kapoor', email: 'roads@city.gov', open_issues: 18, resolved_issues: 142 },
  { id: 'd2', name: 'Electricity Board', categories: ['lighting', 'electricity'], head: 'Meena Pillai', email: 'electricity@city.gov', open_issues: 9, resolved_issues: 87 },
  { id: 'd3', name: 'Sanitation', categories: ['sanitation'], head: 'Arun Nair', email: 'sanitation@city.gov', open_issues: 14, resolved_issues: 201 },
  { id: 'd4', name: 'Parks & Recreation', categories: ['parks'], head: 'Deepa Menon', email: 'parks@city.gov', open_issues: 5, resolved_issues: 63 },
  { id: 'd5', name: 'Water Works', categories: ['water'], head: 'Suresh Babu', email: 'water@city.gov', open_issues: 7, resolved_issues: 94 },
];

export const mockStats: StatsOverview = {
  total: 2418, open: 53, in_progress: 28, resolved: 2337, avg_resolution_days: 3.2, satisfaction: 94,
};
