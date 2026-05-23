export const CCI_COURSES = [
  "Administração",
  "Análise e Desenvolvimento de Sistemas",
  "Biomedicina",
  "Direito",
  "Enfermagem",
  "Fonoaudiologia",
  "Pedagogia",
  "Psicologia",
] as const;

export const SEMESTERS = [
  "1º semestre",
  "2º semestre",
  "3º semestre",
  "4º semestre",
  "5º semestre",
  "6º semestre",
  "7º semestre",
  "8º semestre",
  "9º semestre",
  "10º semestre",
] as const;

export interface RegistrationPayload {
  fullName: string;
  cpf: string;
  birthDate: string;
  institutionalEmail: string;
  course: string;
  semester: string;
}
