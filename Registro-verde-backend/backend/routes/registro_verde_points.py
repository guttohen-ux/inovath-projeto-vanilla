from flask import Blueprint, jsonify, request

pontos_bp = Blueprint("pontos", __name__)

ACTIVITIES = [
  { "material": 'Garrafa PET', "pts": '+2 kg', "time": 'Hoje, 10:30' },
  { "material": 'Lata de alumínio', "pts": '+0.5 kg', "time": 'Hoje, 09:15' },
  { "material": 'Papelão', "pts": '+1.5 kg', "time": 'Ontem, 16:40' },
]

MISSIONS = [
  { "label": 'Recicle 10 itens', "reward": '+10 de Impacto', "progress": 0, "total": 10 },
  { "label": 'Visite 2 Ecopontos diferentes', "reward": 'Medalha Explorador', "progress": 1, "total": 2 },
  { "label": 'Traga 5 amigos para o projeto', "reward": 'Selo Comunidade', "progress": 2, "total": 5 },
]

@pontos_bp.route("/historico", methods=["GET"])
def historico():
    return jsonify(ACTIVITIES)

@pontos_bp.route("/missoes", methods=["GET"])
def missoes():
    return jsonify(MISSIONS)

@pontos_bp.route("/pontos", methods=["POST"])
def adicionar_pontos():
    data = request.json
    return jsonify({
        "msg": "pontos registrados",
        "dados": data
    })