import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getEmailProvider, sendRegistrationEmail } from "./lib/email.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.post("/api/inscricao", async (req, res) => {
  try {
    const { fullName, email, phone, identifier, role, courseTopic } = req.body;

    if (!fullName?.trim()) {
      return res.status(400).json({ error: "Nome completo é obrigatório." });
    }
    if (fullName.trim().split(/\s+/).length < 2) {
      return res.status(400).json({ error: "Informe nome e sobrenome completos." });
    }
    if (!email?.trim() || !email.includes("@")) {
      return res.status(400).json({ error: "E-mail inválido." });
    }
    if (!phone?.trim() || phone.replace(/\D/g, "").length < 10) {
      return res.status(400).json({ error: "Telefone/WhatsApp inválido." });
    }
    if (!identifier?.trim()) {
      return res.status(400).json({ error: "Matrícula ou CPF é obrigatório." });
    }

    const data = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      identifier: identifier.trim(),
      role: role || "student",
      courseTopic: (courseTopic || "").trim() || undefined,
    };

    await sendRegistrationEmail(data);

    res.status(201).json({
      success: true,
      message: "Inscrição enviada! A comissão receberá seus dados por e-mail.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("POST /api/inscricao:", e);
    const authHint =
      msg.includes("BadCredentials") ||
      msg.includes("EAUTH") ||
      msg.includes("Authentication");
    res.status(500).json({
      error: authHint
        ? "E-mail não configurado no servidor. O organizador deve adicionar RESEND_API_KEY no .env (veja README)."
        : "Não foi possível enviar a inscrição. Tente novamente em instantes.",
    });
  }
});

async function startServer() {
  const provider = getEmailProvider();
  const dest = process.env.ADMIN_EMAIL || "(defina ADMIN_EMAIL)";
  const labels = {
    resend: `Resend → ${dest}`,
    smtp: `SMTP → ${dest}`,
    dev: `modo dev (só terminal) — defina RESEND_API_KEY para ${dest}`,
  };
  console.log(`E-mail: ${labels[provider]}`);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Não deixa o Vite interceptar rotas da API (evita resposta vazia/HTML)
    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 404 JSON para rotas /api inexistentes
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Rota da API não encontrada." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor em http://localhost:${PORT}`);
  });
}

startServer();
