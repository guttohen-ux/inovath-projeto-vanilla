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

def _dashboard_data():
    sorted_users = sorted(MOCK_USERS, key=lambda u: u["impacto_kg"], reverse=True)
    ranking_data = [
        {"user": u["nome"], "pontos": u["impacto_kg"]}
        for u in sorted_users
    ]

    total_guardioes = len(MOCK_USERS)
    total_impacto = sum(u["impacto_kg"] for u in MOCK_USERS)
    total_ecopontos = len(ECOPONTOS)
    total_scans = sum(len(u.get("historico", [])) for u in MOCK_USERS)

    return {
        "projeto": "Registro Verde",
        "status": "online",
        "modulos": {
            "auth": "ativo",
            "users": "ativo",
            "recycling": "ativo",
            "verde_points": "ativo",
            "ranking": "ativo",
            "ia_scanner": "ativo"
        },
        "ranking": ranking_data,
        "stats": {
            "guardioes": f"{total_guardioes}+",
            "impacto_kg": total_impacto,
            "residuos_ton": round(total_impacto / 1000, 2),
            "ecopontos": total_ecopontos,
            "scans": f"{total_scans}"
        },
        "mensagem": "Sistema carregado com sucesso"
    }


@app.route("/")
def dashboard():
    return jsonify(_dashboard_data())


# Rota usada na produção (Netlify), pois "/" serve a página inicial (index.html).
# Todo o tráfego /api/* é encaminhado para a função Netlify.
@app.route("/api/dashboard")
def dashboard_api():
    return jsonify(_dashboard_data())

if __name__ == "__main__":
    import os
    debug = os.getenv("FLASK_ENV") == "development"
    port = int(os.getenv("PORT", "5000"))
    print("\nServidor Registro Verde iniciado em http://localhost:{}\n".format(port))
    app.run(host="0.0.0.0", port=port, debug=debug)