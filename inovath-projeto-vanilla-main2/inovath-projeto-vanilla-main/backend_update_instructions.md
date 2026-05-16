# Instruções para Atualização do Backend

Para que o frontend do Registro Verde consiga exibir o número total de scans realizados de forma dinâmica, é necessário realizar uma pequena alteração no arquivo `backend/app.py`.

## Arquivo: `backend/app.py`

### 1. Calcular o total de scans
Dentro da função `dashboard()` (rota `@app.route("/")`), adicione o cálculo do total de atividades baseando-se no histórico de todos os usuários.

### 2. Incluir no JSON de retorno
Adicione o campo `scans` dentro do objeto `stats`.

### Exemplo de como deve ficar o código:

```python
@app.route("/")
def dashboard():
    # ... código existente ...
    
    total_guardioes = len(MOCK_USERS)
    total_impacto = sum(u["impacto_kg"] for u in MOCK_USERS)
    total_ecopontos = len(ECOPONTOS)
    
    # --- NOVA LINHA: Calcular total de scans ---
    total_scans = sum(len(u.get("historico", [])) for u in MOCK_USERS)
    
    return jsonify({
        "projeto": "Registro Verde",
        "status": "online",
        # ... outros campos ...
        "stats": {
            "guardioes": f"{total_guardioes}+",
            "impacto_kg": total_impacto,
            "residuos_ton": round(total_impacto / 1000, 2),
            "ecopontos": total_ecopontos,
            "scans": f"{total_scans}"  # --- NOVA LINHA: Incluir scans aqui ---
        },
        "mensagem": "Sistema carregado com sucesso"
    })
```

---
**Nota:** Após essa alteração, o frontend passará a exibir o número real de scans registrados no "banco de dados" mockado.
