import requests
import json
import os
import sys
from pathlib import Path


class CafeSearchApp:
    def __init__(self, data_file="data/pins.json"):
        self.data_file = data_file
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.headers = {'User-Agent': 'CafeSearchApp/1.0'}
        self.history = []  # Track operations for undo
        self._ensure_data_file()

    def _ensure_data_file(self):
        """Ensure the data file and directory exist"""
        Path(self.data_file).parent.mkdir(parents=True, exist_ok=True)
        if not os.path.exists(self.data_file):
            with open(self.data_file, 'w') as f:
                json.dump([], f)

    def search_cafe_in_bari(self, cafe_name):
        """Search for a cafe in Bari using Nominatim API"""
        search_query = f"{cafe_name}, Bari, Italy"
        
        params = {
            'q': search_query,
            'format': 'json',
            'limit': 1,
        }
        
        try:
            response = requests.get(self.base_url, params=params, headers=self.headers)
            response.raise_for_status()
            results = response.json()
            
            if not results:
                return {
                    'error': f'No results found for "{cafe_name}" in Bari',
                }
            
            place = results[0]
            
            result = {
                'name': place.get('name', cafe_name),
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
            }

    def load_data(self):
        """Load existing cafe data"""
        with open(self.data_file, 'r') as f:
            return json.load(f)

    def save_data(self, data):
        """Save cafe data to file"""
        with open(self.data_file, 'w') as f:
            json.dump(data, f, indent=2, ensure_ascii=True)

    def add_cafe(self, cafe_name):
        """Search and add a cafe to the database"""
        print(f"\n🔍 Searching for: {cafe_name} in Bari, Italy...")
        
        result = self.search_cafe_in_bari(cafe_name)
        
        if 'error' in result:
            print(f"❌ Error: {result['error']}")
            return False
        
        data = self.load_data()
        
        # Check if already exists
        for elem in data:
            if elem.get("name") == result["name"]:
                print(f"ℹ️  '{result['name']}' already exists in the database!")
                return False
        
        # Add new entry
        data.append(result)
        self.save_data(data)
        self.history.append(('add', result['name']))
        
        print(f"✅ Added: {result['name']}")
        print(f"📍 Location: {result['latitude']}, {result['longitude']}")
        print(f"📝 {result['description']}")
        
        return True

    def undo_last(self):
        """Remove the last added entry"""
        if not self.history:
            print("❌ Nothing to undo!")
            return False
        
        last_action, cafe_name = self.history.pop()
        
        if last_action == 'add':
            data = self.load_data()
            original_length = len(data)
            data = [cafe for cafe in data if cafe.get('name') != cafe_name]
            
            if len(data) < original_length:
                self.save_data(data)
                print(f"↩️  Removed: {cafe_name}")
                return True
            else:
                print(f"❌ Could not find '{cafe_name}' to remove")
                return False
        
        return False

    def list_cafes(self):
        """List all saved cafes"""
        data = self.load_data()
        
        if not data:
            print("\n📝 No cafes saved yet!")
            return
        
        print(f"\n📝 Saved cafes ({len(data)}):")
        print("=" * 60)
        for i, cafe in enumerate(data, 1):
            print(f"{i}. {cafe.get('name', 'Unknown')}")
            print(f"   📍 {cafe.get('latitude')}, {cafe.get('longitude')}")
            print(f"   📝 {cafe.get('description', 'No description')}")
            print()

    def clear_screen(self):
        """Clear the terminal screen"""
        os.system('cls' if os.name == 'nt' else 'clear')

    def print_help(self):
        """Print help information"""
        print("\nCommands:")
        print("  • Type a cafe name to search and add it")
        print("  • 'undo' or 'u' - Remove the last entry")
        print("  • 'list' or 'l' - Show all saved cafes")
        print("  • 'clear' or 'cls' - Clear screen")
        print("  • 'help' or 'h' - Show this help")
        print("  • 'quit', 'exit', or 'q' - Exit the app")
        print("  • Ctrl+C - Quick exit")
        print("=" * 60 + "\n")

    def run(self):
        """Main interactive loop"""
        self.clear_screen()
        self.print_help()
        
        print("Type 'help' to see available commands\n")
        
        while True:
            try:
                # Get user input
                user_input = input("🔍 Enter query (or command): ").strip()
                
                if not user_input:
                    continue
                
                # Parse commands
                command = user_input.lower()
                
                if command in ['quit', 'exit', 'q']:
                    print("\n👋 Goodbye!")
                    break
                
                elif command in ['undo', 'u']:
                    self.undo_last()
                
                elif command in ['list', 'l']:
                    self.list_cafes()
                
                elif command in ['clear', 'cls']:
                    self.clear_screen()
                    self.print_help()
                
                elif command in ['help', 'h']:
                    self.print_help()
                
                else:
                    # Treat as cafe name to search
                    self.add_cafe(user_input)
            
            except KeyboardInterrupt:
                print("\n\n👋 Goodbye!")
                break
            
            except Exception as e:
                print(f"\n❌ An error occurred: {str(e)}")
                print("Type 'help' for available commands\n")


def main():
    app = CafeSearchApp()
    app.run()


if __name__ == "__main__":
    main()