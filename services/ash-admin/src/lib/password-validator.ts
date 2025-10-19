/**
 * Password Complexity Validator
 *
 * Enforces strong password requirements based on NIST guidelines
 */

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number // 0-100
}

// Minimum requirements
const MIN_LENGTH = 8
const MIN_UPPERCASE = 1
const MIN_LOWERCASE = 1
const MIN_NUMBERS = 1
const MIN_SPECIAL = 0 // Special character not required

// Common passwords list (top 100 most common passwords)
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', '123456789', 'qwerty',
  'abc123', 'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', '111111', 'iloveyou', 'master', 'sunshine', 'ashley',
  'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'Football', 'welcome', 'jesus', 'ninja',
  'mustang', 'password1', '123qwe', 'password01', 'admin', 'admin123',
  'root', 'toor', 'pass', 'test', 'guest', 'oracle', 'passpass',
]

/**
 * Validate password strength and complexity
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Length check
  if (password.length < MIN_LENGTH) {
    errors.push(`Password must be at least ${MIN_LENGTH} characters long`)
  } else {
    score += Math.min(30, password.length * 2) // Max 30 points for length
  }

  // Uppercase check
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length
  if (uppercaseCount < MIN_UPPERCASE) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += Math.min(15, uppercaseCount * 5) // Max 15 points
  }

  // Lowercase check
  const lowercaseCount = (password.match(/[a-z]/g) || []).length
  if (lowercaseCount < MIN_LOWERCASE) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score += Math.min(15, lowercaseCount * 5) // Max 15 points
  }

  // Number check
  const numberCount = (password.match(/[0-9]/g) || []).length
  if (numberCount < MIN_NUMBERS) {
    errors.push('Password must contain at least one number')
  } else {
    score += Math.min(15, numberCount * 5) // Max 15 points
  }

  // Special character check (optional but recommended)
  const specialCount = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length
  if (specialCount >= 1) {
    score += Math.min(15, specialCount * 5) // Bonus points for special chars
  }

  // Common passwords check (warning only, not blocking)
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score = Math.min(score, 20) // Cap score at 20 for common passwords
  }

  // Sequential characters check (warning only, not blocking)
  if (hasSequentialCharacters(password)) {
    score -= 10
  }

  // Repeated characters check (warning only, not blocking)
  if (hasRepeatedCharacters(password)) {
    score -= 10
  }

  // Dictionary words check (warning only, not blocking)
  if (containsDictionaryWords(password)) {
    score -= 15
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score))

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  if (score >= 80 && errors.length === 0) {
    strength = 'very-strong'
  } else if (score >= 60 && errors.length === 0) {
    strength = 'strong'
  } else if (score >= 40) {
    strength = 'medium'
  } else {
    strength = 'weak'
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score,
  }
}

/**
 * Check for sequential characters (123, abc, etc.)
 */
function hasSequentialCharacters(password: string): boolean {
  const sequences = [
    '0123456789',
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ]

  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      const forward = seq.substring(i, i + 3)
      const backward = forward.split('').reverse().join('')

      if (password.toLowerCase().includes(forward) || password.toLowerCase().includes(backward)) {
        return true
      }
    }
  }

  return false
}

/**
 * Check for repeated characters (aaa, 111, etc.)
 */
function hasRepeatedCharacters(password: string): boolean {
  const repeatedPattern = /(.)\1{2,}/ // Same character 3+ times in a row
  return repeatedPattern.test(password)
}

/**
 * Check for common dictionary words
 */
function containsDictionaryWords(password: string): boolean {
  const commonWords = [
    'admin', 'user', 'login', 'pass', 'password', 'welcome',
    'hello', 'test', 'qwerty', 'letmein', 'monkey', 'dragon',
  ]

  const lowerPassword = password.toLowerCase()

  return commonWords.some(word => lowerPassword.includes(word))
}

/**
 * Generate password strength feedback
 */
export function getPasswordFeedback(result: PasswordValidationResult): string[] {
  const feedback: string[] = []

  if (result.valid) {
    feedback.push(`✓ Password strength: ${result.strength.toUpperCase()}`)
    feedback.push(`✓ Security score: ${result.score}/100`)
  } else {
    feedback.push('✗ Password does not meet requirements:')
    feedback.push(...result.errors.map(error => `  - ${error}`))
  }

  // Additional suggestions
  if (result.score < 60) {
    feedback.push('\nSuggestions:')
    feedback.push('  - Use a longer password (16+ characters recommended)')
    feedback.push('  - Mix uppercase, lowercase, numbers, and special characters')
    feedback.push('  - Avoid common words and patterns')
    feedback.push('  - Consider using a passphrase (e.g., "BlueSky-Coffee42!")')
  }

  return feedback
}

/**
 * Check if password has been compromised (HIBP check simulation)
 * In production, integrate with Have I Been Pwned API
 */
export async function checkPasswordBreached(password: string): Promise<boolean> {
  // For now, just check against common passwords
  // In production, integrate with: https://haveibeenpwned.com/API/v3
  return COMMON_PASSWORDS.includes(password.toLowerCase())
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + special

  let password = ''

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
