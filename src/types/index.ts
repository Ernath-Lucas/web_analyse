export interface SiteAnalysis {
  url: string;
  score: number | null;
  error: boolean;
  loading: boolean;
  completed: boolean;
}

export interface AnalysisStats {
  total: number;
  completed: number;
  averageScore: number;
  goodScores: number;
  averageScores: number;
  poorScores: number;
}