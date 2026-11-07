// Recuperação de vendas: recebe o webhook da Kiwify e avisa o Kaic no celular (ntfy)
// com a mensagem de WhatsApp pronta para o cliente, em um toque.
// Variáveis na Vercel: KIWIFY_TOKEN (token do webhook) e NTFY_TOPIC (tópico do app ntfy). Nunca imprime nenhuma delas.
const crypto = require('crypto');

const CHECKOUT = 'https://pay.kiwify.com.br/DPqtnSJ';

function corpoCru(req) {
  return new Promise((ok, erro) => {
    const partes = [];
    req.on('data', (c) => partes.push(c));
    req.on('end', () => ok(Buffer.concat(partes)));
    req.on('error', erro);
  });
}

// procura um campo em qualquer nível do JSON (a Kiwify usa formatos diferentes no carrinho abandonado)
function achar(obj, nomes, prof = 0) {
  if (!obj || typeof obj !== 'object' || prof > 4) return '';
  for (const [k, v] of Object.entries(obj)) {
    if (nomes.includes(k.toLowerCase()) && v && typeof v !== 'object') return String(v);
  }
  for (const v of Object.values(obj)) {
    const r = achar(v, nomes, prof + 1);
    if (r) return r;
  }
  return '';
}

function telefone(t) {
  let d = (t || '').replace(/\D/g, '');
  if (d.length === 10 || d.length === 11) d = '55' + d;
  return d.length >= 12 ? d : '';
}

function primeiroNome(n) {
  const p = (n || '').trim().split(/\s+/)[0] || '';
  return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '';
}

function mensagem(tipo, nome, link) {
  const oi = nome ? `Oi, ${nome}!` : 'Oi!';
  const msgs = {
    pix_created: `${oi} Aqui é o Kaic, do @ocorredobiel 👋 Vi que você gerou o Pix do Animador de Bolso e ficou faltando só pagar. O acesso chega na hora depois do pagamento. Ficou alguma dúvida? Se o código expirou, é só gerar de novo aqui: ${link}`,
    billet_created: `${oi} Aqui é o Kaic, do @ocorredobiel 👋 Vi que você gerou o boleto do Animador de Bolso. Se preferir começar hoje mesmo, no Pix o acesso chega na hora: ${link}`,
    order_rejected: `${oi} Aqui é o Kaic, do @ocorredobiel 👋 Seu pagamento do Animador de Bolso não passou no cartão. Isso acontece muito por limite ou pela segurança do banco. Quer tentar pelo Pix? O acesso chega na hora: ${link}`,
    carrinho: `${oi} Aqui é o Kaic, do @ocorredobiel 👋 Vi que você começou a se inscrever no Animador de Bolso e não terminou. Ficou alguma dúvida que eu possa te ajudar? O link é esse: ${link}`,
  };
  return msgs[tipo] || msgs.carrinho;
}

async function avisar(topico, titulo, texto, clique, tags) {
  const corpo = {topic: topico, title: titulo, message: texto, tags: [tags], priority: 4};
  if (clique) {
    corpo.click = clique;
    corpo.actions = [{action: 'view', label: 'Enviar no WhatsApp', url: clique}];
  }
  await fetch('https://ntfy.sh/', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(corpo)});
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('ok');
  const cru = await corpoCru(req);
  const token = process.env.KIWIFY_TOKEN || '';
  const assinatura = String((req.query && req.query.signature) || '');
  if (token) {
    const esperado = crypto.createHmac('sha1', token).update(cru).digest('hex');
    const a = Buffer.from(esperado), b = Buffer.from(assinatura);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).send('assinatura inválida');
  }
  let d;
  try { d = JSON.parse(cru.toString('utf8') || '{}'); } catch (e) { return res.status(400).send('json inválido'); }

  const tipo = d.webhook_event_type || (d.order_status ? '' : 'carrinho');
  const nomeCompleto = achar(d, ['full_name', 'name', 'nome']);
  const nome = primeiroNome(nomeCompleto);
  const fone = telefone(achar(d, ['mobile', 'phone', 'telefone', 'cellphone']));
  const produto = achar(d, ['product_name']) || 'Animador de Bolso';
  const link = achar(d, ['checkout_link', 'checkout_url']) || CHECKOUT;
  const topico = process.env.NTFY_TOPIC;
  if (!topico) return res.status(200).send('sem NTFY_TOPIC');

  try {
    if (tipo === 'order_approved') {
      const valor = achar(d, ['charge_amount', 'product_base_price']);
      const reais = valor && /^\d+$/.test(valor) ? (Number(valor) / 100).toFixed(2).replace('.', ',') : valor;
      await avisar(topico, `Venda aprovada: ${produto}`, `${nomeCompleto || 'Cliente'}${reais ? ' · R$ ' + reais : ''}`, '', 'moneybag');
    } else if (['pix_created', 'billet_created', 'order_rejected', 'carrinho'].includes(tipo)) {
      const rotulo = {pix_created: 'Pix gerado e não pago', billet_created: 'Boleto gerado', order_rejected: 'Cartão recusado', carrinho: 'Carrinho abandonado'}[tipo];
      const wa = fone ? `https://wa.me/${fone}?text=${encodeURIComponent(mensagem(tipo, nome, link))}` : '';
      const quando = tipo === 'pix_created' ? 'Espere uns 15 min; se não pagar, toque pra mandar.' : 'Toque pra mandar a mensagem pronta.';
      await avisar(topico, `${rotulo}: ${nomeCompleto || 'cliente'}`, fone ? `${produto}. ${quando}` : `${produto}. Sem telefone no pedido.`, wa, 'bell');
    }
  } catch (e) {
    return res.status(200).send('aviso falhou');
  }
  return res.status(200).send('ok');
}

module.exports = handler;
module.exports.config = {api: {bodyParser: false}};
