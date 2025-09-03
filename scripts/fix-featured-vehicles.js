const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixFeaturedVehicles() {
  try {
    // Check current state of vehicles
    const allVehicles = await prisma.vehicle.findMany({
      include: {
        category: true
      }
    })
    
    console.log(`\nFound ${allVehicles.length} total vehicles`)
    console.log('Current featured vehicles:')
    
    const featuredVehicles = allVehicles.filter(v => v.featured)
    if (featuredVehicles.length === 0) {
      console.log('No featured vehicles found!')
      
      // Make the first 3-4 vehicles featured
      const vehiclesToFeature = allVehicles.slice(0, Math.min(4, allVehicles.length))
      
      console.log(`\nMarking ${vehiclesToFeature.length} vehicles as featured:`)
      
      for (const vehicle of vehiclesToFeature) {
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: { featured: true }
        })
        console.log(`- ${vehicle.name} (ID: ${vehicle.id})`)
      }
      
      console.log('\nFeatured vehicles updated successfully!')
    } else {
      featuredVehicles.forEach(vehicle => {
        console.log(`- ${vehicle.name} (ID: ${vehicle.id}) - Active: ${vehicle.active}`)
      })
    }
    
    // Test the API endpoint
    console.log('\nTesting featured vehicles API...')
    const response = await fetch('http://localhost:3000/api/vehicles?featured=true&limit=4')
    if (response.ok) {
      const data = await response.json()
      console.log(`API returned ${data.vehicles?.length || 0} featured vehicles`)
    } else {
      console.log('API test failed - server might not be running')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixFeaturedVehicles()