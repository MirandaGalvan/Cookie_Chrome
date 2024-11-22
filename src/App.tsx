import { useState, useEffect } from 'react'
import './App.css'

interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expirationDate?: number;
  secure: boolean;
  analysis?: string;
}

function App() {
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCookies();
  }, []);

  const getCookies = async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      
      if (!currentTab.url) {
        setError('No se puede acceder a la URL de la pestaña actual');
        setLoading(false);
        return;
      }

      const url = new URL(currentTab.url);
      const cookies = await chrome.cookies.getAll({ domain: url.hostname });
      
      const analyzedCookies = cookies.map(cookie => {
        const purpose = analizarCookie(cookie);
        return {
          ...cookie,
          analysis: purpose
        };
      });

      setCookies(analyzedCookies);
      setLoading(false);
    } catch (err: any) {
      setError('Error al obtener las cookies: ' + (err?.message || 'Error desconocido'));
      setLoading(false);
    }
  };

  const analizarCookie = (cookie: Cookie) => {
    const name = cookie.name.toLowerCase();
    
    if (name.includes('session') || name.includes('sid')) {
      return 'Cookie de sesión - Mantiene tu estado de inicio de sesión';
    }
    if (name.includes('track') || name.includes('ga') || name.includes('analytics')) {
      return 'Cookie de seguimiento - Realiza seguimiento de tu actividad';
    }
    if (name.includes('prefer') || name.includes('settings')) {
      return 'Cookie de preferencias - Guarda tus configuraciones';
    }
    if (name.includes('ad') || name.includes('marketing')) {
      return 'Cookie publicitaria - Usada para mostrar anuncios relevantes';
    }
    if (cookie.secure) {
      return 'Cookie segura - Solo se transmite a través de HTTPS';
    }
    
    return 'Cookie de propósito desconocido - Requiere análisis manual';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'No expira';
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <>
      <ul className="circles">
        {[...Array(10)].map((_, i) => (
          <li key={i}></li>
        ))}
      </ul>
      
      <div className="container">
        <h1>Analizador de Cookies</h1>

        {loading ? (
          <div className="text-center">Cargando cookies...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : cookies.length === 0 ? (
          <div className="text-center">No se encontraron cookies en este sitio</div>
        ) : (
          <div>
            <div className="cookie-count">
              Se encontraron {cookies.length} cookies en este sitio
            </div>
            
            <div className="cookies-list">
              {cookies.map((cookie, index) => (
                <div key={index} className="cookie-card">
                  <div className="cookie-name">{cookie.name}</div>
                  
                  <div className="cookie-info-row">
                    <div className="cookie-label">Dominio:</div>
                    <div className="cookie-value">{cookie.domain}</div>
                  </div>
                  
                  <div className="cookie-info-row">
                    <div className="cookie-label">Ruta:</div>
                    <div className="cookie-value">{cookie.path}</div>
                  </div>
                  
                  <div className="cookie-info-row">
                    <div className="cookie-label">Segura:</div>
                    <div className="cookie-value">{cookie.secure ? 'Sí' : 'No'}</div>
                  </div>
                  
                  <div className="cookie-info-row">
                    <div className="cookie-label">Expira:</div>
                    <div className="cookie-value">{formatDate(cookie.expirationDate)}</div>
                  </div>

                  <div className="analysis-section">
                    <div className="analysis-title">Análisis:</div>
                    <div className="analysis-content">{cookie.analysis}</div>
                  </div>

                  <div className="value-toggle">
                    ▾ Ver valor
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;