'use client'

import dynamic from 'next/dynamic'

const MarketplaceApp = dynamic(
  () => import('./components/Marketplace').then(mod => ({ 
    default: mod.MarketplaceApp 
  })),
  { ssr: false }
)

export default function Home() {
  return <MarketplaceApp />
}