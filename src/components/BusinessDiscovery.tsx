import React, { useState } from 'react';
import { Search, MapPin, Globe, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { Business } from '../types';
import { discoverBusinessesAroundDouai } from '../utils/businessDiscovery';
import { HistoryManager } from '../utils/historyManager';

interface BusinessDiscoveryProps {
  onStartAnalysis: (urls: string[], apiKey: string) => void;
}

export const BusinessDiscovery: React.FC<BusinessDiscoveryProps> = ({ onStartAnalysis }) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [hasDiscovered, setHasDiscovered] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const discoverBusinesses = async () => {
    setIsDiscovering(true);
    setErrors({});
    
    try {
      const discoveredBusinesses = await discoverBusinessesAroundDouai(30);
      
      // Filtrer les entreprises déjà analysées
      const analyzedUrls = HistoryManager.getUniqueUrls();
      const newBusinesses = discoveredBusinesses.filter(
        business => business.website && !analyzedUrls.includes(business.website)
      );
      
      setBusinesses(newBusinesses);
      setHasDiscovered(true);
      
      if (newBusinesses.length === 0) {
        setErrors({ discovery: 'Toutes les entreprises trouvées ont déjà été analysées.' });
      }
    } catch (error) {
      setErrors({ discovery: 'Erreur lors de la découverte des entreprises.' });
    } finally {
      setIsDiscovering(false);
    }
  };

  const toggleBusinessSelection = (website: string) => {
    const newSelection = new Set(selectedBusinesses);
    if (newSelection.has(website)) {
      newSelection.delete(website);
    } else {
      newSelection.add(website);
    }
    setSelectedBusinesses(newSelection);
  };

  const selectAll = () => {
    const allWebsites = new Set(businesses.map(b => b.website!));
    setSelectedBusinesses(allWebsites);
  };

  const deselectAll = () => {
    setSelectedBusinesses(new Set());
  };

  const handleStartAnalysis = () => {
    const newErrors: { [key: string]: string } = {};

    if (selectedBusinesses.size === 0) {
      newErrors.selection = 'Sélectionnez au moins une entreprise à analyser';
    }

    if (!apiKey.trim()) {
      newErrors.apiKey = 'La clé API est requise';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedUrls = Array.from(selectedBusinesses);
    onStartAnalysis(selectedUrls, apiKey.trim());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-green-600 rounded-xl">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Découverte automatique
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Trouvez et analysez automatiquement les sites web des entreprises autour de Douai
        </p>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Clé API Google</h2>
        <div className="space-y-4">
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (errors.apiKey) setErrors({ ...errors, apiKey: '' });
              }}
              placeholder="Votre clé API Google PageSpeed Insights..."
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.apiKey ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.apiKey && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.apiKey}</span>
            </div>
          )}
        </div>
      </div>

      {/* Discovery Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Entreprises locales</h2>
          <button
            onClick={discoverBusinesses}
            disabled={isDiscovering}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
          >
            {isDiscovering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>{isDiscovering ? 'Recherche...' : 'Découvrir les entreprises'}</span>
          </button>
        </div>

        {errors.discovery && (
          <div className="flex items-center space-x-2 text-amber-600 text-sm mb-4 p-3 bg-amber-50 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.discovery}</span>
          </div>
        )}

        {isDiscovering && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto text-green-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Recherche en cours...</p>
            <p className="text-gray-600">Découverte des entreprises dans un rayon de 30km autour de Douai</p>
          </div>
        )}

        {hasDiscovered && businesses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {businesses.length} entreprise{businesses.length > 1 ? 's' : ''} trouvée{businesses.length > 1 ? 's' : ''} avec un site web
              </p>
              <div className="space-x-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Tout sélectionner
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Tout désélectionner
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map((business) => (
                <div
                  key={business.website}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedBusinesses.has(business.website!)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleBusinessSelection(business.website!)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{business.name}</h3>
                    <input
                      type="checkbox"
                      checked={selectedBusinesses.has(business.website!)}
                      onChange={() => toggleBusinessSelection(business.website!)}
                      className="text-green-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{business.location} ({business.distance}km)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-blue-600">
                      <Globe className="h-3 w-3" />
                      <span className="truncate">{business.website}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.selection && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.selection}</span>
              </div>
            )}

            <div className="text-center pt-6">
              <button
                onClick={handleStartAnalysis}
                disabled={selectedBusinesses.size === 0 || !apiKey.trim()}
                className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-3 mx-auto text-lg font-medium"
              >
                <span>Analyser {selectedBusinesses.size} site{selectedBusinesses.size > 1 ? 's' : ''}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {hasDiscovered && businesses.length === 0 && !errors.discovery && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune nouvelle entreprise trouvée</p>
            <p className="text-sm">Toutes les entreprises locales ont déjà été analysées</p>
          </div>
        )}
      </div>
    </div>
  );
};