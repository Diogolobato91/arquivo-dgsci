# DGSCI / CBMPA — Painel de Controle e Consulta de Estabelecimentos

Sistema de controle e consulta operacional de estabelecimentos comerciais, residenciais e industriais do **Corpo de Bombeiros Militar do Pará (CBMPA)**, desenvolvido para o **Departamento-Geral de Segurança Contra Incêndios e Emergências (DGSCI)**.

## 🚀 Funcionalidades Principais

- **Sincronização em Tempo Real**: Conexão direta com as 58 abas de ocupações do Google Planilhas (A-1 a N-1).
- **Mapa Territorial GIS**: Georreferenciamento de estabelecimentos em Belém e RMB classificados nos 6 Setores Operacionais Oficiais do CBMPA.
- **Catálogo Técnico CBMPA**: Normas técnicas, grupos de ocupação, divisões e exemplos práticos da legislação de segurança contra incêndio.
- **Filtros Avançados & Consulta**: Busca multicritério por Razão Social, CNPJ, CNAE, Bairro, Setor e Situação Cadastral.
- **Impressão de Ficha Cadastral**: Emissão de ficha técnica e histórica individual formatada perfeitamente para folha A4 em 1 página.
- **Análises Estatísticas**: Gráficos de conformidade, distribuição de carga de incêndio (/m^2$) e concentração por bairros.

## 🛠️ Tecnologias Utilizadas

- **HTML5 & Vanilla CSS**: Design responsivo com temas Dark e Light.
- **JavaScript (ES6+)**: Processamento assíncrono e reativo no navegador (sem necessidade de backend complexo).
- **Leaflet.js & OpenStreetMap**: Georreferenciamento geoespacial.
- **Chart.js**: Renderização de métricas e gráficos estatísticos.
- **Google Visualization API**: Leitura direta das planilhas em nuvem.

## 📦 Como Publicar (Netlify / GitHub Pages)

O projeto é 100% estático e pode ser hospedado gratuitamente no **Netlify**, **GitHub Pages** ou **Vercel**:
1. Conecte este repositório no Netlify.
2. Em **Publish directory**, deixe a raiz ./ (onde está o index.html).
3. Clique em **Deploy**.
