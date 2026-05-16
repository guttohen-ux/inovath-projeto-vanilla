import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Detectar porta disponível
PORT = 8000
FRONTEND_DIR = Path(__file__).parent

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)

    def log_message(self, format, *args):
        return super().log_message(f"[Frontend] {format}", *args)

def start_frontend_server():
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("\n" + "="*60)
        print("🌐 Servidor Frontend iniciado!")
        print("="*60)
        print(f"✅ Acesse: http://localhost:{PORT}")
        print(f"📱 No celular (mesma Wi-Fi): http://{get_local_ip()}:{PORT}")
        print("="*60)
        print("Pressione Ctrl+C para parar\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n✋ Servidor parado.")

def get_local_ip():
    import socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

if __name__ == "__main__":
    start_frontend_server()
