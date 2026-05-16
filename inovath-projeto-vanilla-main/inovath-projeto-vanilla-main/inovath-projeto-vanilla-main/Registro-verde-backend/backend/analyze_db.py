from database import MOCK_USERS, NIVEIS, calcular_nivel, calcular_proximo_nivel

def analisar():
    print("=" * 70)
    print("           ANALISADOR DO BANCO DE DADOS - EcoPontos")
    print("=" * 70)

    # Resumo geral
    total_usuarios = len(MOCK_USERS)
    total_impacto = sum(u["impacto_kg"] for u in MOCK_USERS)
    print(f"\n RESUMO GERAL")
    print(f"   Usuários cadastrados: {total_usuarios}")
    print(f"   Impacto total:        {total_impacto} kg desviados")
    print(f"   Média por usuário:    {(total_impacto / total_usuarios):.1f} kg" if total_usuarios else "")
    print(f"   Níveis disponíveis:   {len(NIVEIS)}")

    print(f"\n   Tabela de níveis:")
    print(f"   {'Nome':<30} {'Kg mínimos':<15}")
    print(f"   " + "-" * 45)
    for n in NIVEIS:
        print(f"   {n['nome']:<30} {n['min']:<15}")

    # Ranking de impacto
    ranking = sorted(MOCK_USERS, key=lambda u: u["impacto_kg"], reverse=True)
    print(f"\n RANKING DE IMPACTO")
    print(f"   {'#':<4} {'Nome':<25} {'Impacto':<12} {'Nível':<25}")
    print(f"   " + "-" * 66)
    for i, u in enumerate(ranking, 1):
        nivel = calcular_nivel(u["impacto_kg"])
        medal = {1: "1o", 2: "2o", 3: "3o"}.get(i, "  ")
        print(f"   {medal}  {i:<2} {u['nome']:<25} {u['impacto_kg']:<12} {nivel['nome']:<25}")

    # Detalhes por usuário
    print(f"\n\n DETALHES POR USUÁRIO")
    print("=" * 70)
    for u in MOCK_USERS:
        nivel = calcular_nivel(u["impacto_kg"])
        nivel_atual, prox = calcular_proximo_nivel(u["impacto_kg"])
        print(f"\n   == ID: {u['id']}  |  {u['nome']}  |  {u['email']}")
        print(f"   -> Impacto: {u['impacto_kg']} kg")
        print(f"   -> Nivel atual: {nivel['nome']}")
        if prox["min"] > nivel_atual["min"]:
            prog = ((u["impacto_kg"] - nivel_atual["min"]) / (prox["min"] - nivel_atual["min"])) * 100
            print(f"   -> Proximo nivel: {prox['nome']} ({prox['min']} kg)")
            print(f"   -> Progresso: {prog:.1f}%")
        else:
            print(f"   -> Nivel maximo atingido!")

        print(f"   -> Senha: {u['senha']}")

        if u["historico"]:
            print(f"   -> Ultimas atividades:")
            for h in u["historico"][:5]:
                print(f"       * {h['material']} -> {h['pts']} ({h['time']})")
        else:
            print(f"   -> Historico: (vazio)")

        if u["missoes"]:
            print(f"   -> Missoes:")
            for m in u["missoes"]:
                pct = (m["progress"] / m["total"]) * 100
                barra = "#" * int(pct / 10) + "-" * (10 - int(pct / 10))
                print(f"       {m['label']:<35} [{barra}] {m['progress']}/{m['total']}")

    # Estatísticas
    print(f"\n\n ESTATÍSTICAS")
    print("=" * 70)
    if MOCK_USERS:
        kgs = [u["impacto_kg"] for u in MOCK_USERS]
        print(f"   Maior impacto:  {max(kgs)} kg ({ranking[0]['nome']})")
        print(f"   Menor impacto:  {min(kgs)} kg ({ranking[-1]['nome']})")
        print(f"   Total atividades: {sum(len(u['historico']) for u in MOCK_USERS)}")
        print(f"   Total missões: {sum(len(u['missoes']) for u in MOCK_USERS)}")
    print(f"\n" + "=" * 70)
    print(f"   Fim da análise")
    print("=" * 70)

if __name__ == "__main__":
    analisar()
