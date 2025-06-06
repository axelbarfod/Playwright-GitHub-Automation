import { GitHubUser } from "../user/UserModel";

export interface GitHubMilestone {
  url: string;
  html_url: string;
  labels_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  description: string;
  creator: GitHubUser;
  open_issues: number;
  closed_issues: number;
  state: string;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  due_on: string | null; // ISO 8601 date string or null
  closed_at: string | null; // ISO 8601 date string or null
}
