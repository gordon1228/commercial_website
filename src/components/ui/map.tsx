'use client'

import { useState } from 'react'
import { MapPin, ExternalLink } from 'lucide-react'
import { Button } from './button'

interface MapProps {
  address: string
  businessName?: string
  className?: string
}

export function Map({ address, businessName = "EVTL", className = "" }: MapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  
  // Create Google Maps embed URL (for future use with API key)
  // const createMapUrl = (address: string) => {
  //   const encodedAddress = encodeURIComponent(address)
  //   return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedAddress}`
  // }

  // For fallback - create a simple Google Maps search URL
  const createDirectionsUrl = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  }

  // Use a demonstration address that will show a real location
  const demoAddress = "123 Business Avenue, Commercial District, NY 10001, United States"
  const displayAddress = address || demoAddress
  
  const openInGoogleMaps = () => {
    window.open(createDirectionsUrl(displayAddress), '_blank')
  }

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {!mapLoaded ? (
        <div className="aspect-[21/9] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="text-center p-8">
            <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Visit Our Showroom</h3>
            <p className="text-gray-600 mb-4 max-w-md">
              {displayAddress}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setMapLoaded(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Show Interactive Map
              </Button>
              <Button 
                variant="outline"
                onClick={openInGoogleMaps}
                className="ml-2"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Google Maps
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-[21/9] relative">
          {/* Google Maps Embed - Using a public demo embed for illustration */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.681138873825!2d-73.98784368459395!3d40.74844797932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1642023456789!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map showing location of ${businessName}`}
            className="w-full h-full"
          />
          
          {/* Overlay with address info */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
            <div className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{businessName}</h4>
                <p className="text-gray-600 text-xs leading-relaxed">{displayAddress}</p>
              </div>
            </div>
          </div>

          {/* Action buttons overlay */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button
              size="sm"
              onClick={openInGoogleMaps}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Directions
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}