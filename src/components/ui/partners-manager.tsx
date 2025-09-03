'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageSelector from '@/components/ui/image-selector'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface Partner {
  id?: string
  name: string
  logo: string
  website?: string
  active: boolean
  order: number
}

interface PartnersManagerProps {
  onChange?: () => void
}

export default function PartnersManager({ onChange }: PartnersManagerProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await fetch('/api/partners?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners || [])
      }
    } catch (error) {
      console.error('Error fetching partners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addPartner = () => {
    const newPartner: Partner = {
      name: '',
      logo: '',
      website: '',
      active: true,
      order: partners.length + 1
    }
    setPartners([...partners, newPartner])
  }

  const updatePartner = (index: number, field: keyof Partner, value: string | boolean | number) => {
    const updatedPartners = partners.map((partner, i) => 
      i === index ? { ...partner, [field]: value } : partner
    )
    setPartners(updatedPartners)
  }

  const removePartner = (index: number) => {
    const updatedPartners = partners.filter((_, i) => i !== index)
    // Re-order remaining partners
    const reorderedPartners = updatedPartners.map((partner, i) => ({
      ...partner,
      order: i + 1
    }))
    setPartners(reorderedPartners)
  }

  const movePartner = (index: number, direction: 'up' | 'down') => {
    const newPartners = [...partners]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex < 0 || newIndex >= partners.length) return

    // Swap partners
    [newPartners[index], newPartners[newIndex]] = [newPartners[newIndex], newPartners[index]]
    
    // Update order values
    newPartners.forEach((partner, i) => {
      partner.order = i + 1
    })
    
    setPartners(newPartners)
  }

  const savePartners = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/partners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partners)
      })

      if (response.ok) {
        await fetchPartners() // Refresh with server data
        onChange?.()
      } else {
        console.error('Failed to save partners')
      }
    } catch (error) {
      console.error('Error saving partners:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Partner Logos
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPartner}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Partner
            </Button>
            <Button
              type="button"
              onClick={savePartners}
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {partners.map((partner, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                {/* Drag handle and order controls */}
                <div className="flex flex-col items-center gap-1 mt-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => movePartner(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => movePartner(index, 'down')}
                      disabled={index === partners.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                </div>

                {/* Partner details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Partner Name *</Label>
                    <Input
                      value={partner.name}
                      onChange={(e) => updatePartner(index, 'name', e.target.value)}
                      placeholder="Partner Name"
                    />
                  </div>
                  
                  <div>
                    <Label>Website (optional)</Label>
                    <Input
                      value={partner.website || ''}
                      onChange={(e) => updatePartner(index, 'website', e.target.value)}
                      placeholder="https://partner-website.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <ImageSelector
                      value={partner.logo}
                      onChange={(value) => updatePartner(index, 'logo', value)}
                      label="Partner Logo"
                      placeholder="Select partner logo"
                      folder="uploads"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={partner.active}
                      onCheckedChange={(checked) => updatePartner(index, 'active', checked)}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                {/* Remove button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePartner(index)}
                  className="mt-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {partners.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No partners configured. Add your first partner above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}