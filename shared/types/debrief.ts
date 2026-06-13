// TS mirror of the backend debrief schemas (app/schemas/debrief.py).

export interface DimensionScores {
  clarity: number;
  deescalation: number;
  info_gathering: number;
  escalation: number;
  status_communication: number;
}

export interface LostControlMoment {
  quote: string;
  issue: string;
  better: string;
}

export interface DebriefContent {
  strengths: string[];
  lost_control: LostControlMoment[];
  missed_information: string[];
  escalation_assessment: string;
  status_communication_assessment: string;
  dimension_scores: DimensionScores;
}

export interface DebriefOut {
  session_id: string;
  summary: string;
  overall_grade: string;
  content: DebriefContent;
  created_at: string;
}
