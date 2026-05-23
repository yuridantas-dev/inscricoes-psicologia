import nodemailer from "nodemailer";
import { Resend } from "resend";

const ROLE_LABELS: Record<string, string> = {
  student: "Estudante de Psicologia",
  professional: "Profissional da Saúde/Psicólogo",
  external: "Comunidade Externa / Outros",
  faculty: "Professor / Docente",
};

export interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  identifier: string;
  role: string;
  courseTopic?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(data: RegistrationData): string {
  const roleLabel = ROLE_LABELS[data.role] || data.role;
  return `
    <h2>Nova inscrição — Turma de Psicologia</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Nome</td><td>${escapeHtml(data.fullName)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">E-mail</td><td>${escapeHtml(data.email)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Telefone</td><td>${escapeHtml(data.phone)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Matrícula/CPF</td><td>${escapeHtml(data.identifier)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Vínculo</td><td>${escapeHtml(roleLabel)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Área de interesse</td><td>${escapeHtml(data.courseTopic || "—")}</td></tr>
    </table>
    <p style="color:#64748b;font-size:12px;margin-top:16px">Enviado em ${new Date().toLocaleString("pt-BR")}</p>
  `;
}

function buildText(data: RegistrationData): string {
  return [
    `Nova inscrição — ${data.fullName}`,
    `E-mail: ${data.email}`,
    `Telefone: ${data.phone}`,
    `Matrícula/CPF: ${data.identifier}`,
    `Vínculo: ${ROLE_LABELS[data.role] || data.role}`,
    `Área: ${data.courseTopic || "—"}`,
  ].join("\n");
}

async function sendViaResend(
  adminEmail: string,
  data: RegistrationData,
  subject: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY não configurada");

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM || "Inscrições Psicologia <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: [adminEmail],
    replyTo: data.email,
    subject,
    html: buildHtml(data),
    text: buildText(data),
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function sendViaSmtp(
  adminEmail: string,
  data: RegistrationData,
  subject: string
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error("SMTP não configurado");
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  await transporter.verify();
  const from = process.env.SMTP_FROM || user;

  await transporter.sendMail({
    from: `"Inscrições Psicologia" <${from}>`,
    to: adminEmail,
    replyTo: data.email,
    subject,
    html: buildHtml(data),
    text: buildText(data),
  });
}

export function getEmailProvider(): "resend" | "smtp" | "dev" {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return "smtp";
  }
  return "dev";
}

export async function sendRegistrationEmail(data: RegistrationData): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL não está configurado no servidor.");
  }

  const subject = `Nova inscrição: ${data.fullName}`;
  const provider = getEmailProvider();

  if (provider === "resend") {
    await sendViaResend(adminEmail, data, subject);
    return;
  }

  if (provider === "smtp") {
    await sendViaSmtp(adminEmail, data, subject);
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Configure RESEND_API_KEY (recomendado) ou SMTP no servidor para enviar e-mails."
    );
  }

  console.log("\n--- Nova inscrição (modo dev — e-mail não enviado) ---");
  console.log(`Configure RESEND_API_KEY no .env para enviar para ${adminEmail}`);
  console.log(`Assunto: ${subject}`);
  console.log(JSON.stringify(data, null, 2));
  console.log("---\n");
}
