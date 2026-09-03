import os
from flask import Blueprint, request, jsonify
from PIL import Image

ia_bp = Blueprint('ia', __name__)

# Configurar IA (opcional: o app não quebra se a chave estiver definida)
_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

@ia_bp.route('/scan', methods=['POST'])
def scan_material():
    """
    Endpoint para análise de materiais recicláveis via IA.
    Recebe imagem e retorna classificação usando Google Gemini.
    """
    if not _GEMINI_API_KEY:
        return jsonify({"error": "IA não configurada (GEMINI_API_KEY ausente)"}), 500

    try:
        import google.generativeai as genai
        genai.configure(api_key=_GEMINI_API_KEY)
    except Exception:
        return jsonify({"error": "Dependência da IA não disponível"}), 500

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
