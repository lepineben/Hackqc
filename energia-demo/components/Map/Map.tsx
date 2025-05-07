import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'

// Using dynamic import without SSR since Leaflet requires window object
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const ZoomControl = dynamic(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
)

const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
)

type MapProps = {
  location: {
    lat: number
    lng: number
  }
}

const Map = ({ location }: MapProps) => {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Fix for Leaflet icons not showing correctly in Next.js
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/icons/marker-icon-2x.png',
        iconUrl: '/icons/marker-icon.png',
        shadowUrl: '/icons/marker-shadow.png',
      })
      
      // Set map as loaded
      setIsLoaded(true)
    })
  }, [])

  // Return a placeholder div when rendering on the server
  if (typeof window === 'undefined') {
    return <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
  }

  return (
    <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="absolute top-4 left-4 z-[1000] bg-white py-1 px-3 rounded-full shadow-md text-sm font-medium text-gray-700 border border-gray-200">
        Hydro-Québec
      </div>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright" />
        <Marker position={[location.lat, location.lng]}>
          <Popup className="custom-popup">
            <div className="font-medium">Infrastructure électrique</div>
            <div className="text-sm text-gray-600">Position: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div>
            <div className="text-xs mt-1 text-blue-600">Cliquez pour plus d'info</div>
          </Popup>
        </Marker>
        <Circle
          center={[location.lat, location.lng]}
          radius={200}
          pathOptions={{
            color: 'rgba(66, 133, 244, 0.8)',
            fillColor: 'rgba(66, 133, 244, 0.2)',
            fillOpacity: 0.5
          }}
        />
      </MapContainer>
    </div>
  )
}

export default Map