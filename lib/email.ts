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

function buildStudentNotificationHtml(data: RegistrationData): string {
  const firstName = data.fullName.trim().split(/\s+/)[0];
  return `
    <h2>Inscrição recebida — Faculdade CCI</h2>
    <p style="font-family:sans-serif;font-size:14px;line-height:1.6">
      Olá, ${escapeHtml(firstName)}!
    </p>
    <p style="font-family:sans-serif;font-size:14px;line-height:1.6">
      Sua inscrição foi registrada com sucesso. Os dados foram enviados para a organização do evento.
    </p>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;margin-top:12px">
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Curso</td><td>${escapeHtml(data.course)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold">Semestre</td><td>${escapeHtml(data.semester)}</td></tr>
    </table>
    <p style="color:#64748b;font-size:12px;margin-top:16px;font-family:sans-serif">
      Enviado em ${new Date().toLocaleString("pt-BR")}
    </p>
  `;
}

function buildStudentNotificationText(data: RegistrationData): string {
  const firstName = data.fullName.trim().split(/\s+/)[0];
  return [
    `Olá, ${firstName}!`,
    "",
    "Sua inscrição foi registrada com sucesso. Os dados foram enviados para a organização do evento.",
    "",
    `Curso: ${data.course}`,
    `Semestre: ${data.semester}`,
  ].join("\n");
}

interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

async function sendViaResend(email: OutgoingEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY não configurada");

  const resend = new Resend(apiKey);
  const from =
    process.env.RESEND_FROM || "Inscrições CCI <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: [email.to],
    replyTo: email.replyTo,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function sendViaSmtp(email: OutgoingEmail): Promise<void> {
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
    to: email.to,
    replyTo: email.replyTo,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
}

async function sendEmail(email: OutgoingEmail): Promise<void> {
  const provider = getEmailProvider();

  if (provider === "resend") {
    await sendViaResend(email);
    return;
  }

  if (provider === "smtp") {
    await sendViaSmtp(email);
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Configure RESEND_API_KEY (recomendado) ou SMTP no servidor para enviar e-mails."
    );
  }

  console.log("\n--- E-mail (modo dev — não enviado) ---");
  console.log(`Para: ${email.to}`);
  console.log(`Assunto: ${email.subject}`);
  console.log(email.text);
  console.log("---\n");
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

  await sendEmail({
    to: adminEmail,
    subject: `Nova inscrição: ${data.fullName} — ${data.course}`,
    html: buildHtml(data),
    text: buildText(data),
    replyTo: data.institutionalEmail,
  });

  await sendEmail({
    to: data.institutionalEmail,
    subject: "Inscrição recebida — Faculdade CCI",
    html: buildStudentNotificationHtml(data),
    text: buildStudentNotificationText(data),
  });
}
