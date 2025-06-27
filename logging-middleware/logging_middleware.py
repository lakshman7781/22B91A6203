import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Logging middleware that captures request and response information
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Log request information
        logger.info(f"Request started: {request.method} {request.url}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        # Process the request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response information
        logger.info(f"Request completed: {request.method} {request.url}")
        logger.info(f"Response status: {response.status_code}")
        logger.info(f"Processing time: {process_time:.4f} seconds")
        
        # Add processing time to response headers
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
