// Intégration avec Google Places API pour découvrir les entreprises autour de Douai

export interface Business {
  name: string;
  website?: string;
  location: string;
  distance: number;
  placeId: string;
  rating?: number;
  types: string[];
}

// Coordonnées de Douai, France
const DOUAI_COORDINATES = {
  lat: 50.3669,
  lng: 3.0803
};

// Types d'entreprises à rechercher (par ordre de priorité)
const BUSINESS_TYPES = [
  'restaurant',
  'store',
  'bakery',
  'pharmacy',
  'gas_station',
  'car_repair',
  'beauty_salon',
  'gym',
  'bank',
  'real_estate_agency',
  'insurance_agency',
  'lawyer',
  'dentist',
  'veterinary_care',
  'florist',
  'book_store',
  'clothing_store',
  'electronics_store',
  'furniture_store',
  'jewelry_store',
  'shoe_store',
  'supermarket',
  'convenience_store',
  'hardware_store',
  'pet_store'
];

interface PlacesSearchParams {
  location: string;
  radius: number;
  type: string;
  key: string;
  pagetoken?: string;
}

interface PlaceDetailsParams {
  place_id: string;
  fields: string;
  key: string;
}

interface PlacesApiResponse {
  results: Array<{
    place_id: string;
    name: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number;
    types: string[];
    vicinity: string;
  }>;
  next_page_token?: string;
  status: string;
}

interface PlaceDetailsResponse {
  result: {
    place_id: string;
    name: string;
    website?: string;
    formatted_address: string;
    rating?: number;
    types: string[];
  };
  status: string;
}

// Calculer la distance entre deux points géographiques
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Rechercher des lieux avec l'API Places
async function searchPlaces(params: PlacesSearchParams): Promise<PlacesApiResponse> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.append('location', params.location);
  url.searchParams.append('radius', params.radius.toString());
  url.searchParams.append('type', params.type);
  url.searchParams.append('key', params.key);
  
  if (params.pagetoken) {
    url.searchParams.append('pagetoken', params.pagetoken);
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Erreur API Places: ${response.status}`);
  }
  
  return response.json();
}

// Obtenir les détails d'un lieu (incluant le site web)
async function getPlaceDetails(params: PlaceDetailsParams): Promise<PlaceDetailsResponse> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.append('place_id', params.place_id);
  url.searchParams.append('fields', params.fields);
  url.searchParams.append('key', params.key);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Erreur API Place Details: ${response.status}`);
  }
  
  return response.json();
}

// Valider et nettoyer une URL de site web
function validateAndCleanWebsiteUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // Ajouter https:// si le protocole manque
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Vérifier que c'est un domaine valide
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return null;
    }
    
    return urlObj.toString();
  } catch {
    return null;
  }
}

// Découvrir les entreprises avec recherche progressive
export async function discoverBusinessesAroundDouai(
  apiKey: string,
  excludeUrls: string[] = [],
  maxResults: number = 50,
  onProgress?: (progress: { current: number; total: number; type: string }) => void
): Promise<Business[]> {
  const businesses: Business[] = [];
  const processedPlaceIds = new Set<string>();
  const location = `${DOUAI_COORDINATES.lat},${DOUAI_COORDINATES.lng}`;
  
  let currentRadius = 5000; // Commencer par 5km
  const maxRadius = 30000; // Maximum 30km
  const radiusIncrement = 5000; // Augmenter de 5km à chaque fois
  
  try {
    // Recherche progressive par rayon croissant
    while (currentRadius <= maxRadius && businesses.length < maxResults) {
      console.log(`🔍 Recherche dans un rayon de ${currentRadius/1000}km...`);
      
      // Recherche par type d'entreprise
      for (let typeIndex = 0; typeIndex < BUSINESS_TYPES.length && businesses.length < maxResults; typeIndex++) {
        const businessType = BUSINESS_TYPES[typeIndex];
        
        if (onProgress) {
          onProgress({
            current: businesses.length,
            total: maxResults,
            type: `${businessType} (${currentRadius/1000}km)`
          });
        }
        
        try {
          let nextPageToken: string | undefined;
          let pageCount = 0;
          const maxPages = 3; // Limiter à 3 pages par type pour éviter les quotas
          
          do {
            // Délai entre les requêtes pour respecter les limites de l'API
            if (pageCount > 0 || typeIndex > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            const searchResponse = await searchPlaces({
              location,
              radius: currentRadius,
              type: businessType,
              key: apiKey,
              pagetoken: nextPageToken
            });
            
            if (searchResponse.status !== 'OK' && searchResponse.status !== 'ZERO_RESULTS') {
              console.warn(`⚠️ Erreur recherche ${businessType}:`, searchResponse.status);
              break;
            }
            
            // Traiter les résultats
            for (const place of searchResponse.results) {
              if (businesses.length >= maxResults) break;
              if (processedPlaceIds.has(place.place_id)) continue;
              
              processedPlaceIds.add(place.place_id);
              
              // Calculer la distance
              const distance = calculateDistance(
                DOUAI_COORDINATES.lat,
                DOUAI_COORDINATES.lng,
                place.geometry.location.lat,
                place.geometry.location.lng
              );
              
              // Obtenir les détails pour récupérer le site web
              try {
                await new Promise(resolve => setTimeout(resolve, 100)); // Petit délai
                
                const detailsResponse = await getPlaceDetails({
                  place_id: place.place_id,
                  fields: 'place_id,name,website,formatted_address,rating,types',
                  key: apiKey
                });
                
                if (detailsResponse.status === 'OK' && detailsResponse.result.website) {
                  const cleanWebsite = validateAndCleanWebsiteUrl(detailsResponse.result.website);
                  
                  if (cleanWebsite && !excludeUrls.includes(cleanWebsite)) {
                    businesses.push({
                      name: detailsResponse.result.name,
                      website: cleanWebsite,
                      location: detailsResponse.result.formatted_address,
                      distance: Math.round(distance * 10) / 10,
                      placeId: place.place_id,
                      rating: detailsResponse.result.rating,
                      types: detailsResponse.result.types
                    });
                    
                    console.log(`✅ Trouvé: ${detailsResponse.result.name} - ${cleanWebsite}`);
                  }
                }
              } catch (detailError) {
                console.warn(`⚠️ Erreur détails pour ${place.name}:`, detailError);
              }
            }
            
            nextPageToken = searchResponse.next_page_token;
            pageCount++;
            
            // Délai obligatoire avant d'utiliser next_page_token
            if (nextPageToken) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
          } while (nextPageToken && pageCount < maxPages && businesses.length < maxResults);
          
        } catch (typeError) {
          console.warn(`⚠️ Erreur pour le type ${businessType}:`, typeError);
        }
      }
      
      // Passer au rayon suivant
      currentRadius += radiusIncrement;
      
      // Si on n'a pas trouvé assez d'entreprises, continuer avec un rayon plus large
      if (businesses.length < maxResults / 2 && currentRadius <= maxRadius) {
        console.log(`📈 Élargissement de la recherche à ${currentRadius/1000}km...`);
      }
    }
    
    // Trier par distance
    businesses.sort((a, b) => a.distance - b.distance);
    
    console.log(`🎉 Découverte terminée: ${businesses.length} entreprises trouvées`);
    return businesses;
    
  } catch (error) {
    console.error('❌ Erreur lors de la découverte:', error);
    throw new Error(`Erreur lors de la découverte des entreprises: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

export function validateWebsiteUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}