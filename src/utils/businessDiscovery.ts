// Simulation d'une API de découverte d'entreprises
// En production, vous pourriez utiliser Google Places API, Yelp API, ou d'autres services

export interface Business {
  name: string;
  website?: string;
  location: string;
  distance: number;
}

// Données simulées d'entreprises autour de Douai
const MOCK_BUSINESSES: Business[] = [
  {
    name: "Boulangerie Dupont",
    website: "https://www.boulangerie-dupont-douai.fr",
    location: "Douai Centre",
    distance: 2
  },
  {
    name: "Restaurant Le Gourmet",
    website: "https://www.restaurant-legourmet.fr",
    location: "Douai",
    distance: 1.5
  },
  {
    name: "Garage Martin",
    website: "https://www.garage-martin-douai.com",
    location: "Sin-le-Noble",
    distance: 8
  },
  {
    name: "Pharmacie Centrale",
    website: "https://www.pharmacie-centrale-douai.fr",
    location: "Douai Centre",
    distance: 1
  },
  {
    name: "Coiffeur Élégance",
    website: "https://www.coiffeur-elegance.fr",
    location: "Douai",
    distance: 3
  },
  {
    name: "Librairie du Nord",
    website: "https://www.librairie-du-nord.com",
    location: "Douai",
    distance: 2.5
  },
  {
    name: "Pizzeria Bella Vista",
    website: "https://www.pizzeria-bellavista-douai.fr",
    location: "Douai",
    distance: 4
  },
  {
    name: "Fleuriste Rose & Jasmin",
    website: "https://www.rose-jasmin-fleurs.fr",
    location: "Lewarde",
    distance: 12
  },
  {
    name: "Cabinet Dentaire Dr. Moreau",
    website: "https://www.cabinet-moreau-douai.fr",
    location: "Douai",
    distance: 2.8
  },
  {
    name: "Magasin Bio Nature",
    website: "https://www.bio-nature-douai.com",
    location: "Cuincy",
    distance: 6
  },
  {
    name: "Auto-École Conduite Plus",
    website: "https://www.conduite-plus-douai.fr",
    location: "Douai",
    distance: 3.2
  },
  {
    name: "Pressing Express",
    website: "https://www.pressing-express-douai.fr",
    location: "Douai",
    distance: 1.8
  },
  {
    name: "Agence Immobilière Habitat",
    website: "https://www.habitat-immobilier-douai.com",
    location: "Douai",
    distance: 2.1
  },
  {
    name: "Salle de Sport FitZone",
    website: "https://www.fitzone-douai.fr",
    location: "Douai",
    distance: 4.5
  },
  {
    name: "Vétérinaire Animaux & Soins",
    website: "https://www.veterinaire-douai.com",
    location: "Flers-en-Escrebieux",
    distance: 7
  }
];

export async function discoverBusinessesAroundDouai(radius: number = 30): Promise<Business[]> {
  // Simulation d'un délai d'API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Filtrer par rayon et retourner seulement ceux avec un site web
  return MOCK_BUSINESSES
    .filter(business => business.distance <= radius && business.website)
    .sort((a, b) => a.distance - b.distance);
}

export function validateWebsiteUrl(url: string): boolean {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}