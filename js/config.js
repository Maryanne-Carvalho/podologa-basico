/* ==========================================================================
   CONFIGURAÇÃO DO SITE
   Tudo o que muda de uma cliente para outra fica aqui: contato, WhatsApp,
   imagens e textos curtos. Os modelos Básico, Intermediário e Avançado vão
   reaproveitar este mesmo formato.
   ========================================================================== */

window.PS = window.PS || {};

window.PS.config = {
  brand: {
    name: "Podologia Studio",
    professional: "Dra. Marina Oliveira",
    city: "São Paulo – SP"
  },

  /* ---- WhatsApp ----
     demoMode: true  → os botões NÃO abrem conversa; mostram um aviso.
     demoMode: false → os botões abrem https://wa.me/<numero>?text=<mensagem>
     numero: somente dígitos, com DDI e DDD (ex.: 5511912345678). */
  whatsapp: {
    demoMode: true,
    number: "5511900000000",
    defaultMessage: "Olá! Vi o site do Podologia Studio e gostaria de agendar uma avaliação.",
    serviceMessage: "Olá! Vi o site do Podologia Studio e gostaria de agendar: {servico}."
  },

  /* ---- Imagens ----
     Endereços externos (Unsplash, uso gratuito). Se alguma não carregar,
     o site mostra automaticamente um quadro neutro nas cores da paleta.
     Para usar fotos próprias, troque o "src" por um caminho local,
     ex.: "assets/img/hero.jpg". */
  images: {
    hero: {
      src: "https://images.unsplash.com/photo-1675159364615-38e1f6b62282?auto=format&fit=crop&w=1000&q=75",
      alt: "Mãos de profissional cuidando de um pé apoiado sobre toalha branca"
    },
    about: {
      src: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=75",
      alt: "Retrato ilustrativo de profissional da saúde sorrindo, de braços cruzados"
    },
    care: {
      src: "https://images.unsplash.com/photo-1712638932314-e2b185ca0930?auto=format&fit=crop&w=1100&q=75",
      alt: "Atendimento tranquilo com toalhas brancas, transmitindo cuidado e higiene"
    }
  },

  /* Tempo máximo (ms) para uma imagem carregar antes de mostrar o quadro neutro */
  imageTimeout: 9000,

  /* Paleta usada na primeira visita e no botão "Configuração original" */
  defaultPalette: "salvia-marfim",

  /* Chave usada para salvar as escolhas no navegador */
  storageKey: "podologia-studio:theme"
};
