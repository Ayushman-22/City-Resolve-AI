import { supabase, isSupabaseConfigured } from './supabase';
import { mockIssues, mockDepartments, mockStats } from './mockData';
import { Issue, StatsOverview, Department } from './types';

export async function getIssues(): Promise<Issue[]> {
  if (!isSupabaseConfigured) return mockIssues;
  const { data, error } = await supabase!.from('issues').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Issue[];
}

export async function getIssueById(id: string): Promise<Issue | null> {
  if (!isSupabaseConfigured) return mockIssues.find(i => i.id === id) || null;
  const { data, error } = await supabase!.from('issues').select('*, comments(*)').eq('id', id).single();
  if (error) throw error;
  return data as Issue;
}

export async function createIssue(issue: Omit<Issue, 'id' | 'votes' | 'created_at' | 'updated_at'>): Promise<Issue> {
  if (!isSupabaseConfigured) {
    const newIssue: Issue = { ...issue, id: String(Date.now()), votes: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    mockIssues.unshift(newIssue);
    return newIssue;
  }
  const { data, error } = await supabase!.from('issues').insert([issue]).select().single();
  if (error) throw error;
  return data as Issue;
}

export async function updateIssueStatus(id: string, status: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const i = mockIssues.find(x => x.id === id);
    if (i) { i.status = status as any; i.updated_at = new Date().toISOString(); }
    return;
  }
  const { error } = await supabase!.from('issues').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function voteIssue(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const i = mockIssues.find(x => x.id === id);
    if (i) i.votes++;
    return;
  }
  await supabase!.rpc('increment_votes', { issue_id: id });
}

export async function getDepartments(): Promise<Department[]> {
  if (!isSupabaseConfigured) return mockDepartments;
  const { data, error } = await supabase!.from('departments').select('*');
  if (error) throw error;
  return data as Department[];
}

export async function getStats(): Promise<StatsOverview> {
  if (!isSupabaseConfigured) return mockStats;
  const { data, error } = await supabase!.from('stats_overview').select('*').single();
  if (error) throw error;
  return data as StatsOverview;
}
