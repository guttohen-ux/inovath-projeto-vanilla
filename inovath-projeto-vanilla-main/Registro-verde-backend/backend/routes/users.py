import os
import random
import secrets
import string
from flask import Blueprint, jsonify, request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from database import MOCK_USERS, NIVEIS, calcular_nivel, calcular_proximo_nivel

users_bp = Blueprint("users", __name__)

# Simulação de códigos de verificação para recuperação de senha
# Em produção, isso seria armazenado no banco de dados com expiração
CODIGOS_RECUPERACAO = {}

@users_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.json
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"erro": "E-mail é obrigatório"}), 400

    user = next((u for u in MOCK_USERS if u["email"] == email), None)
    if not user:
        # Não revelamos se o email existe ou não (segurança)
        return jsonify({"msg": "Se o e-mail estiver cadastrado, você receberá um código de verificação."}), 200

    codigo = ''.join(random.choices(string.digits, k=6))
    CODIGOS_RECUPERACAO[email] = codigo

    # Em produção, enviaríamos o código por email
    # Aqui simulamos o envio retornando o código (apenas para desenvolvimento)
    print(f"[DEV] Código de recuperação para {email}: {codigo}")

    return jsonify({
        "msg": "Se o e-mail estiver cadastrado, você receberá um código de verificação.",
        "dev_codigo": codigo  # Apenas para desenvolvimento
    }), 200


@users_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.json
    email = data.get("email", "").strip().lower()
    codigo = data.get("codigo", "").strip()
    nova_senha = data.get("nova_senha", "")

    if not email or not codigo or not nova_senha:
        return jsonify({"erro": "Todos os campos são obrigatórios"}), 400

    if len(nova_senha) < 4:
        return jsonify({"erro": "A senha deve ter pelo menos 4 caracteres"}), 400

    codigo_armazenado = CODIGOS_RECUPERACAO.get(email)
    if not codigo_armazenado or codigo_armazenado != codigo:
        return jsonify({"erro": "Código de verificação inválido"}), 400

    user = next((u for u in MOCK_USERS if u["email"] == email), None)
    if not user:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    user["senha"] = nova_senha
    del CODIGOS_RECUPERACAO[email]

    return jsonify({"msg": "Senha redefinida com sucesso!"}), 200


def criar_usuario(nome, email, senha, telefone="", cidade="", foto_url=None):
    return {
        "id": len(MOCK_USERS) + 1,
        "nome": nome,
        "email": email,
        "senha": senha,
        "telefone": telefone,
        "cidade": cidade,
        "pontos": 0,
        "impacto_kg": 0,
        "foto_url": foto_url or f"https://i.pravatar.cc/150?img={len(MOCK_USERS)+1}",
        "historico": [],
        "missoes": [
            {"label": "Recicle 10 itens", "reward": "+10 de Impacto", "progress": 0, "total": 10},
            {"label": "Visite 2 Ecopontos diferentes", "reward": "Medalha Explorador", "progress": 0, "total": 2},
            {"label": "Traga 5 amigos para o projeto", "reward": "Selo Comunidade", "progress": 0, "total": 5},
        ],
        "nivel": "Iniciante"
    }

@users_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    nome = data.get("nome", "").strip()
    email = data.get("email", "").strip().lower()
    senha = data.get("senha", "")
    telefone = data.get("telefone", "").strip()
    cidade = data.get("cidade", "").strip()

    if not nome or not email or not senha:
        return jsonify({"erro": "Todos os campos são obrigatórios"}), 400

    if any(u["email"] == email for u in MOCK_USERS):
        return jsonify({"erro": "E-mail já cadastrado"}), 400

    new_user = criar_usuario(nome, email, senha, telefone, cidade)
    MOCK_USERS.append(new_user)

    return jsonify({
        "msg": "Usuário criado com sucesso",
        "user": {"id": new_user["id"], "nome": new_user["nome"], "email": new_user["email"]}
    }), 201

@users_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email", "").strip().lower()
    senha = data.get("senha", "")

    user = next((u for u in MOCK_USERS if u["email"] == email and u["senha"] == senha), None)

    if user:
        return jsonify({
            "msg": "Login bem-sucedido",
            "user": {"id": user["id"], "nome": user["nome"], "email": user["email"]}
        }), 200
    else:
        return jsonify({"erro": "Credenciais inválidas"}), 401


@users_bp.route("/google-login", methods=["POST"])
def google_login():
    data = request.json or {}
    credential = data.get("credential", "").strip()

    if not credential:
        return jsonify({"erro": "Token do Google não informado"}), 400

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        return jsonify({"erro": "Login com Google não configurado no servidor"}), 500

    try:
        idinfo = id_token.verify_oauth2_token(
            credential, google_requests.Request(), client_id
        )
    except ValueError:
        return jsonify({"erro": "Token do Google inválido ou expirado"}), 401

    email = idinfo.get("email", "").strip().lower()
    nome = idinfo.get("name", "").strip()

    if not email:
        return jsonify({"erro": "E-mail não disponível na conta Google"}), 400

    if not nome:
        nome = email.split("@")[0]

    user = next((u for u in MOCK_USERS if u["email"] == email), None)
    if not user:
        new_user = criar_usuario(nome, email, secrets.token_urlsafe(16))
        MOCK_USERS.append(new_user)
        user = new_user

    return jsonify({
        "msg": "Login com Google bem-sucedido",
        "user": {"id": user["id"], "nome": user["nome"], "email": user["email"]}
    }), 200

@users_bp.route("/", methods=["GET"])
def get_users():
    return jsonify([{"id": u["id"], "nome": u["nome"], "impacto_kg": u["impacto_kg"]} for u in MOCK_USERS])

@users_bp.route("/<int:user_id>/profile", methods=["GET", "PUT"])
def get_profile(user_id):
    if request.method == "PUT":
        data = request.json
        user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
        if not user:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        nome = data.get("nome", "").strip()
        telefone = data.get("telefone", "").strip()
        cidade = data.get("cidade", "").strip()
        foto_url = data.get("foto_url", "").strip()

        if nome:
            user["nome"] = nome
        if "telefone" in data:
            user["telefone"] = telefone
        if "cidade" in data:
            user["cidade"] = cidade
        if foto_url:
            user["foto_url"] = foto_url

        return jsonify({
            "msg": "Perfil atualizado com sucesso!",
            "user": {
                "id": user["id"],
                "nome": user["nome"],
                "email": user["email"],
                "telefone": user.get("telefone", ""),
                "cidade": user.get("cidade", ""),
                "foto_url": user.get("foto_url", "")
            }
        }), 200
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    nivel_obj = calcular_nivel(user["impacto_kg"])
    nivel_atual, prox_nivel = calcular_proximo_nivel(user["impacto_kg"])
    progresso = 0
    if prox_nivel["min"] > nivel_atual["min"]:
        progresso = ((user["impacto_kg"] - nivel_atual["min"]) / (prox_nivel["min"] - nivel_atual["min"])) * 100
    else:
        progresso = 100

    return jsonify({
        "id": user["id"],
        "nome": user["nome"],
        "email": user["email"],
        "telefone": user.get("telefone", ""),
        "cidade": user.get("cidade", ""),
        "foto_url": user.get("foto_url", ""),
        "impacto_kg": user["impacto_kg"],
        "nivel": nivel_obj["nome"],
        "historico": user["historico"][-5:],
        "missoes": user["missoes"],
        "progresso_percent": round(progresso, 1),
        "proximo_nivel": prox_nivel["nome"] if prox_nivel["min"] > nivel_atual["min"] else None,
        "proximo_nivel_kg": prox_nivel["min"] if prox_nivel["min"] > nivel_atual["min"] else None
    })

@users_bp.route("/<int:user_id>/add-impacto", methods=["POST"])
def add_impacto(user_id):
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    data = request.json
    material = data.get("material", "Reciclável")
    kg = float(data.get("kg", 0))

    if kg <= 0:
        return jsonify({"erro": "Quantidade inválida"}), 400

    user["impacto_kg"] += kg
    user["historico"].insert(0, {
        "material": material,
        "pts": f"+{kg} kg",
        "time": "Agora"
    })

    for missao in user["missoes"]:
        if missao["label"] == "Recicle 10 itens":
            missao["progress"] = min(missao["progress"] + 1, missao["total"])

    return jsonify({
        "msg": "Impacto registrado!",
        "impacto_kg": user["impacto_kg"],
        "historico": user["historico"][:3]
    })