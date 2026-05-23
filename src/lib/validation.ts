const INSTITUTIONAL_EMAIL_DOMAIN = "@faculdadecci.com.br";

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  return digits.length === 11;
}

export function isValidInstitutionalEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (
    normalized.includes("@") &&
    normalized.endsWith(INSTITUTIONAL_EMAIL_DOMAIN) &&
    normalized.length > INSTITUTIONAL_EMAIL_DOMAIN.length + 1
  );
}

export function isValidBirthDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr + "T12:00:00");
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (date > today) return false;
  const minYear = today.getFullYear() - 100;
  return date.getFullYear() >= minYear;
}

export { INSTITUTIONAL_EMAIL_DOMAIN };
