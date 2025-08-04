import React from 'react';
import { BarChart3, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { AnalysisStats } from '../types';

interface StatsOverviewProps {
  stats: AnalysisStats;
  isAnalyzing: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isAnalyzing }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Progression</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completed}/{stats.total}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Score moyen</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completed > 0 ? Math.round(stats.averageScore) : '--'}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {isAnalyzing ? 'Calcul en cours...' : 'Analyse terminée'}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Excellents scores</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.goodScores}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <Award className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">≥ 90 points</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">À améliorer</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.poorScores}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">&lt; 50 points</p>
      </div>
    </div>
  );
};