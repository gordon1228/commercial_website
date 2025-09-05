const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateContactInfoAddress() {
  try {
    console.log('Updating contact info with proper Malaysian address...')
    
    // Update the contact info with Malaysian format
    const contactInfo = await prisma.contactInfo.findFirst()
    
    if (contactInfo) {
      await prisma.contactInfo.update({
        where: { id: contactInfo.id },
        data: {
          city: 'Kajang',
          state: 'Selangor', 
          postcode: '43000',
          country: 'Malaysia'
        }
      })
      
      console.log('✅ Successfully updated contact info address!')
      
      // Show the updated info
      const updatedInfo = await prisma.contactInfo.findFirst()
      console.log('Updated address:', {
        address: updatedInfo?.address,
        city: updatedInfo?.city,
        state: updatedInfo?.state,
        postcode: updatedInfo?.postcode,
        country: updatedInfo?.country
      })
    } else {
      console.log('No contact info found to update')
    }
    
  } catch (error) {
    console.error('❌ Error updating contact info:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateContactInfoAddress()