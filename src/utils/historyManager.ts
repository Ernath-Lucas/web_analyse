import { HistoryEntry, SiteAnalysis } from '../types';

const HISTORY_STORAGE_KEY = 'pagespeed_analysis_history';

export class HistoryManager {
  static getHistory(): HistoryEntry[] {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((entry: any) => ({
        ...entry,
        analyzedAt: new Date(entry.analyzedAt)
      }));
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'historique:', error);
      return [];
    }
  }

  static addToHistory(analysis: SiteAnalysis): void {
    try {
      const history = this.getHistory();
      const newEntry: HistoryEntry = {
        ...analysis,
        id: this.generateId(),
        analyzedAt: new Date()
      };

      // Éviter les doublons basés sur l'URL
      const filteredHistory = history.filter(entry => entry.url !== analysis.url);
      const updatedHistory = [newEntry, ...filteredHistory];

      // Limiter l'historique à 100 entrées
      const limitedHistory = updatedHistory.slice(0, 100);

      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'historique:', error);
    }
  }

  static clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique:', error);
    }
  }

  static isUrlInHistory(url: string): boolean {
    const history = this.getHistory();
    return history.some(entry => entry.url === url);
  }

  static getUniqueUrls(): string[] {
    const history = this.getHistory();
    return [...new Set(history.map(entry => entry.url))];
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}