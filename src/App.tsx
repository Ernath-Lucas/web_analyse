import React, { useState, useCallback } from 'react';
import { Activity, Globe } from 'lucide-react';
import { SiteCard } from './components/SiteCard';
import { StatsOverview } from './components/StatsOverview';
import { UrlManager } from './components/UrlManager';
import { SiteAnalysis, AnalysisStats } from './types';
import { analyzeSite } from './utils/pageSpeedApi';

function App() {
  const [analyses, setAnalyses] = useState<SiteAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentUrls, setCurrentUrls] = useState<string[]>([]);

  const initializeAnalyses = useCallback((urls: string[]) => {
    return urls.map(url => ({
      url,
      score: null,
      error: false,
      loading: false,
      completed: false
    }));
  }, []);

  const calculateStats = useCallback((analyses: SiteAnalysis[]): AnalysisStats => {
    const completed = analyses.filter(a => a.completed);
    const withScores = completed.filter(a => a.score !== null);
    
    const total = analyses.length;
    const completedCount = completed.length;
    const averageScore = withScores.length > 0 
      ? withScores.reduce((sum, a) => sum + (a.score || 0), 0) / withScores.length 
      : 0;
    
    const goodScores = withScores.filter(a => (a.score || 0) >= 90).length;
    const averageScores = withScores.filter(a => (a.score || 0) >= 50 && (a.score || 0) < 90).length;
    const poorScores = withScores.filter(a => (a.score || 0) < 50).length;

    return {
      total,
      completed: completedCount,
      averageScore,
      goodScores,
      averageScores,
      poorScores
    };
  }, []);

  const runAnalysis = async (urls: string[], apiKey: string) => {
    setIsAnalyzing(true);
    setHasStarted(true);
    setCurrentUrls(urls);
    const initialAnalyses = initializeAnalyses(urls);
    setAnalyses(initialAnalyses);

    // Démarrer toutes les analyses en parallèle avec un délai pour éviter la limitation de taux
    const promises = initialAnalyses.map(async (analysis, index) => {
      // Délai progressif pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, index * 1000));
      
      // Marquer comme en cours
      setAnalyses(prev => prev.map(a => 
        a.url === analysis.url ? { ...a, loading: true } : a
      ));

      try {
        const result = await analyzeSite(analysis.url, apiKey);
        
        // Mettre à jour avec le résultat
        setAnalyses(prev => prev.map(a => 
          a.url === analysis.url 
            ? { 
                ...a, 
                score: result.score, 
                error: result.error, 
                loading: false, 
                completed: true 
              }
            : a
        ));
      } catch (error) {
        // Gérer les erreurs
        setAnalyses(prev => prev.map(a => 
          a.url === analysis.url 
            ? { 
                ...a, 
                score: null, 
                error: true, 
                loading: false, 
                completed: true 
              }
            : a
        ));
      }
    });

    // Attendre que toutes les analyses soient terminées
    await Promise.all(promises);
    setIsAnalyzing(false);
  };

  const stats = calculateStats(analyses);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Analyseur de débrit web !
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analysez les performances de vos sites web en temps réel avec Google PageSpeed Insights
          </p>
        </div>

        {/* API Key Form */}
        {!hasStarted && (
          <div className="max-w-2xl mx-auto">
            <UrlManager onStartAnalysis={runAnalysis} />
          </div>
        )}

        {/* Stats Overview */}
        {hasStarted && (
          <StatsOverview stats={stats} isAnalyzing={isAnalyzing} />
        )}

        {/* Sites Grid */}
        {hasStarted && (
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Analyses des sites ({currentUrls.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyses.map((analysis) => (
                <SiteCard key={analysis.url} analysis={analysis} />
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        {hasStarted && !isAnalyzing && (
          <div className="text-center mt-12">
            <button
              onClick={() => {
                setHasStarted(false);
                setAnalyses([]);
                setCurrentUrls([]);
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Nouvelle analyse
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;