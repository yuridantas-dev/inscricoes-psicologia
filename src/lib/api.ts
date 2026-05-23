export async function parseJsonResponse<T = Record<string, unknown>>(
  response: Response
): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(
      response.ok
        ? "Resposta vazia do servidor."
        : `Erro ${response.status}. Verifique se o site está em http://localhost:3000 e rode npm run dev.`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Resposta inválida do servidor (${response.status}). Use http://localhost:3000 com npm run dev.`
    );
  }
}
