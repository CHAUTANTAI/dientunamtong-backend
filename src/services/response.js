/**
 * Success response handler
 * @param {Object} res - Express response object
 * @param {any} data - Response data
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Optional message
 */
export function sendSuccess(res, data, statusCode = 200, message = null) {
  const response = { status: statusCode, data };
  if (message) response.message = message;
  return res.status(statusCode).json(response);
}

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {any} data - Optional error data
 */
export function sendError(res, message, statusCode = 500, data = null) {
  const response = { status: statusCode, data, message };
  return res.status(statusCode).json(response);
}
