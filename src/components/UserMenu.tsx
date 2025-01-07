import React, { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  email: string;
  onSignOut: () => void;
}

export function UserMenu({ email, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { clearSession } = useAuth();

  const handleSignOut = async () => {
    try {
      setIsOpen(false);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear the session from context
      clearSession();
      
      // Call the onSignOut callback from props
      onSignOut();
      
      // Navigate to home page and force a reload
      navigate('/', { replace: true });
      setTimeout(() => window.location.reload(), 100);
      
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
      >
        <User className="h-5 w-5" />
        <span className="hidden md:inline">{email}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}