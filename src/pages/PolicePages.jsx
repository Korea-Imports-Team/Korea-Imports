import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Shield, HelpCircle } from 'lucide-react';
import styles from './PoliciesPage.module.css';

// ─── Dados ────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: 'Qual o prazo de entrega?',
    a: 'Os prazos variam de acordo com o método de envio escolhido: Econômica (10–15 dias úteis), Padrão (5–7 dias úteis) e Expressa (2–3 dias úteis). O prazo começa a contar após a confirmação do pagamento.',
  },
  {
    q: 'Como rastrear meu pedido?',
    a: 'Após o envio, você receberá um código de rastreamento por e-mail. Você também pode acompanhar o status do pedido diretamente em "Meus Pedidos" na sua conta. O código pode ser inserido no site dos Correios ou no app da transportadora.',
  },
  {
    q: 'Posso trocar o tamanho?',
    a: 'Sim! Você tem até 7 dias corridos após o recebimento para solicitar a troca. O produto deve estar sem uso, com etiquetas originais e na embalagem original. Veja nossa Política de Troca completa nesta página.',
  },
  {
    q: 'Como funciona o frete grátis?',
    a: 'Oferecemos frete grátis para compras acima de R$ 200 no método Econômico. Para outros métodos de envio, o frete é calculado de acordo com o CEP de destino.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Aceitamos cartão de crédito (parcelado em até 6x sem juros), cartão de débito, Pix (confirmação em até 5 minutos) e boleto bancário (prazo de até 3 dias úteis para compensação).',
  },
  {
    q: 'O desconto do Pix é automático?',
    a: 'Sim! Ao selecionar Pix como forma de pagamento, o desconto de 5% é aplicado automaticamente no valor total do pedido.',
  },
  {
    q: 'Como usar um cupom de desconto?',
    a: 'No momento do checkout, há um campo "Cupom de Desconto" onde você digita o código e clica em Aplicar. O desconto é aplicado imediatamente no valor total.',
  },
  {
    q: 'Os produtos são originais?',
    a: 'Todos os produtos da Korea Imports são selecionados com rigoroso controle de qualidade. Trabalhamos com fornecedores certificados para garantir a autenticidade e qualidade de cada peça.',
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Utilizamos criptografia SSL em todas as transações e não compartilhamos seus dados pessoais com terceiros sem seu consentimento. Consulte nossa Política de Privacidade para mais detalhes.',
  },
  {
    q: 'Como cancelar um pedido?',
    a: 'Pedidos podem ser cancelados antes do envio. Após o envio, o cancelamento não é possível, mas você pode solicitar a devolução após o recebimento. Entre em contato pelo WhatsApp para mais informações.',
  },
];

const TROCA_ITEMS = [
  {
    title: 'Prazo para troca ou devolução',
    content: 'Você tem até 7 dias corridos após o recebimento do produto para solicitar troca ou devolução, conforme previsto no Art. 49 do Código de Defesa do Consumidor (CDC).',
  },
  {
    title: 'Condições para troca',
    content: 'O produto deve estar em perfeito estado: sem uso, sem lavagem, com todas as etiquetas originais fixadas e na embalagem original. Produtos com sinais de uso, perfume, maquiagem ou danos causados pelo cliente não serão aceitos para troca.',
  },
  {
    title: 'Como solicitar a troca',
    content: 'Entre em contato pelo nosso WhatsApp ou e-mail informando o número do pedido, o motivo da troca e o tamanho ou produto desejado. Nossa equipe retornará em até 24 horas úteis com as instruções de envio.',
  },
  {
    title: 'Custos de frete para troca',
    content: 'Se a troca for motivada por defeito de fabricação ou erro nosso, o frete de retorno é por nossa conta. Para trocas por preferência (tamanho, cor), o frete de retorno é de responsabilidade do cliente.',
  },
  {
    title: 'Reembolso',
    content: 'Após receber e conferir o produto, o reembolso será processado em até 5 dias úteis. Para pagamentos via cartão de crédito, o estorno aparece na fatura em até 2 faturas subsequentes. Para Pix e boleto, o reembolso é feito via Pix.',
  },
  {
    title: 'Produtos com defeito',
    content: 'Em caso de defeito de fabricação, você tem até 90 dias para reclamar (Art. 26 do CDC). Entre em contato imediatamente com fotos do defeito. Faremos a troca ou reembolso integral sem custo algum.',
  },
];

const PRIVACY_ITEMS = [
  {
    title: 'Quais dados coletamos',
    content: 'Coletamos: nome completo, e-mail, telefone, CPF, endereço de entrega e dados de pagamento (processados com segurança por nossos parceiros). Também coletamos dados de navegação como páginas visitadas e produtos visualizados para melhorar sua experiência.',
  },
  {
    title: 'Como usamos seus dados',
    content: 'Seus dados são usados exclusivamente para: processar e entregar seus pedidos, enviar confirmações e atualizações de pedido, melhorar nossos produtos e serviços, e enviar comunicações de marketing (apenas com seu consentimento).',
  },
  {
    title: 'Compartilhamento de dados',
    content: 'Compartilhamos seus dados apenas com parceiros essenciais para a operação: transportadoras (para entrega), processadores de pagamento (para transações seguras) e, se exigido, com autoridades competentes. Nunca vendemos seus dados.',
  },
  {
    title: 'Segurança dos dados',
    content: 'Utilizamos protocolo SSL/TLS para criptografar todas as transmissões de dados. Senhas são armazenadas com hash seguro. Realizamos auditorias periódicas de segurança e seguimos as melhores práticas do mercado.',
  },
  {
    title: 'Seus direitos (LGPD)',
    content: 'Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a: acessar seus dados, corrigir informações incorretas, solicitar exclusão dos seus dados, revogar consentimento de marketing e receber seus dados em formato portável.',
  },
  {
    title: 'Cookies',
    content: 'Usamos cookies para manter sua sessão ativa, lembrar itens no carrinho e analisar o tráfego do site. Você pode desativar cookies no seu navegador, mas algumas funcionalidades podem ser afetadas.',
  },
  {
    title: 'Retenção de dados',
    content: 'Mantemos seus dados pelo período necessário para cumprir nossas obrigações legais e contratuais. Dados de pedidos são mantidos por 5 anos conforme legislação fiscal brasileira. Você pode solicitar a exclusão de dados não obrigatórios a qualquer momento.',
  },
];

// ─── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ title, content, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.accordionItem} ${open ? styles.accordionOpen : ''}`}>
      <button className={styles.accordionBtn} onClick={() => setOpen((o) => !o)}>
        <span className={styles.accordionTitle}>{title}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className={styles.accordionContent}>
          <p>{content}</p>
        </div>
      )}
    </div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${styles.faqItem} ${open ? styles.faqOpen : ''}`}>
      <button className={styles.faqBtn} onClick={() => setOpen((o) => !o)}>
        <span className={styles.faqQ}>{item.q}</span>
        <span className={`${styles.faqIcon} ${open ? styles.faqIconOpen : ''}`}>
          <ChevronDown size={18} />
        </span>
      </button>
      {open && (
        <div className={styles.faqAnswer}>
          <p>{item.a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState('faq');

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove #
    
    if (hash === 'faq') {
      setActiveTab('faq');
    } else if (hash === 'trocas-e-devolucoes') {
      setActiveTab('troca');
    } else if (hash === 'privacidade') {
      setActiveTab('privacidade');
    }
  }, []);

  const TABS = [
    { id: 'faq',       label: 'Perguntas Frequentes', icon: HelpCircle },
    { id: 'troca',     label: 'Trocas e Devoluções',  icon: RefreshCw  },
    { id: 'privacidade', label: 'Privacidade',         icon: Shield     },
  ];

  return (
    <main className={styles.page}>
      <div className="container">

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Central de Ajuda</h1>
          <p className={styles.subtitle}>
            Encontre respostas rápidas, entenda nossas políticas e saiba como estamos comprometidos com você.
          </p>
        </div>

        {/* Tab nav */}
        <div className={styles.tabNav}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div id="faq" className={styles.section}>
            <div className={styles.sectionHeader}>
              <HelpCircle size={22} className={styles.sectionIcon} />
              <div>
                <h2 className={styles.sectionTitle}>Perguntas Frequentes</h2>
                <p className={styles.sectionSub}>Respostas para as dúvidas mais comuns dos nossos clientes</p>
              </div>
            </div>
            <div className={styles.faqList}>
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem key={i} item={item} index={i} />
              ))}
            </div>

            {/* Contato */}
            <div className={styles.contactCard}>
              <p className={styles.contactTitle}>Não encontrou o que procurava?</p>
              <p className={styles.contactSub}>Nossa equipe está pronta para ajudar você</p>
              <div className={styles.contactBtns}>
                <a
                  href="https://wa.me/5511999999999?text=Olá! Preciso de ajuda com meu pedido."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnWhatsapp}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </a>
                <a href="mailto:contato@koreaimports.com.br" className={styles.btnEmail}>
                  E-mail
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Trocas e Devoluções */}
        {activeTab === 'troca' && (
          <div id="trocas-e-devolucoes" className={styles.section}>
            <div className={styles.sectionHeader}>
              <RefreshCw size={22} className={styles.sectionIcon} />
              <div>
                <h2 className={styles.sectionTitle}>Política de Trocas e Devoluções</h2>
                <p className={styles.sectionSub}>
                  Conforme o Código de Defesa do Consumidor (Lei 8.078/1990)
                </p>
              </div>
            </div>

            <div className={styles.highlightCard}>
              <span className={styles.highlightEmoji}>⏱</span>
              <div>
                <p className={styles.highlightTitle}>7 dias para solicitar troca ou devolução</p>
                <p className={styles.highlightText}>
                  Prazo contado a partir do recebimento do produto, garantido pelo Art. 49 do CDC.
                </p>
              </div>
            </div>

            <div className={styles.accordionList}>
              {TROCA_ITEMS.map((item, i) => (
                <AccordionItem key={i} title={item.title} content={item.content} index={i} />
              ))}
            </div>

            <div className={styles.contactCard}>
              <p className={styles.contactTitle}>Precisa solicitar uma troca?</p>
              <p className={styles.contactSub}>Fale conosco pelo WhatsApp ou e-mail com o número do seu pedido</p>
              <div className={styles.contactBtns}>
                <a
                  href="https://wa.me/5511999999999?text=Olá! Gostaria de solicitar uma troca."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnWhatsapp}
                >
                  Solicitar troca pelo WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Privacidade */}
        {activeTab === 'privacidade' && (
          <div id="privacidade" className={styles.section}>
            <div className={styles.sectionHeader}>
              <Shield size={22} className={styles.sectionIcon} />
              <div>
                <h2 className={styles.sectionTitle}>Política de Privacidade</h2>
                <p className={styles.sectionSub}>
                  Em conformidade com a LGPD (Lei 13.709/2018) · Última atualização: Janeiro 2026
                </p>
              </div>
            </div>

            <div className={styles.highlightCard} style={{ borderColor: '#bfdbfe', background: '#eff6ff' }}>
              <span className={styles.highlightEmoji}>🔒</span>
              <div>
                <p className={styles.highlightTitle} style={{ color: '#1e40af' }}>Seus dados estão seguros conosco</p>
                <p className={styles.highlightText} style={{ color: '#3b82f6' }}>
                  Utilizamos criptografia SSL e seguimos rigorosamente a LGPD para proteger suas informações.
                </p>
              </div>
            </div>

            <div className={styles.accordionList}>
              {PRIVACY_ITEMS.map((item, i) => (
                <AccordionItem key={i} title={item.title} content={item.content} index={i} />
              ))}
            </div>

            <div className={styles.lgpdCard}>
              <Shield size={20} />
              <div>
                <p className={styles.lgpdTitle}>Exercer seus direitos LGPD</p>
                <p className={styles.lgpdText}>
                  Para acessar, corrigir ou excluir seus dados, envie um e-mail para{' '}
                  <a href="mailto:privacidade@koreaimports.com.br" className={styles.lgpdLink}>
                    privacidade@koreaimports.com.br
                  </a>
                  {' '}com o assunto "Direitos LGPD". Respondemos em até 15 dias úteis.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}