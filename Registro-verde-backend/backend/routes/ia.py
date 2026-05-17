import os
from flask import Blueprint, request, jsonify
import google.generativeai as genai
from PIL import Image

ia_bp = Blueprint('ia', __name__)

# Configurar IA
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@ia_bp.route('/scan', methods=['POST'])
def scan_material():
    """
    Endpoint para análise de materiais recicláveis via IA.
    Recebe imagem e retorna classificação usando Google Gemini.
    """
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
