import React, { useState } from 'react';
import { Plus, Trash2, Globe, ArrowRight, AlertCircle } from 'lucide-react';

interface UrlManagerProps {
  onStartAnalysis: (urls: string[], apiKey: string) => void;
}

export const UrlManager: React.FC<UrlManagerProps> = ({ onStartAnalysis }) => {
  const [urls, setUrls] = useState<string[]>([
    "https://www.croix-rouge.fr",
    "https://www.decathlon.fr",
    "https://www.auchan.fr"
  ]);
  const [newUrl, setNewUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const addUrl = () => {
    const trimmedUrl = newUrl.trim();
    
    if (!trimmedUrl) {
      setErrors({ newUrl: 'Veuillez entrer une URL' });
      return;
    }

    if (!validateUrl(trimmedUrl)) {
      setErrors({ newUrl: 'Veuillez entrer une URL valide (http:// ou https://)' });
      return;
    }

    if (urls.includes(trimmedUrl)) {
      setErrors({ newUrl: 'Cette URL est déjà dans la liste' });
      return;
    }

    setUrls([...urls, trimmedUrl]);
    setNewUrl('');
    setErrors({});
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addUrl();
    }
  };

  const handleStartAnalysis = () => {
    const newErrors: { [key: string]: string } = {};

    if (urls.length === 0) {
      newErrors.urls = 'Ajoutez au moins une URL à analyser';
    }

    if (!apiKey.trim()) {
      newErrors.apiKey = 'La clé API est requise';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onStartAnalysis(urls, apiKey.trim());
  };

  const formatUrl = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configuration de l'analyse
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Ajoutez les sites web que vous souhaitez analyser avec PageSpeed Insights
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
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">Comment obtenir une clé API :</p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Visitez la <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Créez un projet ou sélectionnez-en un existant</li>
              <li>Activez l'API PageSpeed Insights</li>
              <li>Créez des identifiants (clé API)</li>
            </ol>
          </div>
        </div>
      </div>

      {/* URL Management Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sites à analyser</h2>
        
        {/* Add URL Form */}
        <div className="space-y-4 mb-6">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  if (errors.newUrl) setErrors({ ...errors, newUrl: '' });
                }}
                onKeyPress={handleKeyPress}
                placeholder="https://exemple.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.newUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.newUrl && (
                <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.newUrl}</span>
                </div>
              )}
            </div>
            <button
              onClick={addUrl}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* URLs List */}
        <div className="space-y-3">
          {urls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun site ajouté pour le moment</p>
              <p className="text-sm">Ajoutez des URLs pour commencer l'analyse</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">
                  {urls.length} site{urls.length > 1 ? 's' : ''} à analyser
                </span>
              </div>
              {urls.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formatUrl(url)}</p>
                      <p className="text-sm text-gray-500">{url}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeUrl(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer cette URL"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </>
          )}
          
          {errors.urls && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{errors.urls}</span>
            </div>
          )}
        </div>
      </div>

      {/* Start Analysis Button */}
      <div className="text-center">
        <button
          onClick={handleStartAnalysis}
          disabled={urls.length === 0 || !apiKey.trim()}
          className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-3 mx-auto text-lg font-medium"
        >
          <span>Démarrer l'analyse</span>
          <ArrowRight className="h-5 w-5" />
        </button>
        <p className="text-sm text-gray-500 mt-3">
          L'analyse peut prendre quelques minutes selon le nombre de sites
        </p>
      </div>
    </div>
  );
};