export type CookieType = 'Marketing' | 'Analytics' | 'Functional' | 'Unknown';

export interface CookieAnalysis {
  type: CookieType;
  description: string;
}

export class CookieClassifier {
  analyzeCookie(name: string, domain: string): CookieAnalysis {
    const nameLower = name.toLowerCase();
    const domainLower = domain.toLowerCase();

 
    if (domainLower.includes('google-analytics') || domainLower.includes('yandex.metrica')) {
      return {
        type: 'Analytics',
        description: 'Cookie de análisis - Usada para analítica web y estadísticas'
      };
    }

    if (domainLower.includes('facebook') || domainLower.includes('adform')) {
      return {
        type: 'Marketing',
        description: 'Cookie de marketing - Usada para publicidad dirigida'
      };
    }

    if (domainLower.includes('wordpress') || domainLower.includes('cookieyes')) {
      return {
        type: 'Functional',
        description: 'Cookie funcional - Necesaria para la funcionalidad del sitio'
      };
    }

    // Reglas por nombre de cookie
    if (nameLower.includes('_ga') || nameLower.includes('analytics')) {
      return {
        type: 'Analytics',
        description: 'Cookie de análisis - Usada para seguimiento de usuarios'
      };
    }

    if (nameLower.includes('ad_') || nameLower.includes('pixel')) {
      return {
        type: 'Marketing',
        description: 'Cookie publicitaria - Usada para mostrar anuncios relevantes'
      };
    }

    if (nameLower.includes('consent') || nameLower.includes('cookie')) {
      return {
        type: 'Functional',
        description: 'Cookie de consentimiento - Guarda tus preferencias de cookies'
      };
    }

    // Reglas adicionales basadas en patrones comunes
    if (nameLower.includes('session') || nameLower.includes('login') || nameLower.includes('auth')) {
      return {
        type: 'Functional',
        description: 'Cookie de sesión - Mantiene tu estado de inicio de sesión'
      };
    }

    if (nameLower.includes('track') || nameLower.includes('stats')) {
      return {
        type: 'Analytics',
        description: 'Cookie de seguimiento - Analiza el comportamiento del usuario'
      };
    }

    if (nameLower.includes('campaign') || nameLower.includes('promo')) {
      return {
        type: 'Marketing',
        description: 'Cookie de campaña - Seguimiento de campañas publicitarias'
      };
    }

    return {
      type: 'Unknown',
      description: 'Cookie de propósito desconocido - Requiere análisis manual'
    };
  }

  getTypeDescription(type: CookieType): string {
    switch (type) {
      case 'Marketing':
        return 'Marketing (de plataformas de terceros)';
      case 'Analytics':
        return 'Analytics (análisis del comportamiento)';
      case 'Functional':
        return 'Functional (funcionalidad del sitio)';
      default:
        return 'Desconocido';
    }
  }
}