import {
  validation,
  validateInput,
  sanitizeHtml,
  sanitizeString,
  sanitizeFileName,
  generateCSRFToken,
  validateCSRFToken,
  checkPasswordStrength,
  validateEmailDomain
} from '../validation'

describe('Validation Library', () => {
  describe('Email validation', () => {
    it('validates correct email addresses', () => {
      const result = validateInput(validation.email, 'test@example.com')
      expect(result.success).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      const invalidEmails = ['invalid', '@example.com', 'test@', 'test.example.com']
      
      invalidEmails.forEach(email => {
        const result = validateInput(validation.email, email)
        expect(result.success).toBe(false)
      })
    })

    it('rejects email addresses that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      const result = validateInput(validation.email, longEmail)
      expect(result.success).toBe(false)
    })
  })

  describe('Phone validation', () => {
    it('validates correct phone numbers', () => {
      const validPhones = ['+1234567890', '1234567890', '+447890123456']
      
      validPhones.forEach(phone => {
        const result = validateInput(validation.phone, phone)
        expect(result.success).toBe(true)
      })
    })

    it('rejects invalid phone numbers', () => {
      const invalidPhones = ['abc', '123', '+0123456789', 'phone']
      
      invalidPhones.forEach(phone => {
        const result = validateInput(validation.phone, phone)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Password validation', () => {
    it('validates strong passwords', () => {
      const strongPassword = 'StrongPass123!'
      const result = validateInput(validation.password, strongPassword)
      expect(result.success).toBe(true)
    })

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'weak',
        'password',
        '12345678',
        'PASSWORD',
        'Password1',
        'password!'
      ]
      
      weakPasswords.forEach(password => {
        const result = validateInput(validation.password, password)
        expect(result.success).toBe(false)
      })
    })

    it('checks password strength correctly', () => {
      const weakPassword = 'weak'
      const strongPassword = 'StrongPass123!'
      
      const weakResult = checkPasswordStrength(weakPassword)
      const strongResult = checkPasswordStrength(strongPassword)
      
      expect(weakResult.score).toBeLessThan(strongResult.score)
      expect(weakResult.feedback.length).toBeGreaterThan(0)
      expect(strongResult.feedback.length).toBe(0)
    })
  })

  describe('Vehicle validation', () => {
    const validVehicle = {
      name: 'Test Truck',
      model: 'Model X',
      year: 2023,
      price: 50000,
      category: 'truck' as const,
      status: 'active' as const
    }

    it('validates correct vehicle data', () => {
      const result = validateInput(validation.vehicle.create, validVehicle)
      expect(result.success).toBe(true)
    })

    it('rejects invalid vehicle data', () => {
      const invalidVehicle = {
        ...validVehicle,
        year: 1800, // Too old
        price: -1000 // Negative price
      }
      
      const result = validateInput(validation.vehicle.create, invalidVehicle)
      expect(result.success).toBe(false)
    })

    it('validates vehicle updates with ID', () => {
      const updateData = {
        id: 'valid-uuid-here',
        name: 'Updated Name'
      }
      
      // Mock UUID validation - in real test would use actual UUID
      const result = validateInput(validation.vehicle.update, {
        ...updateData,
        id: '123e4567-e89b-12d3-a456-426614174000'
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Contact form validation', () => {
    const validContact = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message that is long enough'
    }

    it('validates correct contact form data', () => {
      const result = validateInput(validation.contact, validContact)
      expect(result.success).toBe(true)
    })

    it('rejects invalid contact form data', () => {
      const invalidContact = {
        ...validContact,
        message: 'Short' // Too short
      }
      
      const result = validateInput(validation.contact, invalidContact)
      expect(result.success).toBe(false)
    })
  })

  describe('Sanitization functions', () => {
    describe('sanitizeHtml', () => {
      it('removes dangerous HTML tags', () => {
        const dangerous = '<script>alert("xss")</script><p>Safe content</p>'
        const result = sanitizeHtml(dangerous)
        
        expect(result).not.toContain('<script>')
        expect(result).toContain('<p>Safe content</p>')
      })

      it('allows safe HTML tags', () => {
        const safeHtml = '<p>Safe <strong>content</strong> with <em>emphasis</em></p>'
        const result = sanitizeHtml(safeHtml)
        
        expect(result).toContain('<p>')
        expect(result).toContain('<strong>')
        expect(result).toContain('<em>')
      })
    })

    describe('sanitizeString', () => {
      it('escapes dangerous characters', () => {
        const dangerous = '<script>alert("xss")</script>'
        const result = sanitizeString(dangerous)
        
        expect(result).toContain('&lt;')
        expect(result).toContain('&gt;')
        expect(result).not.toContain('<script>')
      })

      it('handles quotes and ampersands', () => {
        const input = 'Test "quotes" & ampersands'
        const result = sanitizeString(input)
        
        expect(result).toContain('&quot;')
        expect(result).toContain('&amp;')
      })
    })

    describe('sanitizeFileName', () => {
      it('removes dangerous characters from filenames', () => {
        const dangerous = '../../../etc/passwd'
        const result = sanitizeFileName(dangerous)
        
        expect(result).not.toContain('..')
        expect(result).not.toContain('/')
      })

      it('preserves safe characters', () => {
        const safe = 'document-2023.pdf'
        const result = sanitizeFileName(safe)
        
        expect(result).toBe(safe)
      })

      it('limits filename length', () => {
        const longName = 'a'.repeat(300) + '.txt'
        const result = sanitizeFileName(longName)
        
        expect(result.length).toBeLessThanOrEqual(255)
      })
    })
  })

  describe('CSRF token functions', () => {
    it('generates valid CSRF tokens', () => {
      const token = generateCSRFToken()
      
      expect(token).toHaveLength(64)
      expect(/^[a-f0-9]{64}$/.test(token)).toBe(true)
    })

    it('validates CSRF tokens correctly', () => {
      const token = generateCSRFToken()
      
      expect(validateCSRFToken(token, token)).toBe(true)
      expect(validateCSRFToken(token, 'different-token')).toBe(false)
      expect(validateCSRFToken('invalid', token)).toBe(false)
    })
  })

  describe('Email domain validation', () => {
    it('allows all domains when no restriction', () => {
      expect(validateEmailDomain('test@example.com')).toBe(true)
      expect(validateEmailDomain('test@anydomain.org')).toBe(true)
    })

    it('restricts to allowed domains', () => {
      const allowedDomains = ['example.com', 'company.org']
      
      expect(validateEmailDomain('test@example.com', allowedDomains)).toBe(true)
      expect(validateEmailDomain('test@company.org', allowedDomains)).toBe(true)
      expect(validateEmailDomain('test@badactor.com', allowedDomains)).toBe(false)
    })
  })

  describe('Input length validation', () => {
    it('validates input length in bytes', () => {
      // Import the function that needs to be tested
      const { validateInputLength } = require('../validation')
      
      expect(validateInputLength('short', 100)).toBe(true)
      expect(validateInputLength('a'.repeat(1000), 500)).toBe(false)
      
      // Test with UTF-8 characters
      const unicodeText = '测试文本' // Chinese characters
      expect(validateInputLength(unicodeText, 50)).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('handles validation errors gracefully', () => {
      const result = validateInput(validation.email, null)
      
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(Array.isArray(result.errors)).toBe(true)
    })

    it('provides meaningful error messages', () => {
      const result = validateInput(validation.password, 'weak')
      
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors[0]).toContain('Password must contain')
      }
    })
  })

  describe('File validation', () => {
    const validFile = {
      name: 'document.pdf',
      size: 1024 * 1024, // 1MB
      type: 'application/pdf'
    }

    it('validates correct file data', () => {
      const result = validateInput(validation.file, validFile)
      expect(result.success).toBe(true)
    })

    it('rejects files that are too large', () => {
      const largeFile = {
        ...validFile,
        size: 20 * 1024 * 1024 // 20MB, over the 10MB limit
      }
      
      const result = validateInput(validation.file, largeFile)
      expect(result.success).toBe(false)
    })

    it('rejects disallowed file types', () => {
      const executableFile = {
        ...validFile,
        name: 'virus.exe',
        type: 'application/x-executable'
      }
      
      const result = validateInput(validation.file, executableFile)
      expect(result.success).toBe(false)
    })
  })
})