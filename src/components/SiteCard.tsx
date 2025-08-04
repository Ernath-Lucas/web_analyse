import React from 'react';
import { Globe, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { SiteAnalysis } from '../types';

interface SiteCardProps {
  analysis: SiteAnalysis;
}

export const SiteCard: React.FC<SiteCardProps> = ({ analysis }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 truncate">
              {formatUrl(analysis.url)}
            </h3>
            <p className="text-sm text-gray-500">{analysis.url}</p>
          </div>
        </div>
        
        {analysis.loading && (
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        )}
        {analysis.completed && !analysis.error && (
          <CheckCircle className="h-5 w-5 text-green-600" />
        )}
        {analysis.error && (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
      </div>

      {analysis.loading && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Analyse en cours...</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {analysis.completed && !analysis.loading && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Score de performance</span>
            <span className={`text-sm font-semibold ${getScoreColor(analysis.score)}`}>
              {getScoreLabel(analysis.score)}
            </span>
          </div>
          
          {analysis.score !== null ? (
            <>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ease-out ${getScoreBgColor(analysis.score)}`}
                  style={{ width: `${analysis.score}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}
                </span>
                <span className="text-sm text-gray-500">/ 100</span>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <XCircle className="mx-auto h-8 w-8 text-red-400 mb-2" />
              <p className="text-sm text-red-600">Échec de l'analyse</p>
            </div>
          )}
        </div>
      )}

      {!analysis.loading && !analysis.completed && (
        <div className="text-center py-4">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <p className="text-sm text-gray-500">En attente...</p>
        </div>
      )}
    </div>
  );
};