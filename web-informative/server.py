#!/usr/bin/env python3
"""
Simple HTTP server for the Mercenary website
Serves static files with proper MIME types
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with proper MIME types"""
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def guess_type(self, path):
        """Override to ensure proper MIME types"""
        mimetype, encoding = super().guess_type(path)
        
        # Fix common MIME types
        if path.endswith('.css'):
            return 'text/css', encoding
        elif path.endswith('.js'):
            return 'application/javascript', encoding
        elif path.endswith('.json'):
            return 'application/json', encoding
        elif path.endswith('.svg'):
            return 'image/svg+xml', encoding
        elif path.endswith('.ico'):
            return 'image/x-icon', encoding
        
        return mimetype, encoding

def main():
    """Start the development server"""
    
    # Change to website directory
    website_dir = Path(__file__).parent
    os.chdir(website_dir)
    
    # Server configuration
    PORT = 8080
    HOST = 'localhost'
    
    try:
        # Create server
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Mercenary Website Server")
            print(f"📍 Server running at: http://{HOST}:{PORT}")
            print(f"📁 Serving files from: {website_dir}")
            print(f"🌐 Open in browser: http://{HOST}:{PORT}")
            print(f"⏹️  Press Ctrl+C to stop the server")
            print("-" * 50)
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 10048:  # Port already in use
            print(f"❌ Port {PORT} is already in use")
            print(f"💡 Try using a different port or stop the other server")
        else:
            print(f"❌ Server error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
