/**
 * DGSCI / CBMPA - Chaves de endereço compartilhadas
 * Usado pelo navegador (geo-map.js) e pelo script tools/geocode-addresses.js,
 * garantindo que a chave do cache de geocodificação seja idêntica nos dois lados.
 */
(function (global) {
  function normalizeText(str) {
    return (str || '').toString().toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  // Chave única = endereço bruto normalizado + bairro normalizado
  function buildAddressKey(endereco, bairro) {
    const e = normalizeText(endereco);
    if (!e || e === '-' || e.length < 3) return '';
    return `${e}|${normalizeText(bairro)}`;
  }

  // Monta uma consulta limpa para a API de geocodificação
  function buildGeocodeQuery(endereco, numeroImovel, bairro) {
    let s = (endereco || '').toString().trim();
    if (!s || s === '-' || s.length < 3) return '';
    // Endereços que são só CNPJ/CEP não servem
    if (/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(s)) return '';

    s = s.replace(/\bN\s*[º°o]?\s*[:.]?\s*(\d+)/gi, ' $1');          // "Nº 123", "N: 123" -> " 123"
    s = s.replace(/\b(?:SALA|APTO|AP|LOJA|BLOCO|BL|LETRA|GALPAO|GALPÃO)\b\s*['"]?[A-Z0-9]*['"]?/gi, ' ');
    s = s.replace(/\b(?:TERREO|TÉRREO|ALTOS|BAIXOS|ANDAR)\b/gi, ' ');
    s = s.replace(/\b(?:S\/?N|SEM N[UÚ]MERO)\b/gi, ' ');
    s = s.replace(/[;|]+/g, ',').replace(/\s*,\s*,+/g, ',').replace(/\s+/g, ' ').replace(/^[,\s]+|[,\s]+$/g, '');

    // Garante que o número do imóvel entre na consulta
    if (numeroImovel && numeroImovel !== 'S/N' && !new RegExp(`\\b${numeroImovel}\\b`).test(s)) {
      s += ` ${numeroImovel}`;
    }

    const b = (bairro || '').toString().trim();
    return `${s}${b ? ', ' + b : ''}, Belém - PA`;
  }

  // Centróides aproximados dos bairros (usados para validar e como fallback)
  const BAIRRO_CENTROIDS = {
    'NAZARE': [-1.4526, -48.4848], 'UMARIZAL': [-1.4428, -48.4839], 'BATISTA CAMPOS': [-1.4593, -48.4912],
    'MARCO': [-1.4326, -48.4632], 'PEDREIRA': [-1.4285, -48.4746], 'TELEGRAFO': [-1.4321, -48.4921],
    'CREMACAO': [-1.4645, -48.4812], 'JURUNAS': [-1.4695, -48.4941], 'GUAMA': [-1.4705, -48.4682],
    'CANUDOS': [-1.4502, -48.4612], 'SAO BRAS': [-1.4491, -48.4719], 'CIDADE VELHA': [-1.4638, -48.5028],
    'CAMPINA': [-1.4552, -48.4998], 'COMERCIO': [-1.4510, -48.5015], 'REDUTO': [-1.4498, -48.4952],
    'FATIMA': [-1.4420, -48.4750], 'CONDOR': [-1.4760, -48.4830], 'TERRA FIRME': [-1.4560, -48.4500],
    'MONTESE': [-1.4560, -48.4500], 'UNIVERSITARIO': [-1.4740, -48.4560], 'SACRAMENTA': [-1.4180, -48.4720],
    'BARREIRO': [-1.4120, -48.4820], 'MIRAMAR': [-1.4060, -48.4900], 'MARACANGALHA': [-1.4100, -48.4780],
    'CURIO-UTINGA': [-1.4350, -48.4400], 'CURIO UTINGA': [-1.4350, -48.4400], 'CASTANHEIRA': [-1.3921, -48.4235],
    'SOUZA': [-1.4215, -48.4412], 'SOUSA': [-1.4215, -48.4412], 'MARAMBAIA': [-1.3995, -48.4452],
    'VAL DE CAES': [-1.3852, -48.4712], 'VAL-DE-CANS': [-1.3852, -48.4712], 'VAL DE CANS': [-1.3852, -48.4712],
    'MANGUEIRAO': [-1.3712, -48.4485], 'BENGUI': [-1.3652, -48.4612], 'CABANAGEM': [-1.3712, -48.4298],
    'UNA': [-1.3600, -48.4500], 'PARQUE VERDE': [-1.3521, -48.4498], 'COQUEIRO': [-1.3412, -48.4352],
    'TAPANA': [-1.3415, -48.4652], 'PRATINHA': [-1.3521, -48.4812], 'TENONE': [-1.3212, -48.4512],
    'SAO CLEMENTE': [-1.3600, -48.4700], 'ICOARACI': [-1.2985, -48.4812], 'AGULHA': [-1.3021, -48.4812],
    'CRUZEIRO': [-1.2985, -48.4812], 'CAMPINA DE ICOARACI': [-1.3050, -48.4750], 'PARACURI': [-1.2950, -48.4890],
    'PONTA GROSSA': [-1.2890, -48.4950], 'OUTEIRO': [-1.2582, -48.4512], 'MOSQUEIRO': [-1.1512, -48.4112],
    'ANANINDEUA': [-1.3645, -48.3742], 'CENTRO (ANANINDEUA)': [-1.3645, -48.3742], 'CIDADE NOVA': [-1.3712, -48.3850],
    'GUANABARA': [-1.3890, -48.4210], 'AGUAS LINDAS': [-1.3850, -48.3950], 'COQUEIRO (ANANINDEUA)': [-1.3412, -48.4000],
    'MARITUBA': [-1.3610, -48.3410], 'BENEVIDES': [-1.3610, -48.2450]
  };

  global.DGSCI_GEO_KEYS = { normalizeText, buildAddressKey, buildGeocodeQuery, BAIRRO_CENTROIDS };
})(typeof window !== 'undefined' ? window : globalThis);
