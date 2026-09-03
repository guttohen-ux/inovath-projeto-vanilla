# Deploy no Netlify — Registro Verde

Este guia cobre as três tarefas pedidas em `instrução.md`:

1. Limpar/ajustar o backend (código morto, dependências e configs não usadas).
2. Configurar o backend para deploy (Netlify Functions — Python).
3. Deploy do frontend estático no Netlify apontando para o backend.

---

## 1. O que foi limpo no backend

- Removido `routes/auth.py` — blueprint duplicado/órfão (nunca importado; o app usa `routes/users.py`).
- Removido `models.py` (vazio, sem uso).
- Removido `analyze_db.py` (script dev que exibia senhas no console; só para debugging).
- Corrigido `routes/_init_.py` → `routes/__init__.py` (nome correto do pacote).
- `requirements.txt` enxuto — mantidas apenas dependências realmente usadas:
  `flask`, `flask-cors`, `python-dotenv`, `google-auth`, `google-generativeai`, `pillow`, `gunicorn`.
- `app.py`:
  - `debug=True` removido do `__main__` (agora usa `FLASK_ENV`/`PORT`).
  - Adicionada a rota `/api/dashboard` com os stats (guardiões, scans, resíduos, ecopontos e ranking).
    > Motivo: na produção o Netlify serve `index.html` em `/`. Antes o frontend consultava `${BASE_URL}/` para os stats, que passaria a retornar HTML. Agora o frontend usa `/api/dashboard`.
  - Campo `scans` adicionado aos stats (conforme `docs/backend_update_instructions.md`).
- `routes/ia.py`: import do `google.generativeai` virou **lazy** — o app sobe mesmo sem a chave/dependência, sem quebrar na inicialização.
- Removidos os arquivos legados do deploy anterior (Vercel): `api/`, `vercel.json` e o `requirements.txt` raiz (dump de `pip freeze` cheio de bibliotecas não usadas).

---

## 2. Como o backend roda no Netlify (Netlify Functions — Python)

O Netlify **não** hospeda um servidor Express/Node com WebSocket persistente — e aqui também não há banco PostgreSQL real: o backend é Flask com dados em memória (`MOCK_USERS`). Nada impede rodar o Flask inteiro como uma **Netlify Function** em modo "Lambda compatibility" (Python).

Estrutura:

```
netlify/
  functions/
    api/
      api.py            # handler Netlify que envolve o Flask via serverless-wsgi
      requirements.txt  # deps da função (Flask, serverless-wsgi, etc.)
Registro-verde-backend/
  backend/              # código Flask (app.py, database.py, routes/)
frontend-vanilla/        # frontend estático (publish dir)
netlify.toml            # build, publicar, functions, redirects
build-config.js         # gera js/config.js a partir da env API_URL
```

- `netlify.toml` declara `publish = "frontend-vanilla"` e `directory = "netlify/functions"`.
- `included_files = ["Registro-verde-backend/backend/**"]` faz o Netlify empacotar o backend junto com a função.
- `api.py` localiza o backend via `sys.path` (caminhos conhecidos + busca recursiva) e chama `serverless_wsgi.handle_request(app, event, context)` — converte o evento da função para WSGI e a resposta de volta para o formato esperado pelo Netlify.
- O redirect `from = "/api/*" to = "/.netlify/functions/api"` (status 200) envia **todo** o tráfego de API para a função, preservando o caminho original (ex.: `/api/users/login`).

### ⚠️ Aviso importante (deprecação)

Funções Python no Netlify rodam em **Lambda compatibility mode**, que está **deprecado**: a partir de **1º de julho de 2027** deploys nesse modo não serão mais aceitos. Ou seja, funciona hoje (2026), mas você deve planejar migrar o backend para um host sempre-ligado (Render/Railway) ou para o novo runtime de Functions até essa data. Como o backend é stateless (dados em memória), a migração é simples.

---

## 3. Como publicar

### Pré-requisitos
- Repositório no GitHub (já existe `origin`).
- Conta no [Netlify](https://app.netlify.com).
- CLI opcional: `npm install -g netlify-cli` (para `netlify dev` local).

### Passos (contínuo a partir do GitHub)

1. Faça commit e push das alterações.
2. No Netlify → **Add new site → Import an existing project** → escolha o repositório.
3. Build settings (o `netlify.toml` já preenche):
   - **Build command:** `node build-config.js`
   - **Publish directory:** `frontend-vanilla`
4. **Environment variables** (Netlify → Site settings → Environment variables), escopo **Functions**:
   - `API_URL` → a URL do site Netlify (ex.: `https://registroverde.netlify.app`). Usada pelo `build-config.js` para gerar o `config.js` do frontend.
   - `GEMINI_API_KEY` → chave da IA do scanner.
   - `GOOGLE_CLIENT_ID` (e `GOOGLE_CLIENT_SECRET`) → login Google.
   - `JWT_SECRET_KEY` → segredo JWT.
   - `PORT` no runtime não é necessário (a função gerencia).
5. Deploy. A cada push o Netlify rebuilda.

### Teste local (opcional)
```bash
npm install -g netlify-cli
netlify dev            # serve functions + frontend com rotas simuladas
```

---

## 4. Como o frontend aponta para o backend

- Todas as chamadas usavam `http://localhost:5000` fixo. Foram substituídas por `window.APP_CONFIG.API_BASE_URL`.
- `js/config.js` é gerado no build a partir da env `API_URL` (`build-config.js`). Em desenvolvimento local, o padrão é `http://localhost:5000`.
- Todo arquivo HTML carrega `js/config.js` **antes** de `app.js` (e dos scripts específicos de cada página).

---

## 5. Limitações conhecidas no Netlify Functions

- **Cold start:** primeira chamada após inatividade pode demorar (aceitável em demo).
- **Tempo de execução:** limite de ~30s por função. As rotas atuais são rápidas; okay para esse app.
- **Estado em memória:** dados são resetados a cada cold start (era assim também localmente — o "banco" é mock).
- **Upload de imagem do scanner:** o `/api/scan` envia a imagem em base64 dentro do evento da função (tratado pelo `serverless-wsgi`). Certifique-se de que `GEMINI_API_KEY` esteja configurada.
- **Deprecação do Lambda-compat:** ver seção 2 acima.

---

## 6. Checklist pós-deploy

- [ ] `https://SEUSITE.netlify.app/api/dashboard` retorna JSON com stats.
- [ ] `https://SEUSITE.netlify.app/api/recycling/ecopontos` retorna lista.
- [ ] Login/cadastro no frontend funciona.
- [ ] Home mostra stats (scans, guardiões, resíduos) vindos do backend.
- [ ] Scanner com `GEMINI_API_KEY` retorna classificação.
