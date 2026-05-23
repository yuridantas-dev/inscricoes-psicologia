import "dotenv/config";
import { getEmailProvider, sendRegistrationEmail } from "../lib/email.js";

async function main() {
  console.log("Destino:", process.env.ADMIN_EMAIL);
  console.log("Provedor:", getEmailProvider());

  try {
    await sendRegistrationEmail({
      fullName: "Teste Sistema Inscrições",
      email: "teste@exemplo.com",
      phone: "(61) 99999-9999",
      identifier: "RA-TESTE",
      role: "student",
      courseTopic: "Psicologia Clínica",
    });
    console.log("\nSucesso! Confira a caixa de entrada (e spam).");
  } catch (e) {
    console.error("\nFalha:");
    console.error(e);
    process.exit(1);
  }
}

main();
