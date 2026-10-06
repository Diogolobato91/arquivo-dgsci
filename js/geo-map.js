/**
 * DGSCI / CBMPA - Official Mapbox GL JS Store Locator & GPU Vector Engine
 * Desenvolvido com Mapbox GL JS v3, GPU Shaders e GeoJSON Clustering
 * Conexão direta com a base cartográfica de Belém e RMB.
 */

// Token Oficial Mapbox fornecido pela equipe DGSCI / CBMPA
const MAPBOX_TOKEN = window.MAPBOX_TOKEN || (typeof atob !== 'undefined' ? atob('cGsuZXlKMUlqb2laR2x2WjI5c2IySmhkRzhpTENKaElqb2lZMjExZDNwaGRIaG1NRE5pZHpKNmNUUjBhV0pqTm1oek15SjkuZmJURk9RY2h4VTh1ZUZlRFVDVWdqdw==') : '');

// Coordenadas cartográficas oficiais dos bairros de Belém e Região Metropolitana (CBMPA)
const BAIRRO_COORDINATES = {
  'NAZARE': [-1.4526, -48.4848],
  'NAZARÉ': [-1.4526, -48.4848],
  'UMARIZAL': [-1.4428, -48.4839],
  'BATISTA CAMPOS': [-1.4593, -48.4912],
  'MARCO': [-1.4326, -48.4632],
  'PEDREIRA': [-1.4285, -48.4746],
  'TELEGRAFO': [-1.4321, -48.4921],
  'TELÉGRAFO': [-1.4321, -48.4921],
  'CREMACAO': [-1.4645, -48.4812],
  'CREMAÇÃO': [-1.4645, -48.4812],
  'JURUNAS': [-1.4695, -48.4941],
  'GUAMA': [-1.4705, -48.4682],
  'GUAMÁ': [-1.4705, -48.4682],
  'CANUDOS': [-1.4502, -48.4612],
  'SAO BRAS': [-1.4491, -48.4719],
  'SÃO BRÁS': [-1.4491, -48.4719],
  'CIDADE VELHA': [-1.4638, -48.5028],
  'CAMPINA': [-1.4552, -48.4998],
  'COMERCIO': [-1.4510, -48.5015],
  'COMÉRCIO': [-1.4510, -48.5015],
  'REDUTO': [-1.4498, -48.4952],
  'SOUZA': [-1.4215, -48.4412],
  'SOUSA': [-1.4215, -48.4412],
  'MARAMBAIA': [-1.3995, -48.4452],
  'CASTANHEIRA': [-1.3921, -48.4235],
  'MANGUEIRAO': [-1.3712, -48.4485],
  'MANGUEIRÃO': [-1.3712, -48.4485],
  'BENGUI': [-1.3652, -48.4612],
  'BENGUÍ': [-1.3652, -48.4612],
  'CABANAGEM': [-1.3712, -48.4298],
  'PARQUE VERDE': [-1.3521, -48.4498],
  'COQUEIRO': [-1.3412, -48.4352],
  'TAPANA': [-1.3415, -48.4652],
  'TAPANÃ': [-1.3415, -48.4652],
  'PRATINHA': [-1.3521, -48.4812],
  'VAL DE CAES': [-1.3852, -48.4712],
  'VAL-DE-CANS': [-1.3852, -48.4712],
  'VAL DE CANS': [-1.3852, -48.4712],
  'TENONE': [-1.3212, -48.4512],
  'TENONÉ': [-1.3212, -48.4512],
  'ICOARACI': [-1.2985, -48.4812],
  'AGULHA': [-1.3021, -48.4812],
  'CRUZEIRO': [-1.2985, -48.4812],
  'CAMPINA DE ICOARACI': [-1.3050, -48.4750],
  'PARACURI': [-1.2950, -48.4890],
  'PONTA GROSSA': [-1.2890, -48.4950],
  'OUTEIRO': [-1.2582, -48.4512],
  'MOSQUEIRO': [-1.1512, -48.4112],
  'ANANINDEUA': [-1.3645, -48.3742],
  'CENTRO (ANANINDEUA)': [-1.3645, -48.3742],
  'CIDADE NOVA': [-1.3712, -48.3850],
  'GUANABARA': [-1.3890, -48.4210],
  'AGUAS LINDAS': [-1.3850, -48.3950],
  'ÁGUAS LINDAS': [-1.3850, -48.3950],
  'MARITUBA': [-1.3610, -48.3410],
  'BENEVIDES': [-1.3610, -48.2450]
};

class GeoMapManager {
  constructor() {
    this.map = null;
    this.unlocatedCompanies = [];
    this.plottedCompanies = [];
    this.geolocatedCount = 0;
    this.verifiedStreets = {};
    this.normalizedGisIndex = {};
    this.isLoadedGis = false;
    this.colorMode = 'status'; // 'status' ou 'sector'
    this.currentStyle = 'streets'; // 'streets', 'dark', 'satellite'
    this.activeCompanyId = null;
    this.activePopup = null;
    this.lastRenderArgs = null;
    this.activeMarker = null;

    // Estilos oficiais do Mapbox (CDN Global de alta velocidade)
    this.styles = {
      streets: 'mapbox://styles/mapbox/streets-v12',
      dark: 'mapbox://styles/mapbox/dark-v11',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
    };

    if (typeof mapboxgl !== 'undefined') {
      mapboxgl.accessToken = MAPBOX_TOKEN;
    }

    this.loadVerifiedGIS();
  }

  async loadVerifiedGIS() {
    // 1. Cache de geocodificação por endereço completo (rua + número) - gerado por tools/geocode-addresses.js
    try {
      const resAddr = await fetch('/geocoded_addresses.json?_t=' + Date.now());
      if (resAddr.ok) this.geocodedAddresses = await resAddr.json();
    } catch (e) {
      this.geocodedAddresses = {};
    }

    // 2. Base antiga por rua (fallback)
    try {
      const res = await fetch('/verified_gis_streets.json?_t=' + Date.now());
      if (res.ok) {
        this.verifiedStreets = await res.json();
        this.buildNormalizedGisIndex();
        this.isLoadedGis = true;
      }
    } catch (e) {
      console.warn('Carregando base de ruas em tempo de execução...');
    }
  }

  lookupGeocodedAddress(address, bairro) {
    if (!this.geocodedAddresses || !window.DGSCI_GEO_KEYS) return null;
    const key = window.DGSCI_GEO_KEYS.buildAddressKey(address, bairro);
    const hit = key && this.geocodedAddresses[key];
    if (!hit || hit.error || hit.rejected) return null;
    return {
      coords: [hit.lat, hit.lng],
      precision: hit.type === 'address' ? 'exact' : 'street'
    };
  }

  buildNormalizedGisIndex() {
    this.normalizedGisIndex = {};
    for (const [k, coords] of Object.entries(this.verifiedStreets)) {
      if (!Array.isArray(coords) || coords.length < 2) continue;

      const norm = this.normalizeKey(k);
      if (norm && !this.normalizedGisIndex[norm]) {
        this.normalizedGisIndex[norm] = coords;
      }

      const clean = this.cleanStreetName(norm);
      if (clean && clean.length > 3 && !this.normalizedGisIndex[clean]) {
        this.normalizedGisIndex[clean] = coords;
      }

      // Variante sem prefixo para fallback seguro
      const noPrefix = clean.replace(/\b(AVENIDA|TRAVESSA|RUA|RODOVIA|PASSAGEM|ESTRADA|ALAMEDA)\b/g, '').trim();
      if (noPrefix && noPrefix.length > 3 && !this.normalizedGisIndex['NOPREFIX_' + noPrefix]) {
        this.normalizedGisIndex['NOPREFIX_' + noPrefix] = coords;
      }
    }
  }

  normalizeKey(str) {
    if (!str) return '';
    let s = str.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    s = s.replace(/[.,;:\-\/\(\)]/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();

    // Normalização canônica de tipos de logradouros
    s = s.replace(/\b(AVENIDA|AVEN|AV)\b/g, 'AVENIDA');
    s = s.replace(/\b(TRAVESSA|TRAV|TR|TV|RAV|TVE)\b/g, 'TRAVESSA');
    s = s.replace(/\b(RUAS?|R)\b/g, 'RUA');
    s = s.replace(/\b(RODOVIA|ROD)\b/g, 'RODOVIA');
    s = s.replace(/\b(PASSAGEM|PASS|PAS|PSG)\b/g, 'PASSAGEM');
    s = s.replace(/\b(ESTRADA|EST)\b/g, 'ESTRADA');
    s = s.replace(/\b(ALAMEDA|AL)\b/g, 'ALAMEDA');

    // Sinônimos e correções cartográficas específicas de Belém/RMB
    s = s.replace(/\bRODOVIA\s+A\s+MONTENEGRO\b/g, 'RODOVIA AUGUSTO MONTENEGRO');
    s = s.replace(/\bRODOVIA\s+AUG\s+MONTENEGRO\b/g, 'RODOVIA AUGUSTO MONTENEGRO');
    s = s.replace(/\bRODOVIA\s+BR\s*316\b/g, 'RODOVIA BR 316');
    s = s.replace(/\bMARIS\b/g, 'MARIZ');
    s = s.replace(/\bBOA\s+VENTURA\b/g, 'BOAVENTURA');
    s = s.replace(/\b09\s+DE\s+JANEIRO\b/g, '9 DE JANEIRO');
    s = s.replace(/\bNOVE\s+DE\s+JANEIRO\b/g, '9 DE JANEIRO');
    s = s.replace(/\bQUATORZE\s+DE\s+MARCO\b/g, '14 DE MARCO');
    s = s.replace(/\b03\s+DE\s+MAIO\b/g, '3 DE MAIO');
    s = s.replace(/\bTRES\s+DE\s+MAIO\b/g, '3 DE MAIO');
    s = s.replace(/\bVINTE\s+E\s+CINCO\s+DE\s+SETEMBRO\b/g, '25 DE SETEMBRO');
    s = s.replace(/\bVINTE\s+E\s+OITO\s+DE\s+SETEMBRO\b/g, '28 DE SETEMBRO');
    s = s.replace(/\bDR\s+MORAES\b/g, 'DOUTOR MORAES');
    s = s.replace(/\bDR\.?\s+MORAES\b/g, 'DOUTOR MORAES');
    s = s.replace(/\bENG\.?\s+FERNANDO\s+GUILHON\b/g, 'ENGENHEIRO FERNANDO GUILHON');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }

  cleanStreetName(str) {
    if (!str) return '';
    let s = str;
    const dateMap = {};
    let dIdx = 0;

    // Protege datas de logradouros (14 de Março, 9 de Janeiro, 25 de Setembro, 3 de Maio, etc.)
    s = s.replace(/\b(\d{1,2}|PRIMEIRO|1º|1O)\s+DE\s+(JANEIRO|FEVEREIRO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\b/gi, (m) => {
      const k = `__DATE_${dIdx++}__`;
      dateMap[k] = m;
      return k;
    });

    // Remove complementos de imóveis e numerações
    s = s.replace(/,\s*(?:SALA|APTO|LOJA|BLOCO|BL|CONJ|CONJUNTO|GALPAO|TERREO|ALTOS|BAIXOS)\b.*$/i, '');
    s = s.replace(/(?:N[º°\.\:\s]*|NUMERO\s*[:\.]?\s*|N\s*[:\.]?\s*)\d+.*$/i, '');
    s = s.replace(/,\s*\d+.*$/i, '');
    s = s.replace(/\b\d{1,5}\b.*$/i, '');
    s = s.replace(/LETRA\s*:\s*[A-Z0-9]/gi, '');
    s = s.replace(/\b(?:TERREO|ALTOS|BAIXOS|GALPAO|SALA\s*['"A-Z0-9]*|APTO\s*[A-Z0-9]*|BL\s*[A-Z0-9]*|BLOCO\s*[A-Z0-9]*|LOTE\s*[A-Z0-9]*|CONJ\s*[A-Z0-9]*|CONJUNTO\s*[A-Z0-9]*)\b/gi, '');
    s = s.replace(/\b(?:ENTRE|ESQ\.|ESQUINA|PROXIMO|AO LADO|EM FRENTE)\b.*$/gi, '');
    s = s.replace(/\s+/g, ' ').trim();

    for (const [k, v] of Object.entries(dateMap)) {
      s = s.replace(k, v);
    }
    return s.trim();
  }

  resolveLocation(address, bairro) {
    // 0. Endereço exato (rua + número) geocodificado pelo Mapbox
    const exact = this.lookupGeocodedAddress(address, bairro);
    if (exact) return exact;

    if (!address || address.length < 3) {
      const normB = (bairro || '').toUpperCase().trim();
      if (normB && BAIRRO_COORDINATES[normB]) {
        return { coords: BAIRRO_COORDINATES[normB], precision: 'bairro' };
      }
      return null;
    }

    const rawUpper = address.toUpperCase().trim();
    const normFull = this.normalizeKey(address);
    const cleanFull = this.cleanStreetName(normFull);

    let coords = null;
    let precision = 'street';

    // 1. Correspondência direta pelo endereço completo normalizado
    if (this.verifiedStreets[rawUpper]) {
      coords = this.verifiedStreets[rawUpper];
    } else if (this.normalizedGisIndex[normFull]) {
      coords = this.normalizedGisIndex[normFull];
    } else if (this.normalizedGisIndex[cleanFull]) {
      coords = this.normalizedGisIndex[cleanFull];
    } else {
      // 2. Extração por segmentos (ex: antes da primeira vírgula)
      const segments = address.split(',').map(s => s.trim()).filter(Boolean);
      for (const seg of segments) {
        if (/(?:RUAS?|R|AV|AVEN|TRAV|TV|TVE|TR|ROD|PASS|PAS|PSG|EST|ALAMEDA)\b/i.test(seg)) {
          const normSeg = this.normalizeKey(seg);
          const cleanSeg = this.cleanStreetName(normSeg);
          if (this.normalizedGisIndex[normSeg]) { coords = this.normalizedGisIndex[normSeg]; break; }
          if (this.normalizedGisIndex[cleanSeg]) { coords = this.normalizedGisIndex[cleanSeg]; break; }
          const noPre = 'NOPREFIX_' + cleanSeg.replace(/\b(AVENIDA|TRAVESSA|RUA|RODOVIA|PASSAGEM|ESTRADA|ALAMEDA)\b/g, '').trim();
          if (this.normalizedGisIndex[noPre]) { coords = this.normalizedGisIndex[noPre]; break; }
        }
      }

      // 3. Fallback sem prefixo
      if (!coords) {
        const noPreFull = 'NOPREFIX_' + cleanFull.replace(/\b(AVENIDA|TRAVESSA|RUA|RODOVIA|PASSAGEM|ESTRADA|ALAMEDA)\b/g, '').trim();
        if (this.normalizedGisIndex[noPreFull]) coords = this.normalizedGisIndex[noPreFull];
      }
    }

    // 4. Verificação de consistência com o Bairro (Evita outliers como enviar Jurunas para Mosqueiro)
    const normBairro = (bairro || '').toUpperCase().trim();
    if (coords && normBairro && BAIRRO_COORDINATES[normBairro]) {
      const [bLat] = BAIRRO_COORDINATES[normBairro];
      // Se as coordenadas estiverem em Mosqueiro (lat > -1.25) mas o bairro é central (lat < -1.35)
      if (coords[0] > -1.25 && bLat < -1.35) {
        coords = BAIRRO_COORDINATES[normBairro];
        precision = 'bairro';
      }
    }

    // 5. Fallback para o centróide do bairro caso a rua não exista na base
    if (!coords && normBairro && BAIRRO_COORDINATES[normBairro]) {
      coords = BAIRRO_COORDINATES[normBairro];
      precision = 'bairro';
    }

    return coords ? { coords, precision } : null;
  }


  initMap(containerId = 'mapContainer') {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (typeof mapboxgl === 'undefined') {
      console.warn('Mapbox GL JS não carregado, aguardando...');
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (this.map) {
      this.map.resize();
      return;
    }

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    this.currentStyle = currentTheme === 'light' ? 'streets' : 'dark';

    this.map = new mapboxgl.Map({
      container: containerId,
      style: this.styles[this.currentStyle],
      center: [-48.4800, -1.4480], // Belém [lng, lat]
      zoom: 12.8,
      pitch: 35, // 3D tilt cinematográfico do Mapbox
      bearing: 0,
      attributionControl: false
    });

    this.map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    this.map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

    this.setupStyleSwitcher();

    this.map.on('load', () => {
      this.setupMapboxLayers();
      if (this.lastRenderArgs && window.dataStore) {
        this.renderMarkers(window.dataStore, ...this.lastRenderArgs);
      }
    });

    window.addEventListener('resize', () => {
      if (this.map) this.map.resize();
    });

    setTimeout(() => {
      if (this.map) this.map.resize();
    }, 250);
  }

  setupStyleSwitcher() {
    const switcher = document.getElementById('mapStyleSwitcher');
    if (!switcher) return;

    switcher.querySelectorAll('.btn-style-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        let styleKey = btn.getAttribute('data-style');
        if (styleKey === 'voyager') styleKey = 'streets';
        this.setStyle(styleKey);
      });
    });
  }

  setStyle(styleKey) {
    if (!this.map || !this.styles[styleKey]) return;
    this.currentStyle = styleKey;

    const switcher = document.getElementById('mapStyleSwitcher');
    if (switcher) {
      switcher.querySelectorAll('.btn-style-pill').forEach(btn => {
        const val = btn.getAttribute('data-style');
        btn.classList.toggle('active', val === styleKey || (styleKey === 'streets' && val === 'voyager'));
      });
    }

    this.map.setStyle(this.styles[styleKey]);

    this.map.once('style.load', () => {
      this.setupMapboxLayers();
      if (window.dataStore) {
        this.renderMarkers(window.dataStore);
      }
    });
  }

  handleThemeChange(theme) {
    const target = theme === 'light' ? 'streets' : 'dark';
    if (this.currentStyle !== 'satellite') {
      this.setStyle(target);
    }
  }

  setupMapboxLayers() {
    if (!this.map) return;

    if (!this.map.getSource('establishments')) {
      this.map.addSource('establishments', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 15,
        clusterRadius: 40
      });
    }

    // Camada 1: Clusters (GPU Circles)
    if (!this.map.getLayer('clusters')) {
      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'establishments',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#2563EB',
            10, '#EAB308',
            30, '#F97316',
            100, '#EF4444'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18,
            10, 24,
            30, 30,
            100, 38
          ],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.88
        }
      });
    }

    // Camada 2: Contagem de estabelecimentos no Cluster
    if (!this.map.getLayer('cluster-count')) {
      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'establishments',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13
        },
        paint: {
          'text-color': '#ffffff'
        }
      });
    }

    // Camada 3: Pontos individuais de alta performance WebGL (Sem travar o DOM)
    if (!this.map.getLayer('unclustered-point')) {
      this.map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'establishments',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            10, 6,
            14, 9,
            18, 13
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF',
          'circle-opacity': 0.95
        }
      });
    }

    // Eventos de clique e hover com aceleração por hardware
    this.map.on('click', 'clusters', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      this.map.getSource('establishments').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        this.map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
          duration: 600
        });
      });
    });

    this.map.on('click', 'unclustered-point', (e) => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const props = e.features[0].properties;
      this.selectStoreByProps(props, coordinates);
    });

    this.map.on('mouseenter', 'clusters', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'clusters', () => { this.map.getCanvas().style.cursor = ''; });
    this.map.on('mouseenter', 'unclustered-point', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'unclustered-point', () => { this.map.getCanvas().style.cursor = ''; });
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
        <div class="legend-item"><span class="legend-dot" style="background: #64748B;"></span> Desativado / Baixado</div>
      `;
    }
  }

  async renderMarkers(store, filterStatus = 'all', filterRisk = 'all', filterSector = 'all', searchQuery = '') {
    if (!this.map) this.initMap();
    if (!this.map) return;

    if (!this.isLoadedGis) {
      await this.loadVerifiedGIS();
    }

    if (filterStatus === 'all' && filterRisk === 'all' && filterSector === 'all' && !searchQuery) {
      const mapStatus = document.getElementById('mapFilterStatus');
      const mapRisk = document.getElementById('mapFilterRisk');
      const mapSector = document.getElementById('mapFilterSector');
      const mapSearch = document.getElementById('mapSearchInput');
      if (mapStatus && mapStatus.value !== 'all') filterStatus = mapStatus.value;
      if (mapRisk && mapRisk.value !== 'all') filterRisk = mapRisk.value;
      if (mapSector && mapSector.value !== 'all') filterSector = mapSector.value;
      if (mapSearch && mapSearch.value) searchQuery = mapSearch.value;
    }

    this.lastRenderArgs = [filterStatus, filterRisk, filterSector, searchQuery];

    if (this.activePopup) {
      this.activePopup.remove();
      this.activePopup = null;
    }
    if (this.activeMarker) {
      this.activeMarker.remove();
      this.activeMarker = null;
    }

    const q = (searchQuery || '').toLowerCase().trim();
    this.unlocatedCompanies = [];
    const plottedCompanies = [];
    const bounds = new mapboxgl.LngLatBounds();

    store.companies.forEach((company) => {
      const loc = this.resolveLocation(company.endereco, company.bairro);

      if (!loc || !loc.coords) {
        this.unlocatedCompanies.push(company);
        return;
      }

      if (filterStatus !== 'all' && company.normalizedStatus !== filterStatus) return;
      if (filterRisk !== 'all' && company.risco !== filterRisk) return;
      if (filterSector !== 'all' && company.setor !== filterSector) return;
      if (q) {
        const fullText = `${company.razao} ${company.cnpj} ${company.bairro} ${company.endereco} ${company.numeroImovel} ${company.situacao} ${company.setor}`.toLowerCase();
        if (!fullText.includes(q)) return;
      }

      // Micro-dispersão determinística para evitar sobreposição exata no mesmo endereço
      const coords = loc.coords;
      const hash = (company.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const jitterAngle = (hash % 360) * (Math.PI / 180);
      const jitterDist = loc.precision === 'bairro'
        ? (((hash % 20) + 1) * 0.00018)
        : loc.precision === 'exact'
          ? (((hash % 5) + 1) * 0.00002)
          : (((hash % 10) + 1) * 0.00008);
      const lng = coords[1] + (Math.cos(jitterAngle) * jitterDist);
      const lat = coords[0] + (Math.sin(jitterAngle) * jitterDist);

      company._lng = lng;
      company._lat = lat;
      company.locationPrecision = loc.precision;

      bounds.extend([lng, lat]);
      plottedCompanies.push(company);
    });

    this.plottedCompanies = plottedCompanies;
    this.geolocatedCount = plottedCompanies.length;

    // Atualiza a fonte GeoJSON no Mapbox (Processamento direto na GPU via WebGL)
    const geojsonData = {
      type: 'FeatureCollection',
      features: plottedCompanies.map((c, idx) => ({
        type: 'Feature',
        id: idx,
        geometry: {
          type: 'Point',
          coordinates: [c._lng, c._lat]
        },
        properties: {
          id: c.id,
          index: idx,
          razao: c.razao,
          cnpj: c.cnpj || 'Não informado',
          endereco: c.endereco || '-',
          numeroImovel: c.numeroImovel || 'S/N',
          bairro: c.bairro || '-',
          precision: c.locationPrecision || 'street',
          setor: c.setor || '-',
          setorCor: c.setorCor || 'Branco',
          setorHex: c.setorHex || '#EAB308',
          divisao: c.divisao || '-',
          divisaoDescricao: c.divisaoDescricao || '',
          situacao: c.situacao || '-',
          normalizedStatus: c.normalizedStatus || 'REGULAR',
          risco: c.risco || 'BAIXO',
          carga: c.cargaIncendio || 0,
          color: this.colorMode === 'sector' ? (c.setorHex || '#F8FAFC') : this.getStatusColor(c.normalizedStatus)
        }
      }))
    };

    const src = this.map.getSource('establishments');
    if (src) {
      src.setData(geojsonData);
    }

    // Renderiza a listagem lateral do Store Locator
    this.buildLocationList(plottedCompanies);

    // Atualiza cabeçalhos e contadores
    const countEl = document.getElementById('mapPointsCount');
    if (countEl) {
      countEl.innerHTML = `
        <span class="text-success" style="font-weight: 700;">${this.geolocatedCount}</span> estabelecimentos geolocalizados via Mapbox GL JS 
        • <span class="text-warning" style="font-weight: 700;">${this.unlocatedCompanies.length}</span> não mapeados
      `;
    }

    const badgeCount = document.getElementById('locatorBadgeCount');
    if (badgeCount) badgeCount.textContent = this.geolocatedCount;

    this.renderUnlocatedTable();

    // Enquadra a visão do mapa nos pontos carregados
    if (plottedCompanies.length > 0 && this.map) {
      try {
        this.map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      } catch (e) {
        console.warn('Erro ao ajustar bounds:', e);
      }
    }
  }

  getStatusColor(status) {
    if (status === 'VENCIDO') return '#EF4444';
    if (status === 'PARADO') return '#F59E0B';
    if (status === 'SEM_SISGAT') return '#8B5CF6';
    if (status === 'DESATIVADO') return '#64748B';
    return '#10B981';
  }

  buildPopupHtml(company) {
    const hasExplicitNum = company.numeroImovel && company.numeroImovel !== 'S/N' && !(company.endereco || '').includes(company.numeroImovel);
    const numDisplay = hasExplicitNum ? ` <strong>(Nº ${this.escape(company.numeroImovel)})</strong>` : '';
    const approxBadge = company.locationPrecision === 'bairro' 
      ? `<span style="font-size: 0.65rem; background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 4px; padding: 1px 5px; margin-left: 6px;">📍 Bairro aproximado</span>` 
      : '';

    return `
      <div class="map-popup-card">
        <div class="popup-header">
          <span class="popup-status-badge badge-${this.getStatusBadgeClass(company.normalizedStatus)}">
            ${company.situacao}
          </span>
          <span class="popup-risk-badge risk-${(company.risco || 'baixo').toLowerCase()}">
            ${company.risco || 'BAIXO'} (${company.cargaIncendio || company.carga || 0} MJ/m²)
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
          <strong>Endereço:</strong> <span>${this.escape(company.endereco || '-')}${numDisplay}</span>
        </div>
        <div class="popup-info-row">
          <strong>Bairro:</strong> <span>${this.escape(company.bairro)}${approxBadge}</span>
        </div>
        <div class="popup-info-row">
          <strong>Divisão CBMPA:</strong> <span>Divisão <strong>${this.escape(company.divisao)}</strong></span>
        </div>
        ${company.divisaoDescricao ? `
          <div class="popup-info-row" style="font-size: 0.73rem; color: var(--text-dim);">
            <em>${this.escape(company.divisaoDescricao)}</em>
          </div>
        ` : ''}
        <div class="popup-actions mt-3">
          <button class="btn btn-sm btn-primary w-full btn-popup-dossier" data-id="${company.id}">
            <i data-lucide="file-text" style="width: 14px; height: 14px; margin-right: 4px;"></i> Ver Ficha Completa
          </button>
        </div>
      </div>
    `;
  }

  buildLocationList(companies) {
    const listings = document.getElementById('locatorListings');
    if (!listings) return;

    if (companies.length === 0) {
      listings.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-dim);">
          <i data-lucide="map-pin-off" style="width: 32px; height: 32px; margin: 0 auto 0.5rem; display: block; opacity: 0.5;"></i>
          Nenhum estabelecimento encontrado no filtro atual.
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Exibe os primeiros 80 estabelecimentos para máxima fluidez
    const displayList = companies.slice(0, 80);

    listings.innerHTML = displayList.map((c) => this.renderLocatorCardHtml(c)).join('');

    if (window.lucide) lucide.createIcons();

    listings.querySelectorAll('.locator-item').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-company-id');
        const company = this.plottedCompanies.find(item => item.id === id);
        if (company) {
          this.selectStore(company);
        }
      });
    });
  }

  renderLocatorCardHtml(c) {
    const statusColor = this.getStatusColor(c.normalizedStatus);
    const borderLeftColor = this.colorMode === 'sector' ? (c.setorHex || '#F8FAFC') : statusColor;
    const approxTag = c.locationPrecision === 'bairro' 
      ? `<span style="font-size: 0.62rem; color: #60A5FA; margin-left: 4px;">(Bairro)</span>` 
      : '';

    return `
      <div class="locator-item" id="listing-${c.id}" data-company-id="${c.id}" style="border-left-color: ${borderLeftColor};">
        <div class="locator-item-header">
          <span class="tab-tag" style="font-size: 0.68rem; padding: 0.1rem 0.35rem;">${this.escape(c.divisao)}</span>
          <span class="popup-status-badge badge-${this.getStatusBadgeClass(c.normalizedStatus)}" style="font-size: 0.65rem;">
            ${c.situacao}
          </span>
        </div>

        <h4 class="locator-item-name" title="${this.escape(c.razao)}">
          ${this.escape(c.razao)}
        </h4>

        <div class="locator-item-address">
          📍 ${this.escape(c.endereco || '-')} • <strong>${this.escape(c.bairro)}</strong>${approxTag}
        </div>

        <div class="locator-item-footer">
          <span style="color: ${c.setorHex || 'var(--cbmpa-gold)'}; font-weight: 700;">
            ${this.escape(c.setor || '-')}
          </span>
          <span style="color: var(--text-dim);">
            ${c.risco || 'BAIXO'} (${c.cargaIncendio || 0} MJ/m²)
          </span>
        </div>
      </div>
    `;
  }

  selectStoreByProps(props, coords) {
    const company = this.plottedCompanies.find(c => c.id === props.id) || 
                    (props.index !== undefined ? this.plottedCompanies[props.index] : null) || 
                    props;
    this.selectStore(company);
  }

  selectStore(company) {
    if (!this.map || !company) return;

    // 1. Destaque na listagem lateral (Store Locator Pattern)
    const activeCards = document.querySelectorAll('.locator-item.active');
    activeCards.forEach(c => c.classList.remove('active'));

    const listings = document.getElementById('locatorListings');
    let selectedCard = document.getElementById(`listing-${company.id}`);

    // Se o card não estiver nos primeiros visíveis, insere no topo dinamicamente
    if (!selectedCard && listings) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.renderLocatorCardHtml(company);
      const newCard = tempDiv.firstElementChild;
      if (newCard) {
        newCard.addEventListener('click', () => this.selectStore(company));
        listings.prepend(newCard);
        selectedCard = newCard;
        if (window.lucide) lucide.createIcons();
      }
    }

    if (selectedCard) {
      selectedCard.classList.add('active');
      selectedCard.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }

    // 2. Remove popup anterior
    if (this.activePopup) {
      this.activePopup.remove();
      this.activePopup = null;
    }

    // 3. Remove marcador de foco anterior
    if (this.activeMarker) {
      this.activeMarker.remove();
      this.activeMarker = null;
    }

    // 4. Cria um pino luminoso de foco no local selecionado
    const el = document.createElement('div');
    el.className = 'active-selected-pin';
    el.innerHTML = `
      <div class="marker-pin-wrapper active-focus">
        <div class="marker-pin" style="background-color: ${company.color || this.getStatusColor(company.normalizedStatus)}; transform: rotate(-45deg) scale(1.4); box-shadow: 0 0 16px var(--cbmpa-gold); border: 2px solid #FFF;">
          <div class="marker-dot"></div>
        </div>
        <div class="marker-pulse" style="background-color: #EAB308;"></div>
      </div>
    `;

    this.activeMarker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([company._lng, company._lat])
      .addTo(this.map);

    // 5. Exibe o Popup
    this.activePopup = new mapboxgl.Popup({ offset: 25, closeButton: true, className: 'dgsci-mapbox-popup' })
      .setLngLat([company._lng, company._lat])
      .setHTML(this.buildPopupHtml(company))
      .addTo(this.map);

    this.activePopup.on('open', () => {
      const btn = this.activePopup.getElement().querySelector(`.btn-popup-dossier[data-id="${company.id}"]`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (window.tableManager && window.dataStore) {
            window.tableManager.openCompanyModal(company, window.dataStore);
          }
        });
      }
    });

    // 6. Voo suave de câmera (Cinematic flyTo)
    this.map.flyTo({
      center: [company._lng, company._lat],
      zoom: 16.5,
      pitch: 45,
      bearing: 0,
      duration: 1000
    });
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
            Todos os estabelecimentos possuem endereço validado pela base oficial!
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
        <td>${window.tableManager ? window.tableManager.renderSectorBadge(c) : (c.setor || '-')}</td>
        <td style="font-size: 0.78rem; color: var(--text-muted);">${this.escape(c.endereco || '(Endereço em branco na planilha)')}</td>
        <td>${window.tableManager ? window.tableManager.renderStatusBadge(c.situacao, c.normalizedStatus) : c.situacao}</td>
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
        const company = window.dataStore ? window.dataStore.companies.find(item => item.id === id) : null;
        if (company && window.tableManager) window.tableManager.openCompanyModal(company, window.dataStore);
      });
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
