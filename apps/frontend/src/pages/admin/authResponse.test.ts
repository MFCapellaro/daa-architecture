import { describe, expect, it } from 'vitest';
import { readAuthResponse } from './authResponse';

describe('readAuthResponse', () => {
  it('reports an empty response with its HTTP status', async () => {
    await expect(readAuthResponse(new Response(null, { status: 502 })))
      .rejects.toThrow('sin contenido (HTTP 502)');
  });

  it('reports a non-JSON response without exposing its body', async () => {
    await expect(readAuthResponse(new Response('<html>upstream error</html>', { status: 502 })))
      .rejects.toThrow('respuesta no válida (HTTP 502)');
  });

  it('returns a JSON object', async () => {
    await expect(readAuthResponse(Response.json({ token: 'token' })))
      .resolves.toEqual({ token: 'token' });
  });
});
