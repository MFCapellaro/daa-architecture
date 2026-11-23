export async function readAuthResponse(response: Response): Promise<Record<string, unknown>> {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(
      `El servidor de autenticación respondió sin contenido (HTTP ${response.status}). Verifica que el backend esté activo y que la ruta /api esté dirigida al backend.`,
    );
  }

  let result: unknown;
  try {
    result = JSON.parse(body);
  } catch {
    throw new Error(
      `El servidor de autenticación devolvió una respuesta no válida (HTTP ${response.status}). Verifica que la ruta /api esté dirigida al backend.`,
    );
  }

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error(
      `El servidor de autenticación devolvió una respuesta no válida (HTTP ${response.status}).`,
    );
  }

  return result as Record<string, unknown>;
}
