/**
 * DGSCI / CBMPA - Catálogo Técnico Oficial de Ocupações e Divisões (Instrução Técnica do CBMPA)
 * Mapeamento completo dos Grupos A até N, suas divisões, descrições e exemplos oficiais.
 */

const CBMPA_DIVISIONS_CATALOG = {
  // GRUPO A: RESIDENCIAL
  "A-1": {
    grupo: "A",
    grupoNome: "Residencial",
    divisao: "A-1",
    tab: "A1",
    descricao: "Habitação unifamiliar",
    exemplos: "Casas térreas ou assobradadas (isoladas e não isoladas) e condomínios horizontais.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "A-2": {
    grupo: "A",
    grupoNome: "Residencial",
    divisao: "A-2",
    tab: "A2",
    descricao: "Habitação multifamiliar",
    exemplos: "Edifícios de apartamento em geral.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "A-3": {
    grupo: "A",
    grupoNome: "Residencial",
    divisao: "A-3",
    tab: "A3",
    descricao: "Habitação coletiva",
    exemplos: "Pensionatos, internatos, alojamentos, mosteiros, conventos. Capacidade máxima de 16 leitos.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },

  // GRUPO B: SERVIÇO DE HOSPEDAGEM
  "B-1": {
    grupo: "B",
    grupoNome: "Serviço de Hospedagem",
    divisao: "B-1",
    tab: "B1",
    descricao: "Hotel e assemelhado",
    exemplos: "Hotéis, motéis, pensões, hospedarias, pousadas, albergues, casas de cômodos e divisão A3 com mais de 16 leitos.",
    cargaPadrao: 500,
    riscoPadrao: "MÉDIO"
  },
  "B-2": {
    grupo: "B",
    grupoNome: "Serviço de Hospedagem",
    divisao: "B-2",
    tab: "B2",
    descricao: "Hotel residencial",
    exemplos: "Hotéis e assemelhados com cozinha própria nos apartamentos (incluem-se apart-hotéis, hotéis residenciais).",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },

  // GRUPO C: COMERCIAL
  "C-1": {
    grupo: "C",
    grupoNome: "Comercial",
    divisao: "C-1",
    tab: "C1",
    descricao: "Comércio com baixa carga de incêndio",
    exemplos: "Armarinhos, artigos de metal, louças, artigos hospitalares e outros com carga até 300 MJ/m².",
    cargaPadrao: 200,
    riscoPadrao: "BAIXO"
  },
  "C-2": {
    grupo: "C",
    grupoNome: "Comercial",
    divisao: "C-2",
    tab: "C2",
    descricao: "Comércio com média e alta carga de incêndio",
    exemplos: "Edifícios de lojas de departamentos, magazines, armarinhos, galerias comerciais, supermercados em geral, mercados e outros.",
    cargaPadrao: 800,
    riscoPadrao: "MÉDIO"
  },
  "C-3": {
    grupo: "C",
    grupoNome: "Comercial",
    divisao: "C-3",
    tab: "C3",
    descricao: "Centro de compras",
    exemplos: "Centro de compras em geral (shopping centers).",
    cargaPadrao: 600,
    riscoPadrao: "MÉDIO"
  },

  // GRUPO D: SERVIÇO PROFISSIONAL
  "D-1": {
    grupo: "D",
    grupoNome: "Serviço profissional",
    divisao: "D-1",
    tab: "D1",
    descricao: "Local para prestação de serviço profissional ou condução de negócios",
    exemplos: "Escritórios administrativos ou técnicos, instituições financeiras (que não estejam incluídas em D-2), repartições públicas, cabeleireiros, centros profissionais.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "D-2": {
    grupo: "D",
    grupoNome: "Serviço profissional",
    divisao: "D-2",
    tab: "D2",
    descricao: "Agência bancária",
    exemplos: "Agências bancárias e assemelhadas.",
    cargaPadrao: 500,
    riscoPadrao: "MÉDIO"
  },
  "D-3": {
    grupo: "D",
    grupoNome: "Serviço profissional",
    divisao: "D-3",
    tab: "D3",
    descricao: "Serviço de reparação (exceto os classificados em G-4)",
    exemplos: "Lavanderias, assistência técnica, reparação e manutenção de aparelhos eletrodomésticos, chaveiros, pintura de letreiros.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "D-4": {
    grupo: "D",
    grupoNome: "Serviço profissional",
    divisao: "D-4",
    tab: "D4",
    descricao: "Laboratório",
    exemplos: "Laboratórios de análises clínicas sem internação, laboratórios químicos, fotográficos e assemelhados.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },

  // GRUPO E: EDUCACIONAL E CULTURA FÍSICA
  "E-1": {
    grupo: "E",
    grupoNome: "Educacional e cultura física",
    divisao: "E-1",
    tab: "E1",
    descricao: "Escola em geral",
    exemplos: "Escolas de primeiro, segundo e terceiro graus, cursos supletivos e pré-universitários e assemelhados.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "E-2": {
    grupo: "E",
    grupoNome: "Educacional e cultura física",
    divisao: "E-2",
    tab: "E2",
    descricao: "Escola especial",
    exemplos: "Escolas de artes e artesanato, de línguas, de cultura geral, de cultura estrangeira, escolas religiosas e assemelhados.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "E-3": {
    grupo: "E",
    grupoNome: "Educacional e cultura física",
    divisao: "E-3",
    tab: "E3",
    descricao: "Espaço para cultura física",
    exemplos: "Locais de ensino e/ou práticas de artes marciais, natação, ginástica (artística, dança, musculação e outros) esportes coletivos, sauna, casas de fisioterapia. Sem arquibancadas.",
    cargaPadrao: 200,
    riscoPadrao: "BAIXO"
  },
  "E-4": {
    grupo: "E",
    grupoNome: "Educacional e cultura física",
    divisao: "E-4",
    tab: "E4",
    descricao: "Centro de treinamento profissional",
    exemplos: "Escolas profissionais em geral.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "E-5": {
    grupo: "E",
    grupoNome: "Educacional e cultura física",
    divisao: "E-5",
    tab: "E5",
    descricao: "Pré-escola",
    exemplos: "Creches, escolas maternais, jardins-de-infância.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "E-6": {
    grupo: "E",
    grupoNome: "Educacional e cultura física",
    divisao: "E-6",
    tab: "E6",
    descricao: "Escola para portadores de deficiências",
    exemplos: "Escolas para excepcionais, deficientes visuais e auditivos e assemelhados.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },

  // GRUPO F: LOCAL DE REUNIÃO DE PÚBLICO
  "F-1": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-1",
    tab: "F1",
    descricao: "Local onde há objeto de valor inestimável",
    exemplos: "Museus, centro de documentos históricos, bibliotecas e assemelhados.",
    cargaPadrao: 500,
    riscoPadrao: "MÉDIO"
  },
  "F-2": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-2",
    tab: "F2",
    descricao: "Local religioso e velório",
    exemplos: "Igrejas, capelas, sinagogas, mesquitas, templos, cemitérios, crematórios, necrotérios, salas de funerais.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "F-3": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-3",
    tab: "F3",
    descricao: "Centro esportivo e de exibição",
    exemplos: "Arenas em geral, estádios, ginásios, piscinas, rodeios, autódromos, sambódromos, pista de patinação. Todos com arquibancadas.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "F-4": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-4",
    tab: "F4",
    descricao: "Estação e terminal de passageiro",
    exemplos: "Estações rodoferroviárias e lacustres, portos, metrô, aeroportos, heliporto, estações de transbordo.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "F-5": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-5",
    tab: "F5",
    descricao: "Artecênica e auditório",
    exemplos: "Teatros em geral, cinemas, óperas, auditórios de estúdios de rádio e televisão, auditórios em geral.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "F-6": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-6",
    tab: "F6",
    descricao: "Casas noturnas e clubes sociais",
    exemplos: "Boates, restaurantes dançantes, danceterias, casa de show, salões de festa (buffet), clubes sociais, bilhares, tiro ao alvo, boliche.",
    cargaPadrao: 600,
    riscoPadrao: "MÉDIO"
  },
  "F-7": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-7",
    tab: "F7",
    descricao: "Instalação temporária",
    exemplos: "Circos, parques de diversão, feiras de exposição, feiras agropecuárias, rodeios, shows artísticos.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "F-8": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-8",
    tab: "F8",
    descricao: "Local para refeição",
    exemplos: "Restaurantes, lanchonetes, bares, cafés, refeitórios, cantinas e assemelhados.",
    cargaPadrao: 500,
    riscoPadrao: "MÉDIO"
  },
  "F-9": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-9",
    tab: "F9",
    descricao: "Recreação pública",
    exemplos: "Jardim zoológico, parques recreativos e assemelhados.",
    cargaPadrao: 200,
    riscoPadrao: "BAIXO"
  },
  "F-10": {
    grupo: "F",
    grupoNome: "Local de Reunião de Público",
    divisao: "F-10",
    tab: "F10",
    descricao: "Exposição de objetos e animais",
    exemplos: "Centros de exposições, salões e salas para exposição de objetos ou animais. Edificações permanentes.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },

  // GRUPO G: SERVIÇOS AUTOMOTIVOS E ASSEMELHADOS
  "G-1": {
    grupo: "G",
    grupoNome: "Serviços automotivos",
    divisao: "G-1",
    tab: "G1",
    descricao: "Garagem sem acesso de público e sem abastecimento",
    exemplos: "Garagens automáticas, garagens com manobristas.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "G-2": {
    grupo: "G",
    grupoNome: "Serviços automotivos",
    divisao: "G-2",
    tab: "G2",
    descricao: "Garagem com acesso de público e sem abastecimento",
    exemplos: "Garagens coletivas sem automação em geral sem abastecimento (exceto veículos de carga e coletivos).",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "G-3": {
    grupo: "G",
    grupoNome: "Serviços automotivos",
    divisao: "G-3",
    tab: "G3",
    descricao: "Local dotado de abastecimento de combustível",
    exemplos: "Postos de abastecimento e serviço, garagens (exceto veículos de carga e coletivos).",
    cargaPadrao: 800,
    riscoPadrao: "MÉDIO"
  },
  "G-4": {
    grupo: "G",
    grupoNome: "Serviços automotivos",
    divisao: "G-4",
    tab: "G4",
    descricao: "Serviços de conservação, manutenção e reparos",
    exemplos: "Oficinas de conserto de veículos, borracharia (sem recauchutagem), oficinas de veículos de carga e coletivos, retificadoras.",
    cargaPadrao: 700,
    riscoPadrao: "MÉDIO"
  },
  "G-5": {
    grupo: "G",
    grupoNome: "Serviços automotivos",
    divisao: "G-5",
    tab: "G5",
    descricao: "Hangar",
    exemplos: "Abrigos para aeronaves com ou sem abastecimento.",
    cargaPadrao: 600,
    riscoPadrao: "MÉDIO"
  },
  "G-6": {
    grupo: "G",
    grupoNome: "Serviços automotivos",
    divisao: "G-6",
    tab: "G6",
    descricao: "Serviços automotivos especiais",
    exemplos: "Pátios de veículos, oficinas de grande porte.",
    cargaPadrao: 600,
    riscoPadrao: "MÉDIO"
  },

  // GRUPO H: SERVIÇO DE SAÚDE E INSTITUCIONAL
  "H-1": {
    grupo: "H",
    grupoNome: "Serviço de saúde e institucional",
    divisao: "H-1",
    tab: "H1",
    descricao: "Hospital veterinário",
    exemplos: "Hospitais, clínicas veterinárias (inclui-se alojamento com ou sem adestramento).",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "H-2": {
    grupo: "H",
    grupoNome: "Serviço de saúde e institucional",
    divisao: "H-2",
    tab: "H2",
    descricao: "Locais onde as pessoas requerem cuidados especiais por limitações físicas ou mentais",
    exemplos: "Asilos, orfanatos, abrigos geriátricos, hospitais psiquiátricos, reformatórios, tratamento de dependentes de drogas/álcool. Todos sem celas.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "H-3": {
    grupo: "H",
    grupoNome: "Serviço de saúde e institucional",
    divisao: "H-3",
    tab: "H3",
    descricao: "Hospitais e assemelhado",
    exemplos: "Hospitais, casa de saúde, prontos-socorros, clínicas com internação, ambulatórios e postos de atendimento de urgência.",
    cargaPadrao: 500,
    riscoPadrao: "MÉDIO"
  },
  "H-4": {
    grupo: "H",
    grupoNome: "Serviço de saúde e institucional",
    divisao: "H-4",
    tab: "H4",
    descricao: "Repartição pública, edificações das forças armadas e policiais",
    exemplos: "Edificações do Executivo, Legislativo e Judiciário, tribunais, cartórios, quartéis, centrais de polícia, delegacias, postos policiais.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "H-5": {
    grupo: "H",
    grupoNome: "Serviço de saúde e institucional",
    divisao: "H-5",
    tab: "H5",
    descricao: "Local onde a liberdade das pessoas sofre restrições",
    exemplos: "Hospitais psiquiátricos, manicômios, prisões em geral (casa de detenção, penitenciárias, presídios). Todos com celas.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "H-6": {
    grupo: "H",
    grupoNome: "Serviço de saúde e institucional",
    divisao: "H-6",
    tab: "H6",
    descricao: "Clínicas médicas, odontológicas e veterinárias",
    exemplos: "Clínicas médicas em geral, unidades de hemodiálise, ambulatórios e assemelhados. Todos sem internação.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },

  // GRUPO I: INDÚSTRIA
  "I-1": {
    grupo: "I",
    grupoNome: "Indústria",
    divisao: "I-1",
    tab: "I1",
    descricao: "Indústria com carga de incêndio até 300 MJ/m²",
    exemplos: "Atividades industriais fabricantes de aço, artigos de metal, gesso, esculturas de pedra, ferramentas, joias, relógios, sabão, serralheria, suco de frutas, louças, vidro.",
    cargaPadrao: 200,
    riscoPadrao: "BAIXO"
  },
  "I-2": {
    grupo: "I",
    grupoNome: "Indústria",
    divisao: "I-2",
    tab: "I2",
    descricao: "Indústria com carga de incêndio acima de 300 e até 1.200 MJ/m²",
    exemplos: "Atividades industriais fabricantes de bebidas destiladas, instrumentos musicais, móveis, alimentos, marcenarias, fábricas de caixas.",
    cargaPadrao: 800,
    riscoPadrao: "MÉDIO"
  },
  "I-3": {
    grupo: "I",
    grupoNome: "Indústria",
    divisao: "I-3",
    tab: "I3",
    descricao: "Indústria com carga de incêndio superior a 1.200 MJ/m²",
    exemplos: "Atividades industriais fabricantes de inflamáveis, materiais oxidantes, ceras, espuma sintética, grãos, tintas, borracha, processamento de lixo.",
    cargaPadrao: 1500,
    riscoPadrao: "ALTO"
  },

  // GRUPO J: DEPÓSITO
  "J-1": {
    grupo: "J",
    grupoNome: "Depósito",
    divisao: "J-1",
    tab: "J1",
    descricao: "Depósitos de material incombustível",
    exemplos: "Edificações sem processo industrial que armazenam tijolos, pedras, areias, cimentos, metais e outros materiais incombustíveis. Todos sem embalagem.",
    cargaPadrao: 100,
    riscoPadrao: "BAIXO"
  },
  "J-2": {
    grupo: "J",
    grupoNome: "Depósito",
    divisao: "J-2",
    tab: "J2",
    descricao: "Todo tipo de Depósito com carga de incêndio até 300 MJ/m²",
    exemplos: "Depósitos com carga de incêndio até 300 MJ/m².",
    cargaPadrao: 250,
    riscoPadrao: "BAIXO"
  },
  "J-3": {
    grupo: "J",
    grupoNome: "Depósito",
    divisao: "J-3",
    tab: "J3",
    descricao: "Todo tipo de Depósito com carga de incêndio acima de 300 até 1.200 MJ/m²",
    exemplos: "Depósitos com carga de incêndio acima de 300 até 1.200 MJ/m².",
    cargaPadrao: 800,
    riscoPadrao: "MÉDIO"
  },
  "J-4": {
    grupo: "J",
    grupoNome: "Depósito",
    divisao: "J-4",
    tab: "J4",
    descricao: "Todo tipo de Depósito onde a carga de incêndio ultrapassa a 1.200 MJ/m²",
    exemplos: "Depósitos onde a carga de incêndio ultrapassa a 1.200 MJ/m².",
    cargaPadrao: 1600,
    riscoPadrao: "ALTO"
  },

  // GRUPO L: EXPLOSIVOS
  "L-1": {
    grupo: "L",
    grupoNome: "Explosivos",
    divisao: "L-1",
    tab: "L1",
    descricao: "Comércio de explosivos",
    exemplos: "Comércio em geral de fogos de artifício e assemelhados.",
    cargaPadrao: 1500,
    riscoPadrao: "ALTO"
  },
  "L-2": {
    grupo: "L",
    grupoNome: "Explosivos",
    divisao: "L-2",
    tab: "L2",
    descricao: "Indústria de explosivos",
    exemplos: "Indústria de material explosivo.",
    cargaPadrao: 2000,
    riscoPadrao: "ALTO"
  },
  "L-3": {
    grupo: "L",
    grupoNome: "Explosivos",
    divisao: "L-3",
    tab: "L3",
    descricao: "Depósito de explosivos",
    exemplos: "Depósito de material explosivo.",
    cargaPadrao: 2000,
    riscoPadrao: "ALTO"
  },

  // GRUPO M: ESPECIAL
  "M-1": {
    grupo: "M",
    grupoNome: "Especial",
    divisao: "M-1",
    tab: "M1",
    descricao: "Túnel",
    exemplos: "Túnel rodoferroviário e lacustre, destinados a transporte de passageiros ou cargas diversas.",
    cargaPadrao: 400,
    riscoPadrao: "MÉDIO"
  },
  "M-2": {
    grupo: "M",
    grupoNome: "Especial",
    divisao: "M-2",
    tab: "M2",
    descricao: "Tanques ou parque de tanques",
    exemplos: "Edificação destinada a produção, manipulação, armazenamento e distribuição de líquidos ou gases combustíveis e inflamáveis.",
    cargaPadrao: 1800,
    riscoPadrao: "ALTO"
  },
  "M-3": {
    grupo: "M",
    grupoNome: "Especial",
    divisao: "M-3",
    tab: "M3",
    descricao: "Central de comunicação e energia",
    exemplos: "Central telefônica, centros de comunicação, centrais de transmissão, de distribuição de energia e central de processamento de dados.",
    cargaPadrao: 600,
    riscoPadrao: "MÉDIO"
  },
  "M-4": {
    grupo: "M",
    grupoNome: "Especial",
    divisao: "M-4",
    tab: "M4",
    descricao: "Canteiro de obras",
    exemplos: "Canteiro de obras e assemelhados.",
    cargaPadrao: 300,
    riscoPadrao: "BAIXO"
  },
  "M-5": {
    grupo: "M",
    grupoNome: "Especial",
    divisao: "M-5",
    tab: "M5",
    descricao: "Silos",
    exemplos: "Armazéns de grãos e assemelhados.",
    cargaPadrao: 800,
    riscoPadrao: "MÉDIO"
  },
  "M-6": {
    grupo: "M",
    grupoNome: "Especial",
    divisao: "M-6",
    tab: "M6",
    descricao: "Energia",
    exemplos: "Geração, transmissão e distribuição de energia e assemelhados.",
    cargaPadrao: 600,
    riscoPadrao: "MÉDIO"
  },
  "M-7": {
    grupo: "M",
    grupoNome: "Especial",
    divisao: "M-7",
    tab: "M7",
    descricao: "Pátio de Containers",
    exemplos: "Área aberta destinada a armazenamento de containers.",
    cargaPadrao: 700,
    riscoPadrao: "MÉDIO"
  },

  // GRUPO N: SERVIÇOS DE TRANSPORTE
  "N-1": {
    grupo: "N",
    grupoNome: "Transportes",
    divisao: "N-1",
    tab: "N1",
    descricao: "Transportes e armazéns gerais",
    exemplos: "Logística, armazéns e transportes de cargas em geral.",
    cargaPadrao: 600,
    riscoPadrao: "MÉDIO"
  }
};

/**
 * Função utilitária para buscar ou normalizar a divisão a partir da aba (ex: 'A1' -> 'A-1')
 */
function getCBMPADivisionInfo(tabOrDivision) {
  if (!tabOrDivision) return null;
  const clean = tabOrDivision.toUpperCase().replace(/\s+/g, '').replace('_', '-');
  
  // Busca direta por 'A-1'
  if (CBMPA_DIVISIONS_CATALOG[clean]) {
    return CBMPA_DIVISIONS_CATALOG[clean];
  }

  // Busca por 'A1' -> 'A-1'
  const withHyphen = clean.replace(/([A-Z])(\d+)/, '$1-$2');
  if (CBMPA_DIVISIONS_CATALOG[withHyphen]) {
    return CBMPA_DIVISIONS_CATALOG[withHyphen];
  }

  // Busca por tab
  for (const key in CBMPA_DIVISIONS_CATALOG) {
    if (CBMPA_DIVISIONS_CATALOG[key].tab === clean) {
      return CBMPA_DIVISIONS_CATALOG[key];
    }
  }

  return null;
}

if (typeof window !== 'undefined') {
  window.CBMPA_DIVISIONS_CATALOG = CBMPA_DIVISIONS_CATALOG;
  window.getCBMPADivisionInfo = getCBMPADivisionInfo;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CBMPA_DIVISIONS_CATALOG, getCBMPADivisionInfo };
}
