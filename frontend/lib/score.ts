export type Tier = "Gold" | "Silver" | "Bronze";

/** Readiness tier from total points, shared by the dashboard and leaderboard. */
export function tierFor(points: number): Tier {
  return points >= 1500 ? "Gold" : points >= 500 ? "Silver" : "Bronze";
}
