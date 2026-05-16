from flask import Blueprint, request, jsonify

users_bp = Blueprint('users', __name__)

# Simulação de banco de dados (substitua pelo seu database.py)
USERS = [
    {"id": 1, "nome": "Bruno", "email": "bruno@email.com", "senha": "123", "impacto_kg": 12.5}
]

@users_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')

    # Busca o usuário
    user = next((u for u in USERS if u['email'] == email and u['senha'] == senha), None)

    if user:
        # Retornamos os dados (exceto a senha) para salvar no localStorage
        return jsonify({
            "status": "success",
            "user": {
                "id": user['id'],
                "nome": user['nome'],
                "impacto_kg": user['impacto_kg']
            }
        }), 200
    
    return jsonify({"status": "error", "message": "E-mail ou senha incorretos"}), 401