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
    <div className="container p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        Analizador de Cookies
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
          
          <div className="space-y-4">
            {cookies.map((cookie, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <div className="font-bold text-lg">{cookie.name}</div>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-semibold">Dominio:</span> {cookie.domain}
                  </div>
                  <div>
                    <span className="font-semibold">Ruta:</span> {cookie.path}
                  </div>
                  <div>
                    <span className="font-semibold">Segura:</span> {cookie.secure ? 'Sí' : 'No'}
                  </div>
                  <div>
                    <span className="font-semibold">Expira:</span> {formatDate(cookie.expirationDate)}
                  </div>
                </div>

                <div className="mt-2 text-sm">
                  <span className="font-semibold">Análisis:</span>
                  <p className="mt-1 text-blue-600">{cookie.analysis}</p>
                </div>

                <div className="mt-2">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600">Ver valor</summary>
                    <div className="mt-1 p-2 bg-gray-50 rounded break-all">
                      {cookie.value}
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App


