import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface RegistrationData {
  fullName: string;
  cpf: string;
  birthDate: string;
  institutionalEmail: string;
  course: string;
  semester: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatBirthDatePtBr(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

function buildHtml(data: RegistrationData): string {
  return `
    <h2>Nova inscrição — Faculdade CCI</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Nome completo</td><td>${escapeHtml(data.fullName)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">CPF</td><td>${escapeHtml(data.cpf)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Data de nascimento</td><td>${escapeHtml(formatBirthDatePtBr(data.birthDate))}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">E-mail institucional</td><td>${escapeHtml(data.institutionalEmail)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Curso</td><td>${escapeHtml(data.course)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Semestre</td><td>${escapeHtml(data.semester)}</td></tr>
    </table>
    <p style="color:#64748b;font-size:12px;margin-top:16px">Enviado em ${new Date().toLocaleString("pt-BR")}</p>
  `;
}

function buildText(data: RegistrationData): string {
  return [
    `Nova inscrição — ${data.fullName}`,
    `CPF: ${data.cpf}`,
    `Data de nascimento: ${formatBirthDatePtBr(data.birthDate)}`,
    `E-mail institucional: ${data.institutionalEmail}`,
    `Curso: ${data.course}`,
    `Semestre: ${data.semester}`,
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
    process.env.RESEND_FROM || "Inscrições CCI <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: [adminEmail],
    replyTo: data.institutionalEmail,
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
    from: `"Inscrições CCI" <${from}>`,
    to: adminEmail,
    replyTo: data.institutionalEmail,
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

  const subject = `Nova inscrição: ${data.fullName} — ${data.course}`;
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
