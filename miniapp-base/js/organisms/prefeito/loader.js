const VERSION_STATUS_ELEMENT = document.getElementById('version-status');
let chartsBootstrapped = false;

function updateDesignSystemStatus(success = true) {
  if (!VERSION_STATUS_ELEMENT) {
    return;
  }

  VERSION_STATUS_ELEMENT.textContent = success ? 'Design System sincronizado' : 'Design System indisponível';
  VERSION_STATUS_ELEMENT.classList.toggle('badge--error', !success);
}

document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('app-wrapper');
  const toggleButton = document.getElementById('menu-toggle');

  updateDesignSystemStatus(true);

  if (wrapper && toggleButton) {
    wrapper.classList.remove('closed');
    toggleButton.addEventListener('click', () => {
      wrapper.classList.toggle('closed');
      drawAllCharts();
    });
  }
});

google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(() => {
  chartsBootstrapped = true;
  drawAllCharts();
});

function getCssVar(name, fallback) {
  try {
    const value = getComputedStyle(document.body).getPropertyValue(name).trim();
    return value || fallback;
  } catch (error) {
    return fallback || '#000000';
  }
}

function drawAllCharts() {
  if (!chartsBootstrapped) {
    return;
  }

  if (document.getElementById('chart_line')) {
    drawLineChart();
  }
  if (document.getElementById('chart_bar')) {
    drawBarChart();
  }
}

function drawLineChart() {
  const data = google.visualization.arrayToDataTable([
    ['Mês', 'Saúde (Setor 1)', 'Educação (Setor 2)', 'Mobilidade (Setor 3)'],
    ['Abr', 4.0, 3.8, 3.0],
    ['Mai', 4.2, 3.9, 3.2],
    ['Jun', 4.3, 4.1, 3.5],
    ['Jul', 4.1, 4.0, 3.6],
    ['Ago', 4.2, 4.2, 3.8],
    ['Set', 4.4, 4.3, 3.9],
  ]);

  const options = {
    hAxis: {
      title: 'Mês',
      textStyle: { color: getCssVar('--text-color-muted', '#64748b') },
    },
    vAxis: {
      title: 'Nível (1-5)',
      viewWindow: { min: 1, max: 5 },
      format: 'decimal',
      textStyle: { color: getCssVar('--text-color-muted', '#64748b') },
    },
    legend: {
      position: 'bottom',
      textStyle: { color: getCssVar('--text-color-primary', '#0f172a') },
    },
    colors: [
      getCssVar('--color-accent-green', '#16a34a'),
      getCssVar('--color-brand-secondary', '#0b57d0'),
      getCssVar('--color-brand-primary', '#ff7a00'),
    ],
    chartArea: { width: '90%', height: '70%' },
    backgroundColor: 'transparent',
    animation: { duration: 1000, easing: 'out', startup: true },
  };

  const chart = new google.visualization.LineChart(document.getElementById('chart_line'));
  chart.draw(data, options);
}

function drawBarChart() {
  const data = google.visualization.arrayToDataTable([
    ['Setor', 'Satisfação Média (1-5)', { role: 'style' }],
    ['Planejamento', 3.1, getCssVar('--color-warning-yellow', '#f59e0b')],
    ['Ass. Social', 3.7, getCssVar('--color-accent-green', '#16a34a')],
    ['Desenvolvimento', 3.5, getCssVar('--color-brand-secondary', '#0b57d0')],
    ['Meio Ambiente', 2.9, getCssVar('--color-danger-red', '#dc2626')],
  ]);

  const options = {
    title: 'Média dos KPIs K06-K10',
    chartArea: { width: '70%', height: '80%' },
    hAxis: {
      title: 'Nível (1-5)',
      minValue: 1,
      maxValue: 5,
      textStyle: { color: getCssVar('--text-color-muted', '#64748b') },
    },
    vAxis: {
      textStyle: { color: getCssVar('--text-color-muted', '#64748b') },
    },
    legend: { position: 'none' },
    backgroundColor: 'transparent',
    animation: { duration: 1000, easing: 'out', startup: true },
  };

  const chart = new google.visualization.BarChart(document.getElementById('chart_bar'));
  chart.draw(data, options);
}

window.addEventListener('resize', drawAllCharts, false);

