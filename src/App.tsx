import { useState, useEffect } from 'react'
import './App.css'

interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expirationDate?: number;
  secure: boolean;
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

      // Sacamos las cookies de la URL en la que estamos 
      const url = new URL(currentTab.url);
      const cookies = await chrome.cookies.getAll({ domain: url.hostname });
      
    // analisis de las cookies 
      const analyzedCookies = cookies.map(cookie => {
        let purpose = analizarCookie(cookie);
        return {
          ...cookie,
          analysis: purpose
        };
      });

      setCookies(analyzedCookies);
      setLoading(false);
    } catch (err) {
      setError('Error al obtener las cookies: ' + err.message);
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
    <div className="container">
      <h1>
        Analizador de Cookies
        <span role="img" aria-label="cookie">🍪</span>
      </h1>

      {loading ? (
        <div className="text-center">Cargando cookies...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : cookies.length === 0 ? (
        <div className="text-center">No se encontraron cookies en este sitio</div>
      ) : (
        <div>
          <div className="mb-4">
            Se encontraron {cookies.length} cookies en este sitio
          </div>
          
          <div className="cookies-list">
            {cookies.map((cookie, index) => (
              <div key={index} className="cookie-card">
                <div className="cookie-header">{cookie.name}</div>
                
                <div className="cookie-info">
                  <span className="cookie-label">Dominio:</span>
                  <span className="cookie-value">{cookie.domain}</span>
                  
                  <span className="cookie-label">Ruta:</span>
                  <span className="cookie-value">{cookie.path}</span>
                  
                  <span className="cookie-label">Segura:</span>
                  <span className="cookie-value">{cookie.secure ? 'Sí' : 'No'}</span>
                  
                  <span className="cookie-label">Expira:</span>
                  <span className="cookie-value">{formatDate(cookie.expirationDate)}</span>
                </div>

                <div className="analysis-section">
                  <div className="cookie-label">Análisis:</div>
                  <div className="cookie-value">{cookie.analysis}</div>
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer text-gray-600">Ver valor</summary>
                  <div className="mt-1 p-2 bg-gray-50 rounded break-all">
                    {cookie.value}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;