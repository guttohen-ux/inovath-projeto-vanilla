from flask import Blueprint, jsonify
from database import MOCK_USERS, calcular_nivel

ranking_bp = Blueprint('ranking', __name__)

@ranking_bp.route('/')
def ranking():
    sorted_users = sorted(MOCK_USERS, key=lambda u: u["impacto_kg"], reverse=True)
    ranking_data = []
    
    for idx, u in enumerate(sorted_users, 1):
        nivel = calcular_nivel(u["impacto_kg"])
        ranking_data.append({
            "posicao": idx,
            "id": u["id"],
            "nome": u["nome"],
            "foto_url": u.get("foto_url", ""),
            "impacto_kg": u["impacto_kg"],
            "nivel": nivel["nome"],
            "email": u["email"]
        })
    
    return jsonify(ranking_data)