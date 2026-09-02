/**
 * DGSCI / CBMPA - Charts Renderer (Chart.js)
 * Renderização e atualização reativa de todos os gráficos visuais do Dashboard
 */

class DashboardCharts {
  constructor() {
    this.instances = {};
    this.initThemeDefaults();
  }

  initThemeDefaults() {
    if (typeof Chart === 'undefined') return;
    
    // Configurações padrão de tema e fontes
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.color = '#94A3B8';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
  }

  /**
   * Renderiza ou atualiza todos os gráficos
   */
  updateAll(store, groupFilter = 'all') {
    this.renderSituationChart(store, groupFilter);
    this.renderNeighborhoodsChart(store);
    this.renderRiskAndGroupChart(store);
    this.renderProjectApprovedChart(store);
    this.renderRiskDistributionChart(store);
    this.renderSectorDistributionChart(store);
  }

  /**
   * 1. Gráfico Rosca: Situação do Licenciamento
   */
  renderSituationChart(store, groupFilter) {
    const ctx = document.getElementById('chartSituation');
    if (!ctx) return;

    const data = store.getSituationChartData(groupFilter);

    if (this.instances.situation) {
      this.instances.situation.destroy();
    }

    this.instances.situation = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors,
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#FFF' : '#121B2F',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 11, weight: '500' }
            }
          }
        }
      }
    });
  }

  /**
   * 2. Gráfico Barras Horizontais: Top Bairros
   */
  renderNeighborhoodsChart(store) {
    const ctx = document.getElementById('chartNeighborhoods');
    if (!ctx) return;

    const data = store.getTopNeighborhoodsData(7);

    if (this.instances.neighborhoods) {
      this.instances.neighborhoods.destroy();
    }

    this.instances.neighborhoods = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Estabelecimentos',
          data: data.data,
          backgroundColor: 'rgba(59, 130, 246, 0.75)',
          borderColor: '#3B82F6',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { precision: 0 }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * 3. Gráfico Barras Empilhadas: Grupos CBMPA e Risco
   */
  renderRiskAndGroupChart(store) {
    const ctx = document.getElementById('chartRiskAndGroup');
    if (!ctx) return;

    const data = store.getGroupAndRiskData();

    if (this.instances.riskAndGroup) {
      this.instances.riskAndGroup.destroy();
    }

    this.instances.riskAndGroup = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets.map(ds => ({
          ...ds,
          borderRadius: 4
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false }
          },
          y: {
            stacked: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { precision: 0 }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { size: 11 } }
          }
        }
      }
    });
  }

  /**
   * 4. Gráfico Vistorias por Vistoriador
   */
  renderInspectorsChart(store) {
    const ctx = document.getElementById('chartInspectors');
    if (!ctx) return;

    const data = store.getInspectorsData(8);

    if (this.instances.inspectors) {
      this.instances.inspectors.destroy();
    }

    this.instances.inspectors = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Vistorias Designadas',
          data: data.data,
          backgroundColor: 'rgba(139, 92, 246, 0.75)',
          borderColor: '#8B5CF6',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  /**
   * 5. Gráfico Projetos Aprovados
   */
  renderProjectApprovedChart(store) {
    const ctx = document.getElementById('chartProjectApproved');
    if (!ctx) return;

    const data = store.getProjectApprovalData();

    if (this.instances.projectApproved) {
      this.instances.projectApproved.destroy();
    }

    this.instances.projectApproved = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors,
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#FFF' : '#121B2F'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  /**
   * 6. Gráfico Grau de Risco
   */
  renderRiskDistributionChart(store) {
    const ctx = document.getElementById('chartRiskDistribution');
    if (!ctx) return;

    const data = store.getRiskDistributionData();

    if (this.instances.riskDistribution) {
      this.instances.riskDistribution.destroy();
    }

    this.instances.riskDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors,
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#FFF' : '#121B2F'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  /**
   * 7. Gráfico Setores Operacionais
   */
  renderSectorDistributionChart(store) {
    const ctx = document.getElementById('chartSectorDistribution');
    if (!ctx) return;

    const data = store.getSectorDistributionData();

    if (this.instances.sectors) {
      this.instances.sectors.destroy();
    }

    this.instances.sectors = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Processos / Cadastros',
          data: data.data,
          backgroundColor: data.colors.map(c => c + 'CC'),
          borderColor: data.colors,
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { precision: 0 } }
        }
      }
    });
  }
}

window.dashboardCharts = new DashboardCharts();
