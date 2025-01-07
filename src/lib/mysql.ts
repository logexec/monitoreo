const API_URL = 'http://localhost:3000/api';

export async function getProjects(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    if (!response.ok) {
      throw new Error('Error al obtener los proyectos');
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Formato de respuesta inválido');
    }
    return data;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

export async function getTrips(date: string, projects: string[] = ['all']): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      date,
      projects: projects.join(',')
    });
    
    const response = await fetch(`${API_URL}/trips?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    if (!response.ok) {
      throw new Error('Error al obtener los viajes');
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Formato de respuesta inválido');
    }
    return data;
  } catch (error) {
    console.error('Error loading trips:', error);
    return [];
  }
}