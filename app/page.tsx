'use client'

import dynamic from 'next/dynamic'

const MarketplaceApp = dynamic(
  () => import('./components/Marketplace').then(mod => ({ 
    default: mod.MarketplaceApp 
  })),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        background: '#09090f', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7fff',
        fontFamily: 'sans-serif',
        fontSize: 14,
      }}>
        Loading CONACT...
      </div>
    )
  }
)

export default function Home() {
  return <MarketplaceApp />
}