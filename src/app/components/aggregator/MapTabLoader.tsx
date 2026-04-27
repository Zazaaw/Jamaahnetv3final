import React, { Suspense } from 'react';
const MapTab = React.lazy(() => import('./MapTab'));

export default function MapTabLoader() {
  return (
    <Suspense fallback={
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#94a3b8' }}>
        Memuat Peta...
      </div>
    }>
      <MapTab />
    </Suspense>
  );
}