import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getEmailProvider, sendRegistrationEmail } from "./lib/email.js";

const INSTITUTIONAL_DOMAIN = "@faculdadecci.com.br";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

function isValidCpf(cpf: string): boolean {
  return cpf.replace(/\D/g, "").length === 11;
}

function isValidInstitutionalEmail(email: string): boolean {
  const n = email.trim().toLowerCase();
  return n.includes("@") && n.endsWith(INSTITUTIONAL_DOMAIN);
}

function isValidBirthDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr + "T12:00:00");
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return date <= today;
}

app.post("/api/inscricao", async (req, res) => {
  try {
    const {
      fullName,
      cpf,
      birthDate,
      institutionalEmail,
      course,
      semester,
    } = req.body;

    if (!fullName?.trim()) {
      return res.status(400).json({ error: "Nome completo é obrigatório." });
    }
    if (fullName.trim().split(/\s+/).length < 2) {
      return res.status(400).json({ error: "Informe nome e sobrenome completos." });
    }
    if (!cpf?.trim() || !isValidCpf(cpf)) {
      return res.status(400).json({ error: "CPF inválido. Informe os 11 dígitos." });
    }
    if (!birthDate || !isValidBirthDate(birthDate)) {
      return res.status(400).json({ error: "Data de nascimento inválida." });
    }
    if (!institutionalEmail?.trim() || !isValidInstitutionalEmail(institutionalEmail)) {
      return res.status(400).json({
        error: `Use seu e-mail institucional (${INSTITUTIONAL_DOMAIN}).`,
      });
    }
    if (!course?.trim()) {
      return res.status(400).json({ error: "Selecione o curso." });
    }
    if (!semester?.trim()) {
      return res.status(400).json({ error: "Selecione o semestre." });
    }

    const data = {
      fullName: fullName.trim(),
      cpf: cpf.trim(),
      birthDate: birthDate.trim(),
      institutionalEmail: institutionalEmail.trim().toLowerCase(),
      course: course.trim(),
      semester: semester.trim(),
    };

    await sendRegistrationEmail(data);

    res.status(201).json({
      success: true,
      message: "Inscrição enviada! A comissão receberá seus dados por e-mail.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("POST /api/inscricao:", e);

    if (
      msg.includes("BadCredentials") ||
      msg.includes("EAUTH") ||
      msg.includes("Authentication")
    ) {
      return res.status(500).json({
        error:
          "E-mail não configurado no servidor. O organizador deve adicionar RESEND_API_KEY no .env ou no Render.",
      });
    }

    if (msg.includes("testing emails to your own") || msg.includes("verify a domain")) {
      return res.status(500).json({
        error:
          "Envio de e-mail bloqueado pelo Resend: a chave API só pode notificar o e-mail da conta que criou o Resend. Crie uma conta em resend.com com ana3718825@faculdadecci.com.br, gere uma nova API Key e atualize no Render (Environment).",
      });
    }

    res.status(500).json({
      error: "Não foi possível enviar a inscrição. Tente novamente em instantes.",
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

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Rota da API não encontrada." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor em http://localhost:${PORT}`);
  });
}

startServer();
