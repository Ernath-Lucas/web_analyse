export interface SiteAnalysis {
  url: string;
  score: number | null;
  error: boolean;
  loading: boolean;
  completed: boolean;
  analyzedAt?: Date;
  businessName?: string;
  location?: string;
}

export interface AnalysisStats {
  total: number;
  completed: number;
  averageScore: number;
  goodScores: number;
  averageScores: number;
  poorScores: number;
}

export interface Business {
  name: string;
  website?: string;
  location: string;
  distance: number;
}

export interface HistoryEntry extends SiteAnalysis {
  id: string;
  analyzedAt: Date;
}