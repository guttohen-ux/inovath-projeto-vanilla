import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image
import io

from database import MOCK_USERS
from routes.users import users_bp
from routes.ranking import ranking_bp
from routes.recycling import recycling_bp, ECOPONTOS
from routes.registro_verde_points import pontos_bp

# Carregar variáveis de ambiente e configurar IA
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

# Registro dos seus Blueprints originais
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(ranking_bp, url_prefix='/api/ranking')
app.register_blueprint(recycling_bp, url_prefix='/api/recycling')
app.register_blueprint(pontos_bp, url_prefix='/api/pontos')

# --- NOVA ROTA PARA O SCANNER COM IA ---
@app.route('/api/scan', methods=['POST'])
def scan_material():
    if 'image' not in request.files:
        return jsonify({"error": "Nenhuma imagem enviada"}), 400

    try:
        file = request.files['image']
        image = Image.open(file.stream)

        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """
        Analise a imagem para o projeto Registro Verde Amazônia.
        Se for material reciclável, responda APENAS este JSON:
        {"reciclavel": true, "material": "nome", "pontos": 10, "dica": "frase curta"}
        Se não for:
        {"reciclavel": false, "material": "ignorado", "pontos": 0, "dica": "tente outro"}
        """

        response = model.generate_content([prompt, image])
        # Limpa possíveis blocos de código da resposta da IA
        res_text = response.text.replace('```json', '').replace('```', '').strip()
        return res_text
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ---------------------------------------

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
    app.run(debug=True)