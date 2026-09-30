import { UserRole } from '../types';

/**
 * Security & Data Quality Utilities
 * - Role-based authorization helpers
 * - PII Masking & Citizen Data Privacy Protection
 * - Strict File Upload Validation & MIME Sanitization
 * - Safe Timestamp formatting
 */

/**
 * Checks if the current role is an authorized Disaster Management Authority role
 */
export function isAuthorityRole(role?: UserRole): boolean {
  return role === 'authority' || role === 'field_officer' || role === 'admin';
}

/**
 * Redacts personal names for public view while preserving initials
 * Example: "Ramesh Sharma" -> "R••••• S•••••"
 */
export function maskName(name?: string, isAnonymous?: boolean): string {
  if (isAnonymous || !name || !name.trim()) {
    return 'Anonymous Citizen Observer';
  }
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      return part[0] + '•'.repeat(Math.min(part.length - 1, 5));
    })
    .join(' ');
}

/**
 * Masks phone numbers to protect personal citizen contact information
 * Example: "+91 98765 43210" -> "+91 ••••• ••210"
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone || !phone.trim()) {
    return 'Not provided';
  }
  const clean = phone.trim();
  if (clean.length <= 4) {
    return '••••';
  }
  const lastFour = clean.slice(-4);
  const prefix = clean.startsWith('+') ? clean.slice(0, 3) + ' ' : '';
  return `${prefix}••••• ••${lastFour}`;
}

/**
 * Masks email addresses to prevent public harvesting and identity exposure
 * Example: "rajesh.kumar@gmail.com" -> "r•••••@g••••.com"
 */
export function maskEmailAddress(email?: string): string {
  if (!email || !email.trim()) {
    return 'Not provided';
  }
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 1) {
    return '••••@••••.com';
  }
  const user = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const maskedUser = user[0] + '•'.repeat(Math.max(user.length - 1, 4));

  const dotIndex = domain.lastIndexOf('.');
  const domainName = dotIndex > 0 ? domain.slice(0, dotIndex) : domain;
  const domainExt = dotIndex > 0 ? domain.slice(dotIndex) : '';
  const maskedDomain = domainName.length > 1 ? domainName[0] + '•'.repeat(domainName.length - 1) : '•••';

  return `${maskedUser}@${maskedDomain}${domainExt}`;
}

/**
 * Strict file validation against malicious file types, scripts, and oversized uploads.
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

// Disallowed extensions including scripts, executables, macros, and embedded SVG scripts
const FORBIDDEN_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.js', '.jsx', '.ts', '.tsx',
  '.vbs', '.scr', '.svg', '.html', '.htm', '.php', '.py', '.rb', '.pl',
  '.jar', '.apk', '.msi', '.bin', '.dll', '.com', '.cpl', '.hta', '.wsf'
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export function validateUploadedFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // 1. Zero-byte check (empty file)
  if (file.size === 0) {
    return {
      valid: false,
      error: `File "${file.name}" is empty (0 bytes). Please upload a valid hazard photograph.`,
    };
  }

  // 2. Oversized file check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File "${file.name}" (${sizeMb} MB) exceeds the maximum allowed upload limit of 10 MB.`,
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const lastDot = fileNameLower.lastIndexOf('.');
  const extension = lastDot !== -1 ? fileNameLower.slice(lastDot) : '';

  // 3. Reject known dangerous executable / script extensions explicitly
  if (FORBIDDEN_EXTENSIONS.has(extension)) {
    return {
      valid: false,
      error: `Security Alert: File type "${extension}" is blocked for security reasons. Executables and scripts are prohibited.`,
    };
  }

  // 4. Verify allowed extension
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      valid: false,
      error: `Unsupported file format "${extension || 'unknown'}". Only standard photos (JPG, JPEG, PNG, WEBP) are accepted.`,
    };
  }

  // 5. Verify MIME type
  const mimeLower = file.type ? file.type.toLowerCase() : '';
  if (mimeLower && !ALLOWED_MIME_TYPES.has(mimeLower)) {
    return {
      valid: false,
      error: `MIME type "${mimeLower}" does not match allowed image formats (JPEG, PNG, WEBP).`,
    };
  }

  return { valid: true };
}

/**
 * Formats an exact, unambiguous operational timestamp (IST / local time)
 */
export function formatOperationalTimestamp(dateInput?: Date | string | number): string {
  if (!dateInput) return 'Timestamp unavailable';
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    // If it's already a formatted string like "Just now", return it cleanly
    return String(dateInput);
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ' IST';
}
