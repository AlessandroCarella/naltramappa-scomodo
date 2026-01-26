import requests
import json


def search_cafe_in_bari(cafe_name):
    # Nominatim API endpoint
    base_url = "https://nominatim.openstreetmap.org/search"
    
    # Search query - searching for the cafe in Bari, Italy
    search_query = f"{cafe_name}, Bari, Italy"
    
    # Parameters for the API request
    params = {
        'q': search_query,
        'format': 'json',
        'limit': 1,  # Get the top result
    }

    # Headers (Nominatim requires a User-Agent)
    headers = {
        'User-Agent': 'CafeSearchApp/1.0'
    }
    
    try:
        # Make the API request
        response = requests.get(base_url, params=params, headers=headers)
        response.raise_for_status()
        
        # Parse the JSON response
        results = response.json()
        
        if not results:
            return {
                'error': f'No results found for "{cafe_name}" in Bari',
                'name': None,
                'coordinates': None,
                'description': None
            }
        
        # Get the first result
        place = results[0]
        print(place)
        
        # Extract information
        result = {
            'name': place.get('name', ''),
            'latitude': float(place.get('lat', 0)),
            'longitude': float(place.get('lon', 0)),
            'description': place.get('display_name', ''),
            'type': 'purple',
            'category': 'addresstype'
        }
        
        return result
        
    except requests.exceptions.RequestException as e:
        return {
            'error': f'API request failed: {str(e)}',
            'name': None,
            'coordinates': None,
            'description': None
        }


def main(cafe_name):    
    print(f"Searching for: {cafe_name} in Bari, Italy\n")
    
    result = search_cafe_in_bari(cafe_name)
    
    if 'error' in result:
        print(f"Error: {result['error']}")
    else:
        
        # Pretty print the full result
        print("\nFull result (JSON):")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
        with open ("data/pins.json", "r") as f:
            data = json.load(f)
            for elem in data:
                if elem["name"] == result["name"]:
                    exit()
            data.append(result)
        with open ("data/pins.json", "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=True)

cafe_name = "feltrinelli"
main(cafe_name)