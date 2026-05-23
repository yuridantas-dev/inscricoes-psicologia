import "dotenv/config";
import { getEmailProvider, sendRegistrationEmail } from "../lib/email.js";

async function main() {
  console.log("Destino:", process.env.ADMIN_EMAIL);
  console.log("Provedor:", getEmailProvider());

  try {
    await sendRegistrationEmail({
      fullName: "Teste Sistema Inscrições",
      cpf: "123.456.789-00",
      birthDate: "2000-05-15",
      institutionalEmail: "teste@faculdadecci.com.br",
      course: "Psicologia",
      semester: "3º semestre",
    });
    console.log("\nSucesso! Confira a caixa de entrada (e spam).");
  } catch (e) {
    console.error("\nFalha:");
    console.error(e);
    process.exit(1);
  }
}

main();
