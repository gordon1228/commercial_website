'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface CompanyInfo {
  id: string
  companyName: string
  companyDescription: string
  foundedYear: number
  totalVehiclesSold: number
  totalHappyCustomers: number
  totalYearsExp: number
  satisfactionRate: number
  storyTitle: string
  storyParagraph1: string
  storyParagraph2: string
  storyParagraph3: string
  missionTitle: string
  missionText: string
  visionTitle: string
  visionText: string
}

export default function AdminAboutPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    fetchCompanyInfo()
  }, [])

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('/api/company-info')
      if (response.ok) {
        const data = await response.json()
        setCompanyInfo(data)
      }
    } catch (error) {
      console.error('Error fetching company info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!companyInfo) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyInfo),
      })

      if (response.ok) {
        setSaveMessage('Company information saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage('Error saving company info. Please try again.')
      }
    } catch (error) {
      console.error('Error saving company info:', error)
      setSaveMessage('Error saving company info. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateCompanyInfo = (field: keyof CompanyInfo, value: string | number) => {
    if (!companyInfo) return
    setCompanyInfo({
      ...companyInfo,
      [field]: value
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!companyInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading company info</h2>
          <Button onClick={fetchCompanyInfo}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">About Page Content</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/about">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-3 rounded-md ${
          saveMessage.includes('Error') 
            ? 'bg-red-100 text-red-800 border border-red-200' 
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Company Basic Information */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Basic Company Information</CardTitle>
          <p className="text-sm text-gray-600">Manage the basic company information displayed on the about page</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyInfo.companyName}
                onChange={(e) => updateCompanyInfo('companyName', e.target.value)}
                placeholder="EVTL"
              />
            </div>
            <div>
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                type="number"
                value={companyInfo.foundedYear}
                onChange={(e) => updateCompanyInfo('foundedYear', parseInt(e.target.value))}
                placeholder="2025"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="companyDescription">Company Description</Label>
            <Textarea
              id="companyDescription"
              value={companyInfo.companyDescription}
              onChange={(e) => updateCompanyInfo('companyDescription', e.target.value)}
              rows={3}
              placeholder="Brief description of your company"
            />
          </div>
        </CardContent>
      </Card>

      {/* Company Statistics */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Company Statistics</CardTitle>
          <p className="text-sm text-gray-600">Numerical achievements and statistics</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="totalVehiclesSold">Total Vehicles Sold</Label>
              <Input
                id="totalVehiclesSold"
                type="number"
                value={companyInfo.totalVehiclesSold}
                onChange={(e) => updateCompanyInfo('totalVehiclesSold', parseInt(e.target.value))}
                placeholder="150"
              />
            </div>
            <div>
              <Label htmlFor="totalHappyCustomers">Happy Customers</Label>
              <Input
                id="totalHappyCustomers"
                type="number"
                value={companyInfo.totalHappyCustomers}
                onChange={(e) => updateCompanyInfo('totalHappyCustomers', parseInt(e.target.value))}
                placeholder="50"
              />
            </div>
            <div>
              <Label htmlFor="totalYearsExp">Years of Experience</Label>
              <Input
                id="totalYearsExp"
                type="number"
                value={companyInfo.totalYearsExp}
                onChange={(e) => updateCompanyInfo('totalYearsExp', parseInt(e.target.value))}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="satisfactionRate">Satisfaction Rate (%)</Label>
              <Input
                id="satisfactionRate"
                type="number"
                min="0"
                max="100"
                value={companyInfo.satisfactionRate}
                onChange={(e) => updateCompanyInfo('satisfactionRate', parseInt(e.target.value))}
                placeholder="98"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission & Vision */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Mission & Vision</CardTitle>
          <p className="text-sm text-gray-600">Define your company's mission and vision statements</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="missionTitle">Mission Title</Label>
              <Input
                id="missionTitle"
                value={companyInfo.missionTitle}
                onChange={(e) => updateCompanyInfo('missionTitle', e.target.value)}
                placeholder="Our Mission"
              />
              <div className="mt-4">
                <Label htmlFor="missionText">Mission Statement</Label>
                <Textarea
                  id="missionText"
                  value={companyInfo.missionText}
                  onChange={(e) => updateCompanyInfo('missionText', e.target.value)}
                  rows={4}
                  placeholder="Enter your mission statement here"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="visionTitle">Vision Title</Label>
              <Input
                id="visionTitle"
                value={companyInfo.visionTitle}
                onChange={(e) => updateCompanyInfo('visionTitle', e.target.value)}
                placeholder="Our Vision"
              />
              <div className="mt-4">
                <Label htmlFor="visionText">Vision Statement</Label>
                <Textarea
                  id="visionText"
                  value={companyInfo.visionText}
                  onChange={(e) => updateCompanyInfo('visionText', e.target.value)}
                  rows={4}
                  placeholder="Enter your vision statement here"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Story */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Company Story</CardTitle>
          <p className="text-sm text-gray-600">Tell your company's story in three paragraphs</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="storyTitle">Story Section Title</Label>
            <Input
              id="storyTitle"
              value={companyInfo.storyTitle}
              onChange={(e) => updateCompanyInfo('storyTitle', e.target.value)}
              placeholder="Our Story"
            />
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="storyParagraph1">First Paragraph</Label>
              <Textarea
                id="storyParagraph1"
                value={companyInfo.storyParagraph1}
                onChange={(e) => updateCompanyInfo('storyParagraph1', e.target.value)}
                rows={3}
                placeholder="Tell the beginning of your company's story"
              />
            </div>
            <div>
              <Label htmlFor="storyParagraph2">Second Paragraph</Label>
              <Textarea
                id="storyParagraph2"
                value={companyInfo.storyParagraph2}
                onChange={(e) => updateCompanyInfo('storyParagraph2', e.target.value)}
                rows={3}
                placeholder="Continue your company's journey"
              />
            </div>
            <div>
              <Label htmlFor="storyParagraph3">Third Paragraph</Label>
              <Textarea
                id="storyParagraph3"
                value={companyInfo.storyParagraph3}
                onChange={(e) => updateCompanyInfo('storyParagraph3', e.target.value)}
                rows={3}
                placeholder="Present day and future vision"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}