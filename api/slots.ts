
export const config = {
  runtime: 'edge',
};

/**
 * Handler para sincronização da agenda com Vercel Edge Config.
 * Suporta GET para leitura e POST para atualização (requer VERCEL_ACCESS_TOKEN).
 */
export default async function handler(req: Request) {
  const edgeConfigUrl = process.env.EDGE_CONFIG;
  
  if (!edgeConfigUrl) {
    return new Response(JSON.stringify({ 
      error: 'Configuração ausente', 
      message: 'A variável EDGE_CONFIG não foi encontrada no ambiente.' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const baseUrl = edgeConfigUrl.split('?')[0];
  const configId = baseUrl.split('/').pop();

  // --- LEITURA ---
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${baseUrl}/item/slots?${edgeConfigUrl.split('?')[1]}`);
      if (!response.ok) return new Response(JSON.stringify({}), { status: 200 });
      
      const data = await response.json();
      return new Response(JSON.stringify(data || {}), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store' 
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Erro na leitura' }), { status: 500 });
    }
  }

  // --- ESCRITA ---
  if (req.method === 'POST') {
    try {
      const newData = await req.json();
      const token = process.env.VERCEL_ACCESS_TOKEN;

      if (!token) {
        return new Response(JSON.stringify({ error: 'Token ausente' }), { status: 401 });
      }

      const updateRes = await fetch(
        `https://api.vercel.com/v1/edge-config/${configId}/items`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [{ operation: 'upsert', key: 'slots', value: newData }],
          }),
        }
      );

      if (updateRes.ok) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      return new Response(JSON.stringify({ error: 'Erro na Vercel API' }), { status: 500 });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Erro no processamento' }), { status: 500 });
    }
  }

  return new Response('Método não permitido', { status: 405 });
}
