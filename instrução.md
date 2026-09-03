
### Diagnosticar
Verificar se o problema é do **servidor local** (backend não está rodando na porta 5000) ou do **código do frontend** (`app.js`), considerando:

1. Confirmar se o backend está ativo e escutando na porta 5000 (`app.listen(5000, ...)`).
2. Verificar se o servidor não crashou ao iniciar (checar terminal/logs por erros, ex: falha de conexão com banco).
3. Confirmar se a porta configurada no backend bate com a porta usada no `fetch()` do frontend.
4. Testar o endpoint diretamente no navegador (`http://localhost:5000/api/recycling/ecopontos`) para isolar se é falha de servidor ou de código.
5. Checar se outro processo já está ocupando a porta 5000, ou se há bloqueio de firewall/antivírus.

### Ação
- Se o servidor não estiver rodando: iniciar o backend antes de testar o frontend.
- Se estiver rodando mas ainda recusar conexão: revisar logs do processo e liberar/checar a porta.
- Confirmar se as rotas `/api/recycling/ecopontos` e `/api/recycling/materials` pertencem a este projeto ou a um projeto separado, para não misturar o diagnóstico.