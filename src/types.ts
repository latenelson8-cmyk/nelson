export type AnalysisType = "proscons" | "compare" | "swot";

export interface ProConElement {
  text: string;
  impact: number;
  category: string;
  explanation: string;
}

export interface ProsConsResult {
  title: string;
  summary: string;
  pros: ProConElement[];
  cons: ProConElement[];
  finalScore: number;
  verdict: string;
}

export interface ScoreItem {
  option: string;
  score: number;
}

export interface CriterionItem {
  name: string;
  description: string;
  scores: ScoreItem[];
  comment: string;
}

export interface CompareResult {
  title: string;
  options: string[];
  criteria: CriterionItem[];
  summary: string;
  recommendation: {
    winner: string;
    why: string;
  };
}

export interface SwotItem {
  text: string;
  details: string;
}

export interface SwotResult {
  title: string;
  summary: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  strategicPath: string;
}

export interface SavedDecision {
  id: string;
  createdAt: string;
  situation: string;
  type: AnalysisType;
  context?: string;
  options?: string[];
  result: ProsConsResult | CompareResult | SwotResult;
  userRating?: number; // optionally rate the arbitration
}
