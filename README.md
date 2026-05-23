# Portal de Inscrições — Psicologia 2026

Formulário simples: cada inscrição envia um **e-mail** para a comissão.

## Configurar e-mail (Resend — recomendado)

O e-mail `@faculdadecci.com.br` usa **Google** e normalmente **não aceita** a senha normal para envio automático. O jeito mais fácil é o **Resend** (grátis, ~100 e-mails/dia):

1. Acesse **https://resend.com** e crie uma conta (pode usar Google).
2. Menu **API Keys** → **Create API Key** → copie a chave (`re_...`).
3. No arquivo `.env` do projeto:

```env
ADMIN_EMAIL=marcos3716625@faculdadecci.com.br
RESEND_API_KEY=re_sua_chave_aqui
```

4. Teste:

```bash
npm run test:email
```

5. Reinicie o site: `npm run dev` e envie uma inscrição pelo formulário.

Os e-mails chegam no `ADMIN_EMAIL` configurado (confira também **Spam**).

**Importante (Resend grátis):** a API Key só envia para o **mesmo e-mail da conta Resend** até você verificar o domínio `faculdadecci.com.br` em [resend.com/domains](https://resend.com/domains). Para notificar `ana3718825@faculdadecci.com.br`, crie a conta Resend com o e-mail da Ana e use a API Key dela no Render.

## Alternativa: Gmail com senha de app

Se preferir usar o próprio e-mail da faculdade:

1. Ative verificação em 2 etapas na conta Google.
2. Crie uma **Senha de app**: https://myaccount.google.com/apppasswords
3. No `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=marcos3716625@faculdadecci.com.br
SMTP_PASS=xxxx xxxx xxxx xxxx
```

(Não use a senha normal de login — o Google bloqueia.)

## Rodar o site

```bash
npm install
npm run dev
```

http://localhost:3000

## Publicar na internet

Guia completo em **[DEPLOY.md](./DEPLOY.md)** (GitHub + Render, grátis).

Resumo: suba o projeto no GitHub → crie um **Web Service** no [Render](https://render.com) → configure `NODE_ENV=production`, `ADMIN_EMAIL` e `RESEND_API_KEY` → use a URL que o Render gerar.
