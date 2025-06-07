import { GitHubUser } from "../user/UserModel";
import { GitHubMilestone } from "../milestone/Milestone";

interface SubIssuesSummary {
  total: number;
  completed: number;
  percent_completed: number;
}

interface Reactions {
  url: string;
  total_count: number;
  "+1": number;
  "-1": number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export interface GitHubIssue {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: GitHubUser;
  labels: never[]; // This could be more specific if you have label objects
  state: string;
  locked: boolean;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  milestone: GitHubMilestone | null; // This could be more specific if you have milestone objects
  comments: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  closed_at: string | null; // ISO 8601 date string
  author_association: string;
  active_lock_reason: string | null;
  sub_issues_summary: SubIssuesSummary;
  body: string;
  closed_by: GitHubUser | null;
  reactions: Reactions;
  timeline_url: string;
  performed_via_github_app: never | null; // This could be more specific if you have app objects
  state_reason: string | null;
}

export type GitHubIssuesResponse = GitHubIssue[];
