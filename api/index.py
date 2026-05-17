import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND_PATH = ROOT / 'Registro-verde-backend' / 'backend'
sys.path.insert(0, str(BACKEND_PATH))

from app import app

application = app
