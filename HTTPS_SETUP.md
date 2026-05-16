# 🔒 Configuração HTTPS Segura

## O que foi implementado

✅ **HTTPS automático** - Certificados SSL auto-assinados gerados automaticamente  
✅ **Sem quebra de código** - Compatível com todo o código existente  
✅ **CORS configurado** - Funciona com requisições do frontend  
✅ **Desenvolvimento seguro** - Pronto para produção com certificados válidos  

## Como usar

### 1️⃣ Instalar dependências

```bash
cd Registro-verde-backend/backend
pip install -r requirements.txt
```

### 2️⃣ Iniciar o projeto

**Opção A - Automático (Windows):**
```bash
iniciar-projeto.bat
```

**Opção B - Manual (qualquer SO):**
```bash
python app.py
```

### 3️⃣ Acessar

```
🔒 https://localhost:5000
```

> ⚠️ **Aviso de Certificado:** Seu navegador mostrará um aviso porque o certificado é auto-assinado. Clique em "Continuar mesmo assim" ou "Avançado" → "Continuar para localhost".

## Como funciona

1. **Primeira execução**: O servidor gera automaticamente:
   - Chave privada: `Registro-verde-backend/backend/certs/key.pem`
   - Certificado: `Registro-verde-backend/backend/certs/cert.pem`

2. **Próximas execuções**: Reutiliza os certificados existentes

3. **Frontend**: Todas as requisições agora usam `https://`

## Para Produção

Para usar certificados válidos (Let's Encrypt), substitua os arquivos:

```python
# Em app.py, linha do ssl_context, use:
ssl_context=("caminho/para/cert.pem", "caminho/para/key.pem")
```

## Troubleshooting

### ❌ Erro: "certificate verify failed"

**Solução:** É esperado em desenvolvimento. Ignore o aviso no navegador.

### ❌ Porta 5000 já em uso

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### ❌ Módulo pyopenssl não encontrado

```bash
pip install --upgrade pyopenssl cryptography
```

---

**Segurança:** Este certificado auto-assinado é APENAS para desenvolvimento. Para produção, use certificados de uma CA confiável (Let's Encrypt é grátis! 🎉).
