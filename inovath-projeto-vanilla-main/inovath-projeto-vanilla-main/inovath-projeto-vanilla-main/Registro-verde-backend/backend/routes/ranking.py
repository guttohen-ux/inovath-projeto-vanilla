from flask import Blueprint, jsonify
from database import MOCK_USERS

ranking_bp = Blueprint('ranking', __name__)

@ranking_bp.route('/')
def ranking():
    sorted_users = sorted(MOCK_USERS, key=lambda u: u["impacto_kg"], reverse=True)
    ranking_data = [
        {"user": u["nome"], "pontos": u["impacto_kg"]}
        for u in sorted_users
    ]
    return jsonify(ranking_data)