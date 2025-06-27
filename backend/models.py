import string
import random
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import validators
from pydantic import BaseModel, validator


class URLCreate(BaseModel):
    original_url: str
    custom_shortcode: Optional[str] = None
    validity_minutes: Optional[int] = 30

    @validator('original_url')
    def validate_url(cls, v):
        if not validators.url(v):
            raise ValueError('Invalid URL format')
        return v

    @validator('custom_shortcode')
    def validate_custom_shortcode(cls, v):
        if v is not None:
            if len(v) < 3 or len(v) > 20:
                raise ValueError('Custom shortcode must be between 3 and 20 characters')
            if not v.isalnum():
                raise ValueError('Custom shortcode must contain only alphanumeric characters')
        return v


class ClickRecord(BaseModel):
    timestamp: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class URLResponse(BaseModel):
    id: str
    original_url: str
    short_url: str
    shortcode: str
    created_at: datetime
    expires_at: datetime
    click_count: int


class URLStats(BaseModel):
    shortcode: str
    original_url: str
    short_url: str
    created_at: datetime
    expires_at: datetime
    click_count: int
    is_expired: bool
    click_history: List[ClickRecord] = []


class URLDatabase:
    
    def __init__(self):
        self.urls: Dict[str, dict] = {}
        self.original_to_short: Dict[str, str] = {}
    
    def generate_shortcode(self, length: int = 6) -> str:
        characters = string.ascii_letters + string.digits
        while True:
            shortcode = ''.join(random.choice(characters) for _ in range(length))
            if shortcode not in self.urls:
                return shortcode
    
    def create_short_url(self, url_data: URLCreate, base_url: str) -> URLResponse:

        if url_data.original_url in self.original_to_short:
            existing_shortcode = self.original_to_short[url_data.original_url]
            existing_url = self.urls[existing_shortcode]
            if datetime.now() < existing_url['expires_at']:
                return URLResponse(**existing_url)
        
        if url_data.custom_shortcode:
            if url_data.custom_shortcode in self.urls:
                raise ValueError("Custom shortcode already exists")
            shortcode = url_data.custom_shortcode
        else:
            shortcode = self.generate_shortcode()
        
        created_at = datetime.now()
        expires_at = created_at + timedelta(minutes=url_data.validity_minutes)
        
        url_record = {
            'id': shortcode,
            'original_url': url_data.original_url,
            'short_url': f"{base_url}/{shortcode}",
            'shortcode': shortcode,
            'created_at': created_at,
            'expires_at': expires_at,
            'click_count': 0,
            'click_history': []
        }
        
        self.urls[shortcode] = url_record
        self.original_to_short[url_data.original_url] = shortcode
        
        return URLResponse(**url_record)
    
    def get_original_url(self, shortcode: str, ip_address: str = None, user_agent: str = None) -> Optional[str]:
        if shortcode not in self.urls:
            return None
        
        url_record = self.urls[shortcode]
        
        if datetime.now() > url_record['expires_at']:
            return None
        
        click_record = {
            'timestamp': datetime.now(),
            'ip_address': ip_address,
            'user_agent': user_agent
        }
        
        self.urls[shortcode]['click_count'] += 1
        self.urls[shortcode]['click_history'].append(click_record)
        
        return url_record['original_url']
    
    def get_url_stats(self, shortcode: str) -> Optional[URLStats]:
        if shortcode not in self.urls:
            return None
        
        url_record = self.urls[shortcode]
        is_expired = datetime.now() > url_record['expires_at']
        
        click_history = [
            ClickRecord(
                timestamp=click['timestamp'],
                ip_address=click.get('ip_address'),
                user_agent=click.get('user_agent')
            )
            for click in url_record.get('click_history', [])
        ]
        
        return URLStats(
            shortcode=url_record['shortcode'],
            original_url=url_record['original_url'],
            short_url=url_record['short_url'],
            created_at=url_record['created_at'],
            expires_at=url_record['expires_at'],
            click_count=url_record['click_count'],
            is_expired=is_expired,
            click_history=click_history
        )
    
    def get_all_urls(self) -> list:
        return [
            URLStats(
                shortcode=record['shortcode'],
                original_url=record['original_url'],
                short_url=record['short_url'],
                created_at=record['created_at'],
                expires_at=record['expires_at'],
                click_count=record['click_count'],
                is_expired=datetime.now() > record['expires_at'],
                click_history=[
                    ClickRecord(
                        timestamp=click['timestamp'],
                        ip_address=click.get('ip_address'),
                        user_agent=click.get('user_agent')
                    )
                    for click in record.get('click_history', [])
                ]
            )
            for record in self.urls.values()
        ]
