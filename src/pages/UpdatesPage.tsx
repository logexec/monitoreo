import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { TripUpdate } from '../types/database';
import { StatusBadge } from '../components/StatusBadge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SortableHeader } from '../components/SortableHeader';
import { SearchInput } from '../components/SearchInput';
import { StatusFilter } from '../components/StatusFilter';
import { sortUpdates } from '../utils/updateSorting';
import { SortConfig } from '../types/sorting';
import { useRequireAuth } from '../lib/auth';
import toast from 'react-hot-toast';

export function UpdatesPage() {
  const [updates, setUpdates] = useState<(TripUpdate & { trip: { trip_id: string; plate_number: string; project: string } })[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'created_at',
    direction: 'desc'
  });

  useEffect(() => {
    useRequireAuth()
      .then(loadUpdates)
      .catch(error => {
        console.error('Authentication error:', error);
        toast.error('Error de autenticación');
      });
  }, []);

  const loadUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('trip_updates')
        .select(`
          *,
          trip:trip_id (
            trip_id,
            plate_number,
            project
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error loading updates:', error);
      toast.error('Error al cargar las actualizaciones');
    }
  };

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredUpdates = updates.filter(update => {
    const matchesSearch = 
      String(update.trip?.trip_id || '').toLowerCase().includes(search.toLowerCase()) ||
      update.notes.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || update.category === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedUpdates = sortUpdates(filteredUpdates, sortConfig);

  return (
    <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Historial de Actualizaciones
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Buscar actualizaciones..."
              />
              <StatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto relative max-h-[calc(100vh-220px)]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="ID Viaje"
                        field="trip_id"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="Placa"
                        field="plate_number"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="Proyecto"
                        field="project"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="Estado"
                        field="category"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Notas
                      </span>
                    </th>
                    <th className="sticky top-0 bg-gray-800 z-10 px-6 py-3 text-left">
                      <SortableHeader
                        label="Fecha"
                        field="created_at"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onSort={handleSort}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedUpdates.map((update) => (
                    <tr key={update.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {update.trip?.trip_id || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {update.trip?.plate_number || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {update.trip?.project || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge category={update.category} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                        <div className="line-clamp-2">{update.notes}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(update.created_at), "dd-MMM-yy H:mm", { locale: es })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}