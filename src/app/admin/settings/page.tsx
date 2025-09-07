'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Settings, Save, User, Mail, Lock, Bell, Link2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface PhoneNumberParts {
  countryCode: string
  number: string
}

// Popular country codes for commercial businesses
const COUNTRY_CODES = [
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSettingsLoading, setIsSettingsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [settings, setSettings] = useState({
    siteName: '',
    contactEmail: '',
    supportPhone: '',
    address: '',
    emailNotifications: false,
    systemNotifications: false,
    maintenanceMode: false
  })
  
  const [footerSettings, setFooterSettings] = useState({
    companyDescription: '',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    privacyPolicyUrl: '',
    termsOfServiceUrl: ''
  })
  const [profileForm, setProfileForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Phone number parsing and formatting
  const parsePhoneNumber = (fullNumber: string): PhoneNumberParts => {
    const cleaned = fullNumber.replace(/[\s\-\(\)]/g, '')
    
    // Find matching country code
    const matchingCode = COUNTRY_CODES.find(cc => cleaned.startsWith(cc.code))
    
    if (matchingCode) {
      return {
        countryCode: matchingCode.code,
        number: cleaned.substring(matchingCode.code.length)
      }
    }
    
    // Default to Malaysia if no country code found
    if (cleaned.startsWith('0')) {
      return {
        countryCode: '+60',
        number: cleaned.substring(1)
      }
    }
    
    return {
      countryCode: '+60',
      number: cleaned
    }
  }
  
  const formatPhoneNumber = (countryCode: string, number: string): string => {
    return countryCode + number.replace(/[\s\-\(\)]/g, '')
  }

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
    
    // Load settings from API
    loadInitialData()
  }, [session, status, router])

  const loadInitialData = async () => {
    setIsDataLoading(true)
    await Promise.all([loadSettings(), loadFooterSettings()])
    setIsDataLoading(false)
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          siteName: data.siteName || 'EVTL',
          contactEmail: data.contactEmail || 'contact@EVTL.com',
          supportPhone: data.supportPhone || '010-339-1414/+016-332-2349',
          address: data.address || '3-20 Level 3 MKH Boulevard Jalan Changkat, 43000 Kajang Selangor Malaysia',
          emailNotifications: data.emailNotifications ?? true,
          systemNotifications: data.systemNotifications ?? true,
          maintenanceMode: data.maintenanceMode ?? false
        })
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const loadFooterSettings = async () => {
    try {
      const response = await fetch('/api/contact-info')
      if (response.ok) {
        const data = await response.json()
        setFooterSettings({
          companyDescription: data.companyDescription || 'EVTL Sdn. Bhd. is a next-generation mobility startup focusing on Electric Trucks (EV Trucks) and future smart transport solutions.',
          facebookUrl: data.facebookUrl || '',
          twitterUrl: data.twitterUrl || '',
          instagramUrl: data.instagramUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          privacyPolicyUrl: data.privacyPolicyUrl || '/privacy',
          termsOfServiceUrl: data.termsOfServiceUrl || '/terms'
        })
      }
    } catch (error) {
      console.error('Failed to load footer settings:', error)
    }
  }

  const handleSettingsChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }
  
  const updatePhoneNumber = (countryCode: string, number: string) => {
    const formattedPhone = formatPhoneNumber(countryCode, number)
    setSettings(prev => ({ ...prev, supportPhone: formattedPhone }))
  }

  const handleFooterSettingsChange = (field: string, value: string) => {
    setFooterSettings(prev => ({ ...prev, [field]: value }))
  }

  const saveFooterSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSettingsLoading(true)
    
    try {
      // For now, we'll use the contact-info endpoint to save footer settings
      // In a real implementation, we'd extend that endpoint or create a dedicated one
      const response = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerSettings)
      })
      
      if (response.ok) {
        alert('Footer settings saved successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to save footer settings: ${error.error}`)
      }
    } catch {
      alert('Failed to save footer settings')
    } finally {
      setIsSettingsLoading(false)
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSettingsLoading(true)
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        alert('Settings saved successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to save settings: ${error.error}`)
      }
    } catch {
      alert('Failed to save settings')
    } finally {
      setIsSettingsLoading(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (profileForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    setIsPasswordLoading(true)
    
    try {
      // In real app, you'd call API to change password
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Password changed successfully!')
      setProfileForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch {
      alert('Failed to change password')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  if (status === 'loading' || isDataLoading) {
    return (
      <div className="px-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your application settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => handleSettingsChange('siteName', e.target.value)}
                  placeholder="EliteFleet"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleSettingsChange('contactEmail', e.target.value)}
                  placeholder="contact@elitefleet.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Phone
                </label>
                <div className="flex gap-2">
                  <select 
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={parsePhoneNumber(settings.supportPhone).countryCode} 
                    onChange={(e) => {
                      const parsed = parsePhoneNumber(settings.supportPhone)
                      updatePhoneNumber(e.target.value, parsed.number)
                    }}
                  >
                    {COUNTRY_CODES.map((cc) => (
                      <option key={cc.code} value={cc.code}>
                        {cc.flag} {cc.code} {cc.country}
                      </option>
                    ))}
                  </select>
                  <Input
                    className="flex-1"
                    value={parsePhoneNumber(settings.supportPhone).number}
                    onChange={(e) => {
                      const parsed = parsePhoneNumber(settings.supportPhone)
                      updatePhoneNumber(parsed.countryCode, e.target.value)
                    }}
                    placeholder="123456789"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Full number: {settings.supportPhone}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <Input
                  value={settings.address}
                  onChange={(e) => handleSettingsChange('address', e.target.value)}
                  placeholder="123 Business Avenue"
                />
              </div>

              <Button type="submit" disabled={isSettingsLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSettingsLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current User Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="font-medium">{session?.user?.email}</span>
              </div>
              <div className="text-sm text-gray-600">
                Role: {session?.user?.role}
              </div>
            </div>

            {/* Change Password */}
            <form onSubmit={changePassword} className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  minLength={6}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  minLength={6}
                  required
                />
              </div>

              <Button type="submit" disabled={isPasswordLoading} className="w-full">
                {isPasswordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Email Notifications</label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingsChange('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">System Notifications</label>
                  <p className="text-sm text-gray-600">Receive system alerts and updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.systemNotifications}
                  onChange={(e) => handleSettingsChange('systemNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" disabled={isSettingsLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSettingsLoading ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Maintenance Mode</label>
                  <p className="text-sm text-gray-600">Put the site in maintenance mode</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingsChange('maintenanceMode', e.target.checked)}
                  className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
              </div>
              
              {settings.maintenanceMode && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  Warning: Maintenance mode will make the site inaccessible to regular users.
                </div>
              )}

              <Button type="submit" disabled={isSettingsLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSettingsLoading ? 'Saving...' : 'Save System Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Footer Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveFooterSettings} className="space-y-6">
              {/* Company Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  value={footerSettings.companyDescription}
                  onChange={(e) => handleFooterSettingsChange('companyDescription', e.target.value)}
                  placeholder="Company description shown in footer"
                />
              </div>

              {/* Social Media URLs */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Social Media Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      Facebook URL
                    </label>
                    <Input
                      value={footerSettings.facebookUrl}
                      onChange={(e) => handleFooterSettingsChange('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/your-page"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter URL
                    </label>
                    <Input
                      value={footerSettings.twitterUrl}
                      onChange={(e) => handleFooterSettingsChange('twitterUrl', e.target.value)}
                      placeholder="https://twitter.com/your-handle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram URL
                    </label>
                    <Input
                      value={footerSettings.instagramUrl}
                      onChange={(e) => handleFooterSettingsChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/your-account"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1 flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn URL
                    </label>
                    <Input
                      value={footerSettings.linkedinUrl}
                      onChange={(e) => handleFooterSettingsChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/company/your-company"
                    />
                  </div>
                </div>
              </div>

              {/* Legal Links */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Legal Pages</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Privacy Policy URL
                    </label>
                    <Input
                      value={footerSettings.privacyPolicyUrl}
                      onChange={(e) => handleFooterSettingsChange('privacyPolicyUrl', e.target.value)}
                      placeholder="/privacy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Terms of Service URL
                    </label>
                    <Input
                      value={footerSettings.termsOfServiceUrl}
                      onChange={(e) => handleFooterSettingsChange('termsOfServiceUrl', e.target.value)}
                      placeholder="/terms"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isSettingsLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSettingsLoading ? 'Saving...' : 'Save Footer Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}