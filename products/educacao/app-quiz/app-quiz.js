import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fetchExams, fetchExamQuestions } from './enem-data-service.js';

// ==================================================================================
// 1. SISTEMA DE DESIGN & CONFIGURAÇÃO (Theme Engine - APENAS CONSTANTES DECLARATIVAS)
// ==================================================================================

// 1.1. PALETA DE CORES PURAS (SIMPLIFICADA)
// Definindo APENAS as cores necessárias (Primária, Feedback, Neutra).

// NOVO: Definição da cor principal do aplicativo (Esmeralda - Foco Único)
const APP_PRIMARY_COLOR = '#059691';
// Cor de fundo padrão (usando a cor de fundo do tema principal)
const APP_PRIMARY_BG_RAW = '#ecfdf5'; // bg-emerald-50
// Cor do texto padrão
const APP_PRIMARY_TEXT = '#065F46'; // text-emerald-800

// CORES ESSENCIAIS PARA FEEDBACK E ESTADOS
const FEEDBACK_COLORS = {
    RED_PRIMARY: '#DC2626', // Vermelho para Errado
    RED_BG: '#fef2f2', // Fundo Vermelho
    NEUTRAL_PRIMARY: '#64748B', // Cinza para Neutro/Não Respondido
    NEUTRAL_BG: '#f8fafc', // Fundo Neutro
};

// 1.2. TOKENS DE ESTILO PRIMITIVOS (Classes CSS Atômicas)
// Tokens atômicos do Tailwind CSS.
const PRIMITIVE_STYLES = {
    // Cores de Texto e Fundo Genéricas
    TEXT_SLATE_800: 'text-slate-800',
    TEXT_SLATE_700: 'text-slate-700',
    TEXT_SLATE_500: 'text-slate-500',
    TEXT_WHITE: 'text-white',
    BG_SLATE_50: 'bg-slate-50',
    BG_SLATE_500: 'bg-slate-500',
    BG_ROSE_500: 'bg-rose-500',
    BG_AMBER_500: 'bg-amber-500',
    BG_EMERALD_500: 'bg-emerald-500',
    BORDER_SLATE_200: 'border-slate-200',
    // Tipografia Genérica
    FONT_BASE: 'text-base',
    FONT_SM: 'text-sm',
    FONT_XS: 'text-xs',
    LEADING_RELAXED: 'leading-relaxed',
    LEADING_TIGHT: 'leading-tight',
    FONT_NORMAL: 'font-normal',
    FONT_MEDIUM: 'font-medium',
    FONT_BOLD: 'font-bold',
    // Layout & Espaçamento
    TEXT_CENTER: 'text-center',
    PADDING_Y_2: 'py-2',
    PADDING_X_2: 'px-2',
    PADDING_Y_1: 'py-1',
    PADDING_1: 'p-2',
    MARGIN_TOP_1: 'mt-1',
    FLEX: 'flex',
    ITEMS_CENTER: 'items-center',
    GAP_1: 'gap-1',
    JUSTIFY_CENTER: 'justify-center',
    ROUNDED_LG: 'rounded-lg',
    ROUNDED_FULL: 'rounded-full', // Adicionado/Confirmado
    SHADOW_SM: 'shadow-sm',
    BORDER: 'border',
    TEXT_XL: 'text-xl',
};

// 1.3. ÍCONES DO SISTEMA (Tokens para Google Material Symbols)
const SYSTEM_ICONS = {
    // Ícone Genérico Principal (Substitui todos os ícones de matéria)
    ROCKET: 'rocket_launch', 
    
    // Ícones de metadados
    LIGHTBULB: 'lightbulb',
    HELP_OUTLINE: 'help_outline', 
    APPS: 'apps',
    DESCRIPTION: 'description',
    MAP: 'map',
    BOLT: 'bolt',
    MATH_FUNCTIONS: 'functions',
    BAR_CHART: 'bar_chart',
    LINE_CHART: 'ssid_chart',
    DONE_ALL: 'done_all', 
    LOCK: 'lock',
    SEND: 'send',
    REFRESH: 'refresh',
    RATE_REVIEW: 'rate_review',
    LIST_ALT: 'list_alt',
    
    // Status e Feedback
    CHECK: 'check_circle', 
    CLOSE: 'cancel',       
    EMOJI_CORRECT: '✅',
    EMOJI_INCORRECT: '❌',
};

// 1.4. TOKENS COMPOSICIONAIS GLOBAIS (Montado a partir de 1.2)
const COMPOSITIONAL_STYLES = {
    // ATUALIZADO: Retornando ao text-base (16px) padrão para o corpo principal, agora que o simulador tem o tamanho padrão (390px)
    TEXT_BODY: `${PRIMITIVE_STYLES.TEXT_SLATE_800} ${PRIMITIVE_STYLES.FONT_BASE} ${PRIMITIVE_STYLES.LEADING_RELAXED} ${PRIMITIVE_STYLES.FONT_NORMAL}`,
    METRIC_COUNT: `${PRIMITIVE_STYLES.FONT_SM} ${PRIMITIVE_STYLES.FONT_BOLD} ${PRIMITIVE_STYLES.TEXT_SLATE_700} ${PRIMITIVE_STYLES.TEXT_CENTER} ${PRIMITIVE_STYLES.PADDING_Y_2} ${PRIMITIVE_STYLES.LEADING_TIGHT}`,
    TITLE_LABEL: `${PRIMITIVE_STYLES.TEXT_SLATE_800} ${PRIMITIVE_STYLES.TEXT_XL} ${PRIMITIVE_STYLES.FONT_BOLD}`,
    METADATA_TEXT: `${PRIMITIVE_STYLES.TEXT_XS} ${PRIMITIVE_STYLES.FONT_MEDIUM} ${PRIMITIVE_STYLES.TEXT_SLATE_500} ${PRIMITIVE_STYLES.MARGIN_TOP_1}`,
    
    VISUAL_CONTAINER: `${PRIMITIVE_STYLES.FLEX} ${PRIMITIVE_STYLES.JUSTIFY_CENTER}`,
    ICON_WRAPPER_CIRCLE: `p-2 ${PRIMITIVE_STYLES.ROUNDED_FULL}`, 
    BADGE_TEXT_STYLE: `${PRIMITIVE_STYLES.TEXT_SM} ${PRIMITIVE_STYLES.FONT_MEDIUM}`, 

    // Agregação dos estilos de Componente Badged - Mantidos para o caso de uso futuro, mas não usados.
    Badged: {
        BADGE_BASE: `${PRIMITIVE_STYLES.FLEX} ${PRIMITIVE_STYLES.ITEMS_CENTER} ${PRIMITIVE_STYLES.GAP_1} ${PRIMITIVE_STYLES.TEXT_XS} ${PRIMITIVE_STYLES.FONT_BOLD} ${PRIMITIVE_STYLES.PADDING_X_2} ${PRIMITIVE_STYLES.PADDING_Y_1} ${PRIMITIVE_STYLES.ROUNDED_FULL} ${PRIMITIVE_STYLES.TEXT_WHITE} ${PRIMITIVE_STYLES.SHADOW_SM}`,
        BADGE_TIMER: `${PRIMITIVE_STYLES.BG_SLATE_500}`,
        BADGE_DIFFICULTY_EASY: `${PRIMITIVE_STYLES.BG_EMERALD_500}`,
        BADGE_DIFFICULTY_MEDIUM: `${PRIMITIVE_STYLES.BG_AMBER_500}`,
        BADGE_DIFFICULTY_HARD: `${PRIMITIVE_STYLES.BG_ROSE_500}`,
    },
    
    ACTION_BUTTON_SECONDARY: `border border-slate-300 bg-white text-slate-700 hover:bg-slate-100`,
    ACTION_BUTTON_PRIMARY_SOLID: `bg-indigo-600 text-white font-bold shadow-lg`,
    ACTION_BUTTON_EMPHASIS_SOLID: `bg-emerald-600 text-white font-bold shadow-md hover:bg-emerald-700`,
};

// 1.5. TEMA GLOBAL (Padronizado)
const GLOBAL_THEME = { 
    primary: APP_PRIMARY_COLOR, 
    bgRaw: APP_PRIMARY_BG_RAW, 
    text: APP_PRIMARY_TEXT, 
    icon: SYSTEM_ICONS.ROCKET 
};


// ==================================================================================
// 2. MODELO UNIVERSAL DE QUESTÃO (Esquema de Dados e Metadados de UI)
// ==================================================================================

// 2.1. TEMPLATE DE MODELO UNIVERSAL (Contrato de Dados) - Mantido para documentação
const UNIVERSAL_MODEL_TEMPLATE = {
    id: null, 
    type: 'text', 
    subject: 'Geral', // PADRONIZADO
    topic: 'Assunto Padrão',
    preview: 'Descrição curta do conteúdo',
    courseEdition: 'Edição Padrão',
    durationMinutes: 5,
    difficulty: 'Média',
    content: { 
        text: 'O corpo principal da pergunta ou contexto.',
        chartData: null,
        pyramidData: null,
        imageURL: null,
        imageAlt: null
    },
    question: 'A pergunta de múltipla escolha a ser respondida.',
    options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'], 
    answer: null,
    modelAnswer: null, // Adicionado campo para resposta dissertativa
};

// 2.2. METADADOS DE UI (Constantes Flexíveis de Texto/Ícone)
const MODEL_METADATA = {
    // Títulos principais do Quiz e Seções
    SECTION_TITLE: {
        CONTEXT: { title: "Contexto", icon: SYSTEM_ICONS.LIGHTBULB },
        QUESTION: { title: "Pergunta", icon: SYSTEM_ICONS.HELP_OUTLINE },
        RESPONSE_OPTIONS: { title: "Options de Resposta", icon: SYSTEM_ICONS.LIST_ALT }, 
        MAP_VIEW: { title: "Catálogo de Cursos", icon: SYSTEM_ICONS.MAP },
        APP_TITLE: { title: "Simulado Inteligente | Preparatório ENEM", icon: SYSTEM_ICONS.BOLT, color: APP_PRIMARY_COLOR },
        APP_SUBTITLE: "Sua plataforma completa de simulação para o ENEM e Cursos Preparatórios.",
    },
    // Rótulos de metadados da questão (Badge Headers)
    QUESTION_LABELS: {
        SUBJECT: { title: "TEMA", icon: SYSTEM_ICONS.APPS }, // Renomeado para TEMA
        TOPIC: { title: "ASSUNTO", icon: SYSTEM_ICONS.DESCRIPTION },
        METRIC: "Questão",
    },
    // Rótulos de Feedback
    FEEDBACK: {
        CORRECT: "Parabéns, você acertou!",
        CORRECT_ICON: 'sentiment_satisfied',
        INCORRECT_ICON: 'sentiment_dissatisfied',
        RETRY: "Tentar Novamente",
        SHOW_ANSWER: "Ver Resposta",
        PREV: "Anterior",
        NEXT: "Próximo",
        CONTINUE: "Continuar", // Novo rótulo para botão unificado
        REVIEW_TITLE: "Revisão Detalhada de Questões",
    }
};

// ==================================================================================
// 3. DADOS (Data Layer)
// ==================================================================================

// 3.1. CATÁLOGO DE PERGUNTAS (Carregado dinamicamente via serviço)
// Os dados são buscados a partir dos arquivos JSON do repositório no momento da interação.

// ==================================================================================
// 4. COMPONENTES UTILITÁRIOS (Visualização de Dados)
// ==================================================================================

// Componente DEPRECATED, mas mantido para a pirâmide, pois ainda é referenciado.
const FoodPyramidDiagram = ({ data }) => {
    // CLÁUSULA DE GUARDA ADICIONADA
    if (!data || !data.levels || data.levels.length === 0) {
        return <div className="p-4 text-center text-red-500">Dados da Pirâmide Ausentes.</div>;
    }

    const svgWidth = 300;
    const svgHeight = 250;
    const pyramidBase = 280;
    const pyramidHeight = 220;

    const totalArea = data.levels.reduce((acc, level) => acc + level.area, 0);
    let cumulativeHeight = pyramidHeight;
    const pyramidLevels = [];

    data.levels.forEach((level, index) => {
        const areaRatio = level.area / totalArea;
        const heightReduction = pyramidHeight * Math.sqrt(areaRatio); 
        const topY = cumulativeHeight - heightReduction;
        const bottomY = cumulativeHeight;
        const topWidth = (topY / pyramidHeight) * pyramidBase;
        const bottomWidth = (bottomY / pyramidHeight) * pyramidBase;
        const centerOffset = (svgWidth - pyramidBase) / 2 + 10;
        
        pyramidLevels.push({
            ...level,
            points: `${centerOffset + (pyramidBase - bottomWidth) / 2},${bottomY} 
                     ${centerOffset + (pyramidBase + bottomWidth) / 2},${bottomY} 
                     ${centerOffset + (pyramidBase + topWidth) / 2},${topY} 
                     ${centerOffset + (pyramidBase - topWidth) / 2},${topY}`,
            center: { x: svgWidth / 2, y: topY + (bottomY - topY) / 2 }
        });
        cumulativeHeight = topY;
    });
    
    pyramidLevels.reverse(); 

    return (
        <div className="w-full flex justify-center py-4 bg-white rounded-lg">
            <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                {pyramidLevels.map((level, index) => (
                    <g key={index}>
                        <polygon points={level.points} fill={level.color} className="opacity-90 stroke-white stroke-2 shadow-inner" />
                        <text x={level.center.x} y={level.center.y - 10} textAnchor="middle" className="text-2xl drop-shadow-md">{level.icon}</text>
                         <text x={level.center.x} y={level.center.y + 15} textAnchor="middle" className="fill-white text-[10px] font-bold uppercase drop-shadow-sm">{level.label}</text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// Componente para renderizar gráficos Chart.js
const ChartJSRenderer = ({ type, data, isLoaded }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const chartTypeMap = {
        'chart-donut': 'doughnut',
        'chart-line': 'line',
        'chart-bar': 'bar',
    };
    
    const chartType = chartTypeMap[type] || 'bar';

    // Cria os dados no formato Chart.js
    const getChartData = useCallback(() => {
        // CORREÇÃO 1: Adicionar verificação inicial mais rigorosa
        if (!data || !data.labels || (!data.values && !data.datasets)) {
            console.error("Chart data is incomplete:", data);
            return null;
        }

        let baseDatasets = [];
        
        if (chartType === 'doughnut') {
            // Doughnut Chart (usa um dataset único com values/colors)
            if (data.values && data.colors) {
                 baseDatasets.push({
                    data: data.values,
                    backgroundColor: data.colors,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                });
            }
        } else {
            // Bar/Line Chart (usa múltiplos datasets, ou datasets simulados de 'values')
            if (data.datasets && data.datasets.length > 0) {
                 // Usa a estrutura de datasets, mapeando cada uno
                 baseDatasets = data.datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data,
                    backgroundColor: ds.backgroundColor || ds.borderColor || '#4F46E5',
                    borderColor: ds.borderColor || '#4F46E5',
                    borderWidth: ds.borderWidth || 2,
                    pointRadius: ds.pointRadius || 4,
                    // Garante que se pointBackgroundColor não for definido, ele use a cor da linha, 
                    // e se pointBorderWidth não for definido, use 1 (ou o que for padrão), 
                    // mas forçamos 0 ou um valor baixo para simular um ponto sólido se for um gráfico de linha.
                    pointBackgroundColor: ds.pointBackgroundColor || ds.borderColor || '#4F46E5',
                    pointBorderWidth: ds.pointBorderWidth !== undefined ? ds.pointBorderWidth : (chartType === 'line' ? 0 : 1), 
                    fill: ds.fill || false,
                    tension: ds.tension !== undefined ? ds.tension : (chartType === 'line' ? 0.4 : 0),
                }));
            } else if (data.values) {
                // CORREÇÃO 2: Trata Bar/Line que usa a estrutura simplificada 'values' (ex: Questões 3 e 12)
                 baseDatasets.push({
                    label: data.label || 'Frequência',
                    data: data.values,
                    backgroundColor: data.backgroundColor || '#4F46E5',
                    borderColor: data.backgroundColor || '#4F46E5',
                    borderWidth: 1,
                    pointRadius: chartType === 'line' ? 3 : 4,
                    pointBorderWidth: chartType === 'line' ? 0 : 1,
                    pointBackgroundColor: data.backgroundColor || '#4F46E5',
                    // Garante que gráficos de linha simples usando 'values' sejam tratados corretamente
                    type: chartType === 'line' ? 'line' : undefined, 
                    tension: chartType === 'line' ? 0.4 : 0,
                    fill: chartType === 'line',
                });
            }
        }
        
        // Verifica se datasets válidos foram criados
        if (baseDatasets.length === 0) {
             console.error("Chart data is incomplete:", data);
             return null;
        }

        return {
            labels: data.labels,
            datasets: baseDatasets
        };
    }, [chartType, data]); // Dependências do useCallback

    // Opções do gráfico
    const options = useMemo(() => {
        
        let legendPosition;
        if (chartType === 'doughnut') {
            // Para gráfico de rosca, mantém a legenda à direita para maximizar o espaço vertical
            legendPosition = 'right';
        } else {
            // Para gráficos de Linha e Barra, define a legenda na parte inferior
            legendPosition = 'bottom';
        }

        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false, // Permite que o contêiner React controle o tamanho
            plugins: {
                legend: {
                    // IMPLEMENTAÇÃO DA PADRONIZAÇÃO DA LEGENDA
                    position: legendPosition,
                    labels: {
                        // NOVO: Usa estilo de ponto (círculo) para o indicador
                        usePointStyle: true,
                        pointStyle: 'circle',
                        // ADIÇÃO SOLICITADA: Reduz o tamanho do tamanho do marcador na legenda (boxWidth)
                        boxWidth: 12, 
                        font: {
                            family: 'Inter',
                            size: 10,
                        }
                    }
                },
                tooltip: {
                    titleFont: { family: 'Inter', size: 10, weight: 'bold' },
                    bodyFont: { family: 'Inter', size: 10 },
                },
                // REINTRODUZIDO: Configuração do datalabels (apenas para Doughnut Chart)
                datalabels: {
                    display: chartType === 'doughnut',
                    color: '#fff', // Cor do texto branco
                    font: {
                        weight: 'bold',
                        size: 14,
                    },
                    textAlign: 'center',
                    // Formatação para exibir a porcentagem
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        if (total === 0) return '0%';
                        const percentage = ((value / total) * 100).toFixed(0);
                        return value > 0 ? `${percentage}%` : ''; 
                    },
                    anchor: 'center', 
                    align: 'center',
                },
            },
            scales: chartType !== 'doughnut' ? {
                x: {
                    ticks: { font: { size: 10, family: 'Inter' } },
                    title: { display: true, text: chartType === 'line' ? 'Tempo (min)' : 'Categoria', font: { size: 10, family: 'Inter' } }
                },
                y: {
                    ticks: { font: { size: 10, family: 'Inter' } },
                    title: { display: true, text: chartType === 'line' ? 'Temperatura ($^\circ C$)' : 'Frequência', font: { size: 10, family: 'Inter' } }
                }
            } : {}
        };

        // Customização de Títulos de Eixos para a Questão 10 (Gráfico de Barras - Frequência)
        if (chartType === 'bar' && data.label === "Frequência de Ocorrência") {
             baseOptions.scales.x.title.text = 'Face do Dado';
             baseOptions.scales.y.title.text = 'Contagem (Frequência)';
        }
        
        // Remove 'datalabels' da lista de plugins para outros tipos de gráfico
        if (chartType !== 'doughnut') {
            baseOptions.plugins.datalabels = { display: false };
        }
        
        return baseOptions;
    }, [chartType, data]);


    useEffect(() => {
        // Se Chart.js não estiver carregado, ou os dados estiverem ausentes, ou a referência não estiver pronta
        if (!isLoaded || !canvasRef.current || !data || !window.Chart) {
            return;
        }

        // Destroi a instância anterior do gráfico, se houver
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const chartData = getChartData();
        // CORREÇÃO 3: Se getChartData retornar null (dados incompletos), não tenta criar o gráfico.
        if (!chartData) return;

        // REINTRODUZIDO: Lógica de adição do plugin datalabels ao Chart.js
        const plugins = [];
        if (window.ChartDataLabels) {
             plugins.push(window.ChartDataLabels);
        } else {
             console.warn("ChartDataLabels plugin not found globally. Check CDN loading.");
        }


        // Cria a nova instância do gráfico
        chartRef.current = new window.Chart(canvasRef.current, {
            type: chartType,
            data: chartData,
            options: options,
            plugins: plugins // Adiciona o plugin aqui
        });

        // Limpeza: destrói o gráfico ao desmontar o componente
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [isLoaded, data, chartType, options, getChartData]); // Adicionado getChartData como dependência

    // Renderiza um placeholder enquanto o script Chart.js não carrega
    if (!isLoaded) {
         return (
             <div className="w-full h-64 flex items-center justify-center text-slate-500 text-sm">
                Carregando biblioteca de gráficos...
             </div>
         );
    }

    // O canvas precisa de um tamanho fixo para Chart.js funcionar corretamente no modo 'maintainAspectRatio: false'
    return (
        // Removido o padding do p-4 para maximizar o espaço do gráfico dentro do contêiner.
        <div className="w-full flex justify-center">
            <div className="relative w-full max-w-sm h-64">
                <canvas ref={canvasRef} aria-label={`Gráfico do tipo ${chartType}`} role="img"></canvas>
            </div>
        </div>
    );
};


// Componente para renderizar imagens ou SVGs simulados
const ImageRenderer = ({ url, alt }) => {
    
    return (
        // ATUALIZADO: Usando w-full e h-auto para garantir a área útil máxima e o esticamento vertical.
        // Removido o padding desnecessário do componente ChartJSRenderer.
        <div className="w-full flex justify-center">
            <img 
                src={url} 
                alt={alt} 
                // Permite que o contêiner de simulação se estique verticalmente.
                className="w-full max-w-sm rounded-lg shadow-lg border border-slate-200 h-auto"
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src="https://placehold.co/500x300/ef4444/ffffff?text=MODELO+IMAGEM+N%C3%83O+ENCONTRADO";
                }}
            />
        </div>
    );
};


// ==================================================================================
// 5. COMPONENTES REUTILIZÁVEIS (Blocos de UI Atômicos)
// ==================================================================================

// 5.1. IconToken: Componente que renderiza ícones do Google Material Symbols via string.
const IconToken = ({ iconName, color, sizeClass = 'w-3 h-3' }) => {
    // Ajustado para permitir ícones maiores
    // REVERTIDO: Voltando para a lógica de tamanho original (base/sm/xs)
    const fontSizeStyle = { 
        fontSize: sizeClass === 'w-3 h-3' ? '1.1rem' : (sizeClass === 'w-4 h-4' ? '1.3rem' : '1.5rem') 
    };

    return (
        <i 
            className={`material-symbols-outlined ${sizeClass} flex-shrink-0`}
            style={{ 
                color: color, 
                ...fontSizeStyle
            }} 
        >
            {iconName}
        </i>
    );
};

// 5.2. ComponentTitleToken: Renderiza um token visual (Ícone + Título + Valor) no header.
const ComponentTitleToken = ({ iconName, title, value, color, postValueContent }) => {
    // ATUALIZADO: Classes de fonte/tamanho ajustadas para o layout original/maior (390px)
    const tokenBaseClass = `text-sm uppercase flex items-start gap-2 flex-shrink-0`; 
    const labelClass = "font-bold";
    // ATUALIZADO: Usando text-base
    const valueClass = `${PRIMITIVE_STYLES.FONT_BASE} ${PRIMITIVE_STYLES.FONT_MEDIUM} text-slate-700 ml-1`;

    return (
        <div className="py-0.5 flex items-center">
            
            <div className={tokenBaseClass} style={{ color: color }}>
                {iconName && <IconToken iconName={iconName} color={color} sizeClass='w-5 h-5' />} {/* Ícone maior */}
                <span className={labelClass}>{title}:</span>
            </div>
           
            <span className={valueClass}>{value}</span>
            {postValueContent}
        </div>
    );
};

// 5.3. TitleSection: Wrapper para Contexto ou Pergunta, garantindo a formatação consistente.
const TitleSection = ({ color, iconName, title, value, children, mtClass = 'pt-1' }) => (
    <>
        <div className={mtClass}>
            <ComponentTitleToken 
                iconName={iconName} 
                title={title} 
                value={value} 
                // CORREÇÃO: Usando a cor passada via props (que será APP_PRIMARY_COLOR)
                color={color}
            />
        </div>
        
        {/* Acesso direto ao COMPOSITIONAL_STYLES */}
        <div className={COMPOSITIONAL_STYLES.TEXT_BODY + " -mt-3"}>
            {children}
        </div>
    </>
);


// 5.5. ActionButton: Componente padronizado para botões de navegação/ação no rodapé.
const ActionButton = ({ label, onClick, styleClass, isDisabled, basePaddingClass, refProp }) => {
    
    // Classe Base Global de Estética para manter fonte/tamanho/peso consistentes
    // REMOVIDO: rounded-xl, mantido flex/items/justify center.
    const globalBaseClass = 'text-sm font-semibold flex items-center justify-center text-center';
    
    // Classe de Estado: Manipula apenas o cursor e a opacidade se desabilitado.
    let stateClass = '';
    if (isDisabled) {
        // Estado Inativo: Aplica opacidade e desabilita interações de hover/cursor
        stateClass = 'cursor-not-allowed opacity-70'; 
    } 
    // Otherwise, we let the styleClass determine the hover behavior.

    return (
        <button 
            onClick={onClick}
            disabled={isDisabled}
            ref={refProp} // Propriedade de ref adicionada
            // Combina classe base global (fonte/tamanho), padding (variável), classe de estilo (cor/borda/fundo/hover) e estado
            className={`
                ${globalBaseClass}
                ${basePaddingClass} 
                ${styleClass}
                ${stateClass}
            `}
        >
            <span className="leading-tight">{label}</span>
        </button>
    );
};


// ==================================================================================
// 6. RENDERIZADORES DE CONTEÚDO (Model Rendering)
// ==================================================================================

const QuestionContentRenderer = ({ model, isChartJSEnabled }) => {
    const { type, content } = model;
    
    // Lógica de acesso ao tema Padrão
    const currentTheme = GLOBAL_THEME;
    
    let VisualComponent;
    
    // Usar ChartJSRenderer para todos os tipos de gráfico
    if (isChartJSEnabled && (type === 'chart-donut' || type === 'chart-line' || type === 'chart-bar')) {
        VisualComponent = <ChartJSRenderer type={type} data={content.chartData} isLoaded={isChartJSEnabled} />;
    }
    // Manter Pyramid Diagram e ImageRenderer como fallback ou para tipos específicos
    else if (type === 'diagram-pyramid') {
        VisualComponent = <FoodPyramidDiagram data={content.pyramidData} />;
    }
    else if (type === 'image' || type === 'geometry' || type === 'map') {
        VisualComponent = <ImageRenderer url={content.imageURL} alt={content.imageAlt} />;
    }
    else {
        VisualComponent = null;
    }


    const formattedText = content.text.split(/(\$\$[^$]*\$\$|\$[^$]*\$)/g).map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
            // CORRIGIDO: part.slice(2, -2) para pegar o conteúdo entre $$e$$
            const latex = part.slice(2, -2).trim(); 
            return <div key={index} data-latex={latex} className="my-3 text-center text-lg font-mono text-indigo-700 select-all katex-display-target" style={{ fontFamily: 'monospace' }}>{latex}</div>;
        } else if (part.startsWith('$') && part.endsWith('$')) {
            const latex = part.slice(1, -1).trim();
            return <span key={index} data-latex={latex} className="mx-0.5 text-indigo-600 font-mono text-sm select-all katex-inline-target" style={{ fontFamily: 'monospace' }}>{latex}</span>;
        }
        return part;
    });

    // Consumo do MODEL_METADATA.SECTION_TITLE
    // NOVO: Adicionado RESPONSE_OPTIONS
    const { CONTEXT, QUESTION, RESPONSE_OPTIONS } = MODEL_METADATA.SECTION_TITLE;

    return (
        <div className="p-4 flex flex-col gap-4 bg-white">
            
            {/* 1. SEÇÃO CONTEXTO */}
            <TitleSection 
                // CORREÇÃO: Usando a cor do tema principal do aplicativo
                color={APP_PRIMARY_COLOR} 
                iconName={CONTEXT.icon} 
                title={CONTEXT.title} 
                value={""} 
            >
                {formattedText}
            </TitleSection>

            {/* Visual Component */}
            {VisualComponent && (
                <div className={COMPOSITIONAL_STYLES.VISUAL_CONTAINER}>
                    {VisualComponent}
                </div>
            )}
            
            {/* 2. SEÇÃO PERGUNTA */}
            <TitleSection 
                // CORREÇÃO: Usando a cor do tema principal do aplicativo
                color={APP_PRIMARY_COLOR} 
                iconName={QUESTION.icon}
                title={QUESTION.title}
                value={""}
                mtClass='pt-4'
            >
                 <div className={COMPOSITIONAL_STYLES.TEXT_BODY}>
                    {model.question}
                 </div>
            </TitleSection>
            
            {/* NOVO: SEÇÃO OPÇÕES DE RESPOSTA */}
            <div className="pt-2">
                 <ComponentTitleToken 
                    iconName={RESPONSE_OPTIONS.icon} 
                    title={RESPONSE_OPTIONS.title} 
                    value={""} 
                    color={APP_PRIMARY_COLOR} 
                 />
            </div>
            
        </div>
    );
};

// ==================================================================================
// 7. COMPONENTES DO LABORATÓRIO (Map View - Cartões de Navegação)
// ==================================================================================

const FilterControls = ({
    exams,
    selectedYear,
    selectedDiscipline,
    selectedLanguage,
    onYearChange,
    onDisciplineChange,
    onLanguageChange,
    isLoading,
    error,
}) => {
    const selectedExam = exams.find((exam) => exam.year === selectedYear) || exams[0] || {};
    const disciplines = selectedExam?.disciplines || [];
    const languages = selectedExam?.languages || [];

    return (
        <div className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Ano</label>
                    <select
                        className="border border-slate-300 rounded-md p-2 text-sm"
                        value={selectedYear ?? ''}
                        onChange={(e) => onYearChange(Number(e.target.value))}
                    >
                        {exams.map((exam) => (
                            <option key={exam.year} value={exam.year}>{exam.title}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Disciplina</label>
                    <select
                        className="border border-slate-300 rounded-md p-2 text-sm"
                        value={selectedDiscipline}
                        onChange={(e) => onDisciplineChange(e.target.value)}
                    >
                        {disciplines.map((disc) => (
                            <option key={disc.value} value={disc.value}>{disc.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">Idioma</label>
                    <select
                        className="border border-slate-300 rounded-md p-2 text-sm"
                        value={selectedLanguage}
                        onChange={(e) => onLanguageChange(e.target.value)}
                    >
                        <option value="">Todos</option>
                        {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading && (
                <div className="text-sm text-emerald-700 font-medium">Carregando questões...</div>
            )}

            {error && (
                <div className="text-sm text-red-600 font-medium">{error}</div>
            )}
        </div>
    );
};

/**
 * Componente que renderiza um cartão representando uma edição de curso agrupada (ex: ENEM 2023).
 * Substitui o antigo ModelCard.
 */
const CourseCard = ({ course, onClick }) => {
    // Styling é genérico, pois representa um curso inteiro
    const themeColor = APP_PRIMARY_COLOR;
    // Icone padronizado globalmente
    const cardIconName = GLOBAL_THEME.icon; 
    
    // Estilos de base
    const bgClasses = 'bg-white hover:bg-slate-50'; 
    const neutralTextColor = 'rgb(71 85 105)'; // slate-600
    
    // Novo: Padronizando o tema da matéria para 'Geral'
    const subjectLabel = "TEMA: Geral";

    return (
        <div 
            // O onClick agora passa a edição para ser filtrada
            onClick={() => onClick(course.firstModel)}
            className={`
                w-full rounded-xl border p-4 cursor-pointer 
                transition-colors duration-200 
                ${bgClasses}
            `}
            style={{ 
                borderColor: themeColor,
            }}
        >
            <div className="flex items-start gap-3">
                {/* ÍCONE GRANDE */}
                <IconToken 
                    iconName={cardIconName} 
                    color={themeColor} 
                    sizeClass="w-10 h-10" // Icone grande
                />
                
                <div className="flex flex-col flex-1 min-w-0">
                    {/* TÍTULO PRINCIPAL: Edição do Curso */}
                    <h3 className="text-xl font-extrabold leading-tight mb-1 truncate" style={{ color: themeColor }}>
                        {course.edition} 
                    </h3>
                    
                    {/* METADADOS: Contagem de Questões */}
                    <p className="text-sm font-medium leading-tight text-slate-700">
                        {course.count} Questões Cadastradas
                    </p>
                    
                    {/* METADADOS: Assuntos Envolvidos (Com truncamento se muito longo) - ATUALIZADO */}
                     <p className="text-xs text-slate-500 mt-1 leading-normal">
                        {subjectLabel} ({course.subjectCount} Tópicos)
                    </p>
                </div>
            </div>
        </div>
    );
};


// ==================================================================================
// 8. COMPONENTES DE INTERAÇÃO (Interation Engine)
// =================================================================================E

// 8.1. Renderer para Múltipla Escolha
const MultipleChoiceRenderer = React.memo(({ model, selectedOption, isAnswered, handleSubmit }) => {
    const { options, answer } = model;

    // NOVO ESTADO: Armazena as opções (AGORA SEM EMBARALHAMENTO)
    const [displayOptions, setDisplayOptions] = useState(options);

    // REFERÊNCIAS E ESTADO PARA ALTURA IGUAL
    const buttonRefs = useRef([]);
    // REVERTIDO: Voltando ao min-h padrão
    const minHeightClass = 'min-h-[56px]'; 
    
    // Efeito para definir opções (sem embaralhar) quando o modelo muda
    useEffect(() => {
        // Simplesmente define as opções na ordem em que vieram do modelo
        setDisplayOptions(options);
    }, [model.id, options]); // Depende do model.id para re-executar

    // Efeito para calcular e aplicar a altura máxima (roda após a definição das opções)
    useEffect(() => {
        // Garante que o array de refs esteja sincronizado com o número de opções
        buttonRefs.current = buttonRefs.current.slice(0, displayOptions.length);
        
        if (buttonRefs.current.length === displayOptions.length) {
            let maxHeight = 0;
            
            // 1. Resetar alturas para calcular altura natural máxima
            // CORREÇÃO: Alterado de forEach para for...of para permitir o uso de 'break'.
            for (const btn of buttonRefs.current) {
                if (btn) {
                    btn.style.height = 'auto'; 
                    maxHeight = Math.max(maxHeight, btn.offsetHeight);
                    // Otimização: se um botão atingir a altura mínima (56px) ou mais, ele serve como base
                    if (maxHeight >= 56) break; // CORREÇÃO: 'break' é permitido aqui.
                }
            }
            
            // 2. Aplicar altura máxima a todos os botões
            if (maxHeight > 0) {
                // REVERTIDO: Voltando ao mínimo de 56px (para 390px de largura)
                const finalHeight = Math.max(maxHeight, 56); 
                buttonRefs.current.forEach(btn => {
                    if (btn) {
                        btn.style.height = `${finalHeight}px`;
                    }
                });
            }
        }
    // Depende das opções (agora não embaralhadas)
    }, [displayOptions, isAnswered]); 

    // Se a lista de exibição não estiver pronta (embora o useEffect garanta que esteja), usa o original como fallback
    // const displayOptions = shuffledOptions.length > 0 ? shuffledOptions : options;
    
    return (
        // ATUALIZADO: Usando px-4 py-4 para padding consistente.
        <div className="px-4 py-4 grid grid-cols-2 gap-3 sm:grid-cols-2">
            {displayOptions.map((opt, index) => {
                const isCorrect = opt === answer;
                const isSelected = opt === selectedOption;
                
                // --- NOVO: ESTILOS BASE ---
                let btnClass = "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100";
                let textClass = 'font-medium text-sm'; 
                
                // Lógica de Feedback Simplificada: Se isAnswered é true, mostre o feedback.
                const isFeedbackVisible = isAnswered;

                // Desativação visual após resposta
                const disabledClass = isAnswered ? 'pointer-events-none opacity-80' : 'hover:bg-slate-100';

                if (isFeedbackVisible) {
                    // 1. Mostrar o botão CORRETO em VERDE, independente de ter sido clicado.
                    if (isCorrect) {
                        btnClass = "bg-emerald-100 border-emerald-500 text-emerald-800";
                        textClass = 'font-bold text-sm'; 
                    } 
                    // 2. Marcar o botão CLICADO (Selecionado) com o estilo NEUTRO de destaque.
                    else if (isSelected) {
                        // Aplica o estilo neutro de seleção (roxo suave)
                        btnClass = "bg-indigo-50 border-indigo-300 text-indigo-700 opacity-80";
                        textClass = 'font-medium text-sm'; 
                        // Nota: Se o botão clicado for o correto, ele cai na condição 1, que tem prioridade.
                    } 
                    // 3. Os botões não clicados e incorretos mantêm o estilo base 'bg-white border-slate-200'
                } 
                // Estado antes de responder:
                else if (isSelected) {
                    // Estado de seleção antes de responder
                    btnClass = "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium";
                }


                return (
                    <button 
                        key={index}
                        ref={el => buttonRefs.current[index] = el} // Atribuição da ref para medição de altura
                        onClick={() => handleSubmit(opt)} 
                        // Desabilita sempre que a resposta foi dada
                        disabled={isAnswered}
                        // REVERTIDO: Voltando padding de p-3 e text-sm 
                        className={`
                            text-left p-3 rounded-xl border-2 transition-all duration-200 relative 
                            group flex items-center justify-center
                            ${minHeightClass} ${btnClass} ${disabledClass}
                        `}
                    >
                        <span className={`flex-1 break-words leading-tight ${textClass} text-center`}>
                            {opt}
                        </span>
                        
                        {/* Container do ícone: Vazio, pois o feedback de ícone foi removido */}
                        <div className={`ml-2 flex-shrink-0 w-5 h-5 flex items-center justify-center absolute right-3 ${isFeedbackVisible ? '' : 'invisible'}`}>
                            {/* Removido o IconToken para o feedback */}
                        </div>
                    </button>
                );
            })}
        </div>
    );
});


// 8.2. Renderer para Resposta Dissertativa (Open Answer)
const OpenAnswerRenderer = React.memo(({ model, userText, isAnswered, handleTextChange, handleSubmit }) => {
    const isSubmitted = isAnswered;
    const isInputActive = !isSubmitted;

    return (
        // ATUALIZADO: Usando px-4 py-4 para padding consistente.
        <div className="px-4 py-4 flex flex-col gap-3">
            <textarea
                value={userText}
                onChange={handleTextChange}
                disabled={!isInputActive}
                rows={6}
                placeholder="Digite sua resposta dissertativa aqui..."
                // REVERTIDO: Voltando o padding e tamanho da fonte (p-3 e text-sm)
                className={`w-full p-3 rounded-lg border-2 transition-colors duration-200 text-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                    isInputActive
                        ? 'bg-white border-slate-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed opacity-80'
                }`}
            />
            
            {/* O botão de submissão não é necessário aqui, pois a submissão acontece via botão "Próximo" ou "Continuar" */}
            
            {isSubmitted && (
                <div className="bg-indigo-50 border border-indigo-300 p-4 rounded-xl shadow-inner">
                    <h4 className="text-sm font-bold text-indigo-800 mb-2">Resposta Modelo:</h4>
                    <p className="text-sm text-indigo-700 leading-relaxed whitespace-pre-wrap">
                        {model.modelAnswer || 'Resposta modelo não fornecida.'}
                    </p>
                </div>
            )}
        </div>
    );
});


// 8.3. FinalResultsScreen: Componente para exibir os resultados finais (Tela embutida no fluxo)
const FinalResultsScreen = ({ score, onReview, onRestart, isChartJSEnabled, onBackToQuiz, isPartial, onSelectNewCourse }) => { // <--- NOVO PROP: onSelectNewCourse
    // DESESTRUTURAÇÃO COMPLETA: Inclui detailedReviewData
    const { correctCount, totalAnswered, totalQuestions, scorePercentage, detailedReviewData } = score;
    
    // Cor verde para >= 50% de acertos, laranja para menos.
    const themeColor = scorePercentage >= 50 ? APP_PRIMARY_COLOR : FEEDBACK_COLORS.RED_PRIMARY; 
    const themeTextColor = scorePercentage >= 50 ? 'text-emerald-700' : 'text-red-700';

    const { CHECK, CLOSE, LOCK, EMOJI_CORRECT, EMOJI_INCORRECT } = SYSTEM_ICONS; // Usando EMOJI_CORRECT/INCORRECT
    
    // Dados para o Gráfico de Rosca
    const chartDataConfig = {
        labels: ["Corretas", "Incorretas", "Não Respondidas"],
        values: [
            correctCount, 
            totalAnswered - correctCount, 
            totalQuestions - totalAnswered
        ],
        // Usando as constantes globais de cor
        colors: [APP_PRIMARY_COLOR, FEEDBACK_COLORS.RED_PRIMARY, FEEDBACK_COLORS.NEUTRAL_PRIMARY] 
    };

    // Helper para obter o status da questão
    const getStatus = (item) => {
        if (!item.wasAnswered) {
            return { label: 'N/R', color: 'text-slate-500', icon: LOCK, visualToken: '⚪' , border: 'border-slate-300' }; // Não Respondida (neutro/cinza)
        }
        if (item.userResponse.isCorrect) {
            // CORREÇÃO: Usando o EMOJI
            return { label: 'Certa', color: 'text-emerald-700', icon: CHECK, visualToken: EMOJI_CORRECT, border: 'border-emerald-500' }; // Correta (verde)
        }
        // CORREÇÃO: Usando o EMOJI
        return { label: 'Errada', color: 'text-red-600', icon: CLOSE, visualToken: EMOJI_INCORRECT, border: 'border-red-500' }; // Incorreta (vermelho)
    };
    
    const { CONTEXT, QUESTION } = MODEL_METADATA.SECTION_TITLE; // Usando CONSTEXT e QUESTION para estruturar

    return (
        // Removido o padding e background da tela principal para que o conteúdo preencha o container do celular
        <div className="w-full h-full flex flex-col gap-4 bg-white"> 
            
            <div className="px-4 pt-4 pb-0 flex flex-col gap-4">
                <h2 className={`text-2xl font-bold text-center ${themeTextColor}`} style={{ color: APP_PRIMARY_COLOR }}>
                    {/* Altera o título para indicar se é parcial ou final */}
                    {isPartial ? 'Resultados Parciais' : 'Quiz Finalizado!'}
                </h2>
                
                {/* --- SEÇÃO 1: INDICADORES GERAIS (Simplificada) --- */}
                <TitleSection 
                    // CORREÇÃO: Usando APP_PRIMARY_COLOR
                    color={APP_PRIMARY_COLOR} 
                    iconName={SYSTEM_ICONS.BAR_CHART} 
                    title="INDICADORES GERAIS"
                    value=""
                    mtClass='pt-4'
                >
                    {/* Texto descritivo simples para manter o fluxo textual antes do gráfico (Substitui o bloco de porcentagem) */}
                    <p className="text-base text-slate-500 mb-2">
                        A distribuição das suas respostas está detalhada no gráfico de rosca abaixo:
                    </p>
                    
                    {/* Gráfico de Rosca */}
                    {isChartJSEnabled && (
                        <div className='mt-2'>
                            <ChartJSRenderer 
                                type="chart-donut" 
                                data={{
                                    labels: chartDataConfig.labels,
                                    values: chartDataConfig.values,
                                    colors: chartDataConfig.colors
                                }} 
                                isLoaded={isChartJSEnabled} 
                            />
                        </div>
                    )}
                    
                </TitleSection>
            </div>
        
            
            {/* --- SEÇÃO 2: RESUMO DAS QUESTÕES --- */}
            <div className="px-4 pt-0 flex flex-col gap-4 bg-white">
                <TitleSection 
                    // CORREÇÃO: Usando APP_PRIMARY_COLOR
                    color={APP_PRIMARY_COLOR} 
                    iconName={SYSTEM_ICONS.DESCRIPTION} 
                    title="RESUMO DAS QUESTÕES"
                    value=""
                    mtClass='pt-0'
                >
                    {/* Conteúdo da TitleSection é necessário, adicionando um texto vazio */}
                    <div className="text-base text-slate-600 mb-2">
                        {isPartial ? 'Progresso atual por questão.' : 'Seu desempenho final por questão.'}
                    </div>
                </TitleSection>

                {/* Resumo Detalhado Linha a Linha (Scorecard) */}
                <div className="flex-1 overflow-y-auto -mt-3">
                    
                    {/* Header da Tabela Limpa - REMOVIDO PARA OCULTAR O TÍTULO */}
                    {/*
                    <div className="flex justify-between items-center text-base font-bold text-slate-700 p-2 border-b border-slate-200 sticky top-0 bg-white z-10">
                        <span>Questão / Tópico</span>
                        <span className='w-8 text-right'>Status</span>
                    </div>
                    */}
                    
                    <div className='divide-y divide-slate-100'>
                        {detailedReviewData.map((item, index) => {
                            const status = getStatus(item);
                            
                            // Row Classes: MANTIDO: Zebrado para legibilidade, removido border-l-4
                            const rowClasses = `flex justify-between items-center py-2 px-3 transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-slate-50' 
                            }`;
                            
                            return (
                                <div 
                                    key={item.id} 
                                    className={rowClasses}
                                >
                                    {/* Coluna 1: Número e Tópico */}
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="font-bold text-base w-5 text-center text-slate-600 flex-shrink-0">
                                            {index + 1}.
                                        </span>
                                        {/* A classe truncate garante que o texto não ative a rolagem horizontal */}
                                        <span className="text-base text-slate-800 font-medium truncate min-w-0">
                                            {item.topic}
                                        </span>
                                    </div>

                                    {/* Coluna 2: Status (Emoji) */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0 w-8 justify-end">
                                        <span className="text-lg leading-none">
                                            {status.visualToken} 
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>


            {/* RODAPÉ DE AÇÃO (Sempre visível, seguindo o padrão de navegação) */}
            <div className="p-3 flex justify-between gap-3 bg-white border-t border-slate-200 sticky bottom-0 z-20"> 
                
                {isPartial ? (
                    // Botão para voltar ao quiz (modo parcial)
                    <ActionButton
                        label="Voltar ao Quiz"
                        onClick={onBackToQuiz}
                        styleClass={COMPOSITIONAL_STYLES.ACTION_BUTTON_SECONDARY} 
                        basePaddingClass="px-4 py-2 w-full" 
                    />
                ) : (
                    // Botões padrão de finalização (modo final)
                    <>
                        <ActionButton
                            label="Recomeçar Quiz"
                            onClick={onRestart}
                            styleClass={COMPOSITIONAL_STYLES.ACTION_BUTTON_EMPHASIS_SOLID}
                            basePaddingClass="px-4 py-2 w-1/3" // <--- Alterado para w-1/3
                        />
                        
                        <ActionButton
                            label="Revisar Questões"
                            onClick={onReview} 
                            styleClass={COMPOSITIONAL_STYLES.ACTION_BUTTON_SECONDARY}
                            basePaddingClass="px-4 py-2 w-1/3" // <--- Alterado para w-1/3
                        />
                         {/* NOVO: Botão para ir para a tela de mapa/catálogo */}
                        <ActionButton
                            label="Outro Curso"
                            onClick={onSelectNewCourse} 
                            styleClass={COMPOSITIONAL_STYLES.ACTION_BUTTON_SECONDARY}
                            basePaddingClass="px-4 py-2 w-1/3" // <--- Novo botão, largura w-1/3
                        />
                    </>
                )}
            </div>
        </div>
    );
};


// 8.4. QuizReviewScreen: Novo componente para a revisão detalhada
// O onBack AGORA voltará para a tela de resultados.
const QuizReviewScreen = ({ reviewData, onBack }) => {
    // Rola para o topo ao montar o componente de revisão
    useEffect(() => {
        // Removido window.scrollTo
    }, []);

    const { REVIEW_TITLE } = MODEL_METADATA.FEEDBACK;
    const { CHECK, CLOSE } = SYSTEM_ICONS;

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-6 p-4 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold" style={{ color: APP_PRIMARY_COLOR }}>
                <IconToken iconName={SYSTEM_ICONS.RATE_REVIEW} color={APP_PRIMARY_COLOR} sizeClass="w-6 h-6" /> {REVIEW_TITLE}
            </h2>
            <div className="border-b -mt-4 pb-2 border-slate-200"></div>

            <div className="flex flex-col gap-8">
                {reviewData.map((item, index) => {
                    // Tema padronizado globalmente
                    const theme = GLOBAL_THEME; 
                    const isCorrect = item.userResponse.isCorrect;
                    const statusIcon = isCorrect ? CHECK : CLOSE;
                    const statusColor = isCorrect ? APP_PRIMARY_COLOR : FEEDBACK_COLORS.RED_PRIMARY;
                    const statusBg = isCorrect ? 'bg-emerald-50' : FEEDBACK_COLORS.RED_BG;

                    return (
                        <div key={item.id} className={`p-4 rounded-xl border-l-4 ${statusBg}`} style={{ borderColor: statusColor }}>
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold" style={{ color: theme.text }}>
                                    {index + 1}. {item.topic} (TEMA: Geral)
                                </h3>
                                <div className="flex items-center gap-1">
                                    <IconToken iconName={statusIcon} color={statusColor} sizeClass="w-5 h-5" />
                                    <span className="text-sm font-semibold" style={{ color: statusColor }}>
                                        {isCorrect ? 'Correta' : 'Incorreta'}
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-base text-slate-500 mb-2">{item.question}</p> {/* REVERTIDO: text-xs para text-base */}

                            {/* Detalhe da Resposta */}
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-base font-medium text-slate-700 mb-2">Sua Resposta:</p> {/* REVERTIDO: text-sm para text-base */}
                                <div className={`p-3 rounded-lg text-base border ${item.userResponse.option === item.answer ? 'border-emerald-300 bg-emerald-100' : 'border-red-300 bg-red-100'}`}>
                                    {item.interactionType === 'multiple-choice' 
                                        ? (item.userResponse.option || 'Não respondida')
                                        : (item.userResponse.text || 'Não respondida')
                                    }
                                </div>
                                
                                {item.interactionType === 'multiple-choice' && (
                                    <>
                                        <p className="text-base font-medium text-slate-700 mt-3 mb-2">Resposta Correta:</p> {/* REVERTIDO: text-sm para text-base */}
                                        <div className="p-3 rounded-lg text-base border border-slate-300 bg-slate-100">
                                            {item.answer}
                                        </div>
                                    </>
                                )}

                                {item.interactionType === 'open-answer' && item.modelAnswer && (
                                    <>
                                        <p className="text-base font-medium text-slate-700 mt-3 mb-2">Gabarito:</p> {/* REVERTIDO: text-sm para text-base */}
                                        <div className="p-3 rounded-lg text-base border border-slate-300 bg-slate-100 whitespace-pre-wrap">
                                            {item.modelAnswer}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6">
                <ActionButton
                    // Rótulo alterado para ser mais claro:
                    label="Voltar para Resultados" 
                    onClick={onBack}
                    styleClass={COMPOSITIONAL_STYLES.ACTION_BUTTON_SECONDARY}
                    basePaddingClass="px-4 py-2 w-full"
                />
            </div>
        </div>
    );
};


// 8.5. Componente: WelcomeScreen (Tela Inicial)
// RENOMEADO para ser mais descritivo e mais simples, pois será renderizado dentro do MobileQuizSimulation
const WelcomeDisplayCard = ({ onBackToMap }) => { // Recebe onBackToMap como prop
    // Usando a estrutura de seção principal
    const { APP_TITLE, APP_SUBTITLE } = MODEL_METADATA.SECTION_TITLE; // Usando APP_SUBTITLE aqui
    
    // NOVO: Componente do botão único
    const SelectCourseButton = () => (
        <ActionButton
            label="Selecionar Curso"
            onClick={onBackToMap} // Chama a função que leva para o mapa
            // Usando o estilo de ênfase (verde sólido)
            styleClass={COMPOSITIONAL_STYLES.ACTION_BUTTON_EMPHASIS_SOLID + " shadow-xl hover:shadow-2xl"}
            // Aumentando o padding para dar mais destaque
            basePaddingClass="px-8 py-3 w-4/5 text-lg" 
            // Não precisa de refProp aqui
        />
    );

    return (
        <div className="p-4 flex flex-col items-center justify-center bg-white h-full min-h-[400px]">
            
            <IconToken iconName={SYSTEM_ICONS.ROCKET} color={APP_PRIMARY_COLOR} sizeClass="w-16 h-16" />
            
            <h2 className="text-3xl font-extrabold mt-4 mb-2 text-slate-800 text-center">
                {/* NOVO TÍTULO */}
                {APP_TITLE.title}
            </h2>
            <p className="text-center text-slate-600 mb-6 max-w-sm text-lg">
                {/* NOVO SUBTÍTULO (Descrição de Boas-Vindas) */}
                {APP_SUBTITLE}
            </p>
            {/* REVERTIDO: text-sm para text-base */}
            <p className="text-center text-slate-500 mb-8 max-w-md text-base">
                {/* NOVO TEXTO DE CHAMADA PARA AÇÃO */}
                Escolha uma edição de prova ou curso para iniciar um quiz focado em questões interativas e modelos visuais.
            </p>
            
            {/* NOVO BOTÃO ÚNICO DE AÇÃO */}
            <SelectCourseButton />
            
        </div>
    );
};

// ==================================================================================
// 9. COMPONENTES DA APLICAÇÃO (Quiz Simulation - A Engrenagem Principal)
// ==================================================================================

// Adicionado onSelectNewCourse nas props.
const MobileQuizSimulation = ({ activeModel, onNext, onPrev, hasNext, hasPrev, isChartJSEnabled, onRestartQuiz, viewMode, onStartQuiz, onBackToMap, onBackToWelcome, onBackFromMap, onHandleModelSelect, MAP_VIEW, fullCatalog, quizQuestions, onSelectNewCourse, userResponsesRef, exams, selectedYear, selectedDiscipline, selectedLanguage, onYearChange, onDisciplineChange, onLanguageChange, isLoadingQuestions, loadingError }) => { // <--- userResponsesRef adicionado
    // Lógica de acesso ao tema Padrão
    const currentTheme = GLOBAL_THEME;
    
    // CORREÇÃO 1: Desestruturação das constantes de FEEDBACK, SYSTEM_ICONS e QUESTION_LABELS
    const { PREV, NEXT, CONTINUE, CORRECT_ICON, INCORRECT_ICON } = MODEL_METADATA.FEEDBACK;
    const { LOCK, DONE_ALL, SEND } = SYSTEM_ICONS;
    const { METRIC } = MODEL_METADATA.QUESTION_LABELS; 

    // Variável 'let' para a cor do ícone anterior (pode ser modificada)
    // Cor Neutra agora vem da constante FEEDBACK_COLORS
    let prevIconColor = hasPrev ? FEEDBACK_COLORS.NEUTRAL_PRIMARY : FEEDBACK_COLORS.NEUTRAL_PRIMARY; 
    
    // CLASSE BASE PARA AJUSTE PROPORCIONAL DE TAMANHOS DE BOTÃO NO NOVO VIEWPORT (70%)
    // REVERTIDO: Voltando aos paddings originais
    const buttonPaddingClass = 'px-4 py-2'; 
    const prevButtonStyle = COMPOSITIONAL_STYLES.ACTION_BUTTON_SECONDARY;
    

    // ========================================================================
    // Lógica de Agrupamento de Questões por Edição de Curso (useMemo) - USA fullCatalog
    // ========================================================================
    const groupedCourses = useMemo(() => {
        const groups = {};
        // Usa o catálogo COMPLETO para agrupar as edições
        fullCatalog.forEach(model => {
            const edition = model.courseEdition;
            if (!groups[edition]) {
                groups[edition] = {
                    edition: edition,
                    count: 0,
                    subjects: new Set(),
                    firstModel: model, // Guarda a primeira questão da edição para ser selecionada
                };
            }
            groups[edition].count++;
            // Agora adicionamos o tópico, não a matéria (subject), para exibir no cartão
            groups[edition].subjects.add(model.topic.split(':')[0].trim());
        });
        
        // Converte para array e formata a lista de matérias
        return Object.values(groups).map(group => ({
            ...group,
            subjects: Array.from(group.subjects).join(', '),
            subjectCount: group.subjects.size // Contagem de tópicos
        }));
    }, [fullCatalog]);

    // Estados para Múltipla Escolha
    const [selectedOption, setSelectedOption] = useState(null);
    // userResponsesRef AGORA É PASSADO VIA PROP, ONDE É INICIALIZADO.
    
    // MANTIDO: Usamos este estado para alternar entre tela de questão e tela de resultado final
    const [isQuizFinished, setIsQuizFinished] = useState(false); 
    
    // NOVO ESTADO: Adicionado para controlar a visualização de resultados parciais
    const [showPartialResults, setShowPartialResults] = useState(false);
    
    // NOVO ESTADO: Para controlar o modo de revisão detalhada
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [reviewData, setReviewData] = useState([]); // Dados detalhados para a revisão

    // Verifica se a questão atual já foi respondida
    const isAnswered = !!userResponsesRef.current[activeModel?.id];


    // Estado para Resposta Dissertativa
    const [userAnswerText, setUserAnswerText] = useState('');
    
    // O currentIndex E o total de questões agora dependem de quizQuestions (lista filtrada)
    const currentIndex = activeModel ? quizQuestions.findIndex(m => m.id === activeModel.id) : -1;
    // As props hasNext/hasPrev são passadas do App, que usa quizQuestions.length para cálculo.

    const feedbackTimeoutRef = useRef(null);

    // Variável de estado local para rastrear se o auto-avanço está ativo.
    // Usamos um ref para não causar re-renderizações desnecessárias ao mudar.
    const autoAdvanceActiveRef = useRef(false);

    // Refs para os botões de navegação para calcular a altura máxima
    const navButtonRefs = useRef([]);

    // NOVO: Ref para o contêiner de conteúdo do mapa (para rolagem vertical)
    const mapContentRef = useRef(null);
    
    // NOVO: Ref para o contêiner de conteúdo do quiz (para rolagem vertical)
    const quizContentRef = useRef(null);


    const getQuizMetrics = useCallback(() => {
        let correctCount = 0;
        let totalAnswered = 0;
        
        // Usa quizQuestions para as métricas
        const detailedReviewData = quizQuestions.map(model => {
            const response = userResponsesRef.current[model.id];
            
            if (response) {
                totalAnswered++;
                if (response.type === 'multiple-choice' && response.isCorrect) {
                    correctCount++;
                }
            }

            // Retorna o objeto combinado para a tela de revisão
            return {
                ...model,
                userResponse: response || { type: model.interactionType, option: null, isCorrect: false, text: null },
                wasAnswered: !!response
            };
        });
        
        const totalQuestions = quizQuestions.length; // Usa a lista filtrada
        const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
        
        return { correctCount, totalAnswered, totalQuestions, scorePercentage, detailedReviewData };
    }, [quizQuestions, userResponsesRef]); // <--- userResponsesRef adicionado como dependência


    // Efeito para rolar a tela para o topo do quizContentRef ao mudar o modelo
    useEffect(() => {
        // CORREÇÃO CRÍTICA: Removido o 'behavior: smooth' para eliminar o efeito de rolagem visível
        if (quizContentRef.current) {
             // NOVO: Scroll total para o topo (posição 0)
             quizContentRef.current.scrollTo({ top: 0 }); // Apenas top: 0, sem behavior: 'smooth'
        }
        
        // Quando a questão muda (seja por onNext ou onPrev), o auto-avanço deve ser redefinido para falso.
        autoAdvanceActiveRef.current = false;
    }, [activeModel?.id, viewMode]); 


    useEffect(() => {
        // Reseta o estado quando o modelo de pergunta muda
        setSelectedOption(null);
        setUserAnswerText(''); 
        
        // Se já tiver uma resposta salva, pré-seleciona
        const savedResponse = userResponsesRef.current[activeModel?.id];
        if (savedResponse) {
            setSelectedOption(savedResponse.option || null);
            setUserAnswerText(savedResponse.text || '');
        }
        
        // Limpa qualquer timeout pendente ao trocar de questão
        if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
            feedbackTimeoutRef.current = null;
        }
    }, [activeModel?.id, userResponsesRef]);

    // Handler de submissão para Múltipla Escolha
    const handleChoiceSubmit = useCallback((option) => {
        // Se já foi respondida, não faz nada
        if (userResponsesRef.current[activeModel.id]) return;
        
        const isCorrect = option === activeModel.answer; // Calcula a correção
        setSelectedOption(option);
        
        // Salva a resposta do usuário, incluindo a correção
        userResponsesRef.current = {
            ...userResponsesRef.current,
            [activeModel.id]: { type: 'multiple-choice', option: option, isCorrect: isCorrect } 
        };
        
        // Força re-renderização para mostrar o feedback 
        setSelectedOption(option);
        
    }, [activeModel, userResponsesRef]); // Depende de activeModel e userResponsesRef

    // Handler para mudança de texto (apenas para Open Answer)
    const handleTextChange = useCallback((e) => {
        // Se já foi submetida, ignora
        if (userResponsesRef.current[activeModel.id]) return;
        
        setUserAnswerText(e.target.value);
    }, [activeModel?.id, userResponsesRef]);

    // Handler de submissão para Resposta Dissertativa 
    const handleOpenAnswerSubmit = useCallback(() => {
        // Se já foi respondida ou o texto está vazio, não submete
        if (userResponsesRef.current[activeModel.id] || userAnswerText.trim().length === 0) {
            return false;
        }
        
        // Salva a resposta do usuário no ref (não calcula isCorrect aqui)
        userResponsesRef.current = {
            ...userResponsesRef.current,
            [activeModel.id]: { type: 'open-answer', text: userAnswerText.trim() }
        };
        // Força re-renderização para mostrar o gabarito
        setUserAnswerText(userAnswerText.trim());
        return true; // Sucesso na submissão
        
    }, [userAnswerText, activeModel?.id, userResponsesRef]);
    
    // NOVO: Função para entrar no modo de visualização de resultados (parcial/final)
    const handleViewResults = () => {
        setShowPartialResults(true);
    };
    
    // NOVO: Função para voltar à questão atual (apenas em modo parcial)
    const handleBackToQuiz = () => {
        setShowPartialResults(false);
    };

    // NOVO: Função para entrar no modo de revisão
    const handleReviewMode = () => {
        const { detailedReviewData } = getQuizMetrics();
        setReviewData(detailedReviewData);
        setIsQuizFinished(false); // Sai da tela de resultados
        setShowPartialResults(false); // Garante que o modo parcial está desligado
        setIsReviewMode(true); // Entra no modo de revisão
    };

    // NOVO: Função para sair do modo de revisão (VOLTA PARA O MODAL DE RESULTADOS)
    const handleBackToResults = () => {
        setIsReviewMode(false); // Sai da tela de revisão
        setIsQuizFinished(true); // Retorna à tela de resultados
    };

    
    // EFEITO DE ALTURA CONSISTENTE (Para os 3 botões da navegação do Quiz)
    useEffect(() => {
        // Condição para aplicar a altura uniforme nos 3 botões da navegação padrão
        if ((viewMode === 'quiz' || viewMode === 'welcome' || viewMode === 'map') && activeModel && !isQuizFinished && !isReviewMode && !showPartialResults) {
            
            // Garantir que navButtonRefs.current tenha 3 elementos para as telas welcome/quiz/map
            navButtonRefs.current = navButtonRefs.current.slice(0, 3);
            
            if (navButtonRefs.current.length === 3) {
                let maxHeight = 0;
                
                // 1. Resetar alturas e calcular altura natural máxima
                navButtonRefs.current.forEach(btn => {
                    if (btn) {
                        btn.style.height = 'auto'; 
                        maxHeight = Math.max(maxHeight, btn.offsetHeight);
                    }
                });
                
                // 2. Aplicar altura máxima a todos os botões (mínimo de 40px para garantir toque)
                // REVERTIDO: Voltando ao mínimo de 40px (para 390px de largura)
                const finalHeight = Math.max(maxHeight, 40); 
                navButtonRefs.current.forEach(btn => {
                    if (btn) {
                        btn.style.height = `${finalHeight}px`;
                    }
                });
            }
        }
        // Depende do modo de visualização e do modelo ativo para re-execução
    }, [viewMode, activeModel?.id, isQuizFinished, isReviewMode, showPartialResults]); 


    // LÓGICA DE RENDERIZAÇÃO UNIVERSAL (MOVIDA AQUI, APÓS AS FUNÇÕES DE CALLBACK)
    const InteractionComponent = useMemo(() => {
        if (!activeModel) return null; // Cláusula de guarda
        
        switch (activeModel.interactionType) {
            case 'multiple-choice':
                return (
                    <MultipleChoiceRenderer 
                        model={activeModel}
                        selectedOption={selectedOption}
                        // Usa a propriedade computada isAnswered
                        isAnswered={isAnswered} 
                        handleSubmit={handleChoiceSubmit}
                    />
                );
            case 'open-answer':
                return (
                    <OpenAnswerRenderer 
                        model={activeModel}
                        userText={userAnswerText}
                        // Usa a propriedade computada isAnswered
                        isAnswered={isAnswered} 
                        handleTextChange={handleTextChange}
                        handleSubmit={handleOpenAnswerSubmit}
                    />
                );
            default:
                // REVERTIDO: text-sm
                return <div className="px-4 py-4 text-sm text-red-500">Tipo de interação não suportado: {activeModel.interactionType}</div>;
        }
    // Adicionado userResponsesRef.current[activeModel.id] como dependência para re-renderizar o feedback.
    }, [activeModel, selectedOption, isAnswered, handleChoiceSubmit, userAnswerText, handleTextChange, handleOpenAnswerSubmit, userResponsesRef.current[activeModel?.id]]);


    // Função que o botão unificado chama (navegar ou finalizar)
    const handleUnifiedNextAction = () => {
        
        // 1. Submete resposta pendente se for dissertativa e houver texto
        if (activeModel?.interactionType === 'open-answer' && !isAnswered && userAnswerText.trim().length > 0) {
            handleOpenAnswerSubmit();
            // Permanece na tela para que o usuário veja o gabarito. No próximo clique, avança (item 2).
            if (hasNext) return;
        }
        
        // 2. Determina próxima ação: FINALIZAR ou NAVEGAR
        if (!hasNext) {
                 // Se é a última questão, FINALIZA o quiz (desde que esteja respondida)
                 if (isAnswered) {
                     setIsQuizFinished(true); 
                     setShowPartialResults(false); 
                 }
            } else {
                 // Caso contrário, navega para a próxima questão, MESMO QUE NÃO TENHA RESPONDIDO.
                 onNext();
            }
    };
    
    // --- DEFINIÇÃO DO NOVO ESTILO NEUTRO SEM EFEITOS ---
    // Atende aos requisitos: mesma cor de texto (slate-700), sem transição/hover, cursor normal
    // REMOVIDO: rounded-xl, que estava no ActionButton (5.5)
    const STYLE_NAVIGATION_NEUTRAL = `bg-transparent border-transparent shadow-none text-slate-700 font-bold cursor-default`;


    // Lógica para o Botão de Ação Unificado (Próximo / Finalizar)
    const getUnifiedAction = () => { // Renomeado para evitar conflito com getUnifiedButtonAction
        
        // Variáveis desestruturadas corretamente
        let label = hasNext ? 'Próximo' : 'Finalizar Quiz'; 
        let isDisabled = false; 
        
        // Determina se a questão atual foi respondida
        const isCurrentQuestionAnswered = isAnswered || (activeModel?.interactionType === 'open-answer' && userAnswerText.trim().length > 0);

        // --- Lógica da Última Questão (Finalizar) ---
        if (!hasNext) {
            
            // Requisito 2: Manter o botão "Finalizar Quiz" inativo se não houver resposta.
            if (!isCurrentQuestionAnswered) {
                 label = 'Finalizar Quiz'; 
                 isDisabled = true;
            }
        } 
        
        // Estilo: Sempre neutro, a menos que seja o botão 'Iniciar Quiz' na tela Welcome.
        // Aqui, aplicamos o neutro. O botão 'Iniciar Quiz' no Welcome fará o override.
        const style = STYLE_NAVIGATION_NEUTRAL;

        return { 
            label: label, 
            action: handleUnifiedNextAction, 
            isDisabled: isDisabled, 
            style: style, 
        };
    };
    
    // Determina o conteúdo da tela principal e a barra de navegação
    let activeScreen;
    let navBarContent;

    // --- DEFINIÇÃO DOS ESTILOS DE BOTÃO ---
    // 1. Ênfase Sólida (Manter para "Iniciar Quiz")
    const STYLE_EMPHASIS_SOLID = COMPOSITIONAL_STYLES.ACTION_BUTTON_EMPHASIS_SOLID;
    // 2. Neutro Total (Novo padrão para todos os botões de navegação)
    const STYLE_NEUTRAL = STYLE_NAVIGATION_NEUTRAL;

    // --- Componente para o Botão "Anterior" Inativo (Placeholder) ---
    const InactivePrevButton = (
        <ActionButton 
            label="Anterior"
            onClick={() => {}} // Não faz nada
            isDisabled={true} // Inativo
            styleClass={STYLE_NEUTRAL}
            basePaddingClass="px-2 py-3 w-full"
            refProp={el => navButtonRefs.current[0] = el}
        />
    );

    // --- Componente para o Botão "Próximo" Inativo (Placeholder) ---
    const InactiveNextButton = (
        <ActionButton 
            label="Próximo"
            onClick={() => {}} // Não faz nada
            isDisabled={true} // Inativo
            // Usa o mesmo estilo neutro
            styleClass={STYLE_NEUTRAL}
            // Usa o mesmo padding minimalista
            basePaddingClass="px-2 py-3 w-full"
            refProp={el => navButtonRefs.current[2] = el}
        />
    );


    // --- MODO: TELA DE BOAS-VINDAS ---
    if (viewMode === 'welcome') {
        activeScreen = (
            // Passa onBackToMap para o WelcomeDisplayCard para acionar o mapa
            <div className="w-full h-full flex items-start justify-center pt-8 pb-4">
                <WelcomeDisplayCard onBackToMap={onBackToMap} /> 
            </div>
        );
        
        // NAV BAR SIMPLIFICADA PARA WELCOME (AGORA SEM BOTÕES)
        navBarContent = null;
        
    } 
    // --- MODO: MAPA DE MODELOS (PADRONIZADO) ---
    else if (viewMode === 'map') {
        
        // NOVO CONTEÚDO DA TELA DE MAPA (Completo, dentro da simulação)
        activeScreen = (
             <div className="flex flex-col gap-4 p-4 bg-white relative">
                 <h3 className={COMPOSITIONAL_STYLES.TITLE_LABEL + " border-b pb-2 flex items-center gap-2 text-xl"} style={{ color: APP_PRIMARY_COLOR }}>
                    <IconToken iconName={MAP_VIEW.icon} sizeClass="w-5 h-5" color={APP_PRIMARY_COLOR} />
                    {/* TÍTULO ATUALIZADO: Usando Catálogo de Cursos ENEM */}
                    {MAP_VIEW.title} ({groupedCourses.length} Edições)
                 </h3>

                 <FilterControls
                    exams={exams}
                    selectedYear={selectedYear}
                    selectedDiscipline={selectedDiscipline}
                    selectedLanguage={selectedLanguage}
                    onYearChange={onYearChange}
                    onDisciplineChange={onDisciplineChange}
                    onLanguageChange={onLanguageChange}
                    isLoading={isLoadingQuestions}
                    error={loadingError}
                 />

                 {/* Lista de Modelos Vertical (agora usa flex-col e rolagem vertical) */}
                 <div className="relative">

                    {/* A rolagem agora é feita de forma nativa pela div abaixo. */}
                    <div
                         ref={mapContentRef}
                         className="flex flex-col gap-3 pb-4 max-h-[570px] overflow-y-auto custom-scrollbar-hidden"
                     >
                         {/* ALTERADO: Mapeando sobre os cursos agrupados */}
                         {groupedCourses.map((course) => (
                             <CourseCard
                                 key={course.edition}
                                 course={course}
                                 // Ao clicar no card, seleciona o primeiro modelo daquela edição
                                 onClick={onHandleModelSelect}
                             />
                         ))}

                         {!isLoadingQuestions && !loadingError && groupedCourses.length === 0 && (
                            <div className="text-sm text-slate-600">Nenhuma questão encontrada para os filtros selecionados.</div>
                         )}
                     </div>
                 </div>
             </div>
        );
        
        // NAV BAR PADRÃO PARA MAPA (3 COLUNAS)
        navBarContent = (
            <div 
                className="flex justify-around items-center bg-white border-t-2" 
                style={{ borderColor: APP_PRIMARY_COLOR }}
            >
                {/* Coluna 1: Botão VOLTAR (Fecha o mapa) */}
                <div className="flex-1 flex justify-center">
                    <ActionButton
                        label="Voltar"
                        onClick={onBackFromMap} 
                        styleClass={STYLE_NEUTRAL}
                        basePaddingClass="px-2 py-3 w-full"
                        refProp={el => navButtonRefs.current[0] = el}
                    />
                </div>
                
                {/* Separador 1 */}
                <div className="h-6 w-px mx-2" style={{ backgroundColor: APP_PRIMARY_COLOR }}></div>

                {/* Coluna 2 (CENTRAL): Botão Mapa Aberto (Inativo - Placeholder) */}
                <div className="flex-1 flex justify-center">
                    <ActionButton
                        label="Mapa Aberto"
                        onClick={() => {}} 
                        isDisabled={true} 
                        styleClass={STYLE_NEUTRAL}
                        basePaddingClass="px-2 py-3 w-full"
                        refProp={el => navButtonRefs.current[1] = el}
                    />
                </div>

                {/* Separador 2 */}
                <div className="h-6 w-px mx-2" style={{ backgroundColor: APP_PRIMARY_COLOR }}></div> 

                {/* Coluna 3: Botão Próximo Inativo (Placeholder) */}
                 <div className="flex-1 flex justify-center">
                     {InactiveNextButton}
                 </div>
            </div>
        );
    }
    // --- MODO: REVISÃO ---
    else if (isReviewMode) {
        // ... (Corpo da Revisão)
        activeScreen = (
            <div className="w-full h-full bg-slate-50 flex items-start justify-center pt-4">
                <QuizReviewScreen reviewData={reviewData} onBack={handleBackToResults} />
            </div>
        );
        navBarContent = null; 
    } 
    // --- MODO: RESULTADOS (FINAL OU PARCIAL) ---
    else if (isQuizFinished || showPartialResults) {
        // ... (Corpo dos Resultados)
        const handleRestart = () => {
            setIsQuizFinished(false);
            setShowPartialResults(false);
            // userResponsesRef é limpo pelo componente App (resetQuizState)
            onRestartQuiz();
        };
        
        // NOVO: Handler para o botão "Outro Curso"
        const handleSelectNewCourseAction = () => {
            onSelectNewCourse(); // Chama a função de limpeza e navegação no App
            setIsQuizFinished(false); // Garante que a tela de resultados saia
            setShowPartialResults(false);
        };


        // Redefinindo estilos para os botões de ação na tela de resultados (usando os estilos anteriores para manter contraste)
        const resultsBtnSecondary = COMPOSITIONAL_STYLES.ACTION_BUTTON_SECONDARY;
        const resultsBtnEmphasis = COMPOSITIONAL_STYLES.ACTION_BUTTON_EMPHASIS_SOLID;

        activeScreen = (
            <FinalResultsScreen 
                score={getQuizMetrics()}
                onReview={handleReviewMode}
                onRestart={handleRestart}
                isChartJSEnabled={isChartJSEnabled} 
                onBackToQuiz={handleBackToQuiz} 
                isPartial={showPartialResults} 
                onSelectNewCourse={handleSelectNewCourseAction} // <--- Usando o novo handler
            />
        );
        navBarContent = null; 
    } 
    // --- MODO: QUESTÃO NORMAL ---
    else if (activeModel) {
        // ... (Corpo da Questão)
        const totalQuestionsInQuiz = quizQuestions.length; // Usa a lista filtrada

        activeScreen = (
            <>
                <div 
                    className="px-4 flex flex-col relative" 
                    style={{ backgroundColor: currentTheme.bgRaw }}
                >
                    
                    {/* Acesso direto ao COMPOSITIONAL_STYLES */}
                    <div className={COMPOSITIONAL_STYLES.METRIC_COUNT + " flex items-center justify-center gap-2"}>
                        {/* NOVO: Icone da Matéria */}
                        <IconToken 
                            iconName={currentTheme.icon} 
                            color={currentTheme.text} 
                            sizeClass="w-4 h-4" 
                        />
                        {/* Contador de Questões - AGORA REFLETE APENAS O CURSO SELECIONADO */}
                        {METRIC} {currentIndex + 1} / {totalQuestionsInQuiz}
                    </div>
                    
                </div>

                <div className="bg-white">
                    <QuestionContentRenderer 
                        model={activeModel} 
                        isChartJSEnabled={isChartJSEnabled} 
                    />
                    
                    {/* ENGENHARIA UNIVERSAL: Renderiza o componente de interação baseado no tipo */}
                    {/* O div abaixo foi removido pois a QuestionContentRenderer agora contém o separador semântico */}
                    <div className="mt-0"> 
                        {InteractionComponent} 
                    </div>
                    
                </div>
            </>
        );
        
        // Lógica dos botões de navegação
        const unifiedButton = getUnifiedAction();
        
        // NOVO: Handler para o botão "Catálogo" na primeira questão
        const handleBackToMapAction = () => {
             // 1. Limpa as respostas (as "memórias")
             userResponsesRef.current = {};
             // 2. Navega para o mapa
             onBackToMap();
        };

        
        let PrevButton;

        // ** LÓGICA DE SUBSTITUIÇÃO DO BOTÃO 'ANTERIOR' / 'CATÁLOGO' **
        if (currentIndex === 0 && viewMode === 'quiz') {
            // Questão 1: Botão Catálogo (Volta ao Mapa)
            PrevButton = (
                <ActionButton 
                    label="Catálogo" // RÓTULO ALTERADO AQUI
                    onClick={handleBackToMapAction} // <--- USANDO NOVO HANDLER COM RESET
                    isDisabled={false} // Sempre ativo
                    // CORREÇÃO: Usando estilo NEUTRO
                    styleClass={STYLE_NEUTRAL} 
                    // CORREÇÃO: Padding interno minimo
                    basePaddingClass="px-2 py-3 w-full" 
                    refProp={el => navButtonRefs.current[0] = el}
                />
            );
        } else {
            // Outras questões: Botão Anterior Padrão
            PrevButton = (
                <ActionButton 
                    label={PREV}
                    onClick={onPrev}
                    isDisabled={false} // Sempre ativo (navega ou para Q1 ou para Q>1)
                    // CORREÇÃO: Usando estilo NEUTRO
                    styleClass={STYLE_NEUTRAL} 
                    // CORREÇÃO: Padding interno minimo
                    basePaddingClass="px-2 py-3 w-full" 
                    refProp={el => navButtonRefs.current[0] = el}
                />
            );
        }


        // 2. **Botão Resultados** (Sempre ativo, estilo neutro)
        const ResultsButton = (
             <div className="flex items-center justify-center h-full"> 
                 <ActionButton
                     label="Resultados"
                     onClick={handleViewResults}
                     isDisabled={false} // Sempre ativo
                     // CORREÇÃO: Usando estilo NEUTRO
                     styleClass={STYLE_NEUTRAL} 
                     // CORREÇÃO: Padding interno minimo
                     basePaddingClass="px-2 py-3 w-full" 
                     refProp={el => navButtonRefs.current[1] = el}
                 />
             </div>
        );

        // 3. **Botão Próximo / Finalizar** (Ênfase se ativo, Neutro se inativo/desabilitado)
        const NextUnifiedButton = (
            <ActionButton 
                label={unifiedButton.label}
                onClick={unifiedButton.action}
                // A funcionalidade de desabilitar (isDisabled) é mantida
                isDisabled={unifiedButton.isDisabled} 
                // CORREÇÃO: Usando estilo NEUTRO, mesmo que seja a ação "Próximo"
                styleClass={STYLE_NEUTRAL}
                // CORREÇÃO: Padding interno minimo
                basePaddingClass="px-2 py-3 w-full" 
                refProp={el => navButtonRefs.current[2] = el}
            />
        );

        // Reset the refs array size if we are in quiz mode
        if (navButtonRefs.current.length !== 3) {
            navButtonRefs.current = new Array(3).fill(null);
        }

        // NOVO RODAPÉ DE NAVEGAÇÃO COM SEPARADORES (Requisito 3 & 6)
        navBarContent = (
             // REMOVIDO: padding p-3. MANTIDO: Borda superior de 2px.
            <div 
                className="flex justify-around items-center bg-white border-t-2" 
                style={{ borderColor: APP_PRIMARY_COLOR }}
            > 
                {/* 1. Botão Esquerda */}
                <div className="flex-1 flex justify-center">{PrevButton}</div>
                
                {/* 2. Separador 1 */}
                <div className="h-6 w-px mx-2 flex-shrink-0" style={{ backgroundColor: APP_PRIMARY_COLOR }}></div>
                
                {/* 3. Botão Central */}
                <div className="flex-1 flex justify-center">{ResultsButton}</div>

                {/* 4. Separador 2 */}
                <div className="h-6 w-px mx-2 flex-shrink-0" style={{ backgroundColor: APP_PRIMARY_COLOR }}></div> 
                
                {/* 5. Botão Direita */}
                <div className="flex-1 flex justify-center">{NextUnifiedButton}</div>
            </div>
        );
    } 
    // --- MODO: MODELO AUSENTE (Erro) ---
    else {
        activeScreen = <div className="p-8 text-center text-red-500">Nenhum modelo de questão ativo.</div>;
        navBarContent = null;
    }
    // FIM DA LÓGICA DE RENDERIZAÇÃO DA TELA ATIVA

    // Determina se a barra de navegação inferior deve ser exibida
    const showNavBar = viewMode === 'quiz' && (!isQuizFinished && !isReviewMode && !showPartialResults && activeModel);
    
    // Dimensões da tela do simulador (390x780)
    const SIM_WIDTH = '390px';
    const SIM_HEIGHT = '780px';
    
    // NOVO: Componente Flutuante de Dimensões
    const DimensionOverlay = () => (
        <div className="absolute top-1 left-1 bg-slate-800/80 text-white text-xs px-2 py-1 rounded-md z-50 pointer-events-none">
            {SIM_WIDTH} x {SIM_HEIGHT}
        </div>
    );

    // Renderização do Quiz Normal (Simulação Móvel)
    return (
        <div className="flex justify-center w-full mt-4">
            {/* CONTAINER FIXO PARA SIMULAR O CELULAR (Modelo S24: 390x780px) */}
            <div 
                className="border-[10px] border-slate-900 rounded-[30px] shadow-2xl overflow-hidden relative bg-white flex flex-col"
                style={{ width: SIM_WIDTH, height: SIM_HEIGHT }}
            >
                
                {/* Overlay de Dimensões */}
                <DimensionOverlay />

                {/* Status Bar */}
                <div className="flex justify-between items-center text-sm text-slate-700 px-3 pt-2 pb-1 bg-slate-100 flex-shrink-0"> {/* REVERTIDO: text-xs para text-sm */}
                    <span>9:15</span>
                    <div className="flex items-center gap-1">
                        {/* Ícone Bolt aumentado */}
                        <IconToken iconName='bolt' sizeClass="w-5 h-5" color={APP_PRIMARY_COLOR} /> {/* REVERTIDO: w-4 h-4 para w-5 h-5 */}
                    </div>
                </div>

                {/* CONTEÚDO DA TELA ATIVA (Scrollable Content Area) */}
                {/* flex-1 garante que isso ocupe todo o espaço vertical restante e permite a rolagem interna */}
                <div ref={quizContentRef} className={`flex flex-col overflow-y-auto flex-1 bg-white`}>
                    {activeScreen}
                </div>
                
                {/* RODAPÉ DE NAVEGAÇÃO */}
                {showNavBar && navBarContent}
                
                {/* BARRA INFERIOR DO CELULAR (Home Indicator) */}
                <div className="h-6 bg-slate-100 flex justify-center items-center flex-shrink-0">
                    <div className="w-20 h-1 bg-slate-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

// ==================================================================================
// 10. COMPONENTES PRINCIPAL (Laboratory/App)
// ==================================================================================


export default function App() {
    // 1. ESTADOS DE CONTROLE DE FILTRO E NAVEGAÇÃO

    const [exams, setExams] = useState([]);
    const [questionCatalog, setQuestionCatalog] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedDiscipline, setSelectedDiscipline] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');

    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [loadingError, setLoadingError] = useState(null);

    // Estado para o filtro de edição de curso selecionado
    const [selectedCourseEdition, setSelectedCourseEdition] = useState(null);

    // Inicializa activeModel com o primeiro modelo do catálogo completo (ou null se estiver vazio)
    const [activeModel, setActiveModel] = useState(null);
    
    // NOVO ESTADO: Controla a tela principal ('welcome', 'map' ou 'quiz')
    const [viewMode, setViewMode] = useState('welcome'); 
    // NOVO ESTADO: Armazena a tela anterior para voltar do mapa
    const [previousViewMode, setPreviousViewMode] = useState('welcome');
    
    // Ref para armazenar as respostas do usuário, mantendo-as consistentes entre re-renderizações
    const userResponsesRef = useRef({}); // <--- O Ref é o dono da memória das respostas
    
    // ESTADO DE CONTROLE: Rastreia se a biblioteca KaTeX está pronta
    const [isKatexLoaded, setIsKatexLoaded] = useState(false); 
    // NOVO ESTADO: Rastreia se a biblioteca Chart.js está pronta
    const [isChartJSEnabled, setIsChartJSEnabled] = useState(false);

    // Consumo do MODEL_METADATA.SECTION_TITLE
    const { APP_TITLE, APP_SUBTITLE, MAP_VIEW } = MODEL_METADATA.SECTION_TITLE;

    useEffect(() => {
        const loadExams = async () => {
            try {
                const examList = await fetchExams();
                setExams(examList);

                if (examList.length > 0) {
                    setSelectedYear(examList[0].year);
                    setSelectedDiscipline(examList[0].disciplines?.[0]?.value || '');
                    setSelectedLanguage('');
                }
            } catch (error) {
                setLoadingError(error.message || 'Erro ao carregar provas disponíveis.');
            }
        };

        loadExams();
    }, []);

    useEffect(() => {
        if (!selectedYear) return;
        const exam = exams.find((item) => item.year === selectedYear);
        if (!exam) return;

        if (selectedDiscipline && !exam.disciplines?.some((disc) => disc.value === selectedDiscipline)) {
            setSelectedDiscipline(exam.disciplines?.[0]?.value || '');
        }

        if (selectedLanguage && !exam.languages?.some((lang) => lang.value === selectedLanguage)) {
            setSelectedLanguage('');
        }
    }, [exams, selectedDiscipline, selectedLanguage, selectedYear]);
    
    // 2. LÓGICA DE FILTRAGEM (MEMOIZED)
    const filteredQuestions = useMemo(() => {
        if (!selectedCourseEdition) {
            // Se nenhum curso selecionado, retorna o catálogo completo como fallback
            return questionCatalog;
        }
        // Filtra as questões pela edição selecionada
        return questionCatalog.filter(q => q.courseEdition === selectedCourseEdition);
    }, [questionCatalog, selectedCourseEdition]);

    // 3. LÓGICA DE NAVEGAÇÃO (BASEADA NA LISTA FILTRADA)
    const currentIndex = activeModel ? filteredQuestions.findIndex(m => m.id === activeModel.id) : -1;
    const hasNext = currentIndex !== -1 && currentIndex < filteredQuestions.length - 1;
    const hasPrev = currentIndex > 0;

    // NOVO: Função central de reset para limpar as respostas salvas
    const resetQuizState = useCallback(() => {
        userResponsesRef.current = {}; // Limpa a memória das respostas
        // Opcional, mas útil: Força a redefinição de estados visuais se o usuário estava na tela de resultados.
        // Isso é tratado na função handleRestartQuiz e handleSelectNewCourse.
    }, []); // Dependências vazias, pois só manipula o Ref.

    useEffect(() => {
        if (!selectedYear || !selectedDiscipline) return;

        const loadQuestions = async () => {
            setIsLoadingQuestions(true);
            setLoadingError(null);
            setQuestionCatalog([]);
            setActiveModel(null);
            try {
                const questions = await fetchExamQuestions({
                    year: selectedYear,
                    discipline: selectedDiscipline,
                    language: selectedLanguage || null,
                });

                resetQuizState();
                setQuestionCatalog(questions);
                const edition = `ENEM ${selectedYear}`;
                setSelectedCourseEdition(edition);
                setActiveModel(questions[0] || null);
                setViewMode('map');
            } catch (error) {
                setLoadingError(error.message || 'Erro ao carregar questões.');
                setQuestionCatalog([]);
                setActiveModel(null);
                setSelectedCourseEdition(null);
                setViewMode('welcome');
            } finally {
                setIsLoadingQuestions(false);
            }
        };

        loadQuestions();
    }, [resetQuizState, selectedDiscipline, selectedLanguage, selectedYear]);


    // Função para selecionar o modelo e iniciar o quiz com ele
    const handleModelSelect = (model) => {
        const edition = model.courseEdition;
        setSelectedCourseEdition(edition); // Define o filtro

        // ** GARANTE O RESET DAS RESPOSTAS AO INICIAR UM NOVO CURSO **
        resetQuizState();

        // A lista filtrada (filteredQuestions) será calculada no próximo render,
        // mas podemos calcular a primeira questão agora.
        const newFilteredList = questionCatalog.filter(q => q.courseEdition === edition);

        if (newFilteredList.length > 0) {
            setActiveModel(newFilteredList[0]); // Define a primeira questão do curso
            setViewMode('quiz'); // Mudar para quiz
            setPreviousViewMode('map'); // Sair do mapa vai para o quiz
        }
    };

    // Função para iniciar o quiz (a partir do WelcomeScreen)
    const handleStartQuiz = () => {
        // Ao iniciar o quiz sem selecionar um curso, usamos o catálogo completo (filtro nulo)
        setSelectedCourseEdition(null);
        if (filteredQuestions.length > 0) {
            setActiveModel(filteredQuestions[0]);
            setViewMode('quiz'); // Mudar para quiz
        }
    };

    // NOVO: Função para alternar para a visualização do mapa
    const handleViewMap = () => {
        // Salva a view atual antes de ir para o mapa
        setPreviousViewMode(viewMode); 
        setViewMode('map');
    };
    
    // NOVO: Função para fechar o mapa e voltar para a tela anterior
    const handleBackFromMap = () => {
        setViewMode(previousViewMode); // Volta para a tela salva
    };

    // NOVO: Handler para voltar para a tela de Boas-Vindas
    const handleBackToWelcome = () => {
        setSelectedCourseEdition(null); // Limpa o filtro
        setViewMode('welcome');
    };


    // Função para voltar para a tela do mapa (do Quiz)
    const handleBackToMap = () => {
        // Não precisamos resetar aqui, pois a navegação já foi resolvida no componente filho (MobileQuizSimulation)
        // O MobileQuizSimulation (Botão Catálogo) chama o reset e o onBackToMap
        setViewMode('map');
    };
    
    
    const handleNext = () => {
        if (hasNext) {
            const nextModel = filteredQuestions[currentIndex + 1]; // Usa filteredQuestions
            setActiveModel(nextModel);
        } else {
             // Se é a última questão, retorna para a primeira da lista FILTRADA
             console.log("Fim do Quiz! Retornando ao primeiro modelo da edição selecionada."); 
             setActiveModel(filteredQuestions[0]); 
        }
    };

    const handlePrev = () => {
        if (hasPrev) {
            const prevModel = filteredQuestions[currentIndex - 1]; // Usa filteredQuestions
            setActiveModel(prevModel);
        }
    };
    
    // NOVO: Função para reiniciar o quiz (Reinicia no PRIMEIRO modelo da edição selecionada)
    const handleRestartQuiz = useCallback(() => {
        // ** GARANTE O RESET DAS RESPOSTAS AO RECOMECAR O QUIZ **
        resetQuizState();
        // Garante que o quiz reinicie na primeira questão da lista filtrada
        setActiveModel(filteredQuestions[0] || null);
    }, [filteredQuestions, resetQuizState]);

    // NOVO: Função para selecionar novo curso (leva para o mapa)
    const handleSelectNewCourse = () => {
         // 1. **GARANTE O RESET DAS RESPOSTAS AO ESCOLHER NOVO CURSO**
         resetQuizState(); 
         // 2. Navega para o mapa
         setViewMode('map');
         // 3. Opcional: Remove o filtro de curso atual para o mapa exibir todos (embora o mapa já use o catálogo completo)
         setSelectedCourseEdition(null);
    };


    // Função segura para renderizar o KaTeX
    const renderKaTeX = () => {
        // VERIFICAÇÃO DE SEGURANÇA: Não fazer nada se a biblioteca KaTeX não estiver definida.
        if (typeof window.katex === 'undefined') return;

        document.querySelectorAll('.katex-display-target').forEach(el => {
            const latex = el.getAttribute('data-latex');
            // Verifica se já foi renderizado para evitar re-renderização desnecessária
            if (latex && !el.dataset.katexRendered) { 
                try {
                    el.innerHTML = ''; 
                    window.katex.render(latex, el, { throwOnError: false, displayMode: true });
                    el.dataset.katexRendered = true;
                } catch (e) { console.error("KaTeX Display error:", e); }
            }
        });

        document.querySelectorAll('.katex-inline-target').forEach(el => {
            const latex = el.getAttribute('data-latex');
            // Verifica se já foi renderizado
            if (latex && !el.dataset.katexRendered) {
                try {
                     el.innerHTML = ''; 
                    window.katex.render(latex, el, { throwOnError: false, displayMode: false });
                    el.dataset.katexRendered = true;
                } catch (e) { console.error("KaTeX Inline error:", e); }
            }
        });
    };
    
    // Efeito para injetar scripts KaTeX E Chart.js (Executa apenas uma vez)
    useEffect(() => {
        const katexScriptId = 'katex-script';
        const katexLinkId = 'katex-style';
        const chartJSScriptId = 'chartjs-script';
        // NOVO: ID para o plugin datalabels
        const datalabelsScriptId = 'datalabels-script'; 

        // 1. Carregar CSS do KaTeX
        if (!document.getElementById(katexLinkId)) {
            const link = document.createElement('link');
            link.id = katexLinkId;
            link.rel = 'stylesheet';
            link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
            document.head.appendChild(link);
        }
        
        // 2. Carregar Script JS do KaTeX
        if (!document.getElementById(katexScriptId)) {
            const script = document.createElement('script');
            script.id = katexScriptId;
            script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js";
            script.onload = () => {
                setIsKatexLoaded(true); 
            };
            document.head.appendChild(script);
        } else if (typeof window.katex !== 'undefined') {
            setIsKatexLoaded(true);
        }
        
        // 3. Carregar Script JS do Chart.js
        // Criamos um contêiner para rastrear o carregamento de ambos os scripts
        const chartLoaded = new Promise(resolve => {
            if (document.getElementById(chartJSScriptId) && typeof window.Chart !== 'undefined') {
                resolve();
            } else if (!document.getElementById(chartJSScriptId)) {
                const script = document.createElement('script');
                script.id = chartJSScriptId;
                script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"; 
                script.onload = resolve; // Resolve quando o Chart.js carregar
                document.head.appendChild(script);
            } else {
                 resolve(); // Já existe, assumimos que está carregado se o if inicial falhar.
            }
        });

        // 4. Carregar Script JS do Plugin Datalabels (DEVE vir APÓS o Chart.js)
        chartLoaded.then(() => {
            if (!document.getElementById(datalabelsScriptId)) {
                 const pluginScript = document.createElement('script');
                 pluginScript.id = datalabelsScriptId;
                 pluginScript.src = "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0";
                 // Habilita o Charting APENAS DEPOIS que o plugin (e, por extensão, o Chart.js) carregar.
                 pluginScript.onload = () => {
                     setIsChartJSEnabled(true); 
                 };
                 document.head.appendChild(pluginScript);
            } else if (typeof window.ChartDataLabels !== 'undefined') {
                 setIsChartJSEnabled(true); // Se já estiver no DOM e o plugin for conhecido
            }
        });
        
        // 5. CARREGAR CSS DO GOOGLE MATERIAL SYMBOLS ICONS (Já estava aqui)
        const linkId = 'google-icons-style';
        if (!document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
            document.head.appendChild(link);
        }

        // 6. Injetar CSS para esconder a barra de rolagem customizada
        const scrollbarStyleId = 'custom-scrollbar-style';
        if (!document.getElementById(scrollbarStyleId)) {
            const style = document.createElement('style');
            style.id = scrollbarStyleId;
            style.textContent = `
                /* Esconder a barra de rolagem (Chrome, Safari e Opera) */
                .custom-scrollbar-hidden::-webkit-scrollbar {
                    display: none;
                }
                /* Esconder a barra de rolagem (IE e Edge) */
                .custom-scrollbar-hidden {
                    -ms-overflow-style: none;  /* IE and Edge */
                    scrollbar-width: none;  /* Firefox */
                }
            `;
            document.head.appendChild(style);
        }


    }, []); 
    
    // Efeito para renderizar KaTeX sempre que o modelo mudar, mas SÓ se a biblioteca estiver carregada.
    useEffect(() => {
        if (isKatexLoaded) {
            // Um pequeno atraso garante que o DOM foi totalmente atualizado pelo React antes de manipularmos o KaTeX
            setTimeout(renderKaTeX, 50); 
        }
        // Limpa a marcação de renderização anterior ao mudar de modelo para forçar a nova renderização
        document.querySelectorAll('[data-katex-rendered="true"]').forEach(el => {
            el.removeAttribute('data-katex-rendered');
            // O QuestionContentRenderer limpa o innerHTML, mas esta limpeza extra ajuda na transição.
        });
    }, [activeModel?.id, isKatexLoaded, viewMode]); // Adicionado viewMode para garantir rerender no switch de tela

    // Renderiza a tela ativa
    const renderActiveView = () => {
        
        // As visualizações 'welcome', 'quiz' e 'map' agora são manipuladas pelo MobileQuizSimulation
        return (
            <div className="flex flex-col gap-6">

                {/* Simulação Principal (Contém todas as telas internas: Welcome, Quiz, Map, Results) */}
                <MobileQuizSimulation 
                    viewMode={viewMode} // Passa o viewMode para a simulação
                    activeModel={activeModel} 
                    onNext={handleNext} 
                    onPrev={handlePrev} 
                    hasNext={hasNext} // Passa o status de navegação atualizado
                    hasPrev={hasPrev} // Passa o status de navegação atualizado
                    isChartJSEnabled={isChartJSEnabled}
                    onRestartQuiz={handleRestartQuiz} // Passa a função de reiniciar
                    onStartQuiz={handleStartQuiz} // Handler para iniciar o quiz (vai para viewMode='quiz')
                    onBackToWelcome={handleBackToWelcome} // Handler para voltar ao Welcome
                    onBackToMap={handleViewMap} // Mudar para viewMode='map'
                    onBackFromMap={handleBackFromMap} // Handler para fechar mapa e voltar

                    // PROPS ADICIONAIS PARA FILTRAGEM
                    onHandleModelSelect={handleModelSelect} // Usado pelo CourseCard para selecionar um curso
                    MAP_VIEW={MAP_VIEW}
                    fullCatalog={questionCatalog} // Catálogo completo para a lógica de agrupamento do mapa
                    quizQuestions={filteredQuestions} // Lista FILTRADA para o QUIZ e MÉTRICAS
                    onSelectNewCourse={handleSelectNewCourse} // <--- Novo prop passado
                    userResponsesRef={userResponsesRef} // <--- Passando o Ref de Respostas
                    exams={exams}
                    selectedYear={selectedYear}
                    selectedDiscipline={selectedDiscipline}
                    selectedLanguage={selectedLanguage}
                    onYearChange={setSelectedYear}
                    onDisciplineChange={setSelectedDiscipline}
                    onLanguageChange={setSelectedLanguage}
                    isLoadingQuestions={isLoadingQuestions}
                    loadingError={loadingError}
                />
            </div>
        );
    };


    return (
        <div className="w-full mx-auto flex flex-col gap-8 max-w-7xl p-6 font-sans bg-slate-50 overflow-x-hidden">

            {/* REMOVIDO: HEADER */}

            {renderActiveView()}

            {/* REMOVIDO: FOOTER */}
        </div>
    );
}
