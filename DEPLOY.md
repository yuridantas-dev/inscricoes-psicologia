# Publicar o site na internet

Guia passo a passo usando **Render** (grátis, fácil, aceita Node.js).

## Antes de começar

Você precisa de:

- Conta no **GitHub** (grátis): https://github.com
- Conta no **Render** (grátis): https://render.com
- Sua chave **Resend** (`RESEND_API_KEY` do arquivo `.env`)
- Seu e-mail `ADMIN_EMAIL`

O arquivo `.env` **não** deve ir para o GitHub (já está no `.gitignore`).

---

## Passo 1 — Enviar o projeto para o GitHub

No PowerShell, na pasta do projeto:

```powershell
cd "C:\Users\marcos.cortes\Downloads\projeto1\inscrições-psicologia"

git init
git add .
git commit -m "Portal de inscrições psicologia"
```

No GitHub: **New repository** → nome ex.: `inscricoes-psicologia` → **não** marque README → Create.

Depois (troque `SEU_USUARIO` pelo seu usuário do GitHub):

```powershell
git remote add origin https://github.com/SEU_USUARIO/inscricoes-psicologia.git
git branch -M main
git push -u origin main
```

---

## Passo 2 — Criar o site no Render

1. Acesse https://dashboard.render.com e faça login (pode usar conta GitHub).
2. **New +** → **Web Service**.
3. Conecte o repositório `inscricoes-psicologia`.
4. Preencha:

| Campo | Valor |
|--------|--------|
| **Name** | `inscricoes-psicologia` (ou outro nome) |
| **Region** | Oregon (ou mais perto) |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

5. Em **Environment Variables**, adicione:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `ADMIN_EMAIL` | `marcos3716625@faculdadecci.com.br` |
| `RESEND_API_KEY` | `re_...` (copie do seu `.env`) |

6. Clique **Create Web Service**.

Aguarde 5–10 minutos no primeiro deploy. Quando ficar **Live**, Render mostra uma URL tipo:

`https://inscricoes-psicologia.onrender.com`

Esse é o link público do seu site.

---

## Passo 3 — Testar online

1. Abra a URL do Render no celular ou em outro computador.
2. Preencha o formulário com dados de teste.
3. Confira se o e-mail chegou em `marcos3716625@faculdadecci.com.br`.

---

## Plano gratuito do Render

- O site “dorme” após ~15 min sem acesso; a **primeira visita** pode demorar ~30 s para acordar.
- Para evento com muitos acessos, o plano pago evita isso.

---

## Atualizar o site depois

Alterou o código localmente:

```powershell
git add .
git commit -m "Descrição da mudança"
git push
```

O Render faz deploy automático de novo.

---

## Alternativa: Railway

1. https://railway.app → New Project → Deploy from GitHub.
2. Mesmas variáveis: `NODE_ENV`, `ADMIN_EMAIL`, `RESEND_API_KEY`.
3. Build: `npm run build` — Start: `npm start`.

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| Formulário dá erro | Confira se `RESEND_API_KEY` está nas variáveis do Render |
| E-mail não chega | Veja **Logs** no painel Render; teste `npm run test:email` local |
| Site lento na 1ª vez | Normal no plano free (servidor acordando) |
