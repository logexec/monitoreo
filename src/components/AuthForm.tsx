import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Logo } from './Logo';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Inicio de sesión exitoso');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Cuenta creada exitosamente');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error instanceof Error ? error.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm shadow-xl rounded-lg p-8 border border-white/10">
      <div className="flex flex-col items-center mb-8">
        <Logo />
        <h2 className="mt-4 text-xl font-semibold text-white">
          FleetOps - Sistema de Gestión de Viajes
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-white/10 bg-white/20 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm backdrop-blur-sm placeholder-white/60 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-white/10 bg-white/20 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm backdrop-blur-sm placeholder-white/60 text-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400"
        >
          <LogIn className="h-4 w-4" />
          {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </button>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/90 hover:text-white"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </form>
    </div>
  );
}