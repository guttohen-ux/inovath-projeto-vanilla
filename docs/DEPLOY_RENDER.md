# Deploy no Render — Registro Verde

Este guia cobre o deploy da aplicação no **[Render](https://render.com)** usando
**dois serviços**:

1. **Backend Flask** → *Web Service* (Python + Gunicorn), sempre ligado.
2. **Frontend estático** → *Static Site*, apontando as chamadas de API para o
   backend.

> O backend é Flask com dados em memória (`MOCK_USERS`), ou seja, é *stateless*
> (os dados resetam a cada restart — era assim também no deploy do Netlify).
> Isso torna o deploy no Render simples e barato.

---

## Estrutura

```
render.yaml                         # Blueprint do Render (os 2 serviços)
Registro-verde-backend/
  backend/
    app.py                          # Flask (usado pelo Gunicorn: gunicorn app:app)
    requirements.txt                # inclui gunicorn
    database.py / routes/           # código do backend
frontend-vanilla/                   # site estático (publish dir)
build-config.js                     # gera js/config.js a partir da env API_URL
```

---

## Como funciona

- O `render.yaml` (na raiz) define os dois serviços.
- **Backend (Web Service):**
  - `rootDir: Registro-verde-backend/backend`
  - build: `pip install -r requirements.txt`
  - start: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 60`
  - health check em `/api/dashboard`
  - `app.py` já lê `PORT` da env e aplica `CORS`. Com `FRONTEND_URL` definida, o
    CORS é restrito às origens informadas.
- **Frontend (Static Site):**
  - `rootDir: frontend-vanilla`
  - build: `node ../build-config.js` (gera `js/config.js` a partir de `API_URL`)
  - `staticPublishPath: .` (publica a própria pasta do frontend)

> Todo arquivo HTML já carrega `js/config.js`, e os scripts JS usam
> `window.APP_CONFIG.API_BASE_URL` para as chamadas de API. Então basta gerar o
> `config.js` com a URL do backend.

---

## Passos para publicar

### Pré-requisitos
- Repositório no GitHub (já existe `origin`).
- Conta no [Render](https://render.com) (faça login com GitHub).

### 1. Commit e push
```bash
git add -A
git commit -m "Adiciona deploy no Render (backend + frontend)"
git push
```

### 2. Publique via Blueprint (recomendado)
No dashboard do Render:
1. **New → Blueprint** (ou "New Blueprint Instance").
2. Conecte o repositório GitHub.
3. O Render lê o `render.yaml` e cria os **dois** serviços automaticamente.
4. Preencha as **variáveis de ambiente** marcadas como `sync: false` (aba "Environment"):
   - **Backend:**
     - `GEMINI_API_KEY` → chave da IA do scanner.
     - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` → login com Google.
     - `JWT_SECRET_KEY` → segredo JWT.
   - **Frontend:**
     - `API_URL` → URL pública do **backend** (ex.: `https://registro-verde-backend.onrender.com`).
5. Click **Apply**. O Render cria, builda e faz o deploy dos dois serviços.
6. No **backend**, defina `FRONTEND_URL` com a URL pública do **frontend**
   (ex.: `https://registro-verde-frontend.onrender.com`). Se deixar vazio, o CORS
   aceita qualquer origem (ok para teste, menos seguro).

### Ou: publique manualmente (um serviço por vez)
Se preferir não usar o Blueprint, crie os dois serviços à mão no Render
copiando os comandos do `render.yaml` e as variáveis acima.

---

## Como o frontend aponta para o backend

- `build-config.js` lê a env `API_URL` e escreve `frontend-vanilla/js/config.js`
  com `window.APP_CONFIG.API_BASE_URL = "<URL do backend>"`.
- Todas as chamadas JS usam `BASE_URL` proveniente desse `config.js`, então nada
  de `localhost` fixo em produção.
- **Local:** sem `API_URL`, o padrão é `http://localhost:5000` (basta rodar o
  backend com `python app.py`).

---

## Checklist pós-deploy

- [ ] `https://SEUBACKEND.onrender.com/api/dashboard` retorna JSON com stats.
- [ ] `https://SEUBACKEND.onrender.com/api/recycling/ecopontos` retorna lista.
- [ ] Login/cadastro no frontend funciona (sem erro de CORS).
- [ ] Home mostra stats (scans, guardiões, resíduos) vindos do backend.
- [ ] Scanner com `GEMINI_API_KEY` retorna classificação.
- [ ] Swagger/rota raiz `/` do backend devolve o status.

---

## Observações / limites

- **Estado em memória:** dados (`MOCK_USERS`) resetam a cada restart. Para dados
  persistentes, substitua por um banco real (ex.: PostgreSQL do próprio Render).
- **Uso Free/Starter:** web services "free" do Render podem "dormir" após
  inatividade (lentidão no primeiro acesso). Considere um plano pago para
  resposta imediata.
- O deploy do **Netlify** (arquivos `netlify.toml` e `netlify/functions/`)
  continua no repositório e pode ser removido se você deixar de usar o Netlify.
