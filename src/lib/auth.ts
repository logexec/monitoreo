import { supabase } from './supabase';
import toast from 'react-hot-toast';

async function signIn() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'demo@example.com',
    password: 'demo12345'
  });
  
  if (error) {
    console.error('Sign in error:', error);
    throw new Error('Error al iniciar sesión. Por favor, verifica tus credenciales.');
  }
  return data.session;
}

async function signUp() {
  const { data, error } = await supabase.auth.signUp({
    email: 'demo@example.com',
    password: 'demo12345'
  });
  
  if (error) {
    console.error('Sign up error:', error);
    if (error.message.includes('already registered')) {
      return signIn();
    }
    throw new Error('Error al crear la cuenta. Por favor, intenta nuevamente.');
  }
  return data.session;
}

export async function useRequireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    try {
      const authSession = await signIn();
      toast.success('Sesión iniciada correctamente');
      return authSession;
    } catch (error) {
      try {
        const authSession = await signUp();
        toast.success('Cuenta creada y sesión iniciada correctamente');
        return authSession;
      } catch (signUpError) {
        toast.error(signUpError instanceof Error ? signUpError.message : 'Error de autenticación');
        throw signUpError;
      }
    }
  }
  return session;
}