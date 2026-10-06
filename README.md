# DGSCI / CBMPA — Painel de Inteligência Territorial e Controle de Estabelecimentos

Sistema integrado de gestão, fiscalização e inteligência geoespacial desenvolvido para o **Departamento-Geral de Segurança Contra Incêndios e Emergências (DGSCI)** do **Corpo de Bombeiros Militar do Pará (CBMPA)**.

O painel unifica o controle de mais de **3.000 estabelecimentos** comerciais, industriais e residenciais da Região Metropolitana de Belém (RMB), integrando cálculo de carga de incêndio, classificação de risco, setorização operacional e georreferenciamento de precisão métrica porta a porta.

---

## 🗺️ Arquitetura Geoespacial de Alta Performance (Mapbox GL JS v3)

Para superar as limitações de ferramentas cartográficas convencionais baseadas em CPU (como o Leaflet anterior, que sofria quedas de desempenho ao manipular milhares de nós no DOM), o sistema foi totalmente reformulado utilizando a infraestrutura da **Mapbox**:

### 1. Renderização Acelerada por Hardware (GPU / WebGL)
* **Mapbox GL JS v3**: Todo o processamento visual dos mais de 3.000 estabelecimentos é transferido diretamente para a placa de vídeo (GPU) através de WebGL Shaders.
* **GeoJSON Clustering em Tempo Real**: Agrupamento dinâmico de alta densidade que ajusta a visualização conforme o nível de zoom, mantendo taxas de atualização estáveis entre **60 e 120 FPS**.
* **Controle de Câmera 3D**: Voo cinemático suave (`flyTo`) com inclinação de terreno (`pitch` de 35° a 45°) ao inspecionar estabelecimentos.
* **Estilos Vetoriais Oficiais**:
  * 🏙️ **Urbano:** `mapbox://styles/mapbox/streets-v12`
  * 🌙 **Dark Operacional:** `mapbox://styles/mapbox/dark-v11`
  * 🛰️ **Satélite com Vias:** `mapbox://styles/mapbox/satellite-streets-v12`

### 2. Pipeline de Geocodificação Porta a Porta (Mapbox Geocoding API v6)
* **Precisão Métrica Predial**: Utilização da API de Geocodificação v6 da Mapbox (`/search/geocode/v6/forward`), cruzando nome do logradouro, número predial da edificação e bairro de Belém.
* **Eliminação de Amontoados Artificiais**: Substituição da antiga abordagem por centróide de rua (que agrupava dezenas de lojas no mesmo ponto) por posicionamento real em frente a cada lote e edificação.
* **Taxa de Resolução de 97%**: Mais de 2.840 endereços resolvidos no número exato do imóvel em Belém, Ananindeua, Marituba e RMB.
* **Algoritmo de Bairro-Affinity**: Validação matemática de pertinência territorial que previne desvios cartográficos e protege vias com datas históricas (ex: *14 de Março*, *09 de Janeiro*, *25 de Setembro*, *3 de Maio*).
* **Cache Incremental Estruturado (`geocoded_addresses.json`)**: Ferramenta em Node.js (`tools/geocode-addresses.js`) que processa novos endereços de forma incremental, mantendo o sistema ultrarrápido e sem consumo desnecessário de cotas de API.

### 3. Padrão Interativo Store Locator
* **Sincronização Bidirecional**: Clique no mapa localiza e destaca instantaneamente o estabelecimento na barra lateral com rolagem suave (`scrollIntoView`).
* **Busca e Destaque Dinâmico**: Ao selecionar um card na barra lateral, a câmera navega até a coordenada exata com pino luminoso pulsante e abertura do pop-up completo.

---

## 🛡️ Regras Técnicas Oficiais do CBMPA Integradas

* **Classificação de Carga de Incêndio**:
  * 🟢 **Risco Baixo:** até $300\text{ MJ/m}^2$
  * 🟡 **Risco Médio:** $300{,}01$ a $1200\text{ MJ/m}^2$
  * 🔴 **Risco Alto:** acima de $1200{,}01\text{ MJ/m}^2$
* **Setorização Operacional por Bairros (6 Setores)**:
  * 🟡 **Setor I (Amarelo):** Cidade Velha, Comércio, Campina, Reduto
  * 🔵 **Setor II (Azul):** Batista Campos, Jurunas, Cremação, Condor
  * ⚪ **Setor III (Branco):** Umarizal, Nazaré, São Brás, Fátima
  * 🟢 **Setor IV (Verde):** Marco, Guamá, Terra Firme, Canudos
  * 🌸 **Setor V (Rosa):** Telégrafo, Pedreira, Sacramenta, Barreiro
  * 🟠 **Setor VI (Laranja):** Marambaia, Benguí, Mangueirão, Tapanã, Icoaraci, Outeiro, Mosqueiro e RMB
* **Catálogo Completo de Ocupações**: Guia interativo das **58 divisões do CBMPA** (Grupos A a N, divisões A-1 a N-1) com descrições e exemplos práticos da legislação de segurança contra incêndio e pânico.
* **Dossiê / Ficha Cadastral em A4**: Emissão individual de ficha técnica padronizada pronta para impressão e vistorias em campo.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Função no Sistema |
| :--- | :--- | :--- |
| **Engine Cartográfico** | **Mapbox GL JS v3** | Renderização vetorial acelerada por GPU (WebGL), clustering e câmera 3D |
| **Geocodificação** | **Mapbox Geocoding API v6** | Resolução espacial de endereços, números prediais e bairros de Belém |
| **Interface & Design** | **HTML5 & Vanilla CSS** | Design system moderno, responsivo e com modos Dark e Light |
| **Lógica do Cliente** | **JavaScript (ES6+)** | Arquitetura reativa e desacoplada orientada a módulos e eventos |
| **Gráficos e KPIs** | **Chart.js** | Visualização analítica da situação cadastral e cargas de incêndio |
| **Integração de Dados** | **Google Visualization API** | Leitura e sincronização com as 58 abas de ocupações em nuvem |
| **Servidor Local** | **Node.js (HTTP nativo)** | Distribuição estática local com suporte a IPv4/IPv6 (`0.0.0.0:3000`) |

---

## 📁 Estrutura do Projeto

```text
arquivo-dgsci/
├── css/
│   ├── base.css                 # Reset, tipografia e tokens de design
│   ├── components.css           # Componentes UI, Store Locator e Mapbox popups
│   └── layout.css               # Grid, sidebar e responsividade
├── js/
│   ├── app.js                   # Orquestrador geral da aplicação
│   ├── cbmpa-divisions.js       # Catálogo oficial das divisões A-1 a N-1
│   ├── charts.js                # Gráficos de conformidade e carga de incêndio
│   ├── data-store.js            # Central de estado e métricas reativas
│   ├── geo-map.js               # Motor Mapbox GL JS, camadas e interatividade
│   ├── geo-map-keys.js          # Módulo compartilhado de chaves e centróides de bairros
│   ├── sheets-sync.js           # Parser e sincronizador das abas do Google Sheets
│   └── table.js                 # Tabela paginada, filtros multicritério e modais
├── tools/
│   └── geocode-addresses.js     # Script de geocodificação porta a porta via Mapbox
├── geocoded_addresses.json      # Base de coordenadas geocodificadas por endereço/número
├── verified_gis_streets.json    # Base de apoio e fallback cartográfico de logradouros
├── index.html                   # Interface principal do painel
├── server.js                    # Servidor HTTP local (porta 3000)
└── README.md                    # Documentação técnica oficial
```

---

## 🚀 Como Executar Localmente

1. **Pré-requisitos**: Ter o [Node.js](https://nodejs.org/) instalado.
2. **Iniciar o Servidor**:
   ```bash
   node server.js
   ```
3. **Acessar**:
   Abra o navegador em: [http://localhost:3000](http://localhost:3000)

### Atualização da Base Geocodificada (Opcional)
Sempre que novos endereços forem adicionados à planilha oficial, basta rodar:
```bash
node tools/geocode-addresses.js
```
O script consultará apenas os endereços inéditos na **Mapbox API v6** e atualizará o arquivo `geocoded_addresses.json` automaticamente.

---

## 🏛️ Corpo de Bombeiros Militar do Pará (CBMPA)
**Departamento-Geral de Segurança Contra Incêndios e Emergências (DGSCI)**  

