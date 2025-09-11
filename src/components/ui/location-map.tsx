'use client'

import { useState } from 'react'
import { MapPin, ExternalLink, Navigation, Phone } from 'lucide-react'
import { Button } from './button'

interface LocationMapProps {
  address: string
  city: string
  state: string
  postcode: string
  country: string
  businessName?: string
  phone?: string
  className?: string
}

export function LocationMap({ 
  address, 
  city, 
  state, 
  postcode, 
  country, 
  businessName = "EVTL", 
  phone,
  className = "" 
}: LocationMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false)
  
  // Construct full address
  const fullAddress = `${address}, ${city}, ${state} ${postcode}, ${country}`
  
  // Create Google Maps URLs
  const createDirectionsUrl = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
  }

  const createNavigationUrl = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
  }

  // Create a generic map embed URL (this will show a centered map of the area)
  const createEmbedUrl = () => {
    // Using coordinates for MKH Boulevard, Kajang, Selangor, Malaysia
    // Latitude: 2.9900434, Longitude: 101.7920339
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.394!2d101.7920339!3d2.9900434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cdcb0ab9b5d0a7%3A0x5c3a8a8a8a8a8a8a!2sMKH%20Boulevard%2C%20Jalan%20Changkat%2C%20Kajang%2C%20Selangor%2C%20Malaysia!5e0!3m2!1sen!2smy!4v1642023456789!5m2!1sen!2smy"
  }

  const openInGoogleMaps = () => {
    window.open(createDirectionsUrl(fullAddress), '_blank')
  }

  const startNavigation = () => {
    window.open(createNavigationUrl(fullAddress), '_blank')
  }

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {!mapLoaded ? (
        <div className="aspect-[21/9] flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="text-center p-8 relative z-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-md mx-auto">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{businessName}</h3>
              <h4 className="text-lg font-medium text-gray-800 mb-3">Visit Our Location</h4>
              
              <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <div className="font-medium">{address}</div>
                    <div>{city}, {state} {postcode}</div>
                    <div>{country}</div>
                  </div>
                </div>
                {phone && (
                  <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{phone}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => setMapLoaded(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  View Interactive Map
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={openInGoogleMaps}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Maps
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={startNavigation}
                    className="flex-1"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-[21/9] relative">
          {/* Google Maps Embed */}
          <iframe
            src={createEmbedUrl()}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Map showing location of ${businessName}`}
            className="w-full h-full"
          />
          
          {/* Info overlay */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{businessName}</h4>
                <div className="text-gray-600 text-xs leading-relaxed">
                  <div>{address}</div>
                  <div>{city}, {state} {postcode}</div>
                  <div>{country}</div>
                </div>
                {phone && (
                  <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-gray-200">
                    <Phone className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-600">{phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <Button
              size="sm"
              onClick={startNavigation}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
            >
              <Navigation className="h-3 w-3 mr-1" />
              Navigate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={openInGoogleMaps}
              className="bg-white/90 hover:bg-white shadow-lg"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Larger
            </Button>
          </div>

          {/* Back to preview button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMapLoaded(false)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg"
          >
            ← Back
          </Button>
        </div>
      )}
    </div>
  )
}