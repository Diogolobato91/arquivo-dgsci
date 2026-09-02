/**
 * DGSCI / CBMPA - Central Data Store
 * Gerenciador de estado, filtros, métricas de conformidade e cruzamento de dados de fiscalização.
 */

class DataStore {
  constructor() {
    this.companies = [];
    this.vistorias = [];
    this.loadedTabs = [];
    this.lastSync = null;

    // Listeners para reatividade
    this.listeners = [];
  }

  setData(data) {
    this.companies = data.companies || [];
    this.vistorias = data.vistorias || [];
    this.loadedTabs = data.loadedTabs || [];
    this.lastSync = data.timestamp || new Date().toISOString();

    // Notifica todos os observadores registrados
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  /**
   * Retorna os KPIs calculados
   */
  getKPIs(groupFilter = 'all') {
    let filteredCompanies = this.companies;
    if (groupFilter && groupFilter !== 'all') {
      filteredCompanies = filteredCompanies.filter(c => c.grupo === groupFilter);
    }

    const total = filteredCompanies.length;
    let regular = 0;
    let vencidos = 0;
    let parados = 0;
    let desativados = 0;

    filteredCompanies.forEach(c => {
      switch (c.normalizedStatus) {
        case 'REGULAR':
          regular++;
          break;
        case 'VENCIDO':
          vencidos++;
          break;
        case 'PARADO':
        case 'SEM_SISGAT':
          parados++;
          break;
        case 'DESATIVADO':
          desativados++;
          break;
        default:
          parados++;
          break;
      }
    });

    const totalVistorias = this.vistorias.length;
    const vistoriasAprovadas = this.vistorias.filter(v => v.normalizedParecer === 'APROVADO').length;
    const vistoriasReprovadas = this.vistorias.filter(v => v.normalizedParecer === 'REPROVADO').length;

    // Contagem de fiscais distintos
    const inspectors = new Set(this.vistorias.map(v => v.vistoriador).filter(Boolean));

    return {
      total,
      regular,
      regularPct: total > 0 ? Math.round((regular / total) * 100) : 0,
      vencidos,
      vencidosPct: total > 0 ? Math.round((vencidos / total) * 100) : 0,
      parados,
      paradosPct: total > 0 ? Math.round((parados / total) * 100) : 0,
      desativados,
      desativadosPct: total > 0 ? Math.round((desativados / total) * 100) : 0,
      totalVistorias,
      vistoriasAprovadas,
      vistoriasReprovadas,
      inspectorsCount: inspectors.size
    };
  }

  /**
   * Agregação para o gráfico de Situação
   */
  getSituationChartData(groupFilter = 'all') {
    const kpis = this.getKPIs(groupFilter);
    return {
      labels: ['Emitidos / Regulares', 'Vencidos / Infração', 'Parados / Pendentes', 'Desativados'],
      data: [kpis.regular, kpis.vencidos, kpis.parados, kpis.desativados],
      colors: ['#10B981', '#EF4444', '#F59E0B', '#64748B']
    };
  }

  /**
   * Agregação de top bairros com mais cadastros
   */
  getTopNeighborhoodsData(limit = 8) {
    const map = {};
    this.companies.forEach(c => {
      const b = c.bairro || 'NÃO INFORMADO';
      map[b] = (map[b] || 0) + 1;
    });

    const sorted = Object.entries(map)
      .filter(([name]) => name !== 'NÃO INFORMADO' && name.length > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return {
      labels: sorted.map(item => item[0]),
      data: sorted.map(item => item[1])
    };
  }

  /**
   * Agregação por Grupo de Ocupação CBMPA (A, B, C, D, E, F, G, H, I, J, L, M, N)
   */
  getGroupAndRiskData() {
    const groupLabels = ['A - Resid.', 'B - Hosped.', 'C - Comércio', 'D - Serviços', 'E - Educac.', 'F - Reunião', 'G - Auto', 'H - Saúde', 'I - Indúst.', 'J - Depós.'];
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    const baixo = groups.map(g => this.companies.filter(c => c.grupo === g && c.risco === 'BAIXO').length);
    const medio = groups.map(g => this.companies.filter(c => c.grupo === g && c.risco === 'MÉDIO').length);
    const alto = groups.map(g => this.companies.filter(c => c.grupo === g && c.risco === 'ALTO').length);

    return {
      labels: groupLabels,
      datasets: [
        { label: 'Risco Baixo', data: baixo, backgroundColor: '#10B981' },
        { label: 'Risco Médio', data: medio, backgroundColor: '#F59E0B' },
        { label: 'Risco Alto', data: alto, backgroundColor: '#EF4444' }
      ]
    };
  }

  /**
   * Agregação de vistorias por militar / vistoriador
   */
  getInspectorsData(limit = 10) {
    const map = {};
    this.vistorias.forEach(v => {
      const name = v.vistoriador || 'NÃO INFORMADO';
      if (name && name !== 'NÃO INFORMADO' && name !== '-') {
        map[name] = (map[name] || 0) + 1;
      }
    });

    const sorted = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return {
      labels: sorted.map(item => item[0]),
      data: sorted.map(item => item[1])
    };
  }

  /**
   * Agregação de Projetos Aprovados vs Não Aprovados
   */
  getProjectApprovalData() {
    let aprovados = 0;
    let naoAprovados = 0;

    this.companies.forEach(c => {
      const p = (c.projetoAprovado || '').toUpperCase();
      if (p.includes('SIM')) aprovados++;
      else naoAprovados++;
    });

    return {
      labels: ['Possui Projeto Aprovado', 'Sem Projeto / Não Aplicável'],
      data: [aprovados, naoAprovados],
      colors: ['#3B82F6', '#64748B']
    };
  }

  /**
   * Agregação por Grau de Risco (calculado via Carga de Incêndio MJ/m² ou classificação técnica)
   */
  getRiskDistributionData() {
    let baixo = 0;
    let medio = 0;
    let alto = 0;

    this.companies.forEach(c => {
      if (c.risco === 'ALTO') alto++;
      else if (c.risco === 'MÉDIO') medio++;
      else baixo++;
    });

    return {
      labels: ['Risco Baixo (≤ 300 MJ/m²)', 'Risco Médio (300,01 a 1200 MJ/m²)', 'Risco Alto (> 1200 MJ/m²)'],
      data: [baixo, medio, alto],
      colors: ['#10B981', '#F59E0B', '#EF4444']
    };
  }

  /**
   * Agregação Oficial dos 6 Setores Operacionais do CBMPA
   */
  getSectorDistributionData() {
    const sectors = [
      { key: 'SETOR I', label: 'Setor I (Amarelo)', color: '#EAB308', count: 0 },
      { key: 'SETOR II', label: 'Setor II (Azul)', color: '#3B82F6', count: 0 },
      { key: 'SETOR III', label: 'Setor III (Branco)', color: '#F8FAFC', count: 0 },
      { key: 'SETOR IV', label: 'Setor IV (Verde)', color: '#22C55E', count: 0 },
      { key: 'SETOR V', label: 'Setor V (Rosa)', color: '#EC4899', count: 0 },
      { key: 'SETOR VI', label: 'Setor VI (Laranja)', color: '#F97316', count: 0 }
    ];

    this.companies.forEach(c => {
      const s = (c.setor || 'SETOR III').toUpperCase();
      const target = sectors.find(sec => sec.key === s) || sectors[2];
      target.count++;
    });

    return {
      labels: sectors.map(s => s.label),
      data: sectors.map(s => s.count),
      colors: sectors.map(s => s.color)
    };
  }

  /**
   * Retorna lista de alertas prioritários de fiscalização
   */
  getPriorityAlerts(filterType = 'all', searchQuery = '') {
    const query = (searchQuery || '').toLowerCase().trim();

    return this.companies.filter(c => {
      const isVencido = c.normalizedStatus === 'VENCIDO' || c.situacao.toUpperCase().includes('VENCID');
      const isParado = c.normalizedStatus === 'PARADO' || c.situacao.toUpperCase().includes('PARADO');
      const isInfracao = c.situacao.toUpperCase().includes('INFRAÇÃO') || c.situacao.toUpperCase().includes('INFRACAO');
      const isSemSisgat = c.normalizedStatus === 'SEM_SISGAT' || c.situacao.toUpperCase().includes('SISGAT');

      // Aplica filtro de categoria
      let matchesType = false;
      if (filterType === 'all') {
        matchesType = isVencido || isParado || isInfracao || isSemSisgat;
      } else if (filterType === 'vencido') {
        matchesType = isVencido;
      } else if (filterType === 'parado') {
        matchesType = isParado;
      } else if (filterType === 'infracao') {
        matchesType = isInfracao;
      } else if (filterType === 'sem-sisgat') {
        matchesType = isSemSisgat;
      }

      if (!matchesType) return false;

      // Aplica busca por texto se fornecido
      if (query) {
        const text = `${c.razao} ${c.cnpj} ${c.bairro} ${c.endereco} ${c.situacao} ${c.observacao}`.toLowerCase();
        return text.includes(query);
      }

      return true;
    });
  }

  /**
   * Busca estabelecimento por CNPJ ou Pasta para cruzar com Vistorias
   */
  findCompanyByCnpj(cnpj) {
    if (!cnpj) return null;
    const clean = cnpj.replace(/\D/g, '');
    return this.companies.find(c => {
      const cClean = (c.cnpj || '').replace(/\D/g, '');
      return cClean && (cClean === clean || clean.includes(cClean) || cClean.includes(clean));
    });
  }
}

window.dataStore = new DataStore();
