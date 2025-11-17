import { GitHubUser } from "../user/UserModel";
import { GitHubRepository } from "../repository/Repository";

export interface PullRequestRef {
  label: string;
  ref: string;
  sha: string;
  user: GitHubUser;
  repo: GitHubRepository;
}

export interface PullRequestLinks {
  self: { href: string };
  html: { href: string };
  issue: { href: string };
  comments: { href: string };
  review_comments: { href: string };
  review_comment: { href: string };
  commits: { href: string };
  statuses: { href: string };
}

export interface PullRequest {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  number: number;
  state: "open" | "closed";
  locked: boolean;
  title: string;
  user: GitHubUser;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  requested_reviewers: GitHubUser[];
  requested_teams: unknown[];
  labels: unknown[];
  milestone: unknown | null;
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: PullRequestRef;
  base: PullRequestRef;
  _links: PullRequestLinks;
  author_association: string;
  auto_merge: unknown | null;
  active_lock_reason: string | null;
  merged: boolean;
  mergeable: boolean | null;
  rebaseable: boolean | null;
  mergeable_state: string;
  merged_by: GitHubUser | null;
  comments: number;
  review_comments: number;
  maintainer_can_modify: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface CreatePullRequestRequest {
  title: string;
  head: string;
  base: string;
  body?: string;
  draft?: boolean;
  maintainer_can_modify?: boolean;
  issue?: number;
}

export interface UpdatePullRequestRequest {
  title?: string;
  body?: string;
  state?: "open" | "closed";
  base?: string;
  maintainer_can_modify?: boolean;
}

export interface MergePullRequestRequest {
  commit_title?: string;
  commit_message?: string;
  sha?: string;
  merge_method?: "merge" | "squash" | "rebase";
}

export interface MergePullRequestResponse {
  sha: string;
  merged: boolean;
  message: string;
}

export interface ListPullRequestsParams {
  state?: "open" | "closed" | "all";
  head?: string;
  base?: string;
  sort?: "created" | "updated" | "popularity" | "long-running";
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
}
