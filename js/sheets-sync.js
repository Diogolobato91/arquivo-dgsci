/**
 * DGSCI / CBMPA - Google Sheets Synchronizer & Technical Standards Engine
 * Classificação oficial de Setores Operacionais do CBMPA, cálculo de carga de incêndio (MJ/m²)
 * e higienização semântica de dados.
 */

class SheetsSyncManager {
  constructor() {
    this.sheetId = '1qQkqpifpNHuIppyWk_VWZDQvSDJ9oet3C_xRffvvgH4';
    
    // Mapeamento de todas as 58 abas de ocupações CBMPA (A-1 a N-1)
    this.knownTabs = [
      { name: 'A1', gid: '1389258266', type: 'ocupacao', group: 'A', division: 'A-1' },
      { name: 'A2', gid: '2101934575', type: 'ocupacao', group: 'A', division: 'A-2' },
      { name: 'A3', gid: '1638828101', type: 'ocupacao', group: 'A', division: 'A-3' },
      { name: 'B1', gid: '2092520150', type: 'ocupacao', group: 'B', division: 'B-1' },
      { name: 'B2', gid: '904973214', type: 'ocupacao', group: 'B', division: 'B-2' },
      { name: 'C1', gid: '201902633', type: 'ocupacao', group: 'C', division: 'C-1' },
      { name: 'C2', gid: '334215936', type: 'ocupacao', group: 'C', division: 'C-2' },
      { name: 'C3', gid: '1169198327', type: 'ocupacao', group: 'C', division: 'C-3' },
      { name: 'D1', gid: '1175655405', type: 'ocupacao', group: 'D', division: 'D-1' },
      { name: 'D2', gid: '552888758', type: 'ocupacao', group: 'D', division: 'D-2' },
      { name: 'D3', gid: '679651322', type: 'ocupacao', group: 'D', division: 'D-3' },
      { name: 'D4', gid: '745443547', type: 'ocupacao', group: 'D', division: 'D-4' },
      { name: 'E1', gid: '1771505226', type: 'ocupacao', group: 'E', division: 'E-1' },
      { name: 'E2', gid: '1896773279', type: 'ocupacao', group: 'E', division: 'E-2' },
      { name: 'E3', gid: '486852657', type: 'ocupacao', group: 'E', division: 'E-3' },
      { name: 'E4', gid: '962084623', type: 'ocupacao', group: 'E', division: 'E-4' },
      { name: 'E5', gid: '1859319373', type: 'ocupacao', group: 'E', division: 'E-5' },
      { name: 'E6', gid: '668908925', type: 'ocupacao', group: 'E', division: 'E-6' },
      { name: 'F1', gid: '1529521850', type: 'ocupacao', group: 'F', division: 'F-1' },
      { name: 'F2', gid: '961066164', type: 'ocupacao', group: 'F', division: 'F-2' },
      { name: 'F3', gid: '1857390658', type: 'ocupacao', group: 'F', division: 'F-3' },
      { name: 'F4', gid: '978493023', type: 'ocupacao', group: 'F', division: 'F-4' },
      { name: 'F5', gid: '853981461', type: 'ocupacao', group: 'F', division: 'F-5' },
      { name: 'F6', gid: '63497752', type: 'ocupacao', group: 'F', division: 'F-6' },
      { name: 'F7', gid: '2107957094', type: 'ocupacao', group: 'F', division: 'F-7' },
      { name: 'F8', gid: '571154120', type: 'ocupacao', group: 'F', division: 'F-8' },
      { name: 'F9', gid: '1912742186', type: 'ocupacao', group: 'F', division: 'F-9' },
      { name: 'F10', gid: '1105683034', type: 'ocupacao', group: 'F', division: 'F-10' },
      { name: 'G1', gid: '1604203128', type: 'ocupacao', group: 'G', division: 'G-1' },
      { name: 'G2', gid: '1915068018', type: 'ocupacao', group: 'G', division: 'G-2' },
      { name: 'G3', gid: '2040026652', type: 'ocupacao', group: 'G', division: 'G-3' },
      { name: 'G4', gid: '177028695', type: 'ocupacao', group: 'G', division: 'G-4' },
      { name: 'G5', gid: '809158963', type: 'ocupacao', group: 'G', division: 'G-5' },
      { name: 'G6', gid: '1798060006', type: 'ocupacao', group: 'G', division: 'G-6' },
      { name: 'H1', gid: '124171633', type: 'ocupacao', group: 'H', division: 'H-1' },
      { name: 'H2', gid: '130885718', type: 'ocupacao', group: 'H', division: 'H-2' },
      { name: 'H3', gid: '2128568713', type: 'ocupacao', group: 'H', division: 'H-3' },
      { name: 'H4', gid: '1551550448', type: 'ocupacao', group: 'H', division: 'H-4' },
      { name: 'H5', gid: '1384447230', type: 'ocupacao', group: 'H', division: 'H-5' },
      { name: 'H6', gid: '1799987882', type: 'ocupacao', group: 'H', division: 'H-6' },
      { name: 'I1', gid: '1123745074', type: 'ocupacao', group: 'I', division: 'I-1' },
      { name: 'I2', gid: '1040554915', type: 'ocupacao', group: 'I', division: 'I-2' },
      { name: 'I3', gid: '414952236', type: 'ocupacao', group: 'I', division: 'I-3' },
      { name: 'J1', gid: '1047488473', type: 'ocupacao', group: 'J', division: 'J-1' },
      { name: 'J2', gid: '1138365959', type: 'ocupacao', group: 'J', division: 'J-2' },
      { name: 'J3', gid: '2114898232', type: 'ocupacao', group: 'J', division: 'J-3' },
      { name: 'J4', gid: '1263356197', type: 'ocupacao', group: 'J', division: 'J-4' },
      { name: 'L1', gid: '367064275', type: 'ocupacao', group: 'L', division: 'L-1' },
      { name: 'L2', gid: '456342657', type: 'ocupacao', group: 'L', division: 'L-2' },
      { name: 'L3', gid: '49753475', type: 'ocupacao', group: 'L', division: 'L-3' },
      { name: 'M1', gid: '799513510', type: 'ocupacao', group: 'M', division: 'M-1' },
      { name: 'M2', gid: '1578122451', type: 'ocupacao', group: 'M', division: 'M-2' },
      { name: 'M3', gid: '1496456184', type: 'ocupacao', group: 'M', division: 'M-3' },
      { name: 'M4', gid: '1509430504', type: 'ocupacao', group: 'M', division: 'M-4' },
      { name: 'M5', gid: '34716689', type: 'ocupacao', group: 'M', division: 'M-5' },
      { name: 'M6', gid: '1503888574', type: 'ocupacao', group: 'M', division: 'M-6' },
      { name: 'M7', gid: '73787398', type: 'ocupacao', group: 'M', division: 'M-7' },
      { name: 'N1', gid: '2016577891', type: 'ocupacao', group: 'N', division: 'N-1' }
    ];
  }

  extractSheetId(urlOrId) {
    if (!urlOrId) return this.sheetId;
    const match = urlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return urlOrId.trim();
  }

  parseCSV(text) {
    const lines = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push("");
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && next === '\n') {
          i++;
        }
        lines.push(row.map(cell => cell.trim()));
        row = [""];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
      lines.push(row.map(cell => cell.trim()));
    }
    return lines;
  }

  async syncFromGoogleSheets(sheetUrlOrId, onProgress) {
    const id = this.extractSheetId(sheetUrlOrId);
    this.sheetId = id;

    const companies = [];
    const vistorias = [];
    const loadedTabs = [];

    const tabsToFetch = this.knownTabs;
    const totalTabs = tabsToFetch.length;
    let completedCount = 0;

    const BATCH_SIZE = 8;
    for (let i = 0; i < tabsToFetch.length; i += BATCH_SIZE) {
      const batch = tabsToFetch.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(async (tab) => {
        try {
          const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${tab.gid}&_t=${Date.now()}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);
          
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) return;

          const csvText = await response.text();
          const rows = this.parseCSV(csvText);

          const parsedCompanies = this.parseCompanyRows(rows, tab);
          if (parsedCompanies.length > 0) {
            companies.push(...parsedCompanies);
            loadedTabs.push({ name: tab.name, count: parsedCompanies.length, type: 'ocupacao' });
          }
        } catch (err) {
          console.warn(`Erro na aba ${tab.name}:`, err.message);
        } finally {
          completedCount++;
          if (onProgress) {
            onProgress(`Sincronizando abas da DGSCI (${completedCount}/${totalTabs})...`, completedCount / totalTabs);
          }
        }
      }));
    }

    const payload = {
      timestamp: new Date().toISOString(),
      sheetId: id,
      companies,
      vistorias,
      loadedTabs
    };

    try {
      localStorage.setItem('dgsci_data_cache', JSON.stringify(payload));
    } catch (e) {
      console.warn('Cache local excedeu localStorage');
    }

    return payload;
  }

  parseCompanyRows(rows, tabInfo) {
    if (!rows || rows.length < 3) return [];

    let headerIndex = -1;
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const rowStr = rows[i].join(' ').toUpperCase();
      if (rowStr.includes('CNPJ') || rowStr.includes('ENDEREÇO') || rowStr.includes('ENDERECO') || rowStr.includes('RAZÃO') || rowStr.includes('RAZAO') || rowStr.includes('PASTA')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) headerIndex = 0;
    if (headerIndex >= rows.length - 1) return [];

    const headers = rows[headerIndex].map(h => (h || '').toString().toUpperCase().trim());
    const colMap = this.resolveColumns(headers);

    const companies = [];

    for (let r = headerIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length < 3) continue;

      const rawRazao = this.getVal(row, colMap.razao);
      const rawCnpj = this.getVal(row, colMap.cnpj);
      const rawItemNum = this.getVal(row, colMap.pasta);
      const rawSituacao = this.getVal(row, colMap.situacao);
      const rawObs = this.getVal(row, colMap.observacao);
      const rawBairro = this.getVal(row, colMap.bairro);
      const rawEndereco = this.getVal(row, colMap.endereco);
      const rawStatusAtivo = this.getVal(row, colMap.statusAtivo);
      const rawCarga = this.getVal(row, colMap.carga);
      const rawRisco = this.getVal(row, colMap.risco);

      const cleanRazaoUpper = (rawRazao || '').toUpperCase().trim();
      const cleanCnpjDigits = (rawCnpj || '').replace(/\D/g, '');

      // VALIDAÇÃO ESTRITA: Descartar linhas em branco pré-numeradas (templates de contagem sem empresa real)
      const hasRealRazao = cleanRazaoUpper.length >= 2 && 
        !/^\d+$/.test(cleanRazaoUpper) &&
        !cleanRazaoUpper.includes('CARACTERÍSTICAS') && 
        !cleanRazaoUpper.includes('QUANTIDADE') && 
        !cleanRazaoUpper.includes('EMPRESA:') && 
        !cleanRazaoUpper.includes('PASTA Nº') &&
        !cleanRazaoUpper.startsWith('DIVISÃO');

      const hasRealCnpj = cleanCnpjDigits.length >= 8;

      if (!hasRealRazao && !hasRealCnpj) {
        // Linha em branco com numeração vazia -> DESCARTAR TOTALMENTE
        continue;
      }

      const cleanCnpj = this.cleanAndFormatCnpj(rawCnpj);
      const cleanBairro = this.normalizeNeighborhood(rawBairro, rawEndereco);
      const { normalizedStatus, displaySituacao, isDesativado } = this.interpretFuzzyStatus(rawSituacao, rawObs, rawStatusAtivo, rawCnpj);
      
      // Classificação Oficial de Carga de Incêndio e Grau de Risco CBMPA
      const { numericCarga, cleanRisco } = this.calculateFireLoadAndRisk(rawCarga, rawRisco);

      // Classificação Oficial de Setores CBMPA por Bairro
      const sectorInfo = this.resolveOfficialSector(cleanBairro, rawEndereco);

      const cleanArea = this.cleanArea(this.getVal(row, colMap.area));
      const cleanPavimentos = this.cleanPavimentos(this.getVal(row, colMap.pavimentos));

      // Número sequencial do registro dentro da divisão
      const itemNum = rawItemNum || `${r - headerIndex}`;
      
      // Normalização Estrita da Divisão (A-1 até N-1) - Elimina números de contagem como '001', '002'
      let divisao = tabInfo.division || tabInfo.name;
      const rawDiv = (this.getVal(row, colMap.divisao) || '').trim();
      if (rawDiv && /^[A-Z]-\d+$/i.test(rawDiv)) {
        divisao = rawDiv.toUpperCase();
      } else if (rawDiv && /^[A-Z]\d+$/i.test(rawDiv)) {
        divisao = rawDiv.toUpperCase().replace(/([A-Z])(\d+)/, '$1-$2');
      } else if (tabInfo.division) {
        divisao = tabInfo.division;
      } else if (tabInfo.name) {
        divisao = tabInfo.name.replace(/([A-Z])(\d+)/, '$1-$2');
      }

      // Enriquecimento técnico oficial CBMPA
      const divInfo = typeof getCBMPADivisionInfo === 'function' ? getCBMPADivisionInfo(divisao) : null;
      const grupo = divInfo ? divInfo.grupo : (tabInfo.group || (divisao ? divisao.charAt(0) : 'C'));
      const grupoNome = divInfo ? divInfo.grupoNome : 'Geral';
      const divisaoDescricao = divInfo ? divInfo.descricao : '';
      const divisaoExemplos = divInfo ? divInfo.exemplos : '';

      // Extração precisa do número do imóvel no endereço
      const numeroImovel = this.extractHouseNumber(rawEndereco);

      companies.push({
        id: `comp_${tabInfo.name}_${r}`,
        tab: tabInfo.name,
        itemNum: itemNum,
        pasta: itemNum, // mantido para compatibilidade retroativa
        razao: this.cleanRazao(rawRazao) || `Item nº ${itemNum} (${divisao})`,
        cnpj: cleanCnpj,
        cnae: this.getVal(row, colMap.cnae),
        descricao: this.getVal(row, colMap.descricao),
        endereco: rawEndereco || '-',
        numeroImovel: numeroImovel || 'S/N',
        bairro: cleanBairro,
        cep: this.cleanCep(this.getVal(row, colMap.cep)),
        setor: sectorInfo.id,
        setorNome: sectorInfo.name,
        setorCor: sectorInfo.color,
        setorHex: sectorInfo.hex,
        grupo: grupo,
        grupoNome: grupoNome,
        divisao: divisao,
        divisaoDescricao: divisaoDescricao,
        divisaoExemplos: divisaoExemplos,
        area: cleanArea,
        pavimentos: cleanPavimentos,
        cargaIncendio: numericCarga,
        cargaDisplay: `${numericCarga} MJ/m²`,
        risco: cleanRisco,
        lotacao: this.getVal(row, colMap.lotacao) || '-',
        projetoAprovado: this.cleanBoolean(this.getVal(row, colMap.projetoAprovado)),
        protocoloProjeto: this.getVal(row, colMap.protocoloProjeto),
        statusAtivo: isDesativado ? 'DESATIVADO' : 'ATIVO',
        situacao: displaySituacao,
        observacao: rawObs,
        normalizedStatus: normalizedStatus
      });
    }

    return companies;
  }

  extractHouseNumber(rawAddress) {
    if (!rawAddress) return '';
    const match = rawAddress.match(/(?:N[º°\.\s]*|NUMERO\s*|N\s+)(\d+[A-Z]?)/i) || 
                  rawAddress.match(/\b(\d{1,5})\b/);
    if (match && match[1]) {
      return match[1];
    }
    return '';
  }

  /**
   * Cálculo Técnico de Carga de Incêndio (MJ/m²) e Grau de Risco Oficial CBMPA:
   * - Até 300 MJ/m²: RISCO BAIXO
   * - De 300,01 até 1200 MJ/m²: RISCO MÉDIO
   * - Acima de 1200,01 MJ/m²: RISCO ALTO
   */
  calculateFireLoadAndRisk(rawCarga, rawRisco) {
    let numeric = 0;
    if (rawCarga) {
      const cleanNumStr = rawCarga.toString().replace(/mj\/m²/gi, '').replace(',', '.').replace(/[^\d.]/g, '').trim();
      numeric = parseFloat(cleanNumStr) || 0;
    }

    let cleanRisco = 'BAIXO';

    if (numeric > 0) {
      if (numeric <= 300) {
        cleanRisco = 'BAIXO';
      } else if (numeric <= 1200) {
        cleanRisco = 'MÉDIO';
      } else {
        cleanRisco = 'ALTO';
      }
    } else if (rawRisco) {
      const r = rawRisco.toUpperCase();
      if (r.includes('ALTO')) cleanRisco = 'ALTO';
      else if (r.includes('MÉD') || r.includes('MED')) cleanRisco = 'MÉDIO';
      else cleanRisco = 'BAIXO';
    }

    return {
      numericCarga: numeric,
      cleanRisco: cleanRisco
    };
  }

  /**
   * Classificação Oficial de Setores da DGSCI / CBMPA:
   * - SETOR I   (Amarelo): CIDADE VELHA, CAMPINA, COMÉRCIO
   * - SETOR II  (Azul):    BATISTA CAMPOS, JURUNAS, CREMAÇÃO, CONDOR
   * - SETOR III (Branco):  REDUTO, UMARIZAL, FÁTIMA, NAZARÉ, SÃO BRÁS
   * - SETOR IV  (Verde):   MARCO, CANUDOS, GUAMÁ, TERRA FIRME, CURIÓ-UTINGA, UNIVERSITÁRIO, MONTESE
   * - SETOR V   (Rosa):    MIRAMAR, BARREIRO, TELÉGRAFO, SACRAMENTA, PEDREIRA, MARACANGALHA
   * - SETOR VI  (Laranja): CASTANHEIRA, SOUZA, MARAMBAIA, MANGUEIRÃO, VAL DE CÃES, BENGUI, TAPANA, PRATINHA, ATALAIA, UNA, PARQUE VERDE, CABANAGEM, GUANABARA (e RMB)
   */
  resolveOfficialSector(bairroRaw, enderecoRaw) {
    const text = `${bairroRaw || ''} ${enderecoRaw || ''}`.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // SETOR I: Amarelo
    if (text.includes('CIDADE VELHA') || text.includes('CAMPINA') || text.includes('COMERCIO')) {
      return { id: 'SETOR I', name: 'Setor I (Centro Histórico / Comércio)', color: 'Amarelo', hex: '#EAB308' };
    }

    // SETOR II: Azul
    if (text.includes('BATISTA CAMPOS') || text.includes('JURUNAS') || text.includes('CREMACAO') || text.includes('CONDOR')) {
      return { id: 'SETOR II', name: 'Setor II (Batista Campos / Jurunas / Cremação)', color: 'Azul', hex: '#3B82F6' };
    }

    // SETOR III: Branco
    if (text.includes('REDUTO') || text.includes('UMARIZAL') || text.includes('FATIMA') || text.includes('NAZARE') || text.includes('SAO BRAS') || text.includes('S. BRAS')) {
      return { id: 'SETOR III', name: 'Setor III (Umarizal / Nazaré / São Brás)', color: 'Branco', hex: '#F8FAFC' };
    }

    // SETOR IV: Verde
    if (text.includes('MARCO') || text.includes('CANUDOS') || text.includes('GUAMA') || text.includes('TERRA FIRME') || text.includes('CURIO') || text.includes('UTINGA') || text.includes('UNIVERSITARIO') || text.includes('MONTESE')) {
      return { id: 'SETOR IV', name: 'Setor IV (Marco / Guamá / Canudos / Utinga)', color: 'Verde', hex: '#22C55E' };
    }

    // SETOR V: Rosa
    if (text.includes('MIRAMAR') || text.includes('BARREIRO') || text.includes('TELEGRAFO') || text.includes('SACRAMENTA') || text.includes('PEDREIRA') || text.includes('MARACANGALHA')) {
      return { id: 'SETOR V', name: 'Setor V (Telégrafo / Sacramenta / Pedreira)', color: 'Rosa', hex: '#EC4899' };
    }

    // SETOR VI: Laranja
    if (text.includes('CASTANHEIRA') || text.includes('SOUZA') || text.includes('MARAMBAIA') || text.includes('MANGUEIRAO') || text.includes('VAL DE CAES') || text.includes('VAL-DE-CAES') || text.includes('BENGUI') || text.includes('TAPANA') || text.includes('PRATINHA') || text.includes('ATALAIA') || text.includes('UNA') || text.includes('PARQUE VERDE') || text.includes('CABANAGEM') || text.includes('GUANABARA') || text.includes('ANANINDEUA') || text.includes('ICOARACI') || text.includes('MOSQUEIRO') || text.includes('OUTEIRO') || text.includes('MARITUBA') || text.includes('CASTANHAL')) {
      return { id: 'SETOR VI', name: 'Setor VI (Expansão / RMB / Rodovias)', color: 'Laranja', hex: '#F97316' };
    }

    return { id: 'SETOR III', name: 'Setor III (Geral)', color: 'Branco', hex: '#F8FAFC' };
  }

  parseVistoriasRows(rows) {
    if (!rows || rows.length < 3) return [];

    let headerIndex = -1;
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const rowStr = rows[i].join(' ').toUpperCase();
      if (rowStr.includes('VISTORIADOR') || rowStr.includes('PARECER') || rowStr.includes('ATRIBUIÇÃO') || rowStr.includes('CNPJ')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) headerIndex = 9;
    const headers = rows[headerIndex].map(h => h.toUpperCase().trim());

    const colMap = {
      qtd: this.findColIndex(headers, ['QTD.', 'QTD', 'Nº']),
      protocolo: this.findColIndex(headers, ['ATRIBUIÇÃO', 'PROTOCOLO', 'PROCESSO']),
      tipo: this.findColIndex(headers, ['TIPO']),
      cnpj: this.findColIndex(headers, ['CNPJ/CPF', 'CNPJ', 'CPF']),
      dataAgendada: this.findColIndex(headers, ['DATA AGENDADA', 'AGENDADA']),
      vistoriador: this.findColIndex(headers, ['VISTORIADOR PRINCIPAL', 'VISTORIADOR']),
      auxiliar: this.findColIndex(headers, ['VISTORIADOR AUXILIAR', 'AUXILIAR']),
      dataExecucao: this.findColIndex(headers, ['DATA EXECUÇÃO', 'DATA EXECUCAO']),
      parecer: this.findColIndex(headers, ['PARECER']),
      tipoParecer: this.findColIndex(headers, ['TIPO/PARECER']),
      situacao: this.findColIndex(headers, ['SITUAÇÃO', 'SITUACAO']),
      observacao: this.findColIndex(headers, ['OBSERVAÇÃO', 'OBS'])
    };

    const vistorias = [];

    for (let r = headerIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const protocolo = this.getVal(row, colMap.protocolo);
      const vistoriador = this.normalizeInspectorName(this.getVal(row, colMap.vistoriador));
      const rawCnpj = this.getVal(row, colMap.cnpj);

      if (!protocolo && !vistoriador && !rawCnpj) continue;

      const rawParecer = this.getVal(row, colMap.parecer);
      const normalizedParecer = this.normalizeParecer(rawParecer);

      vistorias.push({
        id: `vistoria_${r}`,
        numero: this.getVal(row, colMap.qtd) || r - headerIndex,
        protocolo: protocolo || '-',
        tipo: this.normalizeVistoriaType(this.getVal(row, colMap.tipo)),
        cnpj: this.cleanAndFormatCnpj(rawCnpj),
        dataAgendada: this.cleanDate(this.getVal(row, colMap.dataAgendada)),
        vistoriador: vistoriador || 'NÃO DESIGNADO',
        auxiliar: this.getVal(row, colMap.auxiliar),
        dataExecucao: this.cleanDate(this.getVal(row, colMap.dataExecucao)),
        parecer: rawParecer || 'PENDENTE',
        situacao: this.getVal(row, colMap.situacao),
        observacao: this.getVal(row, colMap.observacao),
        normalizedParecer: normalizedParecer
      });
    }

    return vistorias;
  }

  interpretFuzzyStatus(situacaoRaw, obsRaw, statusAtivoRaw, cnpjRaw) {
    const combined = `${situacaoRaw || ''} ${obsRaw || ''} ${statusAtivoRaw || ''} ${cnpjRaw || ''}`.toUpperCase();

    if (combined.includes('BAIXADO') || combined.includes('DESATIVAD') || combined.includes('OUTRA EMPRESA FUNCIONA NO LOCAL') || combined.includes('ENCERRAD')) {
      return {
        normalizedStatus: 'DESATIVADO',
        displaySituacao: situacaoRaw || 'EMPRESA DESATIVADA / CNPJ BAIXADO',
        isDesativado: true
      };
    }

    if (combined.includes('VENCID') || combined.includes('INFRAÇÃO') || combined.includes('INFRACAO') || combined.includes('INAPTO') || combined.includes('SUSPENSO') || combined.includes('REPROVAD')) {
      let display = situacaoRaw || 'CERTIFICADO VENCIDO';
      if (combined.includes('INFRAÇÃO') || combined.includes('INFRACAO')) {
        display = 'AUTO DE INFRAÇÃO EMITIDO';
      }
      return {
        normalizedStatus: 'VENCIDO',
        displaySituacao: display,
        isDesativado: false
      };
    }

    if (combined.includes('EMITIDO') || combined.includes('APROVAD') || combined.includes('FINALIZADO') || combined.includes('REGULAR') || combined.includes('DISPENSADO') || combined.includes('ISENTO') || combined.includes('RENOVADO')) {
      return {
        normalizedStatus: 'REGULAR',
        displaySituacao: situacaoRaw || 'CERTIFICADO EMITIDO / REGULAR',
        isDesativado: false
      };
    }

    if (combined.includes('SEM CADASTRO') || combined.includes('SEM SISGAT') || combined.includes('NÃO POSSUI NADA NO SISGAT') || combined.includes('APENAS FÍSICO') || combined.includes('WEBCAT') || combined.includes('NÃO FOI POSSIVEL LOCALIZAR')) {
      return {
        normalizedStatus: 'SEM_SISGAT',
        displaySituacao: situacaoRaw || 'SEM CADASTRO NO SISGAT',
        isDesativado: false
      };
    }

    return {
      normalizedStatus: 'PARADO',
      displaySituacao: situacaoRaw || 'PROCESSO PARADO / À CONFIRMAR',
      isDesativado: false
    };
  }

  normalizeNeighborhood(bairroRaw, enderecoRaw) {
    const raw = `${bairroRaw || ''} ${enderecoRaw || ''}`.toUpperCase().replace(/\s+/g, ' ').trim();

    if (raw.includes('BATISTA CAMPOS') || raw.includes('B. CAMPOS')) return 'BATISTA CAMPOS';
    if (raw.includes('NAZARÉ') || raw.includes('NAZARE')) return 'NAZARÉ';
    if (raw.includes('UMARIZAL') || raw.includes('UMARISAL')) return 'UMARIZAL';
    if (raw.includes('JURUNAS')) return 'JURUNAS';
    if (raw.includes('CREMAÇÃO') || raw.includes('CREMACAO')) return 'CREMAÇÃO';
    if (raw.includes('GUAMÁ') || raw.includes('GUAMA')) return 'GUAMÁ';
    if (raw.includes('SÃO BRÁS') || raw.includes('SAO BRAS') || raw.includes('S. BRAS')) return 'SÃO BRÁS';
    if (raw.includes('FÁTIMA') || raw.includes('FATIMA')) return 'FÁTIMA';
    if (raw.includes('REDUTO')) return 'REDUTO';
    if (raw.includes('CAMPINA')) return 'CAMPINA';
    if (raw.includes('COMÉRCIO') || raw.includes('COMERCIO')) return 'COMÉRCIO';
    if (raw.includes('CIDADE VELHA')) return 'CIDADE VELHA';
    if (raw.includes('MARCO')) return 'MARCO';
    if (raw.includes('PEDREIRA')) return 'PEDREIRA';
    if (raw.includes('TELÉGRAFO') || raw.includes('TELEGRAFO')) return 'TELÉGRAFO';
    if (raw.includes('SACRAMENTA')) return 'SACRAMENTA';
    if (raw.includes('SOUZA')) return 'SOUZA';
    if (raw.includes('MARAMBAIA')) return 'MARAMBAIA';
    if (raw.includes('MANGUEIRÃO') || raw.includes('MANGUEIRAO')) return 'MANGUEIRÃO';
    if (raw.includes('PARQUE VERDE') || raw.includes('PQ VERDE')) return 'PARQUE VERDE';
    if (raw.includes('VAL-DE-CÃES') || raw.includes('VAL DE CAES')) return 'VAL-DE-CÃES';
    if (raw.includes('CASTANHEIRA')) return 'CASTANHEIRA';
    if (raw.includes('BENGUÍ') || raw.includes('BENGUI')) return 'BENGUÍ';
    if (raw.includes('CABANAGEM')) return 'CABANAGEM';
    if (raw.includes('TAPANÃ') || raw.includes('TAPANA')) return 'TAPANÃ';
    if (raw.includes('ICOARACI')) return 'ICOARACI';
    if (raw.includes('MOSQUEIRO')) return 'MOSQUEIRO';
    if (raw.includes('OUTEIRO')) return 'OUTEIRO';
    if (raw.includes('CONDOR')) return 'CONDOR';
    if (raw.includes('CANUDOS')) return 'CANUDOS';
    if (raw.includes('CIDADE NOVA')) return 'CIDADE NOVA (ANANINDEUA)';
    if (raw.includes('COQUEIRO')) return 'COQUEIRO (ANANINDEUA)';
    if (raw.includes('GUANABARA')) return 'GUANABARA (ANANINDEUA)';
    if (raw.includes('ÁGUAS LINDAS') || raw.includes('AGUAS LINDAS')) return 'ÁGUAS LINDAS (ANANINDEUA)';
    if (raw.includes('ANANINDEUA')) return 'ANANINDEUA (CENTRO)';
    if (raw.includes('MARITUBA')) return 'MARITUBA';
    if (raw.includes('CASTANHAL')) return 'CASTANHAL';

    if (bairroRaw && bairroRaw.trim().length > 2) {
      return bairroRaw.toUpperCase().trim();
    }

    return 'NÃO INFORMADO';
  }

  cleanAndFormatCnpj(val) {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');

    if (digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return val.trim();
  }

  cleanRazao(razao) {
    if (!razao) return '';
    return razao.replace(/\s+/g, ' ').replace(/[\r\n]+/g, ' ').trim();
  }

  cleanArea(area) {
    if (!area) return '-';
    let s = area.toString().replace(/m²/gi, '').trim();
    return `${s} m²`;
  }

  cleanPavimentos(pav) {
    if (!pav) return '1';
    return pav.toString().replace(/\D/g, '') || '1';
  }

  cleanBoolean(val) {
    const s = (val || '').toUpperCase();
    if (s.includes('SIM') || s === 'S') return 'SIM';
    return 'NÃO';
  }

  cleanCep(cep) {
    if (!cep) return '';
    const digits = cep.replace(/\D/g, '');
    if (digits.length === 8) {
      return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return cep.trim();
  }

  cleanDate(dateStr) {
    if (!dateStr) return '-';
    if (dateStr.includes('1900')) return '-';
    return dateStr.trim();
  }

  normalizeInspectorName(name) {
    if (!name) return 'NÃO DESIGNADO';
    let n = name.toUpperCase().replace(/\s+/g, ' ').trim();
    if (n.includes('LEONORA')) return 'SGT LEONORA';
    if (n.includes('FABRICIO') || n.includes('FABRÍCIO')) return 'SGT FABRICIO';
    if (n.includes('HERMANO')) return 'SGT HERMANO';
    if (n.includes('RAFAEL')) return 'CB RAFAEL';
    if (n.includes('SARAIVA')) return 'SGT SARAIVA';
    if (n.includes('BESSA')) return 'SGT BESSA';
    if (n.includes('CARLOS AUGUSTO')) return 'SGT CARLOS AUGUSTO';
    if (n.includes('JAIRO')) return 'SGT JAIRO';
    if (n.includes('SANDRO')) return 'SGT SANDRO';
    if (n.includes('CLEBERSON')) return 'SGT CLEBERSON';
    if (n.includes('VALDIR')) return 'SGT VALDIR';
    if (n.includes('ODETE')) return 'SGT ODETE';
    if (n.includes('ROGÉRIO') || n.includes('ROGERIO')) return 'SGT ROGÉRIO';
    if (n.includes('CARDOSO')) return 'CB CARDOSO';
    if (n.includes('NAYARA')) return 'CB NAYARA';
    return n;
  }

  normalizeVistoriaType(tipo) {
    const t = (tipo || '').toUpperCase();
    if (t.includes('FISC')) return 'FISCALIZAÇÃO';
    if (t.includes('LICEN')) return 'LICENCIAMENTO';
    return tipo || 'LICENCIAMENTO';
  }

  normalizeParecer(parecer) {
    const p = (parecer || '').toUpperCase();
    if (p.includes('APROV')) return 'APROVADO';
    if (p.includes('REPROV') || p.includes('INFRAÇÃO')) return 'REPROVADO';
    return 'PENDENTE';
  }

  resolveColumns(headers) {
    const norm = headers.map(h => (h || '').toString().toUpperCase().trim());

    let pastaIdx = 0;
    let razaoIdx = 1;
    let cnpjIdx = 2;
    let cnaeIdx = 3;
    let descIdx = 4;
    let endIdx = 5;
    let bairroIdx = 6;
    let cepIdx = 7;
    let setorIdx = 8;
    let projAprovIdx = 9;
    let protProjIdx = 10;
    let grupoIdx = 11;
    let divIdx = 12;
    let areaIdx = 14;
    let pavIdx = 19;
    let cargaIdx = 20;
    let riscoIdx = 21;
    let lotacaoIdx = 22;
    let statusAtivoIdx = 23;
    let situacaoIdx = 24;
    let obsIdx = 25;

    for (let i = 0; i < norm.length; i++) {
      const h = norm[i];
      if (h.includes('CNPJ') || h.includes('CPF')) cnpjIdx = i;
      else if (h.includes('ENDEREÇO') || h.includes('ENDERECO') || h.includes('LOGRADOURO')) endIdx = i;
      else if (h.includes('BAIRRO')) bairroIdx = i;
      else if (h.includes('CEP')) cepIdx = i;
      else if (h.includes('CNAE')) cnaeIdx = i;
      else if (h.includes('DESCRIÇÃO') || h.includes('DESCRICAO') || h.includes('ATIVIDADE')) descIdx = i;
      else if (h.includes('CARGA') || h.includes('MJ/M²')) cargaIdx = i;
      else if (h.includes('RISCO') && !h.includes('ESPECÍFICO')) riscoIdx = i;
      else if (h.includes('SITUAÇÃO') || h.includes('SITUACAO')) situacaoIdx = i;
      else if (h.includes('OBSERVAÇÃO') || h.includes('OBSERVACAO') || h.includes('OBS')) obsIdx = i;
      else if (h.includes('ATIVO OU DESATIVADO') || h.includes('STATUS')) statusAtivoIdx = i;
      else if (h.includes('PROJETO APROVADO')) projAprovIdx = i;
      else if (h.includes('PROTOCOLO')) protProjIdx = i;
      else if (h.includes('RAZÃO') || h.includes('RAZAO') || h.includes('NOME FANTASIA') || (h.startsWith('EMPRESA') && !h.includes('PASTA'))) razaoIdx = i;
    }

    // A coluna da Razão Social NUNCA pode ser a coluna 0 (que é reservada para a Pasta/Item Nº)
    if (razaoIdx === 0) razaoIdx = 1;

    return {
      pasta: pastaIdx,
      razao: razaoIdx,
      cnpj: cnpjIdx,
      cnae: cnaeIdx,
      descricao: descIdx,
      endereco: endIdx,
      bairro: bairroIdx,
      cep: cepIdx,
      setor: setorIdx,
      projetoAprovado: projAprovIdx,
      protocoloProjeto: protProjIdx,
      grupo: grupoIdx,
      divisao: divIdx,
      area: areaIdx,
      pavimentos: pavIdx,
      carga: cargaIdx,
      risco: riscoIdx,
      lotacao: lotacaoIdx,
      statusAtivo: statusAtivoIdx,
      situacao: situacaoIdx,
      observacao: obsIdx
    };
  }

  findColIndex(headers, possibleNames) {
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i];
      for (const name of possibleNames) {
        if (h === name || h.startsWith(name)) {
          return i;
        }
      }
    }
    return -1;
  }

  getVal(row, index) {
    if (index === -1 || index >= row.length) return '';
    return (row[index] || '').toString().trim();
  }
}

window.sheetsSyncManager = new SheetsSyncManager();
