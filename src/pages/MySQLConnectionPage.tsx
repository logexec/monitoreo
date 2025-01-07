import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function MySQLConnectionPage() {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      const response = await fetch('http://localhost:3000/api/health');
      const data = await response.json();
      
      if (data.status === 'healthy') {
        setStatus('healthy');
        setError(null);
        toast.success('Conexión establecida correctamente');
      } else {
        throw new Error(data.error || 'Error de conexión');
      }
    } catch (error) {
      setStatus('unhealthy');
      setError(error instanceof Error ? error.message : 'Error desconocido');
      toast.error('Error al conectar con la base de datos');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center justify-center mb-6">
              <Database className="h-12 w-12 text-blue-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Estado de Conexión MySQL
            </h2>

            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${
                status === 'checking' ? 'bg-blue-50' :
                status === 'healthy' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center">
                  {status === 'checking' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                  ) : status === 'healthy' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      status === 'checking' ? 'text-blue-800' :
                      status === 'healthy' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {status === 'checking' ? 'Verificando conexión...' :
                       status === 'healthy' ? 'Conexión establecida' : 'Error de conexión'}
                    </h3>
                    {error && (
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Detalles de Conexión
                </h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Host</dt>
                    <dd className="mt-1 text-sm text-gray-900">sgt.logex.com.ec</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Base de Datos</dt>
                    <dd className="mt-1 text-sm text-gray-900">onix_viajes</dd>
                  </div>
                </dl>
              </div>

              <button
                onClick={checkConnection}
                disabled={status === 'checking'}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {status === 'checking' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Conexión'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}