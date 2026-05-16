NIVEIS = [
    {"nome": "Iniciante", "min": 0},
    {"nome": "Guardião", "min": 10},
    {"nome": "Guardião da Floresta", "min": 50},
    {"nome": "Mestre da Reciclagem", "min": 100},
    {"nome": "Lenda Verde", "min": 200},
]

def calcular_nivel(pontos):
    nivel = NIVEIS[0]
    for n in NIVEIS:
        if pontos >= n["min"]:
            nivel = n
    return nivel

def calcular_proximo_nivel(pontos):
    for i, n in enumerate(NIVEIS):
        if pontos < n["min"]:
            atual = NIVEIS[i - 1] if i > 0 else n
            return atual, n
    return NIVEIS[-1], NIVEIS[-1]

MOCK_USERS = [
    {
        "id": 1,
        "nome": "Ana Silva",
        "email": "ana@email.com",
        "senha": "123456",
        "pontos": 0,
        "impacto_kg": 85,
        "foto_url": "https://i.pravatar.cc/150?img=1",
        "historico": [
            {"material": "Garrafa PET", "pts": "+2 kg", "time": "Hoje, 10:30"},
            {"material": "Lata de alumínio", "pts": "+0.5 kg", "time": "Hoje, 09:15"},
            {"material": "Papelão", "pts": "+1.5 kg", "time": "Ontem, 16:40"},
            {"material": "Vidro", "pts": "+3 kg", "time": "Ontem, 11:20"},
            {"material": "Plástico misto", "pts": "+1 kg", "time": "2 dias atrás"},
        ],
        "missoes": [
            {"label": "Recicle 10 itens", "reward": "+10 de Impacto", "progress": 5, "total": 10},
            {"label": "Visite 2 Ecopontos diferentes", "reward": "Medalha Explorador", "progress": 1, "total": 2},
            {"label": "Traga 5 amigos para o projeto", "reward": "Selo Comunidade", "progress": 2, "total": 5},
        ],
        "nivel": "Guardião da Floresta"
    },
    {
        "id": 2,
        "nome": "Carlos Souza",
        "email": "carlos@email.com",
        "senha": "654321",
        "pontos": 0,
        "impacto_kg": 42,
        "foto_url": "https://i.pravatar.cc/150?img=2",
        "historico": [
            {"material": "Papel", "pts": "+1 kg", "time": "Hoje, 08:00"},
            {"material": "Garrafa PET", "pts": "+1.5 kg", "time": "Ontem, 14:30"},
        ],
        "missoes": [
            {"label": "Recicle 10 itens", "reward": "+10 de Impacto", "progress": 2, "total": 10},
            {"label": "Visite 2 Ecopontos diferentes", "reward": "Medalha Explorador", "progress": 0, "total": 2},
            {"label": "Traga 5 amigos para o projeto", "reward": "Selo Comunidade", "progress": 1, "total": 5},
        ],
        "nivel": "Guardião"
    },
    {
        "id": 3,
        "nome": "Mariana Oliveira",
        "email": "mariana@email.com",
        "senha": "abcdef",
        "pontos": 0,
        "impacto_kg": 210,
        "foto_url": "https://i.pravatar.cc/150?img=3",
        "historico": [
            {"material": "Sucata metálica", "pts": "+10 kg", "time": "Hoje, 07:45"},
            {"material": "Papelão", "pts": "+5 kg", "time": "Ontem, 18:00"},
            {"material": "Vidro", "pts": "+8 kg", "time": "3 dias atrás"},
        ],
        "missoes": [
            {"label": "Recicle 10 itens", "reward": "+10 de Impacto", "progress": 8, "total": 10},
            {"label": "Visite 2 Ecopontos diferentes", "reward": "Medalha Explorador", "progress": 2, "total": 2},
            {"label": "Traga 5 amigos para o projeto", "reward": "Selo Comunidade", "progress": 3, "total": 5},
        ],
        "nivel": "Lenda Verde"
    },
]
