/**
 * Password Validator Unit Tests
 *
 * Comprehensive tests for password validation utility
 * Tests all validation rules, scoring, and edge cases
 */

import { describe, it, expect } from '@jest/globals'
import {
  validatePassword,
  getPasswordFeedback,
  checkPasswordBreached,
  generateStrongPassword,
  type PasswordValidationResult
} from '../../services/ash-admin/src/lib/password-validator'

describe('Password Validator', () => {
  describe('validatePassword() - Basic Requirements', () => {
    it('should accept strong password with all requirements', () => {
      // Use password without sequential characters (no 123, abc, etc.)
      const result = validatePassword('StrongP@ssw0rd!9X')

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.strength).toMatch(/strong|very-strong/)
      expect(result.score).toBeGreaterThan(60)
    })

    it('should reject password shorter than 12 characters', () => {
      const result = validatePassword('Short1!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must be at least 12 characters long')
      expect(result.strength).toBe('weak')
    })

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('lowercasep@ssw0rd123')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('UPPERCASEP@SSW0RD123')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject password without numbers', () => {
      const result = validatePassword('NoNumbersHere!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should reject password without special characters', () => {
      const result = validatePassword('NoSpecialChars123')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*...)')
    })
  })

  describe('validatePassword() - Common Passwords', () => {
    it('should reject password123', () => {
      const result = validatePassword('password123')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password is too common and easily guessable')
      expect(result.score).toBeLessThanOrEqual(20)
    })

    it('should reject admin123', () => {
      const result = validatePassword('admin123')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password is too common and easily guessable')
    })

    it('should reject qwerty', () => {
      const result = validatePassword('qwerty')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password is too common and easily guessable')
    })

    it('should reject common password regardless of case', () => {
      const result = validatePassword('PASSWORD123')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password is too common and easily guessable')
    })
  })

  describe('validatePassword() - Sequential Characters', () => {
    it('should reject password with numeric sequence 123', () => {
      const result = validatePassword('MyPassword123!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains sequential characters (e.g., 123, abc)')
    })

    it('should reject password with alphabetic sequence abc', () => {
      const result = validatePassword('MyPasswordAbc!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains sequential characters (e.g., 123, abc)')
    })

    it('should reject password with keyboard sequence qwerty', () => {
      const result = validatePassword('MyQwertyP@ss1')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains sequential characters (e.g., 123, abc)')
    })

    it('should reject password with reversed sequence 321', () => {
      const result = validatePassword('MyPassword321!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains sequential characters (e.g., 123, abc)')
    })
  })

  describe('validatePassword() - Repeated Characters', () => {
    it('should reject password with 3 repeated characters', () => {
      const result = validatePassword('MyPasssword1!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains too many repeated characters')
    })

    it('should reject password with repeated numbers', () => {
      const result = validatePassword('MyPassword111!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains too many repeated characters')
    })

    it('should accept password with 2 repeated characters', () => {
      const result = validatePassword('MyPassWord22!')

      // Should not have repeated character error
      expect(result.errors).not.toContain('Password contains too many repeated characters')
    })
  })

  describe('validatePassword() - Dictionary Words', () => {
    it('should reject password containing "admin"', () => {
      const result = validatePassword('MyAdmin123Pass!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains common dictionary words')
    })

    it('should reject password containing "password"', () => {
      const result = validatePassword('MyPasswordIs123!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains common dictionary words')
    })

    it('should reject password containing "login"', () => {
      const result = validatePassword('MyLogin123Pass!')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password contains common dictionary words')
    })
  })

  describe('validatePassword() - Strength Levels', () => {
    it('should classify very strong password correctly', () => {
      const result = validatePassword('V3ry$tr0ng!P@ssW0rd#2024')

      expect(result.strength).toBe('very-strong')
      expect(result.score).toBeGreaterThanOrEqual(80)
      expect(result.valid).toBe(true)
    })

    it('should classify strong password correctly', () => {
      const result = validatePassword('Str0ng!P@ssW0rd')

      expect(result.strength).toMatch(/strong|very-strong/)
      expect(result.score).toBeGreaterThanOrEqual(60)
      expect(result.valid).toBe(true)
    })

    it('should classify medium password correctly', () => {
      const result = validatePassword('MediumPass1!')

      expect(result.strength).toBe('medium')
      expect(result.score).toBeGreaterThanOrEqual(40)
      expect(result.score).toBeLessThan(60)
    })

    it('should classify weak password correctly', () => {
      const result = validatePassword('weak')

      expect(result.strength).toBe('weak')
      expect(result.score).toBeLessThan(40)
    })
  })

  describe('validatePassword() - Scoring System', () => {
    it('should give higher score for longer passwords', () => {
      const short = validatePassword('ShortP@ss1')
      const long = validatePassword('VeryLongP@ssw0rdWith24Chars!')

      expect(long.score).toBeGreaterThan(short.score)
    })

    it('should reduce score for common passwords', () => {
      const common = validatePassword('password123')

      expect(common.score).toBeLessThanOrEqual(20)
    })

    it('should reduce score for sequential characters', () => {
      const withSequence = validatePassword('MyPass123word!')
      const withoutSequence = validatePassword('MyP@ssW0rdGood!')

      expect(withSequence.score).toBeLessThan(withoutSequence.score)
    })

    it('should cap score at 100', () => {
      const result = validatePassword('Extremely!L0ng@ndC0mpl3x$P@ssW0rd#With50Characters123!')

      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should have minimum score of 0', () => {
      const result = validatePassword('a')

      expect(result.score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('validatePassword() - Multiple Errors', () => {
    it('should return multiple errors for very weak password', () => {
      const result = validatePassword('weak')

      expect(result.errors.length).toBeGreaterThan(1)
      expect(result.valid).toBe(false)
    })

    it('should list all missing requirements', () => {
      const result = validatePassword('lowercase')

      expect(result.errors).toContain('Password must be at least 12 characters long')
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
      expect(result.errors).toContain('Password must contain at least one number')
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*...)')
    })
  })

  describe('validatePassword() - Edge Cases', () => {
    it('should handle empty string', () => {
      const result = validatePassword('')

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle whitespace-only password', () => {
      const result = validatePassword('            ')

      expect(result.valid).toBe(false)
    })

    it('should handle very long password', () => {
      const longPassword = 'A!1' + 'a'.repeat(100)
      const result = validatePassword(longPassword)

      expect(result).toBeDefined()
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('should handle special characters in sequence', () => {
      const result = validatePassword('P@ssW0rd!!!!')

      expect(result).toBeDefined()
    })

    it('should handle unicode characters', () => {
      const result = validatePassword('MyP@ssw0rd™️123')

      expect(result).toBeDefined()
    })
  })

  describe('getPasswordFeedback()', () => {
    it('should provide positive feedback for valid password', () => {
      const result = validatePassword('StrongP@ssw0rd!9X')
      const feedback = getPasswordFeedback(result)

      expect(feedback).toBeDefined()
      expect(feedback.length).toBeGreaterThan(0)
      expect(feedback.some(f => f.includes('✓'))).toBe(true)
    })

    it('should list errors for invalid password', () => {
      const result = validatePassword('weak')
      const feedback = getPasswordFeedback(result)

      expect(feedback).toBeDefined()
      expect(feedback.some(f => f.includes('✗'))).toBe(true)
      expect(feedback.some(f => f.includes('does not meet requirements'))).toBe(true)
    })

    it('should provide suggestions for weak password', () => {
      const result = validatePassword('WeakP@ss1')
      const feedback = getPasswordFeedback(result)

      expect(feedback.some(f => f.includes('Suggestions'))).toBe(true)
    })

    it('should show strength level', () => {
      const result = validatePassword('VeryStr0ng!P@ssW0rd#2024')
      const feedback = getPasswordFeedback(result)

      expect(feedback.some(f => f.includes('strength'))).toBe(true)
    })

    it('should show security score', () => {
      const result = validatePassword('SecureP@ssw0rd!9X')
      const feedback = getPasswordFeedback(result)

      expect(feedback.some(f => f.includes('score'))).toBe(true)
    })
  })

  describe('checkPasswordBreached()', () => {
    it('should detect breached common password', async () => {
      const breached = await checkPasswordBreached('password123')

      expect(breached).toBe(true)
    })

    it('should detect breached admin password', async () => {
      const breached = await checkPasswordBreached('admin123')

      expect(breached).toBe(true)
    })

    it('should not flag unique password as breached', async () => {
      const breached = await checkPasswordBreached('UniqueP@ssw0rd#2024!')

      expect(breached).toBe(false)
    })

    it('should handle case-insensitive check', async () => {
      const breached = await checkPasswordBreached('PASSWORD123')

      expect(breached).toBe(true)
    })
  })

  describe('generateStrongPassword()', () => {
    it('should generate password of default length 16', () => {
      const password = generateStrongPassword()

      expect(password.length).toBe(16)
    })

    it('should generate password of specified length', () => {
      const password = generateStrongPassword(20)

      expect(password.length).toBe(20)
    })

    it('should generate password with uppercase letter', () => {
      const password = generateStrongPassword()

      expect(/[A-Z]/.test(password)).toBe(true)
    })

    it('should generate password with lowercase letter', () => {
      const password = generateStrongPassword()

      expect(/[a-z]/.test(password)).toBe(true)
    })

    it('should generate password with number', () => {
      const password = generateStrongPassword()

      expect(/[0-9]/.test(password)).toBe(true)
    })

    it('should generate password with special character', () => {
      const password = generateStrongPassword()

      expect(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)).toBe(true)
    })

    it('should generate different passwords each time', () => {
      const password1 = generateStrongPassword()
      const password2 = generateStrongPassword()

      expect(password1).not.toBe(password2)
    })

    it('should generate password that passes validation', () => {
      const password = generateStrongPassword()
      const result = validatePassword(password)

      expect(result.valid).toBe(true)
      expect(result.strength).toMatch(/strong|very-strong/)
    })

    it('should handle very short length request', () => {
      const password = generateStrongPassword(4)

      expect(password.length).toBe(4)
      // Should still have at least one of each type
      expect(/[A-Z]/.test(password)).toBe(true)
      expect(/[a-z]/.test(password)).toBe(true)
      expect(/[0-9]/.test(password)).toBe(true)
      expect(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)).toBe(true)
    })

    it('should handle very long length request', () => {
      const password = generateStrongPassword(50)

      expect(password.length).toBe(50)
    })
  })

  describe('Performance', () => {
    it('should validate password quickly', () => {
      const start = Date.now()

      for (let i = 0; i < 1000; i++) {
        validatePassword('TestP@ssw0rd123!')
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000) // 1000 validations in less than 1 second
    })

    it('should generate password quickly', () => {
      const start = Date.now()

      for (let i = 0; i < 100; i++) {
        generateStrongPassword()
      }

      const duration = Date.now() - start
      expect(duration).toBeLessThan(100) // 100 generations in less than 100ms
    })
  })
})
