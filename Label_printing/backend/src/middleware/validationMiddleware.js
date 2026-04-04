// ============================================
// VALIDATION MIDDLEWARE & HELPERS
// ============================================
// Helper functions for validating data
// Validates UUIDs, emails, URLs, etc.
// Reusable validation logic

// ============================================
// UUID VALIDATION
// ============================================

export function validateUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ============================================
// EMAIL VALIDATION
// ============================================

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// URL VALIDATION
// ============================================

export function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================
// STRING VALIDATION
// ============================================

export function validateString(str, minLength = 1, maxLength = 255) {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

// ============================================
// NUMBER VALIDATION
// ============================================

export function validateNumber(num, min = 0, max = Number.MAX_SAFE_INTEGER) {
  if (typeof num !== 'number' || isNaN(num)) return false;
  return num >= min && num <= max;
}

// ============================================
// POSITIVE INTEGER VALIDATION
// ============================================

export function validatePositiveInteger(num) {
  return Number.isInteger(num) && num > 0;
}

// ============================================
// BOOLEAN VALIDATION
// ============================================

export function validateBoolean(value) {
  return typeof value === 'boolean' || value === 'true' || value === 'false';
}

// ============================================
// ARRAY VALIDATION
// ============================================

export function validateArray(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

// ============================================
// OBJECT VALIDATION
// ============================================

export function validateObject(obj, requiredKeys = []) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return false;
  }

  // Check if all required keys exist
  return requiredKeys.every(key => key in obj);
}

// ============================================
// SERIAL NUMBER VALIDATION
// ============================================

export function validateSerialNumber(serial) {
  // Serial format: {year}{6-digit-number}
  // Example: 2026001
  const serialRegex = /^\d{10}$/;
  return serialRegex.test(serial);
}

// ============================================
// MANUFACTURING CODE VALIDATION
// ============================================

export function validateManufacturingCode(code) {
  // Alphanumeric, 3-20 characters
  const codeRegex = /^[A-Z0-9]{3,20}$/;
  return codeRegex.test(code);
}

// ============================================
// YEAR VALIDATION
// ============================================

export function validateYear(year) {
  const currentYear = new Date().getFullYear();
  const num = parseInt(year, 10);
  return num >= 2000 && num <= currentYear + 10;
}

// ============================================
// VALIDATE REQUEST BODY
// ============================================
// Middleware to validate request body

export function validateRequestBody(requiredFields = []) {
  return (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Request body is required'
      });
    }

    // Check required fields
    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    next();
  };
}

// ============================================
// VALIDATE UUID PARAM
// ============================================
// Middleware to validate UUID in params

export function validateUUIDParam(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `${paramName} parameter is required`
      });
    }

    if (!validateUUID(id)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `Invalid ${paramName} format`
      });
    }

    next();
  };
}

// ============================================
// VALIDATE QUERY STRING
// ============================================
// Middleware to validate query parameters

export function validateQueryParam(paramName, validator, errorMessage) {
  return (req, res, next) => {
    const value = req.query[paramName];

    if (!value) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: `${paramName} query parameter is required`
      });
    }

    if (!validator(value)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: errorMessage || `Invalid ${paramName}`
      });
    }

    next();
  };
}

// ============================================
// SANITIZE STRING
// ============================================
// Removes dangerous characters

export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .trim()
    .replace(/[<>]/g, '')           // Remove angle brackets
    .replace(/\0/g, '')              // Remove null bytes
    .substring(0, 255);              // Limit length
}

// ============================================
// SANITIZE OBJECT
// ============================================
// Sanitizes all string values in an object

export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
