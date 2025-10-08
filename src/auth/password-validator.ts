export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  /**
   * Validate password against security requirements
   */
  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (!password || password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else {
      score += Math.min(20, password.length * 2); // Up to 20 points for length
    }

    if (password && password.length > this.MAX_LENGTH) {
      errors.push(`Password must not exceed ${this.MAX_LENGTH} characters`);
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 20;
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 20;
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 20;
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 20;
    }

    // Check for common patterns
    if (this.hasCommonPatterns(password)) {
      errors.push('Password contains common patterns and is too weak');
      score -= 20;
    }

    // Determine strength based on score
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 80) {
      strength = 'strong';
    } else if (score >= 50) {
      strength = 'medium';
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
      score: Math.max(0, Math.min(100, score)),
    };
  }

  /**
   * Check for common weak patterns
   */
  private static hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /^123456/,
      /^password/i,
      /^qwerty/i,
      /^abc123/i,
      /^admin/i,
      /^letmein/i,
      /^welcome/i,
      /(.)\1{2,}/, // Repeated characters (aaa, 111, etc.)
    ];

    return commonPatterns.some((pattern) => pattern.test(password));
  }

  /**
   * Get password strength description
   */
  static getStrengthDescription(strength: 'weak' | 'medium' | 'strong'): string {
    const descriptions = {
      weak: 'This password is weak and vulnerable to attacks',
      medium: 'This password is moderately strong',
      strong: 'This password is strong and secure',
    };

    return descriptions[strength];
  }
}
