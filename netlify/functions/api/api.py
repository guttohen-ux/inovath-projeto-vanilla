import os
import sys

# O Netlify faz o bundle dos arquivos do backend via `included_files` em
# netlify.toml. Dependendo do zip-it-and-ship-it, os arquivos podem aparecer
# em caminhos diferentes dentro do pacote da função. Buscamos o app.py do
# backend em alguns caminhos conhecidos e, se necessário, recursivamente,
# adicionando o diretório correto ao sys.path.
_HERE = os.path.dirname(os.path.abspath(__file__))


def _find_backend():
    candidates = [
        os.path.normpath(_HERE),
        os.path.normpath(os.path.join(_HERE, "Registro-verde-backend", "backend")),
        os.path.normpath(os.path.join(_HERE, "..", "..", "..", "Registro-verde-backend", "backend")),
    ]
    for candidate in candidates:
        if os.path.isfile(os.path.join(candidate, "app.py")):
            return candidate

    # Busca recursiva (limitada) por um backend contendo app.py
    for root, dirs, files in os.walk(_HERE):
        if "app.py" in files:
            return root
        # Evita descer em diretórios desnecessários
        dirs[:] = [d for d in dirs if d not in ("node_modules", ".git", "site-packages")]

    return None


_backend = _find_backend()
if _backend is None:
    raise RuntimeError(
        "Não foi possível localizar o backend (app.py) dentro da função Netlify. "
        "Verifique a configuração `included_files` em netlify.toml."
    )

if _backend not in sys.path:
    sys.path.insert(0, _backend)

import serverless_wsgi

from app import app as _flask_app


def handler(event, context):
    return serverless_wsgi.handle_request(_flask_app, event, context)
