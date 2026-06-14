export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  drills: number;
}
