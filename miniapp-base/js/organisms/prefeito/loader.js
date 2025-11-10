const VERSION_STATUS_ELEMENT = document.getElementById('version-status');
    let stylesLoaded = false;

    // Função para atualizar o status de carregamento e o indicador visual
    function updateLoadStatus(version, success = true) {
        if (stylesLoaded) return; // Se já carregou, ignora outros eventos

        stylesLoaded = true;
        VERSION_STATUS_ELEMENT.textContent = `CSS: Branch ${version}`;
        VERSION_STATUS_ELEMENT.classList.remove('temp', 'main');
        
        if (success) {
            VERSION_STATUS_ELEMENT.classList.add(version);
            if (version === 'temp') {
                console.log('Design System carregado da branch TEMPORÁRIA.');
            } else {
                console.warn('Design System carregado da branch MAIN (Fallback).');
            }
        } else {
            VERSION_STATUS_ELEMENT.textContent = 'CSS: ERRO FATAL';
            VERSION_STATUS_ELEMENT.style.backgroundColor = 'red';
            console.error('Falha ao carregar o Design System de ambas as fontes.');
        }
        
        // Uma vez que o CSS está carregado, os gráficos podem ser desenhados.
        google.charts.setOnLoadCallback(drawAllCharts);
    }
    
    // Configura listeners para o carregamento bem-sucedido
    document.getElementById('styles-temp').onload = () => updateLoadStatus('temp');
    document.getElementById('styles-main').onload = () => updateLoadStatus('main');


    // Função que é chamada em caso de erro no carregamento
    function loadFallback(failedVersion) {
        if (failedVersion === 'temp') {
            console.warn('Falha ao carregar branch TEMPORÁRIA. O Fallback MAIN deve tentar carregar em seguida.');
        } else if (failedVersion === 'main') {
            // Se até o main falhar, exibe erro final
            updateLoadStatus('main', false);
        }
    }


    // === Lógica do Toggle do Menu ===
    document.addEventListener('DOMContentLoaded', () => {
      const wrapper = document.getElementById('app-wrapper');
      const toggleButton = document.getElementById('menu-toggle');
      
      // Assume-se que o CSS da sidebar está carregado para definir o estado inicial
      wrapper.classList.remove('closed'); 
      
      toggleButton.addEventListener('click', () => {
        wrapper.classList.toggle('closed');
        // Redesenha os gráficos para corrigir o tamanho após o toggle
        drawAllCharts(); 
      });
    });

    // === Lógica dos Gráficos (Google Charts) ===
    google.charts.load('current', {'packages':['corechart', 'bar']});

    // Helper para obter variáveis CSS, essencial para o tema dinâmico
    const getCssVar = (name, fallback) => {
        try {
            const value = getComputedStyle(document.body).getPropertyValue(name).trim();
            return value || fallback;
        } catch (e) {
            return fallback || '#000000'; 
        }
    };

    function drawAllCharts() {
        // Verifica se os elementos existem antes de tentar desenhar
        if (document.getElementById('chart_line')) drawLineChart();
        if (document.getElementById('chart_bar')) drawBarChart();
    }

    // Gráfico de Linha: Evolução de Satisfação (1-5) - Setores 1, 2, 3
    function drawLineChart() {
        const data = google.visualization.arrayToDataTable([
            ['Mês', 'Saúde (Setor 1)', 'Educação (Setor 2)', 'Mobilidade (Setor 3)'],
            ['Abr', 4.0, 3.8, 3.0], 
            ['Mai', 4.2, 3.9, 3.2], 
            ['Jun', 4.3, 4.1, 3.5], 
            ['Jul', 4.1, 4.0, 3.6], 
            ['Ago', 4.2, 4.2, 3.8], 
            ['Set', 4.4, 4.3, 3.9]
        ]);
        
        const options = {
            hAxis: { 
                title: 'Mês', 
                textStyle: { color: getCssVar('--text-color-muted', '#64748b') } 
            },
            vAxis: { 
                title: 'Nível (1-5)', 
                viewWindow: { min: 1, max: 5 }, 
                format: 'decimal', // Exibe o valor de 1 a 5
                textStyle: { color: getCssVar('--text-color-muted', '#64748b') } 
            },
            legend: { 
                position: 'bottom', 
                textStyle: { color: getCssVar('--text-color-primary', '#0f172a')} 
            },
            // Cores: Padrão, Secundária, e uma cor de feedback
            colors: [
                getCssVar('--color-accent-green', '#16a34a'), 
                getCssVar('--color-brand-secondary', '#0b57d0'), 
                getCssVar('--color-brand-primary', '#ff7a00')
            ],
            chartArea: { width: '90%', height: '70%' },
            backgroundColor: 'transparent',
            animation: { duration: 1000, easing: 'out', startup: true }
        };
        const chart = new google.visualization.LineChart(document.getElementById('chart_line'));
        chart.draw(data, options);
    }

    // Gráfico de Barra: Comparativo de Satisfação Média (K06-K10)
    function drawBarChart() {
        const data = google.visualization.arrayToDataTable([
            ['Setor', 'Satisfação Média (1-5)', { role: 'style' }],
            // Simulação de cores baseada no resultado (verde=bom, amarelo=alerta, vermelho=crítico)
            ['Planejamento', 3.1, getCssVar('--color-warning-yellow', '#f59e0b')],
            ['Ass. Social', 3.7, getCssVar('--color-accent-green', '#16a34a')], 
            ['Desenvolvimento', 3.5, getCssVar('--color-brand-secondary', '#0b57d0')],
            ['Meio Ambiente', 2.9, getCssVar('--color-danger-red', '#dc2626')]
        ]);

        const options = {
            title: 'Média dos KPIs K06-K10',
            chartArea: { width: '70%', height: '80%' },
            hAxis: { 
                title: 'Nível (1-5)', 
                minValue: 1, 
                maxValue: 5,
                textStyle: { color: getCssVar('--text-color-muted', '#64748b') } 
            },
            vAxis: { 
                textStyle: { color: getCssVar('--text-color-muted', '#64748b') } 
            },
            legend: { position: 'none' },
            backgroundColor: 'transparent',
            animation: { duration: 1000, easing: 'out', startup: true }
        };
        const chart = new google.visualization.BarChart(document.getElementById('chart_bar'));
        chart.draw(data, options);
    }
    
    // Garante que os gráficos sejam redesenhados ao mudar o tamanho da janela
    window.addEventListener('resize', drawAllCharts, false);

    // Tenta forçar o fallback caso os eventos onload/onerror não disparem imediatamente
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!stylesLoaded) {
                const tempLink = document.getElementById('styles-temp');
                const mainLink = document.getElementById('styles-main');
                
                // Verifica o status de carregamento via `sheet` (pode não funcionar em todos os navegadores/ambientes)
                if (tempLink.sheet) {
                   updateLoadStatus('temp');
                } else if (mainLink.sheet) {
                   updateLoadStatus('main');
                } else {
                   // Se nada carregou, força o status de erro (fallback de último recurso)
                   updateLoadStatus('main', false);
                }
            }
        }, 3000); // 3 segundos para o CSS carregar
    });
