## Tarefas — Deploy do projeto no Netlify

### 1. Limpar e ajustar o servidor (backend)
- Revisar a configuração atual do servidor e **remover tudo que for inútil** (código morto, dependências não usadas, configurações obsoletas — ex: `data.ts` estático se já não fizer mais sentido, configs de dev que não servem em produção).
- Deixar o servidor "enxuto" e pronto para rodar em produção.

### 2. Configurar o backend para deploy
- Definir onde o backend (servidor + PostgreSQL + WebSocket) vai rodar, já que **o Netlify é focado em frontend/estático e funções serverless** — não hospeda um servidor Node/Express tradicional com conexão persistente de WebSocket.
- Opções a considerar:
  - Hospedar o backend separadamente (ex: Railway, Render, Fly.io) e manter só o frontend no Netlify.
  - Se for usar Netlify Functions, avaliar limitações (sem suporte nativo a WebSocket persistente).

### 3. Deploy do frontend no Netlify
- Dicas de como configurar o frontend para apontar para o backend hospedado:
  - Build do frontend (`npm run build`) e configurar o Netlify para servir a pasta de build.
  - Definir variáveis de ambiente no Netlify (ex: URL da API/backend) para o frontend saber para onde mandar as requisições.
  - Configurar `netlify.toml` com comando de build, diretório de publicação e redirects (se usar rotas do lado do cliente, tipo React Router).