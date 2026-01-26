#!/usr/bin/env python3
"""
Google Maps Link Parser with proper consent handling
"""

import re
import requests
from urllib.parse import urlparse, parse_qs, unquote
from typing import Dict, Optional


class MapsLinkParser:
    def __init__(self, fetch_details: bool = True):
        self.fetch_details = fetch_details
        self.session = requests.Session()
        # Set headers to mimic a real browser
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def parse(self, url: str) -> Dict:
        """
        Parse a Google Maps URL and extract location details
        """
        # Resolve shortened URLs
        resolved_url = self._resolve_url(url)
        
        # Extract coordinates
        lat, lon = self._extract_coordinates(resolved_url)
        
        # Extract name and description if requested
        name = None
        description = None
        
        if self.fetch_details and lat and lon:
            name, description = self._fetch_place_details(resolved_url)
        
        return {
            'url': resolved_url,
            'latitude': lat,
            'longitude': lon,
            'name': name,
            'description': description
        }
    
    def _resolve_url(self, url: str) -> str:
        """Resolve shortened Google Maps URLs"""
        try:
            response = self.session.get(url, allow_redirects=True, timeout=10)
            return response.url
        except Exception as e:
            print(f"Error resolving URL: {e}")
            return url
    
    def _extract_coordinates(self, url: str) -> tuple:
        """Extract latitude and longitude from URL"""
        # Pattern 1: @lat,lon format
        match = re.search(r'@(-?\d+\.?\d*),(-?\d+\.?\d*)', url)
        if match:
            return float(match.group(1)), float(match.group(2))
        
        # Pattern 2: query parameter format
        parsed = urlparse(url)
        query_params = parse_qs(parsed.query)
        
        if 'q' in query_params:
            q = query_params['q'][0]
            coords = re.search(r'(-?\d+\.?\d*),(-?\d+\.?\d*)', q)
            if coords:
                return float(coords.group(1)), float(coords.group(2))
        
        return None, None
    
    def _fetch_place_details(self, url: str) -> tuple:
        """Fetch place name and description from the Google Maps page"""
        try:
            # Add consent bypass parameters
            if '?' in url:
                url += '&hl=en&gl=us'
            else:
                url += '?hl=en&gl=us'
            
            response = self.session.get(url, timeout=10)
            html = response.text
            
            # Extract place name from various possible locations
            name = self._extract_name(html, url)
            
            # Extract description
            description = self._extract_description(html)
            
            return name, description
            
        except Exception as e:
            print(f"Error fetching place details: {e}")
            return None, None
    
    def _extract_name(self, html: str, url: str) -> Optional[str]:
        """Extract place name from HTML or URL"""
        # Try to extract from URL first (most reliable)
        url_match = re.search(r'/place/([^/@]+)', url)
        if url_match:
            name = unquote(url_match.group(1))
            # Clean up the name
            name = name.replace('+', ' ')
            if name and name != 'Prima di continuare su Google Maps':
                return name
        
        # Try meta tags
        patterns = [
            r'<meta property="og:title" content="([^"]+)"',
            r'<meta name="title" content="([^"]+)"',
            r'<title>([^<]+)</title>',
            r'"name":"([^"]+)"',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html)
            if match:
                name = match.group(1)
                # Filter out consent page titles
                if name and 'continuare' not in name.lower() and 'google maps' not in name.lower():
                    return name
        
        return None
    
    def _extract_description(self, html: str) -> Optional[str]:
        """Extract place description from HTML"""
        patterns = [
            r'<meta property="og:description" content="([^"]+)"',
            r'<meta name="description" content="([^"]+)"',
            r'"description":"([^"]+)"',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html)
            if match:
                desc = match.group(1)
                # Filter out generic descriptions
                if desc and 'continuare' not in desc.lower() and len(desc) > 20:
                    return desc
        
        return None


def main():
    """Example usage"""
    parser = MapsLinkParser(fetch_details=True)
    
    test_urls = [
        "https://maps.app.goo.gl/zW7bJXuWbkyxWQph7",
        "https://maps.app.goo.gl/19tC3KrsASRJzgkC6",
        "https://maps.app.goo.gl/bALgAB15EvNT36Di6",
        "https://share.google/p8snEw6D6QpcwoSkO"
    ]
    
    print("=" * 80)
    print("Google Maps Link Parser - Examples")
    print("=" * 80 + "\n")
    
    for url in test_urls:
        result = parser.parse(url)
        
        print(f"Input URL:   {url}")
        print(f"Resolved:    {result['url'][:70]}...")
        print(f"Latitude:    {result['latitude']}")
        print(f"Longitude:   {result['longitude']}")
        print(f"Name:        {result['name']}")
        print(f"Description: {result['description'][:100] if result['description'] else 'Not available'}...")
        print()
    
    print("="*80)


if __name__ == '__main__':
    main()