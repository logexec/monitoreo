import React from 'react';

export function Logo() {
  return (
    <div className="flex items-center">
      <img
        src="https://xgbliyecljylwkiekgxc.supabase.co/storage/v1/object/public/trip-updates/24.03%20Logo%20logex%20BW.png"
        alt="LogeX Supply Chain Management" 
        className="h-32 w-auto"
        style={{ objectFit: 'contain', maxWidth: '240px' }}
      />
    </div>
  );
}