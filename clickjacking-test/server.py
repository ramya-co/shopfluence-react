#!/usr/bin/env python3
"""
Simple HTTP server for serving the clickjacking test page on port 8082
"""

import http.server
import socketserver
import os
import sys

# Change to the directory containing this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8082
Handler = http.server.SimpleHTTPRequestHandler

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🎯 Clickjacking test server starting on port {PORT}")
        print(f"📋 Open this URL to test: http://localhost:{PORT}/frame-test.html")
        print(f"🔍 The test page will try to embed: http://localhost:5173/account/profile?bb_iframe=1")
        print(f"⚠️  Make sure the ecommerce app is running on http://localhost:5173")
        print(f"🛑 Press Ctrl+C to stop the server")
        print("-" * 60)
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n🛑 Server stopped by user")
    sys.exit(0)
except OSError as e:
    if "Address already in use" in str(e):
        print(f"❌ Port {PORT} is already in use. Please stop any existing server on this port.")
    else:
        print(f"❌ Error starting server: {e}")
    sys.exit(1)
