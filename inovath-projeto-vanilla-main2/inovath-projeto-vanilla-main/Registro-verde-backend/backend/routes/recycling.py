from flask import Blueprint, jsonify

recycling_bp = Blueprint('recycling', __name__)

ECOPONTOS = [
  { "name": 'Ecoponto Centro', "address": 'Rua das Flores, 123 – Centro', "dist": '0,5 km', "lat": -3.1190, "lng": -60.0217 },
  { "name": 'Ecoponto Escola Verde', "address": 'Av. Educação, 456 – São Jorge', "dist": '1,2 km', "lat": -3.0800, "lng": -60.0100 },
  { "name": 'Ecoponto Parque das Águas', "address": 'Rua do Igarapé, 789 – Compensa', "dist": '2,1 km', "lat": -3.0900, "lng": -60.0500 },
  { "name": 'Ecoponto Shopping Ponta Negra', "address": 'Av. Coronel Teixeira, 5700 – P. Negra', "dist": '3,3 km', "lat": -3.0550, "lng": -60.1000 },
]

MATERIALS = [
  { "id": 'plastico', "label": 'Plástico', "pts": 'Impacto Alto', "color": '#3b82f6' },
  { "id": 'metal', "label": 'Metal', "pts": 'Impacto Muito Alto', "color": '#8b5cf6' },
  { "id": 'papel', "label": 'Papel', "pts": 'Impacto Médio', "color": '#f59e0b' },
  { "id": 'vidro', "label": 'Vidro', "pts": 'Impacto Alto', "color": '#06b6d4' },
]

@recycling_bp.route('/ecopontos')
def get_ecopontos():
    return jsonify(ECOPONTOS)

@recycling_bp.route('/materials')
def get_materials():
    return jsonify(MATERIALS)