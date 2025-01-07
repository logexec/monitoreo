import React from 'react';
import { TripStatus } from '../types/database';
import { statusLabels, statusColors } from '../constants/statusMappings';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface StatusSelectProps {
  tripId: string;
  currentStatus: TripStatus;
  onStatusChange: (newStatus: TripStatus) => void;
}

export function StatusSelect({ tripId, currentStatus, onStatusChange }: StatusSelectProps) {
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TripStatus;
    
    try {
      const { error } = await supabase
        .from('trips')
        .update({ current_status: newStatus })
        .eq('id', tripId);

      if (error) throw error;
      
      onStatusChange(newStatus);
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  return (
    <div className="flex justify-center">
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        className={`text-center appearance-none border-0 focus:ring-2 focus:ring-blue-500 rounded-md font-medium ${statusColors[currentStatus].bg} px-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option 
            key={value} 
            value={value}
            className="text-gray-900 bg-white text-center"
          >
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}