/**
 * DGSCI / CBMPA - Table & Modal Manager
 * Gerencia renderização, paginação, busca, modais de detalhes e cópia rápida para o SISGAT.
 */

class TableManager {
  constructor() {
    this.currentPage = 1;
    this.pageSize = 15;
    this.sortCol = 'pasta';
    this.sortAsc = true;
    this.currentFilteredCompanies = [];
    this.viewMode = 'cards'; // Padrão: Modo Cards para melhor visualização mobile e desktop
    this._viewModeSetup = false;
  }

  setupViewModeToggle() {
    if (this._viewModeSetup) return;
    const btnCards = document.getElementById('btnViewCards');
    const btnTable = document.getElementById('btnViewTable');
    if (!btnCards || !btnTable) return;
    this._viewModeSetup = true;

    btnCards.addEventListener('click', () => this.setViewMode('cards'));
    btnTable.addEventListener('click', () => this.setViewMode('table'));
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const btnCards = document.getElementById('btnViewCards');
    const btnTable = document.getElementById('btnViewTable');
    const cardsContainer = document.getElementById('companiesCardsContainer');
    const tableWrapper = document.getElementById('companiesTableWrapper');

    if (btnCards) btnCards.classList.toggle('active', mode === 'cards');
    if (btnTable) btnTable.classList.toggle('active', mode === 'table');

    if (cardsContainer) cardsContainer.style.display = mode === 'cards' ? 'grid' : 'none';
    if (tableWrapper) tableWrapper.style.display = mode === 'table' ? 'block' : 'none';
  }

  renderCompaniesTable(store, filters = {}) {
    const tbody = document.getElementById('companiesTableBody');
    if (!tbody) return;

    let items = [...store.companies];

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(c => 
        (c.razao && c.razao.toLowerCase().includes(q)) ||
        (c.cnpj && c.cnpj.includes(q)) ||
        (c.endereco && c.endereco.toLowerCase().includes(q)) ||
        (c.bairro && c.bairro.toLowerCase().includes(q)) ||
        (c.pasta && c.pasta.toLowerCase().includes(q)) ||
        (c.protocoloProjeto && c.protocoloProjeto.toLowerCase().includes(q))
      );
    }

    if (filters.situation) {
      items = items.filter(c => c.normalizedStatus === filters.situation || c.situacao.toUpperCase().includes(filters.situation.toUpperCase()));
    }

    if (filters.division) {
      items = items.filter(c => c.divisao === filters.division || c.tab === filters.division);
    }

    if (filters.bairro) {
      items = items.filter(c => c.bairro === filters.bairro);
    }

    if (filters.sector) {
      items = items.filter(c => c.setor === filters.sector || c.setorNome === filters.sector);
    }

    items.sort((a, b) => {
      let valA = (a[this.sortCol] || '').toString();
      let valB = (b[this.sortCol] || '').toString();
      return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    this.currentFilteredCompanies = items;

    const countEl = document.getElementById('companyResultsCount');
    if (countEl) {
      countEl.textContent = `Exibindo ${items.length} estabelecimentos encontrados`;
    }

    const totalPages = Math.ceil(items.length / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = 1;

    const start = (this.currentPage - 1) * this.pageSize;
    const paginated = items.slice(start, start + this.pageSize);

    this.setupViewModeToggle();
    const cardsContainer = document.getElementById('companiesCardsContainer');
    const tableWrapper = document.getElementById('companiesTableWrapper');

    if (cardsContainer && tableWrapper) {
      cardsContainer.style.display = this.viewMode === 'cards' ? 'grid' : 'none';
      tableWrapper.style.display = this.viewMode === 'table' ? 'block' : 'none';
    }

    if (paginated.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 2.5rem; color: var(--text-dim);">
            <i data-lucide="inbox" style="width: 36px; height: 36px; margin: 0 auto 0.5rem auto; display: block;"></i>
            Nenhum estabelecimento encontrado com os filtros selecionados.
          </td>
        </tr>
      `;
      if (cardsContainer) {
        cardsContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-dim);">
            <i data-lucide="inbox" style="width: 44px; height: 44px; margin: 0 auto 0.75rem auto; display: block; opacity: 0.6;"></i>
            <h4 style="color: var(--text-main); margin-bottom: 0.35rem;">Nenhum estabelecimento encontrado</h4>
            <p style="font-size: 0.85rem;">Tente ajustar os filtros ou os termos de busca acima.</p>
          </div>
        `;
      }
      if (window.lucide) lucide.createIcons();
      this.renderPagination(totalPages);
      return;
    }

    // 1. Renderiza a tabela clássica
    tbody.innerHTML = paginated.map(c => `
      <tr>
        <td><strong>#${this.escape(c.itemNum || c.pasta)}</strong></td>
        <td>
          <div style="font-weight: 600;">${this.escape(c.razao)}</div>
          ${c.cnae ? `<div style="font-size: 0.72rem; color: var(--text-dim);">CNAE: ${this.escape(c.cnae)}</div>` : ''}
        </td>
        <td><code>${this.escape(c.cnpj || '-')}</code></td>
        <td>
          <div>${this.escape(c.bairro)}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${this.escape(c.endereco || '-')}
          </div>
        </td>
        <td>${this.renderSectorBadge(c)}</td>
        <td><span class="tab-tag" style="padding: 0.15rem 0.45rem;">${this.escape(c.divisao)}</span></td>
        <td>
          <div>${this.renderRiskBadge(c.risco)}</div>
          <div style="font-size: 0.70rem; color: var(--text-dim); margin-top: 2px;">${c.cargaIncendio > 0 ? `${c.cargaIncendio} MJ/m²` : '-'}</div>
        </td>
        <td>${c.projetoAprovado && c.projetoAprovado.toUpperCase().includes('SIM') ? 
          '<span class="badge badge-success">SIM</span>' : '<span class="badge badge-neutral">NÃO</span>'}</td>
        <td>${this.renderStatusBadge(c.situacao, c.normalizedStatus)}</td>
        <td>
          <button class="btn btn-sm btn-outline btn-view-company" data-id="${c.id}" title="Ver Ficha Completa">
            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // 2. Renderiza os Cards Táticos Modernos
    if (cardsContainer) {
      cardsContainer.innerHTML = paginated.map(c => this.renderCompanyCardHtml(c)).join('');
    }

    if (window.lucide) lucide.createIcons();
    this.renderPagination(totalPages);

    // Eventos compartilhados para Tabela e Cards
    document.querySelectorAll('.btn-view-company').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const company = store.companies.find(item => item.id === id);
        if (company) this.openCompanyModal(company, store);
      });
    });

    document.querySelectorAll('.btn-locate-company').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const company = store.companies.find(item => item.id === id);
        if (company && window.app) {
          window.app.switchTab('map');
          setTimeout(() => {
            if (window.app.geoMap) {
              window.app.geoMap.selectStore(company);
            }
          }, 300);
        }
      });
    });

    document.querySelectorAll('.btn-print-company-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const company = store.companies.find(item => item.id === id);
        if (company && window.app) {
          window.app.printSingleCompanyDossier(company);
        }
      });
    });

    document.querySelectorAll('.btn-copy-cnpj').forEach(el => {
      el.addEventListener('click', () => {
        const cnpj = el.getAttribute('data-cnpj');
        if (cnpj && cnpj !== 'Sem CNPJ') {
          navigator.clipboard.writeText(cnpj);
          if (window.app) window.app.showToast(`CNPJ ${cnpj} copiado para a área de transferência!`, 'success');
        }
      });
    });
  }

  getStatusColor(normalized) {
    if (normalized === 'REGULAR') return '#10B981';
    if (normalized === 'VENCIDO') return '#EF4444';
    if (normalized === 'PARADO') return '#F59E0B';
    if (normalized === 'SEM_SISGAT') return '#8B5CF6';
    return '#64748B';
  }

  getStatusBadgeClass(normalized) {
    if (normalized === 'REGULAR') return 'success';
    if (normalized === 'VENCIDO') return 'danger';
    if (normalized === 'PARADO') return 'warning';
    if (normalized === 'SEM_SISGAT') return 'purple';
    return 'neutral';
  }

  renderCompanyCardHtml(c) {
    const statusColor = this.getStatusColor(c.normalizedStatus);
    const borderLeftColor = c.setorHex || statusColor;
    return `
      <div class="company-card-tactical" id="company-card-${c.id}" data-company-id="${c.id}" style="border-left: 4px solid ${borderLeftColor};">
        <div class="company-card-header">
          <div class="company-card-tags">
            <span class="tab-tag" style="font-weight: 700;">${this.escape(c.divisao)}</span>
            <span class="company-card-reg">#${this.escape(c.itemNum || c.pasta)}</span>
          </div>
          ${this.renderStatusBadge(c.situacao, c.normalizedStatus)}
        </div>

        <div class="company-card-body">
          <h3 class="company-card-title" title="${this.escape(c.razao)}">${this.escape(c.razao)}</h3>
          
          <div class="company-card-meta-row">
            <span class="company-card-cnpj btn-copy-cnpj" data-cnpj="${this.escape(c.cnpj || '')}" title="Clique para copiar CNPJ">
              <i data-lucide="copy" style="width: 13px; height: 13px;"></i>
              <code>${this.escape(c.cnpj || 'Sem CNPJ')}</code>
            </span>
            ${c.cnae ? `<span class="company-card-cnae" title="CNAE: ${this.escape(c.cnae)}"><i data-lucide="briefcase" style="width: 13px; height: 13px;"></i> ${this.escape(c.cnae)}</span>` : ''}
          </div>

          <div class="company-card-address">
            <i data-lucide="map-pin"></i>
            <span>${this.escape(c.endereco || 'Endereço não informado')} • <strong>${this.escape(c.bairro || 'Belém')}</strong></span>
          </div>

          <div class="company-card-metrics">
            <div class="card-metric-pill" style="border-color: ${c.setorHex || 'var(--border-color)'};">
              <span class="metric-label">Setor</span>
              <span class="metric-val" style="color: ${c.setorHex || 'var(--text-main)'}; font-weight: 700;">${this.escape(c.setor || '-')}</span>
            </div>

            <div class="card-metric-pill">
              <span class="metric-label">Carga Incêndio</span>
              <span class="metric-val">${c.cargaIncendio > 0 ? `${c.cargaIncendio} MJ/m²` : '-'} (${c.risco || 'BAIXO'})</span>
            </div>

            <div class="card-metric-pill">
              <span class="metric-label">Proj. Aprovado</span>
              <span class="metric-val">${c.projetoAprovado && c.projetoAprovado.toUpperCase().includes('SIM') ? '🟢 SIM' : '⚪ NÃO'}</span>
            </div>
          </div>
        </div>

        <div class="company-card-actions">
          <button class="btn btn-sm btn-outline btn-locate-company" data-id="${c.id}" title="Localizar no Mapa">
            <i data-lucide="map" style="width: 14px; height: 14px;"></i>
            <span>Ver no Mapa</span>
          </button>
          <button class="btn btn-sm btn-primary btn-view-company" data-id="${c.id}" title="Abrir Ficha Completa">
            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
            <span>Ficha</span>
          </button>
          <button class="btn btn-sm btn-outline btn-print-company-quick" data-id="${c.id}" title="Imprimir Dossiê A4">
            <i data-lucide="printer" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      </div>
    `;
  }


  renderPagination(totalPages) {
    const container = document.getElementById('companyPagination');
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = `
      <button class="btn-page" id="btnPrevPage" ${this.currentPage === 1 ? 'disabled' : ''}>&laquo; Anterior</button>
      <span style="font-size: 0.78rem; padding: 0 0.5rem;">Página <strong>${this.currentPage}</strong> de <strong>${totalPages}</strong></span>
      <button class="btn-page" id="btnNextPage" ${this.currentPage === totalPages ? 'disabled' : ''}>Próxima &raquo;</button>
    `;
    container.innerHTML = html;

    const prev = document.getElementById('btnPrevPage');
    const next = document.getElementById('btnNextPage');

    if (prev) {
      prev.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          window.app.applyCompanyFilters();
        }
      });
    }
    if (next) {
      next.addEventListener('click', () => {
        if (this.currentPage < totalPages) {
          this.currentPage++;
          window.app.applyCompanyFilters();
        }
      });
    }
  }

  openCompanyModal(company, store) {
    this.currentCompany = company;
    window.activeCompanyForPrint = company;

    const modal = document.getElementById('companyDetailModal');
    const nameEl = document.getElementById('modalCompanyName');
    const cnpjEl = document.getElementById('modalCompanyCnpj');
    const bodyEl = document.getElementById('modalCompanyDetailsBody');

    if (!modal || !bodyEl) return;

    nameEl.textContent = company.razao;
    cnpjEl.textContent = `CNPJ / CPF: ${company.cnpj || 'Não informado'} • Cadastro na Divisão ${company.divisao}: Item #${company.itemNum || company.pasta}`;

    bodyEl.innerHTML = `
      <div class="dossier-grid">
        <div class="dossier-item">
          <span class="dossier-label">Situação Cadastral / Licença</span>
          <span class="dossier-value">${this.renderStatusBadge(company.situacao, company.normalizedStatus)}</span>
        </div>

        <div class="dossier-item">
          <span class="dossier-label">Setor Operacional Oficial CBMPA</span>
          <span class="dossier-value">${this.renderSectorBadge(company)}</span>
        </div>

        <div class="dossier-item">
          <span class="dossier-label">Grau de Risco & Carga Incêndio</span>
          <span class="dossier-value">${this.renderRiskBadge(company.risco)} • <strong>${this.escape(company.cargaDisplay || company.cargaIncendio + ' MJ/m²')}</strong></span>
        </div>

        <div class="dossier-item">
          <span class="dossier-label">Classificação CBMPA (A-1 a N-1)</span>
          <span class="dossier-value">Grupo ${this.escape(company.grupo)} (${this.escape(company.grupoNome || 'Ocupação')}) • Divisão <strong>${this.escape(company.divisao)}</strong></span>
        </div>

        <div class="dossier-item">
          <span class="dossier-label">Descrição Oficial da Divisão</span>
          <span class="dossier-value" style="color: var(--cbmpa-gold); font-weight: 600;">${this.escape(company.divisaoDescricao || 'Conforme Instrução Técnica CBMPA')}</span>
        </div>

        <div class="dossier-item dossier-full-span">
          <span class="dossier-label">Exemplos da Norma Técnica para esta Divisão</span>
          <span class="dossier-value" style="font-size: 0.80rem; color: var(--text-muted); line-height: 1.4;">${this.escape(company.divisaoExemplos || '-')}</span>
        </div>

        <div class="dossier-item">
          <span class="dossier-label">Área & Pavimentos</span>
          <span class="dossier-value">${this.escape(company.area || 'N/I')} • ${this.escape(company.pavimentos || '1')} pav.</span>
        </div>

        <div class="dossier-item">
          <span class="dossier-label">Status do Cadastro</span>
          <span class="dossier-value">${this.escape(company.statusAtivo || 'ATIVO')} • Item #${this.escape(company.itemNum || company.pasta)}</span>
        </div>

        <div class="dossier-item dossier-full-span">
          <span class="dossier-label">Endereço Completo, Bairro & Nº</span>
          <span class="dossier-value">${this.escape(company.endereco || '-')} — <strong>Nº ${this.escape(company.numeroImovel || 'S/N')}</strong> — <strong>${this.escape(company.bairro)}</strong> ${company.cep ? `(CEP: ${this.escape(company.cep)})` : ''}</span>
        </div>

        <div class="dossier-item dossier-full-span">
          <span class="dossier-label">Atividade Econômica / CNAE</span>
          <span class="dossier-value"><strong>${this.escape(company.cnae || '-')}</strong> - ${this.escape(company.descricao || '-')}</span>
        </div>

        <div class="dossier-item">
          <span class="dossier-label">Projeto Aprovado no CBMPA</span>
          <span class="dossier-value">${this.escape(company.projetoAprovado || 'NÃO')} ${company.protocoloProjeto ? `(Protocolo: ${this.escape(company.protocoloProjeto)})` : ''}</span>
        </div>

        <div class="dossier-item">
          <span class="dossier-label">Norma Técnica de Carga de Incêndio</span>
          <span class="dossier-value" style="font-size: 0.76rem; color: var(--text-dim);">
            ${company.cargaIncendio <= 300 ? 'Até 300 MJ/m² (Risco Baixo)' : (company.cargaIncendio <= 1200 ? '300,01 a 1200 MJ/m² (Risco Médio)' : 'Acima de 1200 MJ/m² (Risco Alto)')}
          </span>
        </div>

        <div class="dossier-item dossier-full-span">
          <span class="dossier-label">Observações Técnicas da DGSCI</span>
          <span class="dossier-value" style="color: var(--cbmpa-gold); font-weight: 600;">${this.escape(company.observacao || 'Nenhuma observação registrada.')}</span>
        </div>
      </div>

      <div class="mt-6 flex gap-2">
        <button class="btn btn-sm btn-outline" id="btnCopyCnpj" title="Copiar CNPJ para busca no SISGAT">
          <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Copiar CNPJ para o SISGAT
        </button>
      </div>
    `;

    const copyBtn = document.getElementById('btnCopyCnpj');
    if (copyBtn) {
      copyBtn.onclick = () => {
        if (company.cnpj) {
          navigator.clipboard.writeText(company.cnpj);
          window.app.showToast(`CNPJ ${company.cnpj} copiado para a área de transferência!`, 'success');
        } else {
          window.app.showToast('Empresa sem CNPJ cadastrado.', 'info');
        }
      };
    }

    const printBtn = document.getElementById('btnPrintCompanyDossier');
    if (printBtn) {
      printBtn.onclick = () => {
        if (window.app && typeof window.app.printSingleCompanyDossier === 'function') {
          window.app.printSingleCompanyDossier(company);
        }
      };
    }

    modal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  }

  populateFilterDropdowns(store) {
    const groupSelect = document.getElementById('filterGroup');
    if (groupSelect) {
      if (typeof CBMPA_DIVISIONS_CATALOG !== 'undefined') {
        groupSelect.innerHTML = '<option value="">Todas as Divisões (A-1 a N-1)</option>' +
          Object.values(CBMPA_DIVISIONS_CATALOG).map(d => 
            `<option value="${d.divisao}">Divisão ${d.divisao} — ${d.descricao} (${d.grupoNome})</option>`
          ).join('');
      } else {
        const divisions = [...new Set(store.companies.map(c => c.divisao).filter(Boolean))].filter(d => /^[A-Z]-\d+$/i.test(d)).sort();
        groupSelect.innerHTML = '<option value="">Todas as Divisões (A-1 a N-1)</option>' +
          divisions.map(d => `<option value="${d}">Divisão ${d}</option>`).join('');
      }
    }

    const sectorSelect = document.getElementById('filterSector');
    if (sectorSelect) {
      sectorSelect.innerHTML = `
        <option value="">Todos os Setores Operacionais</option>
        <option value="SETOR I">🟡 SETOR I (Cidade Velha, Campina, Comércio)</option>
        <option value="SETOR II">🔵 SETOR II (Batista Campos, Jurunas, Cremação, Condor)</option>
        <option value="SETOR III">⚪ SETOR III (Reduto, Umarizal, Fátima, Nazaré, São Brás)</option>
        <option value="SETOR IV">🟢 SETOR IV (Marco, Canudos, Guamá, Utinga)</option>
        <option value="SETOR V">🌸 SETOR V (Telégrafo, Sacramenta, Pedreira)</option>
        <option value="SETOR VI">🟠 SETOR VI (Marambaia, Souza, Mangueirão, RMB)</option>
      `;
    }

    const bairroSelect = document.getElementById('filterNeighborhood');
    if (bairroSelect) {
      const bairros = [...new Set(store.companies.map(c => c.bairro).filter(b => b && b !== 'NÃO INFORMADO'))].sort();
      bairroSelect.innerHTML = '<option value="">Todos os Bairros</option>' +
        bairros.map(b => `<option value="${b}">${b}</option>`).join('');
    }

    const inspectorSelect = document.getElementById('filterInspector');
    if (inspectorSelect) {
      const inspectors = [...new Set(store.vistorias.map(v => v.vistoriador).filter(i => i && i !== 'NÃO INFORMADO' && i !== '-'))].sort();
      inspectorSelect.innerHTML = '<option value="">Todos os Vistoriadores</option>' +
        inspectors.map(i => `<option value="${i}">${i}</option>`).join('');
    }

    const cloud = document.getElementById('mappedTabsCloud');
    if (cloud && store.loadedTabs) {
      cloud.innerHTML = store.loadedTabs.map(t => `
        <div class="tab-tag">
          <i data-lucide="${t.type === 'vistorias' ? 'clipboard' : 'layers'}" style="width: 14px; height: 14px;"></i>
          <strong>${t.name}</strong>: ${t.count} registros
        </div>
      `).join('');
      if (window.lucide) lucide.createIcons();
    }
  }

  renderSectorBadge(company) {
    const setor = (company.setor || 'SETOR III').toUpperCase();
    let badgeClass = 'badge-sector-iii';
    let dotColor = '#F8FAFC';
    let label = 'SETOR III (BRANCO)';

    if (setor.includes('I') && !setor.includes('II') && !setor.includes('IV') && !setor.includes('V') && !setor.includes('VI')) {
      badgeClass = 'badge-sector-i';
      dotColor = '#EAB308';
      label = 'SETOR I (AMARELO)';
    } else if (setor.includes('II') && !setor.includes('III')) {
      badgeClass = 'badge-sector-ii';
      dotColor = '#3B82F6';
      label = 'SETOR II (AZUL)';
    } else if (setor.includes('III')) {
      badgeClass = 'badge-sector-iii';
      dotColor = '#F8FAFC';
      label = 'SETOR III (BRANCO)';
    } else if (setor.includes('IV')) {
      badgeClass = 'badge-sector-iv';
      dotColor = '#22C55E';
      label = 'SETOR IV (VERDE)';
    } else if (setor.includes('V') && !setor.includes('VI')) {
      badgeClass = 'badge-sector-v';
      dotColor = '#EC4899';
      label = 'SETOR V (ROSA)';
    } else if (setor.includes('VI')) {
      badgeClass = 'badge-sector-vi';
      dotColor = '#F97316';
      label = 'SETOR VI (LARANJA)';
    }

    return `
      <span class="badge-sector ${badgeClass}" title="${this.escape(company.setorNome || setor)}">
        <span class="sector-color-dot" style="background-color: ${dotColor};"></span>
        ${company.setor || 'SETOR III'}
      </span>
    `;
  }

  escape(str) {
    if (str === null || str === undefined) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  renderStatusBadge(situacao, normalized) {
    if (normalized === 'REGULAR') {
      return `<span class="badge badge-success">${this.escape(situacao)}</span>`;
    }
    if (normalized === 'VENCIDO') {
      return `<span class="badge badge-danger">${this.escape(situacao)}</span>`;
    }
    if (normalized === 'PARADO') {
      return `<span class="badge badge-warning">${this.escape(situacao)}</span>`;
    }
    if (normalized === 'SEM_SISGAT') {
      return `<span class="badge badge-purple">${this.escape(situacao)}</span>`;
    }
    return `<span class="badge badge-neutral">${this.escape(situacao)}</span>`;
  }

  renderRiskBadge(risco) {
    const r = (risco || 'BAIXO').toUpperCase();
    if (r === 'ALTO') return `<span class="risk-badge risk-alto">RISCO ALTO</span>`;
    if (r === 'MÉDIO' || r === 'MEDIO') return `<span class="risk-badge risk-medio">RISCO MÉDIO</span>`;
    return `<span class="risk-badge risk-baixo">RISCO BAIXO</span>`;
  }

  renderParecerBadge(parecer, normalized) {
    if (normalized === 'APROVADO') return `<span class="badge badge-success">${this.escape(parecer)}</span>`;
    if (normalized === 'REPROVADO') return `<span class="badge badge-danger">${this.escape(parecer)}</span>`;
    return `<span class="badge badge-warning">${this.escape(parecer)}</span>`;
  }

  getAlertCategoryBadge(c) {
    const s = c.situacao.toUpperCase();
    if (s.includes('VENCID')) return `<span class="badge badge-danger">CERTIFICADO VENCIDO</span>`;
    if (s.includes('INFRAÇÃO') || s.includes('INFRACAO')) return `<span class="badge badge-danger">AUTO DE INFRAÇÃO</span>`;
    if (s.includes('PARADO')) return `<span class="badge badge-warning">PROCESSO PARADO</span>`;
    if (s.includes('SISGAT')) return `<span class="badge badge-purple">SEM SISGAT</span>`;
    return `<span class="badge badge-danger">IRREGULAR</span>`;
  }
}

window.tableManager = new TableManager();
