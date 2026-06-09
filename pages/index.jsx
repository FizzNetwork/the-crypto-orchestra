import dynamic from 'next/dynamic'

const TraderLive = dynamic(() => import('../components/TraderLive'), { ssr: false })

export default function Page() {
  return <TraderLive />
}
