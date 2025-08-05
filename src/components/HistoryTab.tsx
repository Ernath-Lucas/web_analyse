import React, { useState, useEffect } from 'react';
import { History, Calendar, Globe, Trash2, BarChart3, Filter } from 'lucide-react';
import { HistoryEntry } from '../types';
import { HistoryManager } from '../utils/historyManager';

export const HistoryTab: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'good' | 'average' | 'poor'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'url'>('date');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, filter, sortBy]);

  const loadHistory = () => {
    const historyData = HistoryManager.getHistory();
    setHistory(historyData);
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Appliquer le filtre par score
    switch (filter) {
      case 'good':
        filtered = filtered.filter(entry => entry.score !== null && entry.score >= 90);
        break;
      case 'average':
        filtered = filtered.filter(entry => entry.score !== null && entry.score >= 50 && entry.score < 90);
        break;
      case 'poor':
        filtered = filtered.filter(entry => entry.score !== null && entry.score < 50);
        break;
    }

    // Appliquer le tri
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
        break;
      case 'score':
        filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
        break;
      case 'url':
        filtered.sort((a, b) => a.url.localeCompare(b.url));
        break;
    }

    setFilteredHistory(filtered);
  };

  const clearHistory = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ?')) {
      HistoryManager.clearHistory();
      loadHistory();
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number | null) => {
    if (score === null) return 'bg-gray-200';
    if (score >= 90) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return 'Erreur';
    if (score >= 90) return 'Excellent';
    if (score >= 50) return 'Moyen';
    return 'Faible';
  };

  const formatUrl = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getStats = () => {
    const total = history.length;
    const withScores = history.filter(entry => entry.score !== null);
    const averageScore = withScores.length > 0 
      ? withScores.reduce((sum, entry) => sum + (entry.score || 0), 0) / withScores.length 
      : 0;
    
    const goodScores = withScores.filter(entry => (entry.score || 0) >= 90).length;
    const averageScores = withScores.filter(entry => (entry.score || 0) >= 50 && (entry.score || 0) < 90).length;
    const poorScores = withScores.filter(entry => (entry.score || 0) < 50).length;

    return { total, averageScore, goodScores, averageScores, poorScores };
  };

  const stats = getStats();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-purple-600 rounded-xl">
            <History className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Historique des analyses
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Consultez toutes vos analyses précédentes
        </p>
      </div>

      {/* Stats Overview */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total analysé</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score moyen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.averageScore)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Excellents</p>
                <p className="text-2xl font-bold text-green-600">{stats.goodScores}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">À améliorer</p>
                <p className="text-2xl font-bold text-red-600">{stats.poorScores}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filtrer par score:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="good">Excellents (≥90)</option>
                <option value="average">Moyens (50-89)</option>
                <option value="poor">Faibles (&lt;50)</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Trier par:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="score">Score</option>
                <option value="url">URL</option>
              </select>

              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Vider l'historique</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredHistory.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {formatUrl(entry.url)}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{entry.url}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.analyzedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {entry.score !== null ? (
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(entry.score)}`}>
                          {entry.score}
                        </div>
                        <div className={`text-sm font-medium ${getScoreColor(entry.score)}`}>
                          {getScoreLabel(entry.score)}
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${getScoreBgColor(entry.score)}`}
                            style={{ width: `${entry.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">--</div>
                        <div className="text-sm font-medium text-red-600">Erreur</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : history.length > 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg text-gray-500">Aucun résultat pour ce filtre</p>
          <p className="text-sm text-gray-400">Essayez de modifier les critères de filtrage</p>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
          <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg text-gray-500">Aucune analyse dans l'historique</p>
          <p className="text-sm text-gray-400">Commencez par analyser des sites pour voir l'historique ici</p>
        </div>
      )}
    </div>
  );
};