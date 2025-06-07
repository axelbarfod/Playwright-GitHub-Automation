import { GitHubRepository } from "../repository/Repository";

export interface GitHubSearchRepositoriesResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}
