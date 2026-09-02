/**
 * DGSCI / CBMPA - Official OpenStreetMap GIS Engine
 * Conexão direta com a base cartográfica oficial de logradouros do OpenStreetMap.
 * Registros sem logradouro oficial comprovado NUNCA são plotados no mapa.
 */

class GeoMapManager {
  constructor() {
    this.map = null;
    this.markersGroup = null;
    this.markerCluster = null;
    this.unlocatedCompanies = [];
    this.geolocatedCount = 0;
    this.verifiedStreets = {};
    this.isLoadedGis = false;
    this.colorMode = 'status'; // 'status' ou 'sector'

    this.loadVerifiedGIS();
  }

  async loadVerifiedGIS() {
    try {
      const res = await fetch('/verified_gis_streets.json?_t=' + Date.now());
      if (res.ok) {
        this.verifiedStreets = await res.json();
        this.isLoadedGis = true;
      }
    } catch (e) {
      console.warn('Carregando base de ruas em tempo de execução...');
    }
  }

  initMap(containerId = 'mapContainer') {
    const el = document.getElementById(containerId);
    if (!el || typeof L === 'undefined') return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    this.map = L.map(containerId, {
      center: [-1.4480, -48.4800],
      zoom: 13,
      zoomControl: true
    });

    const osmHot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });

    const osmStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Satélite HD',
      maxZoom: 18
    });

    osmHot.addTo(this.map);

    const baseMaps = {
      "🗺️ Mapa Urbano (OpenStreetMap)": osmHot,
      "🏢 Mapa Padrão (OSM)": osmStreet,
      "🛰️ Satélite HD (ESRI)": esriSatellite
    };

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(this.map);

    if (typeof L.markerClusterGroup !== 'undefined') {
      this.markerCluster = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 35,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
      });
      this.map.addLayer(this.markerCluster);
    } else {
      this.markersGroup = L.layerGroup().addTo(this.map);
    }

    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 300);
  }

  extractStreetName(rawAddress) {
    if (!rawAddress || rawAddress.length < 3) return null;
    let clean = rawAddress.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    clean = clean
      .replace(/(?:N[º°\.\s]*|NUMERO\s*|N\s+)\d+.*$/i, '')
      .replace(/\b\d{1,5}\b.*$/i, '')
      .replace(/LETRA:[A-Z0-9]/gi, '')
      .replace(/TERREO|ALTOS|BAIXOS|GALPAO|SALA\s*\d+|APTO\s*\d+|BL\s*\d+/gi, '')
      .replace(/ENTRE\s+.*$/gi, '')
      .replace(/ESQ\.\s+.*$/gi, '')
      .replace(/[.,;:\-\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    clean = clean.replace(/\bTV\b|\bTRAV\b|\bTR\b/g, 'TRAVESSA');
    clean = clean.replace(/\bAV\b|\bAVEN\b|\bAVENIDA\b/g, 'AVENIDA');
    clean = clean.replace(/\bR\b|\bRUAS?\b/g, 'RUA');
    clean = clean.replace(/\bROD\b/g, 'RODOVIA');
    clean = clean.replace(/\bPAS\b|\bPSG\b/g, 'PASSAGEM');
    clean = clean.replace(/\s+/g, ' ').trim();

    if (clean.length < 3) return null;
    return clean;
  }

  setColorMode(mode) {
    this.colorMode = mode;
    this.updateLegend();
    if (window.dataStore && window.dataStore.companies.length > 0) {
      this.renderMarkers(window.dataStore);
    }
  }

  updateLegend() {
    const legendEl = document.querySelector('.map-floating-legend');
    if (!legendEl) return;

    if (this.colorMode === 'sector') {
      legendEl.innerHTML = `
        <div class="legend-title">🛡️ Setores Operacionais CBMPA</div>
        <div class="legend-item"><span class="legend-dot" style="background: #EAB308;"></span> Setor I (Amarelo - C. Velha/Comércio)</div>
        <div class="legend-item"><span class="legend-dot" style="background: #3B82F6;"></span> Setor II (Azul - B. Campos/Jurunas)</div>
        <div class="legend-item"><span class="legend-dot" style="background: #F8FAFC; border: 1px solid #94A3B8;"></span> Setor III (Branco - Umarizal/Nazaré)</div>
        <div class="legend-item"><span class="legend-dot" style="background: #22C55E;"></span> Setor IV (Verde - Marco/Guamá)</div>
        <div class="legend-item"><span class="legend-dot" style="background: #EC4899;"></span> Setor V (Rosa - Telégrafo/Pedreira)</div>
        <div class="legend-item"><span class="legend-dot" style="background: #F97316;"></span> Setor VI (Laranja - Marambaia/RMB)</div>
      `;
    } else {
      legendEl.innerHTML = `
        <div class="legend-title">🚦 Situação de Licenciamento</div>
        <div class="legend-item"><span class="legend-dot" style="background: #10B981;"></span> Regular / Certificado Ativo</div>
        <div class="legend-item"><span class="legend-dot" style="background: #EF4444;"></span> Vencido / Notificado</div>
        <div class="legend-item"><span class="legend-dot" style="background: #F59E0B;"></span> Processo Parado</div>
        <div class="legend-item"><span class="legend-dot" style="background: #8B5CF6;"></span> Sem Cadastro SISGAT</div>
      `;
    }
  }

  async renderMarkers(store, filterStatus = 'all', filterRisk = 'all', filterSector = 'all', searchQuery = '') {
    if (!this.map) this.initMap();
    if (!this.map) return;

    if (!this.isLoadedGis) {
      await this.loadVerifiedGIS();
    }

    const layer = this.markerCluster || this.markersGroup;
    if (!layer) return;

    layer.clearLayers();

    const q = (searchQuery || '').toLowerCase().trim();
    let plottedCount = 0;
    this.unlocatedCompanies = [];
    const bounds = [];

    store.companies.forEach((company) => {
      let coords = null;
      const rawAddrUpper = (company.endereco || '').toUpperCase().trim();
      const streetName = this.extractStreetName(company.endereco);

      // 1. Busca por endereço com numeração completa ou logradouro limpo na base oficial OpenStreetMap
      let isExactNumbered = false;
      if (rawAddrUpper && this.verifiedStreets[rawAddrUpper]) {
        coords = this.verifiedStreets[rawAddrUpper];
        isExactNumbered = true;
      } else if (streetName && this.verifiedStreets[streetName]) {
        coords = this.verifiedStreets[streetName];
      }

      // Se não encontrou no banco oficial, NUNCA plota no mapa!
      if (!coords) {
        this.unlocatedCompanies.push(company);
        return;
      }

      // Filtros
      if (filterStatus !== 'all' && company.normalizedStatus !== filterStatus) return;
      if (filterRisk !== 'all' && company.risco !== filterRisk) return;
      if (filterSector !== 'all' && company.setor !== filterSector) return;
      if (q) {
        const fullText = `${company.razao} ${company.cnpj} ${company.bairro} ${company.endereco} ${company.numeroImovel} ${company.situacao} ${company.setor}`.toLowerCase();
        if (!fullText.includes(q)) return;
      }

      bounds.push(coords);
      plottedCount++;

      const customIcon = this.createCustomIcon(company, this.colorMode);
      const marker = L.marker(coords, { icon: customIcon });

      const popupContent = `
        <div class="map-popup-card">
          <div class="popup-header">
            <span class="popup-status-badge badge-${this.getStatusBadgeClass(company.normalizedStatus)}">
              ${company.situacao}
            </span>
            <span class="popup-risk-badge risk-${(company.risco || 'baixo').toLowerCase()}">
              ${company.risco || 'BAIXO'} (${company.cargaIncendio || 0} MJ/m²)
            </span>
          </div>
          <h4 class="popup-title">${this.escape(company.razao)}</h4>
          <div class="popup-info-row">
            <strong>CNPJ:</strong> <span>${this.escape(company.cnpj || 'Não informado')}</span>
          </div>
          <div class="popup-info-row">
            <strong>Setor CBMPA:</strong> <span style="color: ${company.setorHex || 'var(--cbmpa-gold)'}; font-weight: 700;">${this.escape(company.setor || '-')} (${company.setorCor || 'Branco'})</span>
          </div>
          <div class="popup-info-row">
            <strong>Endereço & Nº:</strong> <span>${this.escape(company.endereco || '-')} <strong>(Nº ${this.escape(company.numeroImovel || 'S/N')})</strong></span>
          </div>
          <div class="popup-info-row">
            <strong>Bairro:</strong> <span>${this.escape(company.bairro)}</span>
          </div>
          <div class="popup-info-row">
            <strong>Divisão CBMPA:</strong> <span>Divisão <strong>${this.escape(company.divisao)}</strong> (Item #${this.escape(company.itemNum || company.pasta)})</span>
          </div>
          ${company.divisaoDescricao ? `
            <div class="popup-info-row" style="font-size: 0.73rem; color: var(--text-dim);">
              <em>${this.escape(company.divisaoDescricao)}</em>
            </div>
          ` : ''}
          ${company.observacao ? `
            <div class="popup-obs">
              ⚠️ ${this.escape(company.observacao)}
            </div>
          ` : ''}
          <div class="popup-actions">
            <button class="btn btn-sm btn-primary btn-popup-dossier" data-id="${company.id}">
              Ver Ficha Completa
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 320, className: 'dgsci-leaflet-popup' });

      marker.on('popupopen', () => {
        const btn = document.querySelector(`.btn-popup-dossier[data-id="${company.id}"]`);
        if (btn) {
          btn.addEventListener('click', () => {
            window.tableManager.openCompanyModal(company, store);
          });
        }
      });

      layer.addLayer(marker);
    });

    this.geolocatedCount = plottedCount;

    const countEl = document.getElementById('mapPointsCount');
    if (countEl) {
      countEl.innerHTML = `
        <span class="text-success" style="font-weight: 700;">${plottedCount}</span> estabelecimentos geocodificados via OpenStreetMap 
        • <span class="text-warning" style="font-weight: 700;">${this.unlocatedCompanies.length}</span> não mapeados
      `;
    }

    this.renderUnlocatedTable();

    if (bounds.length > 0 && this.map) {
      try {
        this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch (e) {
        console.warn('Erro ao ajustar bounds:', e);
      }
    }
  }

  renderUnlocatedTable() {
    const tbody = document.getElementById('unlocatedTableBody');
    const badge = document.getElementById('unlocatedCountBadge');
    if (badge) badge.textContent = this.unlocatedCompanies.length;

    if (!tbody) return;

    if (this.unlocatedCompanies.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem; color: var(--success);">
            <i data-lucide="check-circle-2" style="width: 28px; height: 28px; margin: 0 auto 0.4rem auto; display: block;"></i>
            Todos os estabelecimentos possuem endereço validado pelo OpenStreetMap!
          </td>
        </tr>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    tbody.innerHTML = this.unlocatedCompanies.slice(0, 35).map(c => `
      <tr>
        <td><strong>#${this.escape(c.itemNum || c.pasta)}</strong></td>
        <td>
          <div style="font-weight: 600;">${this.escape(c.razao)}</div>
          <span style="font-size: 0.72rem; color: var(--text-dim);">${c.divisao} (${c.tab})</span>
        </td>
        <td><code>${this.escape(c.cnpj || '-')}</code></td>
        <td>${window.tableManager.renderSectorBadge(c)}</td>
        <td style="font-size: 0.78rem; color: var(--text-muted);">${this.escape(c.endereco || '(Endereço em branco na planilha)')}</td>
        <td>${window.tableManager.renderStatusBadge(c.situacao, c.normalizedStatus)}</td>
        <td>
          <button class="btn btn-sm btn-outline btn-view-unlocated" data-id="${c.id}" title="Ver Ficha">
            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();

    tbody.querySelectorAll('.btn-view-unlocated').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const company = window.dataStore.companies.find(item => item.id === id);
        if (company) window.tableManager.openCompanyModal(company, window.dataStore);
      });
    });
  }

  createCustomIcon(company, mode = 'status') {
    let color = '#10B981';

    if (mode === 'sector') {
      color = company.setorHex || '#F8FAFC';
    } else {
      if (company.normalizedStatus === 'VENCIDO') {
        color = '#EF4444';
      } else if (company.normalizedStatus === 'PARADO') {
        color = '#F59E0B';
      } else if (company.normalizedStatus === 'SEM_SISGAT') {
        color = '#8B5CF6';
      } else if (company.normalizedStatus === 'DESATIVADO') {
        color = '#64748B';
      }
    }

    return L.divIcon({
      className: 'dgsci-custom-marker',
      html: `
        <div class="marker-pin-wrapper status-${(company.normalizedStatus || 'regular').toLowerCase()}">
          <div class="marker-pin" style="background-color: ${color}; box-shadow: 0 0 10px ${color}80;">
            <div class="marker-dot"></div>
          </div>
          <div class="marker-pulse" style="background-color: ${color};"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28]
    });
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'REGULAR': return 'success';
      case 'VENCIDO': return 'danger';
      case 'PARADO': return 'warning';
      case 'SEM_SISGAT': return 'purple';
      default: return 'neutral';
    }
  }

  escape(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

window.geoMapManager = new GeoMapManager();
