export interface Student {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  identifier: string; // CPF or Academic Registration (Matrícula)
  role: string; // "student" (Estudante), "professional" (Profissional), "external" (Comunidade Externa), "faculty" (Professor)
  courseTopic?: string; // Opt-in favorite psychology subfield
  createdAt: string;
}

export type RoleType = 'student' | 'professional' | 'external' | 'faculty';

export const ROLE_LABELS: Record<string, string> = {
  student: "Estudante de Psicologia",
  professional: "Profissional da Saúde/Psicólogo",
  external: "Comunidade Externa / Outros",
  faculty: "Professor / Docente"
};

export const PSYCHOLOGY_SUBFIELDS = [
  "Psicologia Clínica",
  "Neuropsicologia",
  "Psicologia Social e Comunitária",
  "Análise do Comportamento (ABA/TCC)",
  "Psicologia Escolar",
  "Psicopedagogia",
  "Psicologia Organizacional",
  "Outra / Interesse Geral"
];
