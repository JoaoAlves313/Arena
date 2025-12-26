
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const edgeConfigUrl = process.env.EDGE_CONFIG;
  
  if (!edgeConfigUrl) {
    return new Response(JSON.stringify({ error: 'Configuração EDGE_CONFIG não encontrada.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Extrair o ID do Edge Config da URL (ex: ecfg_xxxxxxxx)
  const configId = edgeConfigUrl.split('/').pop()?.split('?')[0];

  // OPERAÇÃO DE LEITURA (GET)
  if (req.method === 'GET') {
    try {
      // Busca direta do item 'slots' na Edge Config
      const readUrl = `${edgeConfigUrl.split('?')[0]}/item/slots?${edgeConfigUrl.split('?')[1]}`;
      const response = await fetch(readUrl);
      const data = await response.json();
      
      return new Response(JSON.stringify(data || {}), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0' // Garante dados frescos
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Erro ao ler dados' }), { status: 500 });
    }
  }

  // OPERAÇÃO DE ESCRITA (POST)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const token = process.env.VERCEL_ACCESS_TOKEN;

      if (!token) {
        return new Response(JSON.stringify({ error: 'Token de acesso Vercel não configurado.' }), { status: 500 });
      }

      // Chamada à API REST da Vercel para atualizar o item
      const updateRes = await fetch(
        `https://api.vercel.com/v1/edge-config/${configId}/items`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              {
                operation: 'upsert',
                key: 'slots',
                value: body,
              },
            ],
          }),
        }
      );

      if (updateRes.ok) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      } else {
        const errorData = await updateRes.json();
        return new Response(JSON.stringify(errorData), { status: updateRes.status });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Erro ao processar requisição' }), { status: 500 });
    }
  }

  return new Response('Método não permitido', { status: 405 });
}
