import sys
import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
from typing import List

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'logging-middleware'))
from logging_middleware import LoggingMiddleware

from models import URLCreate, URLResponse, URLStats, URLDatabase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="URL Shortener Microservice",
    description="A robust HTTP URL Shortener with analytics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)

db = URLDatabase()

@app.get("/")
async def root():
    return {"message": "URL Shortener Microservice", "version": "1.0.0"}

@app.post("/shorten", response_model=URLResponse)
async def create_short_url(url_data: URLCreate, request: Request):
    try:
        base_url = f"{request.url.scheme}://{request.url.netloc}"
        short_url = db.create_short_url(url_data, base_url)
        logger.info(f"Created short URL: {short_url.shortcode} for {url_data.original_url}")
        return short_url
    except ValueError as e:
        logger.error(f"Error creating short URL: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/shorten/bulk", response_model=List[URLResponse])
async def create_multiple_short_urls(url_data_list: List[URLCreate], request: Request):
    try:
        if len(url_data_list) > 5:
            raise HTTPException(status_code=400, detail="Cannot create more than 5 URLs at once")
        
        if len(url_data_list) == 0:
            raise HTTPException(status_code=400, detail="At least one URL is required")
        
        base_url = f"{request.url.scheme}://{request.url.netloc}"
        created_urls = []
        
        for url_data in url_data_list:
            try:
                short_url = db.create_short_url(url_data, base_url)
                created_urls.append(short_url)
                logger.info(f"Created short URL: {short_url.shortcode} for {url_data.original_url}")
            except ValueError as e:
                logger.error(f"Error creating short URL for {url_data.original_url}: {str(e)}")
                continue
        
        if not created_urls:
            raise HTTPException(status_code=400, detail="No URLs could be created")
        
        return created_urls
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in bulk creation: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/{shortcode}")
async def redirect_to_original(shortcode: str, request: Request):
    try:
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        original_url = db.get_original_url(shortcode, ip_address=client_ip, user_agent=user_agent)
        if original_url is None:
            logger.warning(f"Shortcode not found or expired: {shortcode}")
            raise HTTPException(status_code=404, detail="Short URL not found or expired")
        
        logger.info(f"Redirecting {shortcode} to {original_url} from IP: {client_ip}")
        return RedirectResponse(url=original_url, status_code=302)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during redirection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/stats/{shortcode}", response_model=URLStats)
async def get_url_stats(shortcode: str):
    try:
        stats = db.get_url_stats(shortcode)
        if stats is None:
            raise HTTPException(status_code=404, detail="Short URL not found")
        
        logger.info(f"Retrieved stats for shortcode: {shortcode}")
        return stats
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/urls")
async def get_all_urls():
    try:
        urls = db.get_all_urls()
        logger.info(f"Retrieved {len(urls)} URLs")
        return {"urls": urls}
    except Exception as e:
        logger.error(f"Error retrieving all URLs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/urls/{shortcode}")
async def delete_url(shortcode: str):
    try:
        if shortcode not in db.urls:
            raise HTTPException(status_code=404, detail="Short URL not found")
        
        url_record = db.urls[shortcode]
        original_url = url_record['original_url']
        
        del db.urls[shortcode]
        if original_url in db.original_to_short:
            del db.original_to_short[original_url]
        
        logger.info(f"Deleted shortcode: {shortcode}")
        return {"message": "Short URL deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "urls_count": len(db.urls)}
