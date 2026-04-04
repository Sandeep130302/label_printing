// ============================================
// REQUEST LOGGER MIDDLEWARE
// ============================================
// Logs incoming HTTP requests
// Shows method, URL, timestamp
// Helps with debugging and monitoring

export function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  // Log request details
  console.log(`\n📨 [${timestamp}] ${method} ${url}`);
  console.log(`   IP: ${ip}`);
  
  if (method !== 'GET') {
    console.log(`   Body: ${JSON.stringify(req.body)}`);
  }

  // Capture response details
  const originalJson = res.json;
  let statusCode = 200;

  // Override res.json to capture status code
  res.json = function(data) {
    statusCode = res.statusCode;
    
    // Log response
    const responseTime = new Date().toISOString();
    console.log(`✅ [${responseTime}] Response: ${statusCode}`);
    
    // Call original json method
    return originalJson.call(this, data);
  };

  // Handle res.status to capture status code
  const originalStatus = res.status;
  res.status = function(code) {
    statusCode = code;
    return originalStatus.call(this, code);
  };

  next();
}

// ============================================
// DETAILED LOGGER (Optional)
// ============================================
// More verbose logging for development

export function detailedRequestLogger(req, res, next) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  console.log('\n' + '='.repeat(60));
  console.log(`📨 Request Received`);
  console.log('='.repeat(60));
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.originalUrl}`);
  console.log(`IP: ${req.ip || req.connection.remoteAddress}`);
  console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body: ${JSON.stringify(req.body, null, 2)}`);
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    console.log(`Params: ${JSON.stringify(req.params, null, 2)}`);
  }

  // Capture when response is sent
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    const responseTime = new Date().toISOString();
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Response Sent`);
    console.log('='.repeat(60));
    console.log(`Timestamp: ${responseTime}`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
    console.log('='.repeat(60) + '\n');
    
    return originalJson.call(this, data);
  };

  next();
}
