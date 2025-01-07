import React from 'react';

export function InteriorLogo() {
  return (
    <div className="flex items-center">
      <img
        src="https://xgbliyecljylwkiekgxc.supabase.co/storage/v1/object/public/trip-updates/logo%20lx%20transparente%20peq.png"
        alt="LogeX Supply Chain Management" 
        className="h-18 w-auto"
        style={{ objectFit: 'contain', maxWidth: '200px' }}
      />
    </div>
  );
}