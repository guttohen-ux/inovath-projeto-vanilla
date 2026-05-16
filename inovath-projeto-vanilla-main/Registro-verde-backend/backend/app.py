import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from database import MOCK_USERS
from routes.users import users_bp
from routes.ranking import ranking_bp
from routes.recycling import recycling_bp, ECOPONTOS
from routes.registro_verde_points import pontos_bp
from routes.ia import ia_bp

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__)
CORS(app)

# Registro dos Blueprints
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(ranking_bp, url_prefix='/api/ranking')
app.register_blueprint(recycling_bp, url_prefix='/api/recycling')
app.register_blueprint(pontos_bp, url_prefix='/api/pontos')
app.register_blueprint(ia_bp, url_prefix='/api')

@app.route("/")
def dashboard():
    sorted_users = sorted(MOCK_USERS, key=lambda u: u["impacto_kg"], reverse=True)
    ranking_data = [
        {"user": u["nome"], "pontos": u["impacto_kg"]}
        for u in sorted_users
    ]

    total_guardioes = len(MOCK_USERS)
    total_impacto = sum(u["impacto_kg"] for u in MOCK_USERS)
    total_ecopontos = len(ECOPONTOS)

    return jsonify({
        "projeto": "Registro Verde",
        "status": "online",
        "modulos": {
            "auth": "ativo",
            "users": "ativo",
            "recycling": "ativo",
            "verde_points": "ativo",
            "ranking": "ativo",
            "ia_scanner": "ativo" # Novo módulo listado
        },
        "ranking": ranking_data,
        "stats": {
            "guardioes": f"{total_guardioes}+",
            "impacto_kg": total_impacto,
            "residuos_ton": round(total_impacto / 1000, 2),
            "ecopontos": total_ecopontos
        },
        "mensagem": "Sistema carregado com sucesso"
    })

if __name__ == "__main__":
    import socket
    
    hostname = socket.gethostname()
    ip_local = socket.gethostbyname(hostname)
    
    print("\n" + "="*60)
    print("🚀 Servidor Registro Verde iniciado (HTTP)!")
    print("="*60)
    print(f"✅ Acesso Local: http://localhost:5000")
    print(f"📱 Acesso Celular (mesma Wi-Fi): http://{ip_local}:5000")
    print("="*60 + "\n")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )