import React, { useState } from 'react';
import { Search, MapPin, Globe, Loader2, ArrowRight, AlertCircle, Zap } from 'lucide-react';
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
  const [placesApiKey, setPlacesApiKey] = useState('');
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [hasDiscovered, setHasDiscovered] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState({ current: 0, total: 0, type: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const discoverBusinesses = async () => {
    if (!placesApiKey.trim()) {
      setErrors({ placesApiKey: 'La clé API Google Places est requise' });
      return;
    }

    setIsDiscovering(true);
    setErrors({});
    setDiscoveryProgress({ current: 0, total: 50, type: 'Initialisation...' });
    
    try {
      // Obtenir les URLs déjà analysées pour éviter les doublons
      const analyzedUrls = HistoryManager.getUniqueUrls();
      console.log(`🔍 URLs déjà analysées: ${analyzedUrls.length}`);
      
      const discoveredBusinesses = await discoverBusinessesAroundDouai(
        placesApiKey.trim(),
        analyzedUrls,
        50,
        (progress) => {
          setDiscoveryProgress(progress);
        }
      );
      
      setBusinesses(discoveredBusinesses);
      setHasDiscovered(true);
      
      if (discoveredBusinesses.length === 0) {
        setErrors({ 
          discovery: 'Aucune nouvelle entreprise trouvée. Toutes les entreprises dans la zone ont déjà été analysées ou n\'ont pas de site web.' 
        });
      } else {
        // Sélectionner automatiquement les 10 premières entreprises les plus proches
        const autoSelected = new Set(
          discoveredBusinesses.slice(0, 10).map(b => b.website!).filter(Boolean)
        );
        setSelectedBusinesses(autoSelected);
      }
    } catch (error) {
      console.error('Erreur découverte:', error);
      setErrors({ 
        discovery: error instanceof Error ? error.message : 'Erreur lors de la découverte des entreprises.' 
      });
    } finally {
      setIsDiscovering(false);
      setDiscoveryProgress({ current: 0, total: 0, type: '' });
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
    const allWebsites = new Set(businesses.map(b => b.website!).filter(Boolean));
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
      newErrors.apiKey = 'La clé API PageSpeed Insights est requise';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedUrls = Array.from(selectedBusinesses);
    onStartAnalysis(selectedUrls, apiKey.trim());
  };

  const getBusinessTypeLabel = (types: string[]) => {
    const typeLabels: { [key: string]: string } = {
      restaurant: 'Restaurant',
      store: 'Magasin',
      bakery: 'Boulangerie',
      pharmacy: 'Pharmacie',
      gas_station: 'Station-service',
      car_repair: 'Garage',
      beauty_salon: 'Salon de beauté',
      gym: 'Salle de sport',
      bank: 'Banque',
      real_estate_agency: 'Immobilier',
      insurance_agency: 'Assurance',
      lawyer: 'Avocat',
      dentist: 'Dentiste',
      veterinary_care: 'Vétérinaire',
      florist: 'Fleuriste'
    };

    for (const type of types) {
      if (typeLabels[type]) {
        return typeLabels[type];
      }
    }
    return 'Entreprise';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-green-600 rounded-xl">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Découverte automatique intelligente
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Découvrez automatiquement les entreprises autour de Douai avec Google Places API
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Recherche progressive :</strong> L'application commence par chercher dans un rayon de 5km, 
            puis élargit automatiquement jusqu'à 30km pour trouver de nouveaux sites à analyser.
          </p>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration des clés API</h2>
        <div className="space-y-6">
          {/* Google Places API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clé API Google Places (pour la découverte)
            </label>
            <div className="relative">
              <input
                type={showApiKeys ? 'text' : 'password'}
                value={placesApiKey}
                onChange={(e) => {
                  setPlacesApiKey(e.target.value);
                  if (errors.placesApiKey) setErrors({ ...errors, placesApiKey: '' });
                }}
                placeholder="Votre clé API Google Places..."
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.placesApiKey ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowApiKeys(!showApiKeys)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKeys ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.placesApiKey && (
              <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.placesApiKey}</span>
              </div>
            )}
          </div>

          {/* PageSpeed API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clé API Google PageSpeed Insights (pour l'analyse)
            </label>
            <div className="relative">
              <input
                type={showApiKeys ? 'text' : 'password'}
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
            </div>
            {errors.apiKey && (
              <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.apiKey}</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Comment obtenir les clés API :</p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Visitez la <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Créez un projet ou sélectionnez-en un existant</li>
              <li>Activez les APIs : <strong>Places API</strong> et <strong>PageSpeed Insights API</strong></li>
              <li>Créez des identifiants (clé API) - vous pouvez utiliser la même clé pour les deux</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Discovery Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Entreprises locales</h2>
          <button
            onClick={discoverBusinesses}
            disabled={isDiscovering || !placesApiKey.trim()}
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
            <p className="text-gray-600 mb-4">{discoveryProgress.type}</p>
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progression</span>
                <span>{discoveryProgress.current}/{discoveryProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${discoveryProgress.total > 0 ? (discoveryProgress.current / discoveryProgress.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {hasDiscovered && businesses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {businesses.length} nouvelle{businesses.length > 1 ? 's' : ''} entreprise{businesses.length > 1 ? 's' : ''} trouvée{businesses.length > 1 ? 's' : ''}
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
                  key={business.placeId}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedBusinesses.has(business.website!)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleBusinessSelection(business.website!)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{business.name}</h3>
                      <p className="text-xs text-purple-600 font-medium">
                        {getBusinessTypeLabel(business.types)}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedBusinesses.has(business.website!)}
                      onChange={() => toggleBusinessSelection(business.website!)}
                      className="text-green-600 ml-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{business.distance}km de Douai</span>
                      {business.rating && (
                        <span className="text-yellow-600">★ {business.rating}</span>
                      )}
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
            <p className="text-sm">Toutes les entreprises dans un rayon de 30km ont déjà été analysées</p>
          </div>
        )}
      </div>
    </div>
  );
};