/**
 * DGSCI / CBMPA - Main Application Controller
 * Orquestrador principal da interface, mapas geoespaciais, sincronização periódica e relatórios operacionais.
 */

class DashboardApp {
  constructor() {
    this.store = window.dataStore;
    this.syncManager = window.sheetsSyncManager;
    this.charts = window.dashboardCharts;
    this.tables = window.tableManager;
    this.geoMap = window.geoMapManager;
    
    this.autoSyncTimer = null;
    this.activeTab = 'overview';

    this.init();
  }

  async init() {
    if (window.lucide) {
      lucide.createIcons();
    }

    this.setupEventListeners();
    this.setupThemeToggle();
    this.setupDropzone();

    this.store.subscribe((store) => {
      this.updateUI(store);
    });

    this.loadFromCache();

    await this.syncLiveSheet();

    this.setupAutoSync();
  }

  setupEventListeners() {
    // Abas de navegação lateral
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Botão Sincronizar Agora
    const btnSync = document.getElementById('btnSyncNow');
    if (btnSync) {
      btnSync.addEventListener('click', () => this.syncLiveSheet(true));
    }

    // Botão Relatório / Imprimir Fiscalização
    const btnExportFiscal = document.getElementById('btnExportFiscal');
    if (btnExportFiscal) {
      btnExportFiscal.addEventListener('click', () => this.generateFiscalReport());
    }

    // Botão Ver Todos os Alertas
    const btnViewAllAlerts = document.getElementById('btnViewAllAlerts');
    if (btnViewAllAlerts) {
      btnViewAllAlerts.addEventListener('click', () => {
        this.switchTab('alerts');
      });
    }

    // Botão Imprimir do painel de Alertas
    const btnPrintNotificationReport = document.getElementById('btnPrintNotificationReport');
    if (btnPrintNotificationReport) {
      btnPrintNotificationReport.addEventListener('click', () => this.generateFiscalReport());
    }

    // =========================================================================
    // FILTROS DO MAPA GEOGRÁFICO
    // =========================================================================
    const mapSearch = document.getElementById('mapSearchInput');
    const mapStatus = document.getElementById('mapFilterStatus');
    const mapRisk = document.getElementById('mapFilterRisk');
    const mapSector = document.getElementById('mapFilterSector');
    const btnMapModeStatus = document.getElementById('btnMapModeStatus');
    const btnMapModeSector = document.getElementById('btnMapModeSector');

    const applyMapFilters = () => {
      const status = mapStatus ? mapStatus.value : 'all';
      const risk = mapRisk ? mapRisk.value : 'all';
      const sector = mapSector ? mapSector.value : 'all';
      const q = mapSearch ? mapSearch.value : '';
      this.geoMap.renderMarkers(this.store, status, risk, sector, q);
    };

    if (mapSearch) mapSearch.addEventListener('input', applyMapFilters);
    if (mapStatus) mapStatus.addEventListener('change', applyMapFilters);
    if (mapRisk) mapRisk.addEventListener('change', applyMapFilters);
    if (mapSector) mapSector.addEventListener('change', applyMapFilters);

    if (btnMapModeStatus) {
      btnMapModeStatus.addEventListener('click', () => {
        btnMapModeStatus.classList.add('active');
        if (btnMapModeSector) btnMapModeSector.classList.remove('active');
        this.geoMap.setColorMode('status');
        applyMapFilters();
      });
    }

    if (btnMapModeSector) {
      btnMapModeSector.addEventListener('click', () => {
        btnMapModeSector.classList.add('active');
        if (btnMapModeStatus) btnMapModeStatus.classList.remove('active');
        this.geoMap.setColorMode('sector');
        applyMapFilters();
      });
    }

    // =========================================================================
    // FILTROS DE ESTABELECIMENTOS
    // =========================================================================
    const searchInput = document.getElementById('companySearchInput');
    const clearSearch = document.getElementById('btnClearSearch');
    const filterSit = document.getElementById('filterSituation');
    const filterGrp = document.getElementById('filterGroup');
    const filterSector = document.getElementById('filterSector');
    const filterBairro = document.getElementById('filterNeighborhood');
    const filterRisk = document.getElementById('filterRisk');

    const debounceFilter = () => {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        this.applyCompanyFilters();
      }, 250);
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (clearSearch) {
          clearSearch.style.display = searchInput.value ? 'block' : 'none';
        }
        debounceFilter();
      });
    }

    if (clearSearch) {
      clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        clearSearch.style.display = 'none';
        this.applyCompanyFilters();
      });
    }

    if (filterSit) filterSit.addEventListener('change', () => this.applyCompanyFilters());
    if (filterGrp) filterGrp.addEventListener('change', () => this.applyCompanyFilters());
    if (filterSector) filterSector.addEventListener('change', () => this.applyCompanyFilters());
    if (filterBairro) filterBairro.addEventListener('change', () => this.applyCompanyFilters());
    if (filterRisk) filterRisk.addEventListener('change', () => this.applyCompanyFilters());

    // Filtro rápido da Visão Geral
    const overviewGroupFilter = document.getElementById('overviewGroupFilter');
    if (overviewGroupFilter) {
      overviewGroupFilter.addEventListener('change', () => {
        this.updateOverviewKPIsAndCharts();
      });
    }

    // Filtros do Catálogo CBMPA (A-1 a N-1)
    const catalogSearch = document.getElementById('catalogSearchInput');
    const catalogGroup = document.getElementById('catalogGroupFilter');

    const applyCatalogFilters = () => {
      const g = catalogGroup ? catalogGroup.value : 'all';
      const q = catalogSearch ? catalogSearch.value : '';
      this.renderCBMPACatalog(g, q);
    };

    // Ordenação de colunas da tabela
    document.querySelectorAll('#companiesTable th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (this.tables.sortCol === col) {
          this.tables.sortAsc = !this.tables.sortAsc;
        } else {
          this.tables.sortCol = col;
          this.tables.sortAsc = true;
        }
        this.applyCompanyFilters();
      });
    });

    // Modais
    const modal = document.getElementById('companyDetailModal');
    const closeBtn = document.getElementById('btnCloseCompanyModal');
    const closeBtn2 = document.getElementById('btnCloseCompanyModalBtn');
    const printDossierBtn = document.getElementById('btnPrintCompanyDossier');

    const closeModal = () => modal && modal.classList.remove('active');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtn2) closeBtn2.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    if (printDossierBtn) {
      printDossierBtn.addEventListener('click', () => {
        const comp = window.activeCompanyForPrint || (window.tableManager ? window.tableManager.currentCompany : null);
        this.printSingleCompanyDossier(comp);
      });
    }

    // Configurações
    const btnSaveSheetConfig = document.getElementById('btnSaveSheetConfig');
    if (btnSaveSheetConfig) {
      btnSaveSheetConfig.addEventListener('click', () => {
        this.syncLiveSheet(true);
        this.showToast('Configuração salva com sucesso!', 'success');
      });
    }

    const btnTestConnection = document.getElementById('btnTestConnection');
    if (btnTestConnection) {
      btnTestConnection.addEventListener('click', () => {
        this.syncLiveSheet(true);
      });
    }

    // Exportação Excel
    const btnExportCompaniesExcel = document.getElementById('btnExportCompaniesExcel');
    if (btnExportCompaniesExcel) {
      btnExportCompaniesExcel.addEventListener('click', () => this.exportCompaniesToExcel());
    }

    // Exportação de empresas sem localização
    const btnExportUnlocatedExcel = document.getElementById('btnExportUnlocatedExcel');
    if (btnExportUnlocatedExcel) {
      btnExportUnlocatedExcel.addEventListener('click', () => this.exportUnlocatedToExcel());
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.toggle('active', section.id === `tab-${tabId}`);
    });

    if (tabId === 'map') {
      setTimeout(() => {
        this.geoMap.initMap();
        this.geoMap.renderMarkers(this.store);
      }, 150);
    } else if (tabId === 'companies') {
      this.applyCompanyFilters();
    } else if (tabId === 'analytics') {
      this.charts.updateAll(this.store);
    } else if (tabId === 'catalog') {
      this.renderCBMPACatalog();
    }

    if (window.lucide) lucide.createIcons();
  }

  renderCBMPACatalog(groupFilter = 'all', searchQuery = '') {
    const tbody = document.getElementById('cbmpaCatalogTableBody');
    if (!tbody || typeof CBMPA_DIVISIONS_CATALOG === 'undefined') return;

    const q = (searchQuery || '').toLowerCase().trim();
    let list = Object.values(CBMPA_DIVISIONS_CATALOG);

    if (groupFilter !== 'all') {
      list = list.filter(item => item.grupo === groupFilter);
    }

    if (q) {
      list = list.filter(item => 
        item.divisao.toLowerCase().includes(q) ||
        item.grupo.toLowerCase().includes(q) ||
        item.grupoNome.toLowerCase().includes(q) ||
        item.descricao.toLowerCase().includes(q) ||
        item.exemplos.toLowerCase().includes(q)
      );
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-dim);">
            Nenhuma divisão encontrada para o termo pesquisado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(item => `
      <tr>
        <td><strong style="color: var(--cbmpa-gold); font-size: 0.95rem;">${item.grupo}</strong></td>
        <td><strong>${item.grupoNome}</strong></td>
        <td><span class="tab-tag" style="font-weight: 700;">${item.divisao}</span></td>
        <td><div style="font-weight: 600; color: var(--text-main);">${item.descricao}</div></td>
        <td style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">${item.exemplos}</td>
      </tr>
    `).join('');
  }

  async syncLiveSheet(manual = false) {
    const overlay = document.getElementById('loadingOverlay');
    const progressText = document.getElementById('loadingProgressText');
    const syncStatus = document.getElementById('liveSyncStatus');
    const syncTime = document.getElementById('lastSyncTime');
    const urlInput = document.getElementById('settingSheetUrl');

    if (overlay && manual) {
      overlay.classList.remove('hidden');
    }

    try {
      const sheetUrl = urlInput ? urlInput.value : '';
      const data = await this.syncManager.syncFromGoogleSheets(sheetUrl, (msg) => {
        if (progressText) progressText.textContent = msg;
      });

      this.store.setData(data);

      if (syncStatus) {
        syncStatus.innerHTML = '<span class="pulse-dot"></span> Sincronizado';
        syncStatus.className = 'badge-live-pulse';
      }

      if (syncTime) {
        const now = new Date();
        syncTime.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }

      this.showToast(`Sincronização concluída: ${data.companies.length} empresas e ${data.vistorias.length} vistorias!`, 'success');
    } catch (err) {
      console.error('Erro na sincronização:', err);
      if (syncStatus) {
        syncStatus.innerHTML = 'Offline / Cache';
        syncStatus.className = 'badge-live-pulse badge-warning';
      }
      this.showToast('Erro ao conectar ao Google Planilhas. Usando dados locais.', 'error');
    } finally {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    }
  }

  loadFromCache() {
    try {
      const cached = localStorage.getItem('dgsci_data_cache');
      if (cached) {
        const data = JSON.parse(cached);
        this.store.setData(data);
        const syncTime = document.getElementById('lastSyncTime');
        if (syncTime && data.timestamp) {
          syncTime.textContent = new Date(data.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }
      }
    } catch (e) {
      console.warn('Erro ao ler cache local:', e);
    }
  }

  updateUI(store) {
    const navComp = document.getElementById('navCountCompanies');
    const sideRecords = document.getElementById('sidebarTotalRecords');

    if (navComp) navComp.textContent = store.companies.length;
    if (sideRecords) sideRecords.textContent = store.companies.length;

    this.updateOverviewKPIsAndCharts();
    this.tables.populateFilterDropdowns(store);
    this.applyCompanyFilters();
    this.charts.updateAll(store);

    // Atualiza mapa caso já esteja inicializado
    if (this.geoMap.map) {
      this.geoMap.renderMarkers(store);
    }

    if (window.lucide) lucide.createIcons();
  }

  updateOverviewKPIsAndCharts() {
    const groupFilter = document.getElementById('overviewGroupFilter')?.value || 'all';
    const kpis = this.store.getKPIs(groupFilter);

    const totalEl = document.getElementById('kpiTotalCompanies');
    const regEl = document.getElementById('kpiRegular');
    const regPct = document.getElementById('kpiRegularPct');
    const vencEl = document.getElementById('kpiVencidos');
    const vencPct = document.getElementById('kpiVencidosPct');
    const parEl = document.getElementById('kpiParados');
    const parPct = document.getElementById('kpiParadosPct');
    const desatEl = document.getElementById('kpiDesativados');
    const desatPct = document.getElementById('kpiDesativadosPct');

    if (totalEl) totalEl.textContent = kpis.total;
    if (regEl) regEl.textContent = kpis.regular;
    if (regPct) regPct.textContent = `${kpis.regularPct}%`;
    if (vencEl) vencEl.textContent = kpis.vencidos;
    if (vencPct) vencPct.textContent = `${kpis.vencidosPct}%`;
    if (parEl) parEl.textContent = kpis.parados;
    if (parPct) parPct.textContent = `${kpis.paradosPct}%`;
    if (desatEl) desatEl.textContent = kpis.desativados;
    if (desatPct) desatPct.textContent = `${kpis.desativadosPct}%`;

    this.charts.renderSituationChart(this.store, groupFilter);
    this.charts.renderNeighborhoodsChart(this.store);
    this.charts.renderRiskAndGroupChart(this.store);
  }

  applyCompanyFilters() {
    const search = document.getElementById('companySearchInput')?.value || '';
    const situation = document.getElementById('filterSituation')?.value || '';
    const sector = document.getElementById('filterSector')?.value || '';
    const division = document.getElementById('filterGroup')?.value || '';
    const bairro = document.getElementById('filterNeighborhood')?.value || '';
    const risk = document.getElementById('filterRisk')?.value || '';

    this.tables.renderCompaniesTable(this.store, {
      search,
      situation,
      sector,
      division,
      bairro,
      risk
    });
  }

  setupDropzone() {
    const dropzone = document.getElementById('excelDropzone');
    const fileInput = document.getElementById('excelFileInput');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        await this.handleLocalFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', async () => {
      if (fileInput.files.length > 0) {
        await this.handleLocalFile(fileInput.files[0]);
      }
    });
  }

  async handleLocalFile(file) {
    const overlay = document.getElementById('loadingOverlay');
    const progressText = document.getElementById('loadingProgressText');

    if (overlay) overlay.classList.remove('hidden');
    if (progressText) progressText.textContent = `Processando arquivo ${file.name}...`;

    try {
      const data = await this.syncManager.parseLocalExcelFile(file);
      this.store.setData(data);
      this.showToast(`Arquivo local processado: ${data.companies.length} empresas carregadas!`, 'success');
    } catch (err) {
      console.error(err);
      this.showToast('Erro ao ler arquivo Excel/CSV local.', 'error');
    } finally {
      if (overlay) overlay.classList.add('hidden');
    }
  }

  exportCompaniesToExcel() {
    if (typeof XLSX === 'undefined') {
      this.showToast('Biblioteca SheetJS não carregada.', 'error');
      return;
    }

    const items = this.tables.currentFilteredCompanies || this.store.companies;
    const cleanData = items.map(c => ({
      'PASTA': c.pasta,
      'RAZÃO SOCIAL': c.razao,
      'CNPJ': c.cnpj,
      'CNAE': c.cnae,
      'DESCRIÇÃO': c.descricao,
      'ENDEREÇO': c.endereco,
      'BAIRRO': c.bairro,
      'CEP': c.cep,
      'SETOR': c.setor,
      'GRUPO': c.grupo,
      'DIVISÃO': c.divisao,
      'ÁREA (m²)': c.area,
      'PAVIMENTOS': c.pavimentos,
      'CARGA INCÊNDIO': c.cargaIncendio,
      'RISCO': c.risco,
      'PROJETO APROVADO': c.projetoAprovado,
      'PROTOCOLO PROJETO': c.protocoloProjeto,
      'SITUAÇÃO': c.situacao,
      'OBSERVAÇÃO': c.observacao
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estabelecimentos_DGSCI');
    XLSX.writeFile(wb, `DGSCI_Estabelecimentos_${new Date().toISOString().slice(0, 10)}.xlsx`);
    this.showToast('Planilha Excel exportada com sucesso!', 'success');
  }

  exportInspectionsToExcel() {
    if (typeof XLSX === 'undefined') return;

    const cleanData = this.store.vistorias.map(v => ({
      'Nº': v.numero,
      'PROTOCOLO': v.protocolo,
      'TIPO': v.tipo,
      'CNPJ/CPF': v.cnpj,
      'DATA AGENDADA': v.dataAgendada,
      'VISTORIADOR PRINCIPAL': v.vistoriador,
      'VISTORIADOR AUXILIAR': v.auxiliar,
      'DATA EXECUÇÃO': v.dataExecucao,
      'PARECER': v.parecer,
      'SITUAÇÃO': v.situacao,
      'OBSERVAÇÃO': v.observacao
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vistorias_DGSCI');
    XLSX.writeFile(wb, `DGSCI_Vistorias_${new Date().toISOString().slice(0, 10)}.xlsx`);
    this.showToast('Vistorias exportadas para Excel!', 'success');
  }

  exportUnlocatedToExcel() {
    if (typeof XLSX === 'undefined') return;

    const unlocated = this.geoMap.unlocatedCompanies || [];
    if (unlocated.length === 0) {
      this.showToast('Nenhum estabelecimento sem localização encontrado.', 'info');
      return;
    }

    const cleanData = unlocated.map(c => ({
      'PASTA': c.pasta,
      'ABA / DIVISÃO': `${c.divisao} (${c.tab})`,
      'RAZÃO SOCIAL': c.razao,
      'CNPJ': c.cnpj,
      'ENDEREÇO ATUAL': c.endereco,
      'BAIRRO ATUAL (INCOMPLETO/VAZIO)': c.bairro,
      'SITUAÇÃO': c.situacao,
      'OBSERVAÇÃO': c.observacao
    }));

    const ws = XLSX.utils.json_to_sheet(cleanData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pendentes_Geolocalizacao');
    XLSX.writeFile(wb, `DGSCI_Pendentes_Endereco_${new Date().toISOString().slice(0, 10)}.xlsx`);
    this.showToast(`${unlocated.length} estabelecimentos pendentes exportados para Excel!`, 'success');
  }

  /**
   * Impressão Oficial de Ficha Cadastral / Vistoria Individual em Folha Única A4 (via Iframe Isolado)
   */
  printSingleCompanyDossier(company) {
    if (!company) {
      this.showToast('Nenhum estabelecimento selecionado para impressão.', 'error');
      return;
    }

    const relatedVistorias = this.store ? this.store.vistorias.filter(v => v.cnpj && company.cnpj && v.cnpj === company.cnpj) : [];

    const printHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Ficha_CBMPA_${(company.razao || 'Estabelecimento').replace(/[^a-zA-Z0-9]/g, '_')}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      line-height: 1.35;
      color: #000;
      background: #fff;
      padding: 0;
    }
    .print-container {
      width: 100%;
    }
    .header-bar {
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-titles h1 {
      font-size: 12pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #000;
    }
    .header-titles h2 {
      font-size: 8.5pt;
      font-weight: bold;
      color: #222;
      margin-top: 2px;
    }
    .header-titles h3 {
      font-size: 7.5pt;
      color: #444;
      margin-top: 1px;
    }
    .header-meta {
      text-align: right;
      font-size: 7.5pt;
      color: #333;
      line-height: 1.3;
    }
    .company-card {
      margin-top: 10px;
      background: #f4f4f4;
      border: 1px solid #999;
      border-radius: 4px;
      padding: 8px 10px;
    }
    .company-name {
      font-size: 11pt;
      font-weight: 800;
      color: #000;
    }
    .company-sub {
      font-size: 8.5pt;
      color: #222;
      margin-top: 3px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 8pt;
    }
    .data-table td {
      border: 1px solid #888;
      padding: 5px 7px;
      vertical-align: top;
    }
    .section-heading {
      font-size: 8.5pt;
      font-weight: 800;
      border-bottom: 1px solid #888;
      padding-bottom: 2px;
      margin-top: 12px;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .sub-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5pt;
    }
    .sub-table th {
      background: #e8e8e8;
      border: 1px solid #888;
      padding: 4px 6px;
      text-align: left;
      font-weight: bold;
    }
    .sub-table td {
      border: 1px solid #888;
      padding: 4px 6px;
    }
  </style>
</head>
<body>
  <div class="print-container">
    <div class="header-bar">
      <div class="header-titles">
        <h1>CORPO DE BOMBEIROS MILITAR DO PARÁ</h1>
        <h2>DEPARTAMENTO-GERAL DE SEGURANÇA CONTRA INCÊNDIO E EMERGÊNCIAS (DGSCI)</h2>
        <h3>FICHA CADASTRAL E HISTÓRICO DE FISCALIZAÇÃO</h3>
      </div>
      <div class="header-meta">
        <div><strong>EMISSÃO:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
        <div><strong>DIVISÃO CBMPA:</strong> ${company.divisao || '-'} • <strong>REG:</strong> #${company.itemNum || company.pasta}</div>
      </div>
    </div>

    <div class="company-card">
      <div class="company-name">${company.razao}</div>
      <div class="company-sub">
        <strong>CNPJ / CPF:</strong> ${company.cnpj || 'Não informado'} &nbsp;|&nbsp; 
        <strong>CNAE:</strong> ${company.cnae || '-'} - ${company.descricao || 'Atividade geral'}
      </div>
    </div>

    <table class="data-table">
      <tbody>
        <tr>
          <td style="width: 50%;"><strong>Situação Cadastral:</strong> <span style="font-weight: 800;">${company.situacao}</span></td>
          <td style="width: 50%;"><strong>Setor Operacional CBMPA:</strong> <span style="font-weight: 800;">${company.setor || '-'} (${company.setorCor || 'Geral'})</span></td>
        </tr>
        <tr>
          <td colspan="2"><strong>Endereço Completo:</strong> ${company.endereco || '-'} — <strong>Bairro: ${company.bairro}</strong> ${company.cep ? `(CEP: ${company.cep})` : ''}</td>
        </tr>
        <tr>
          <td><strong>Classificação CBMPA:</strong> Grupo ${company.grupo || '-'} (${company.grupoNome || '-'}) • Divisão <strong>${company.divisao}</strong></td>
          <td><strong>Área & Pavimentos:</strong> ${company.area || 'N/I'} • ${company.pavimentos || '1'} pav.</td>
        </tr>
        <tr>
          <td><strong>Carga de Incêndio:</strong> ${company.cargaDisplay || company.cargaIncendio + ' MJ/m²'}</td>
          <td><strong>Grau de Risco Declarado:</strong> <span style="font-weight: 800;">${company.risco || 'BAIXO'}</span></td>
        </tr>
        <tr>
          <td><strong>Projeto Aprovado no CBMPA:</strong> ${company.projetoAprovado || 'NÃO'}</td>
          <td><strong>Protocolo de Aprovação:</strong> ${company.protocoloProjeto || 'Não informado'}</td>
        </tr>
        ${company.divisaoDescricao ? `
        <tr>
          <td colspan="2">
            <strong>Descrição da Divisão CBMPA:</strong> ${company.divisaoDescricao}
            ${company.divisaoExemplos ? `<br><span style="color: #444; font-size: 7.5pt;">Exemplos da norma: ${company.divisaoExemplos}</span>` : ''}
          </td>
        </tr>
        ` : ''}
        ${company.observacao ? `
        <tr>
          <td colspan="2" style="background: #fff8e6;"><strong>Observações / Pendências:</strong> ${company.observacao}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>
  </div>
</body>
</html>
    `;

    let printFrame = document.getElementById('companyPrintIframe');
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'companyPrintIframe';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(printHtml);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();
    }, 250);
  }

  setupThemeToggle() {
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('dgsci_theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(themeIcon, savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('dgsci_theme', next);
        this.updateThemeIcon(themeIcon, next);

        this.charts.updateAll(this.store);
        if (this.geoMap.map) {
          this.geoMap.initMap();
        }
      });
    }
  }

  updateThemeIcon(iconEl, theme) {
    if (!iconEl) return;
    if (theme === 'light') {
      iconEl.setAttribute('data-lucide', 'moon');
    } else {
      iconEl.setAttribute('data-lucide', 'sun');
    }
    if (window.lucide) lucide.createIcons();
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle-2';
    if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  setupAutoSync() {
    const intervalSelect = document.getElementById('settingAutoSyncInterval');
    const schedule = () => {
      if (this.autoSyncTimer) clearInterval(this.autoSyncTimer);

      const minutes = parseInt(intervalSelect ? intervalSelect.value : '15', 10);
      if (minutes > 0) {
        this.autoSyncTimer = setInterval(() => {
          console.log(`[AutoSync] Sincronizando com Google Sheets (${minutes} min)...`);
          this.syncLiveSheet(false);
        }, minutes * 60 * 1000);
      }
    };

    if (intervalSelect) {
      intervalSelect.addEventListener('change', schedule);
    }
    schedule();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new DashboardApp();
});
