// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    // Log request start
    console.log(`🚀 ${req.method} ${req.path} - Started at ${new Date().toISOString()}`);
    
    // Override res.json to log performance metrics
    const originalJson = res.json.bind(res);
    res.json = function(data) {
        const endTime = Date.now();
        const endMemory = process.memoryUsage();
        const duration = endTime - startTime;
        const memoryUsed = endMemory.heapUsed - startMemory.heapUsed;
        
        // Log performance metrics
        console.log(`⏱️  ${req.method} ${req.path} - Completed in ${duration}ms`);
        console.log(`💾 Memory used: ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`);
        
        // Log slow requests (> 5 seconds)
        if (duration > 5000) {
            console.warn(`🐌 SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
        }
        
        // Log memory-intensive requests (> 50MB)
        if (memoryUsed > 50 * 1024 * 1024) {
            console.warn(`💥 HIGH MEMORY: ${req.method} ${req.path} used ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`);
        }
        
        return originalJson(data);
    };
    
    next();
};

export default performanceMiddleware;
