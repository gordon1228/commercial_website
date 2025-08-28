'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Settings, Save, User, Mail, Lock, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'EliteFleet',
    contactEmail: 'contact@elitefleet.com',
    supportPhone: '+1 (555) 123-4567',
    address: '123 Business Avenue, Commercial District, NY 10001',
    emailNotifications: true,
    systemNotifications: true,
    maintenanceMode: false
  })
  const [profileForm, setProfileForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  const handleSettingsChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call - in real app, you'd save to database
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Failed to save settings')
    } finally {
      setIsLoading(false)
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

    setIsLoading(true)
    
    try {
      // In real app, you'd call API to change password
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Password changed successfully!')
      setProfileForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      alert('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
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
                <Input
                  value={settings.supportPhone}
                  onChange={(e) => handleSettingsChange('supportPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
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

              <Button type="submit" disabled={isLoading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Settings'}
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

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Changing...' : 'Change Password'}
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
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}