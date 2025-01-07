import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from '../components/AuthForm';

export function HomePage() {
  const { session } = useAuth();

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ 
        backgroundImage: 'url(https://images.unsplash.com/photo-1616432043562-3671ea2e5242?auto=format&fit=crop&q=80)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundBlendMode: 'multiply',
        backgroundPosition: 'center'
      }}
    >
      <div className="max-w-md w-full mx-4">
        <AuthForm />
      </div>
    </div>
  );
}