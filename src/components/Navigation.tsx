import React from 'react';
import { Upload, Menu, LogIn, Database } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { InteriorLogo } from './InteriorLogo';
import { useAuth } from '../contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { AuthModal } from './AuthModal';
import { useState } from 'react';

export function Navigation() {
  const location = useLocation();
  const { session } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <InteriorLogo />
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Viajes
              </Link>
              
              <Link
                to="/upload"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/upload')
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Cargar Viajes
              </Link>
              <Link
                to="/updates"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/updates')
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Actualizaciones
              </Link>
              <Link
                to="/mysql"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/mysql')
                    ? 'border-primary text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                MySQL
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <UserMenu 
                email={session.user.email || ''} 
                onSignOut={() => setShowAuthModal(false)} 
              />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogIn className="h-5 w-5" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </nav>
  );
}