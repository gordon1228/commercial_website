'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface CountryCode {
  code: string
  name: string
  flag: string
  dialCode: string
}

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const countryCodes: CountryCode[] = [
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82' }
]

export default function PhoneInput({ value, onChange, placeholder = "Enter phone number", className = "", disabled = false }: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Parse existing value to extract country code and number
  const parsePhoneValue = (phoneValue: string) => {
    if (!phoneValue) return { countryCode: countryCodes[0], number: '' }
    
    // Try to find matching country code
    const matchingCountry = countryCodes.find(country => 
      phoneValue.startsWith(country.dialCode)
    )
    
    if (matchingCountry) {
      const number = phoneValue.slice(matchingCountry.dialCode.length).trim()
      return { countryCode: matchingCountry, number }
    }
    
    // If no country code found, assume it's just a number with default country
    return { countryCode: countryCodes[0], number: phoneValue }
  }
  
  const { countryCode: selectedCountry, number } = parsePhoneValue(value)
  
  const handleCountrySelect = (country: CountryCode) => {
    const newValue = number ? `${country.dialCode} ${number}` : country.dialCode
    onChange(newValue)
    setIsOpen(false)
  }
  
  const handleNumberChange = (newNumber: string) => {
    // Remove any non-digit characters except spaces, hyphens, and parentheses
    const cleanNumber = newNumber.replace(/[^\d\s\-\(\)]/g, '')
    const newValue = cleanNumber ? `${selectedCountry.dialCode} ${cleanNumber}` : selectedCountry.dialCode
    onChange(newValue)
  }
  
  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>
          
          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 focus:outline-none focus:bg-gray-50"
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {country.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {country.dialCode}
                    </div>
                  </div>
                  {selectedCountry.code === country.code && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Phone Number Input */}
        <Input
          type="tel"
          value={number}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-l-none border-l-0 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {/* Click outside handler */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}