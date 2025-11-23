import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, setLogLevel } from 'firebase/firestore';

// =========================================================
// CONFIGURAÇÃO DA INTELIGÊNCIA ARTIFICIAL (GOOGLE GEMINI)
// =========================================================
const GEMINI_API_KEY = ""; // Insira sua chave aqui se quiser voz neural

// =========================================================
// 1. SERVIÇO DE ÁUDIO (GLOBAL)
// =========================================================
const AudioService = {
    audioCache: new Map(),

    base64ToArrayBuffer: (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        const pcmData = new ArrayBuffer(len);
        const view = new DataView(pcmData);
        for (let i = 0; i < len; i++) view.setUint8(i, binaryString.charCodeAt(i));
        return pcmData;
    },

    addWavHeader: (pcmData, sampleRate = 24000, numChannels = 1) => {
        const header = new ArrayBuffer(44);
        const view = new DataView(header);
        const dataLen = pcmData.byteLength;
        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
        };
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + dataLen, true);
        writeString(view, 8, 'WAVE');
        view.setUint32(12, 0x20746d66, true); // 'fmt '
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataLen, true);
        const wavBuffer = new Uint8Array(header.byteLength + pcmData.byteLength);
        wavBuffer.set(new Uint8Array(header), 0);
        wavBuffer.set(new Uint8Array(pcmData), header.byteLength);
        return wavBuffer;
    },

    speak: (text, onStart) => {
        return new Promise(async (resolve) => {
            const handleEnd = () => resolve();
            
            if (GEMINI_API_KEY) {
                try {
                    if (AudioService.audioCache.has(text)) {
                        const audio = new Audio(AudioService.audioCache.get(text));
                        audio.onplay = onStart;
                        audio.onended = handleEnd;
                        try { await audio.play(); return; } catch (e) { handleEnd(); return; }
                    }
                    // Implementação da chamada TTS com retries (backoff exponencial)
                    let response;
                    let retries = 0;
                    const MAX_RETRIES = 3;
                    
                    while (retries < MAX_RETRIES) {
                        try {
                            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contents: [{ parts: [{ text: text }] }],
                                    generationConfig: {
                                        responseModalities: ["AUDIO"],
                                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Orus" } } }
                                    }
                                })
                            });
                            if (response.status === 429) { // Too Many Requests
                                retries++;
                                const delay = Math.pow(2, retries) * 1000;
                                await new Promise(r => setTimeout(r, delay));
                                continue;
                            }
                            if (!response.ok) throw new Error(`Erro API: ${response.status}`);
                            break; // Sai do loop se a resposta for OK
                        } catch (e) {
                            if (retries < MAX_RETRIES - 1) {
                                retries++;
                                const delay = Math.pow(2, retries) * 1000;
                                await new Promise(r => setTimeout(r, delay));
                            } else {
                                throw e; // Lança o erro após a última tentativa
                            }
                        }
                    }

                    if (response) {
                        const result = await response.json();
                        const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                        if (base64Audio) {
                            const wavData = AudioService.addWavHeader(AudioService.base64ToArrayBuffer(base64Audio));
                            const url = URL.createObjectURL(new Blob([wavData], { type: 'audio/wav' }));
                            AudioService.audioCache.set(text, url);
                            const audio = new Audio(url);
                            audio.onplay = onStart;
                            audio.onended = handleEnd;
                            await audio.play();
                            return;
                        }
                    }
                } catch (e) { console.warn("Fallback nativo por erro TTS:", e); }
            }

            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                setTimeout(() => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.lang = 'pt-BR';
                    utterance.rate = 1.1;
                    const voices = window.speechSynthesis.getVoices();
                    const preferred = voices.find(v => v.name.includes('Google') && v.lang.includes('pt-BR')) || voices.find(v => v.lang.includes('pt-BR'));
                    if (preferred) utterance.voice = preferred;
                    utterance.onstart = onStart;
                    utterance.onend = handleEnd;
                    utterance.onerror = handleEnd;
                    window.speechSynthesis.speak(utterance);
                }, 50);
            } else { resolve(); }
        });
    },
    cancel: () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
};

// =========================================================
// 2. ESTILOS GLOBAIS & COMPONENTES UI
// =========================================================
const GlobalStyles = () => {
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Roboto:wght@400;500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
        body, #root { font-family: 'Inter', sans-serif; min-height: 100vh; margin: 0; padding: 0; transition: background-color 0.5s ease; }
        .speaking-pulse { animation: pulse-ring 2s infinite; background-color: #fef3c7; color: #d97706; border-color: #fbbf24; }
        @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); } 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); } }
        
        /* Tema Escuro Utilitários */
        .dark-mode body { background-color: #0f172a; color: #f8fafc; }
        .dark-mode .bg-white { background-color: #1e293b; color: #f8fafc; border-color: #334155; }
        .dark-mode .text-slate-800, .dark-mode .text-slate-900 { color: #f1f5f9; }
        .dark-mode .text-slate-600, .dark-mode .text-slate-500 { color: #94a3b8; }
        .dark-mode .border-gray-200 { border-color: #334155; }
        .dark-mode .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }

        /* Estilo para Botão Voltar (back_btn) quando em destaque */
        .highlighted-btn {
            background-color: #fef3c7 !important; /* amber-50 */
            color: #d97706 !important; /* amber-700 */
            border-color: #fbbf24 !important; /* amber-400 */
            transform: scale(1.1);
            z-index: 40;
            box-shadow: 0 0 0 4px #fbbf24;
        }
    `;
    return <style dangerouslySetInnerHTML={{ __html: styles }} />;
};

// Componente para exibir o status/ID do usuário e mensagens temporárias
const StatusMessage = ({ message, isDarkMode }) => (
    <div className="fixed bottom-0 left-0 right-0 p-3 md:p-4 flex flex-col sm:flex-row justify-end items-center z-50 pointer-events-none">
        {/* Mensagem Temporária */}
        <div className={`transition-opacity duration-300 pointer-events-auto mt-2 sm:mt-0 ${message ? 'opacity-100' : 'opacity-0'}`}>
             {message && (
                <div className={`p-2 md:p-3 rounded-lg shadow-xl font-medium transition-colors duration-500 ${isDarkMode ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {message}
                </div>
            )}
        </div>
    </div>
);


// =========================================================
// HUD RESPONSIVO COM MENU "HALO" EXPANSÍVEL (ORDEM INVERTIDA)
// =========================================================
const HUDOverlay = ({ onBack, onAudio, isSpeaking, isDarkMode, toggleTheme, onUserInfo, isAudioButtonHidden, toggleAudioButtonVisibility }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Fecha o menu se clicar fora (opcional, simples timeout para UX)
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // REMOVIDO: hover:scale-110 da classe base. Será aplicado seletivamente.
    const hudButtonBaseClass = "p-3 md:p-4 rounded-full transition-all border flex items-center justify-center shadow-md backdrop-blur-md z-30 relative";
    
    // Classes de cor para tema claro/escuro
    const lightClass = "bg-white/80 text-slate-600 border-gray-200 hover:bg-slate-100 hover:text-amber-600";
    const darkClass = "dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:text-amber-400";
    
    // Classe base para o estado fechado
    const closedStateClass = isDarkMode ? darkClass : lightClass;


    return (
        <div className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start z-50 pointer-events-none">
            {/* Grupo Esquerda (Voltar) */}
            <div className="pointer-events-auto" id="back_btn">
                {onBack && (
                    <button 
                        onClick={onBack} 
                        // ADICIONADO: hover:scale-110
                        className={`${hudButtonBaseClass} ${isDarkMode ? darkClass : lightClass} group hover:scale-110`} 
                        title="Voltar"
                    >
                        <span className="material-symbols-rounded text-xl md:text-2xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    </button>
                )}
            </div>

            {/* Grupo Direita (Ações + Menu Expansível) */}
            <div className="pointer-events-auto flex items-center gap-4">
                
                {/* 1. MENU PRINCIPAL (À Esquerda do Acessibilidade) */}
                <div className="relative flex flex-col items-center">
                    
                    {/* Botão Principal do Menu (Trigger) */}
                    <button 
                        onClick={toggleMenu}
                        // ADICIONADO: hover:scale-110
                        className={`${hudButtonBaseClass} hover:scale-110
                        ${isMenuOpen ? 'bg-amber-600 text-white border-amber-600 rotate-90' : (isDarkMode ? darkClass : lightClass)}`}
                        title="Menu de Opções"
                    >
                        <span className="material-symbols-rounded text-xl md:text-2xl transition-transform">
                            {isMenuOpen ? 'close' : 'widgets'}
                        </span>
                    </button>

                    {/* ITEM 1: TEMA (Expande para baixo) - ESTILO CARD PADRONIZADO */}
                    <button 
                        onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                        // ADICIONADO: hover:scale-110
                        className={`absolute w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center border transition-all duration-300 ease-out z-20 hover:scale-110
                        ${isMenuOpen 
                            // PADRÃO AMBER/LARANJA
                            ? 'translate-y-[110%] opacity-100 scale-100 bg-amber-600 text-white border-amber-400 ring-2 ring-amber-200' 
                            : `translate-y-0 opacity-0 scale-50 pointer-events-none ${closedStateClass}`
                        }`}
                        title={isDarkMode ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
                    >
                        <span className="material-symbols-rounded text-xl md:text-2xl">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* ITEM 2: INFORMAÇÕES DO USUÁRIO - ESTILO CARD PADRONIZADO */}
                    {onUserInfo && (
                        <button 
                            onClick={() => { onUserInfo(); setIsMenuOpen(false); }}
                            // ADICIONADO: hover:scale-110
                            className={`absolute w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center border transition-all duration-300 ease-out z-20 hover:scale-110
                            ${isMenuOpen 
                                // PADRÃO AMBER/LARANJA
                                ? 'translate-y-[220%] opacity-100 scale-100 bg-amber-600 text-white border-amber-400 ring-2 ring-amber-200'
                                : `translate-y-0 opacity-0 scale-50 pointer-events-none ${closedStateClass}`
                            }`} 
                            title="Informações do Usuário"
                        >
                            <span className="material-symbols-rounded text-xl md:text-2xl">
                                account_circle
                            </span>
                        </button>
                    )}

                    {/* NOVO ITEM 3: TOGGLE VISIBILIDADE DO BOTÃO DE ÁUDIO */}
                    {toggleAudioButtonVisibility && (
                        <button 
                            onClick={() => { toggleAudioButtonVisibility(); setIsMenuOpen(false); }}
                            // ADICIONADO: hover:scale-110
                            className={`absolute w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center border transition-all duration-300 ease-out z-20 hover:scale-110
                            ${isMenuOpen 
                                // PADRÃO AMBER/LARANJA
                                ? 'translate-y-[330%] opacity-100 scale-100 bg-amber-600 text-white border-amber-400 ring-2 ring-amber-200'
                                : `translate-y-0 opacity-0 scale-50 pointer-events-none ${closedStateClass}`
                            }`} 
                            title={isAudioButtonHidden ? "Mostrar Botão de Áudio" : "Ocultar Botão de Áudio"}
                        >
                            <span className="material-symbols-rounded text-xl md:text-2xl">
                                {isAudioButtonHidden ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    )}

                </div>

                {/* 2. BOTÃO DE ÁUDIO (Renderizado condicionalmente) */}
                {onAudio && !isAudioButtonHidden && (
                    <button 
                        onClick={onAudio} 
                        className={`${hudButtonBaseClass} 
                        ${isSpeaking 
                            ? 'speaking-pulse bg-amber-50 border-amber-200' // PULSAÇÃO AMBER/LARANJA
                            : (isDarkMode ? darkClass : lightClass)
                        }`}
                        title="Ouvir instruções"
                    >
                        <span className="material-symbols-rounded text-xl md:text-2xl">{isSpeaking ? 'volume_up' : 'accessibility_new'}</span>
                    </button>
                )}

            </div>
        </div>
    );
};

// =========================================================
// 3. COMPONENTE: SELEÇÃO DE PERSONAS (EDUCAÇÃO)
// =========================================================
const EducationPersonaScreen = ({ onBack, onSelect, isDarkMode, toggleTheme, onUserInfo, isAudioButtonHidden, toggleAudioButtonVisibility }) => {
    const [status, setStatus] = useState('idle');
    const [activeHighlight, setActiveHighlight] = useState(null);
    const isMounted = useRef(true);
    const isPlayingRef = useRef(false);

    const personaScript = [
        { text: "Você entrou no Portal Educacional. Agora, precisamos saber quem é você.", highlight: null },
        { text: "Se você é um Professor, toque aqui para gerenciar turmas e lançar notas.", highlight: 'professor' },
        { text: "Se você é um Aluno, toque aqui para ver suas atividades e boletim.", highlight: 'student' },
        { text: "Responsáveis e Pais, toquem aqui para acompanhar a frequência e avisos.", highlight: 'guardian' },
        { text: "Para coordenação e secretaria, use a opção Administração.", highlight: 'admin' },
        { text: "Para voltar ao menu principal, use o botão de seta no topo esquerdo.", highlight: 'back_btn' }
    ];
    
    // Funções de utilidade para manipulação de classes DOM
    const HIGHLIGHT_CLASSES = 'bg-amber-600 text-white shadow-2xl scale-105 z-10 ring-4 ring-amber-400';
    const BLUR_CLASS = 'blur-[1px] scale-95 opacity-60'; 
    const HIGHLIGHT_BTN_CLASS = 'highlighted-btn'; // Classe CSS customizada para o botão Voltar

    const removeClasses = (element, classes) => {
        classes.split(' ').forEach(cls => element.classList.remove(cls));
    };

    const applyHighlight = useCallback((targetId, isPlaying) => {
        // Limpa o destaque anterior em todos os elementos
        document.querySelectorAll(`#back_btn button, .flex-wrap button`).forEach(el => {
            removeClasses(el, HIGHLIGHT_CLASSES); 
            removeClasses(el, BLUR_CLASS); 
            el.classList.remove(HIGHLIGHT_BTN_CLASS);
        });

        if (isPlaying && targetId) {
            const element = document.getElementById(targetId);
            const container = document.querySelector('.flex-wrap');

            // 1. Aplica blur/opacidade em todos os cards (dentro do container)
            if (container) {
                container.querySelectorAll('button').forEach(btn => {
                    if (btn.id !== targetId) {
                        btn.classList.add(...BLUR_CLASS.split(' ')); 
                    }
                });
            }

            // 2. Aplica destaque no elemento alvo
            if (element) {
                if (targetId === 'back_btn') {
                    // Aplica classe especial ao botão Voltar (que está no HUDOverlay)
                    const btn = element.querySelector('button');
                    if (btn) {
                         btn.classList.add(HIGHLIGHT_BTN_CLASS);
                    }
                } else {
                    // Aplica classe de card ao botão Persona
                    element.classList.add(...HIGHLIGHT_CLASSES.split(' ')); 
                }
            }
        }
    }, []);

    
    // Função de playback estável com LOG de diagnóstico
    const playSequence = useCallback(async () => {
        const source = 'education';
        
        // Se já estiver tocando, cancela (assume que é clique manual de toggle)
        if (isPlayingRef.current) { 
            console.log(`[${source} - Play] CANCELADO por clique manual.`);
            AudioService.cancel(); 
            setStatus('idle'); 
            isPlayingRef.current = false; 
            applyHighlight(null, false);
            return;
        }

        // Inicia a narração
        if (!isPlayingRef.current) {
            console.log(`[${source} - Play] Iniciando sequência.`);
            setStatus('playing');
            isPlayingRef.current = true;
        }

        for (const step of personaScript) {
             if (!isMounted.current || !isPlayingRef.current) break;
            
            // Aplica o destaque usando o ID
            applyHighlight(step.highlight, true);

            try {
                await AudioService.speak(step.text, () => {});
            } catch(e) { console.error(`Erro ao falar passo ${step.text.substring(0, 10)}`, e); }
            if (isMounted.current && isPlayingRef.current) await new Promise(r => setTimeout(r, 400));
        }
        
        // Limpa o destaque final
        applyHighlight(null, false);
        
        if (isMounted.current) { 
            setStatus('idle'); 
            isPlayingRef.current = false; 
            console.log(`[${source} - Play] Sequência concluída.`);
        }
    }, [personaScript, applyHighlight]); 

    // Limpeza de estado e áudio
    useEffect(() => {
        return () => { 
            isMounted.current = false; 
            AudioService.cancel(); 
            isPlayingRef.current = false; 
            // Garante que qualquer destaque seja removido ao sair
            applyHighlight(null, false);
        };
    }, [applyHighlight]); // Executa apenas no unmount e limpa o DOM

    const personas = [
        { id: 'professor', title: 'Professor', desc: 'Diário, Notas e Chamada', icon: 'school', color: 'blue' },
        { id: 'student', title: 'Aluno', desc: 'Boletim e Atividades', icon: 'backpack', color: 'emerald' },
        { id: 'guardian', title: 'Responsável', desc: 'Frequência e Avisos', icon: 'family_restroom', color: 'amber' },
        { id: 'admin', title: 'Administração', desc: 'Secretaria e Cadastros', icon: 'admin_panel_settings', color: 'slate' },
    ];

    return (
        <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden py-10 md:py-[60px] ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}> 
            
            <HUDOverlay 
                onBack={onBack} 
                onAudio={playSequence} // Chamada manual
                isSpeaking={status === 'playing'}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                onUserInfo={onUserInfo}
                isAudioButtonHidden={isAudioButtonHidden}
                toggleAudioButtonVisibility={toggleAudioButtonVisibility}
            />
            
            <div className="w-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col items-center relative z-10">
                <h1 className={`text-2xl md:text-4xl font-['Roboto'] font-bold mb-2 md:mb-4 text-center w-full animate-fade-in ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>
                    Portal Educacional
                </h1>
                <p className={`text-sm md:text-xl mb-8 md:mb-12 text-center max-w-2xl animate-fade-in px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Selecione seu perfil de acesso:
                </p>

                {/* GRID FLUIDA/RÍGIDA: */}
                <div className="flex flex-wrap justify-center gap-[60px] w-full max-w-5xl animate-fade-in-up">
                    
                    {personas.map((p) => {
                        // NOTA: As classes de cor de base (sem destaque) são mantidas aqui
                        let colorClass = "";
                        if (isDarkMode) {
                            colorClass = `bg-slate-800 border-slate-700 text-${p.color}-400 hover:bg-slate-700 border-2`;
                        } else {
                            colorClass = `bg-${p.color}-50 text-${p.color}-700 border-${p.color}-200 hover:bg-${p.color}-100 border-2`;
                        }

                        return (
                            <button 
                                key={p.id}
                                onClick={() => onSelect(p.id)}
                                id={p.id} // ID para highlight de acessibilidade
                                className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl shadow-lg w-[300px] h-[300px] flex-shrink-0 max-w-full transition-all duration-500 ${colorClass}`}
                            >
                                <span 
                                    className={`material-symbols-rounded mb-2 md:mb-4 leading-none transition-transform duration-500`} 
                                    style={{ fontSize: '120px' }} // Tamanho fixo para 300x300
                                >
                                    {p.icon}
                                </span>
                                <h2 className="text-sm md:text-xl font-bold font-['Roboto'] mb-1">{p.title}</h2>
                                <p className={`text-[10px] md:text-xs font-medium text-center opacity-80 hidden sm:block`}>{p.desc}</p>
                            </button>
                        );
                    })}
                </div>
                
                <div className="mt-8 md:mt-16 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">Ambiente Seguro v2.0</div>
            </div>
        </div>
    );
};

// =========================================================
// 4. COMPONENTE: DASHBOARD GLOBAL (PORTFÓLIO)
// =========================================================
const GlobalAppDashboard = ({ onNavigate, isDarkMode, toggleTheme, onUserInfo, isAudioButtonHidden, toggleAudioButtonVisibility }) => {
    const [status, setStatus] = useState('idle');
    const [activeHighlight, setActiveHighlight] = useState(null);
    const isMounted = useRef(true);
    const isPlayingRef = useRef(false);

    const accessibilityScript = [
        { text: "Olá! Bem-vindo ao Portfólio de Aplicações.", highlight: null },
        { text: "Aqui temos o Mini App Educação.", highlight: 'education' },
        { text: "Ao lado, temos o Financeiro.", highlight: 'finance' },
        { text: "Abaixo, o Módulo de Saúde.", highlight: 'health' },
        { text: "E por fim, a Agenda Escolar.", highlight: 'agenda' },
        { text: "O botão Educação está ativo. Toque nele para entrar.", highlight: 'education' }
    ];

    const HIGHLIGHT_CLASSES = 'bg-amber-600 text-white shadow-2xl scale-105 z-10 ring-4 ring-amber-400';
    const BLUR_CLASS = 'blur-[1px] scale-95 opacity-60';
    
    const removeClasses = (element, classes) => {
        classes.split(' ').forEach(cls => element.classList.remove(cls));
    };

    const applyHighlight = useCallback((targetId, isPlaying) => {
        // Limpa o destaque anterior em todos os elementos
        document.querySelectorAll('.flex-wrap div[id]').forEach(el => {
            removeClasses(el, HIGHLIGHT_CLASSES); // CORRIGIDO: Usa removeClasses
            removeClasses(el, BLUR_CLASS); // CORRIGIDO: Usa removeClasses para BLUR_CLASS
        });

        if (isPlaying && targetId) {
            const element = document.getElementById(targetId);
            const container = document.querySelector('.flex-wrap');

            // 1. Aplica blur/opacidade em todos os cards (dentro do container)
            if (container) {
                container.querySelectorAll('div[id]').forEach(card => {
                    if (card.id !== targetId) {
                        card.classList.add(...BLUR_CLASS.split(' '));
                    }
                });
            }

            // 2. Aplica destaque no elemento alvo
            if (element) {
                element.classList.add(...HIGHLIGHT_CLASSES.split(' ')); // CORRIGIDO: Usa spread operator
            }
        }
    }, []);


    // Função de playback estável com LOG de diagnóstico
    const playSequence = useCallback(async () => {
        const source = 'home';
        
        // Se já estiver tocando, cancela (assume que é clique manual de toggle)
        if (isPlayingRef.current) { 
            console.log(`[${source} - Play] CANCELADO por clique manual.`);
            AudioService.cancel(); 
            setStatus('idle'); 
            isPlayingRef.current = false; 
            applyHighlight(null, false);
            return;
        }

        // Inicia a narração
        if (!isPlayingRef.current) {
            console.log(`[${source} - Play] Iniciando sequência.`);
            setStatus('playing');
            isPlayingRef.current = true;
        }

        for (const step of accessibilityScript) {
            if (!isMounted.current || !isPlayingRef.current) break;
            
            // Aplica o destaque usando o ID
            applyHighlight(step.highlight, true);

            try {
                await AudioService.speak(step.text, () => {});
            } catch(e) { console.error(`Erro ao falar passo ${step.text.substring(0, 10)}`, e); }
            if (isMounted.current && isPlayingRef.current) await new Promise(r => setTimeout(r, 300));
        }
        
        // Limpa o destaque final
        applyHighlight(null, false);
        
        if (isMounted.current) { 
            setStatus('idle'); 
            isPlayingRef.current = false; 
            console.log(`[${source} - Play] Sequência concluída.`);
        }
    }, [accessibilityScript, applyHighlight]);


    // Limpeza de estado e áudio
    useEffect(() => {
        return () => { 
            isMounted.current = false; 
            AudioService.cancel(); 
            isPlayingRef.current = false; 
            applyHighlight(null, false);
        };
    }, [applyHighlight]); // Executa apenas no unmount


    const miniApps = [
        { key: 'education', title: 'Educação', desc: 'Gestão e Provas', icon: 'cast_for_education', color: 'purple', status: 'active' },
        { key: 'finance', title: 'Financeiro', desc: 'Fluxo de Caixa', icon: 'account_balance', color: 'emerald', status: 'teaser' },
        { key: 'health', title: 'Saúde', desc: 'Enfermaria', icon: 'health_and_safety', color: 'red', status: 'teaser' },
        { key: 'agenda', title: 'Agenda', desc: 'Calendário', icon: 'calendar_month', color: 'amber', status: 'teaser' },
    ];

    return (
        <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 relative overflow-hidden py-10 md:py-[60px] ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`} >
            
            <HUDOverlay 
                onBack={null} 
                onAudio={playSequence} // Chamada manual
                isSpeaking={status === 'playing'}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                onUserInfo={onUserInfo}
                isAudioButtonHidden={isAudioButtonHidden}
                toggleAudioButtonVisibility={toggleAudioButtonVisibility}
            />

            <div className="w-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col items-center relative z-10">
                
                <h1 className={`text-2xl md:text-4xl font-['Roboto'] font-bold mb-2 md:mb-4 text-center w-full animate-fade-in ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    Portfólio de Aplicações
                </h1>
                <p className={`text-sm md:text-xl mb-8 md:mb-12 text-center max-w-2xl animate-fade-in px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Selecione o sistema que deseja acessar:
                </p>
                
                {/* GRID FLUIDA/RÍGIDA (Portfólio) */}
                <div className="flex flex-wrap justify-center gap-[60px] w-full max-w-5xl animate-fade-in-up">
                    {miniApps.map((app) => {
                        // REMOVIDO: isHighlighted do estado local do componente
                        
                        let colorClass = "";
                        if (isDarkMode) {
                            colorClass = `bg-slate-800 border-slate-700 text-${app.color}-400 hover:bg-slate-700 border-2`;
                        } else {
                            colorClass = `bg-${app.color}-50 border-${app.color}-200 text-${app.color}-600 hover:bg-${app.color}-100 border-2`;
                        }

                        return (
                            <div 
                                key={app.key} 
                                onClick={() => app.status === 'active' && onNavigate(app.key)} 
                                id={app.key} // ID para highlight de acessibilidade
                                // w-[300px] h-[300px]: Tamanho fixo, max-w-full: segurança mobile
                                className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl shadow-lg relative w-[300px] h-[300px] flex-shrink-0 max-w-full transition-all duration-500 ${colorClass} ${app.status === 'active' ? 'cursor-pointer' : 'opacity-70 border-dashed'}`}
                            >
                                {app.status !== 'active' && <div className="absolute top-0 right-0 bg-slate-500 text-white text-[8px] md:text-[10px] font-bold px-2 py-1 md:px-3 rounded-bl-lg rounded-tr-lg">EM BREVE</div>}
                                
                                <span 
                                    className={`material-symbols-rounded mb-2 md:mb-4 leading-none transition-transform duration-500`} 
                                    style={{ fontSize: '150px' }} // Tamanho fixo para 300x300
                                >
                                    {app.icon}
                                </span>
                                
                                <div className="text-center w-full">
                                    <h2 className="text-sm md:text-xl font-bold font-['Roboto'] mb-1 leading-tight">{app.title}</h2>
                                    <p className={`text-[10px] md:text-xs font-medium opacity-80 hidden sm:block`}>{app.desc}</p>
                                </div>
                                
                                {/* O elemento de destaque visual 'FALANDO DESTE ITEM' é gerado via JS/DOM no applyHighlight */}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// =========================================================
// 5. COMPONENTE: DASHBOARD DE INFORMAÇÕES DO USUÁRIO
// =========================================================
const UserInfoDashboard = ({ onBack, isDarkMode, toggleTheme, userId, isAuthReady, db, auth, appId, isAudioButtonHidden, toggleAudioButtonVisibility }) => {
    const [status, setStatus] = useState('idle');
    const [activeHighlight, setActiveHighlight] = useState(null);
    const isMounted = useRef(true);
    const isPlayingRef = useRef(false);

    const infoScript = [
        { text: "Você está na área de Informações e Status da Sessão. Aqui você pode verificar seu ID de usuário, o status da autenticação e a conexão com o banco de dados Firebase.", highlight: null },
        { text: "Seu ID de Usuário (UID) é exibido no topo da lista, seguido pelo status de Autenticação.", highlight: 'uid_status' },
        { text: "No final, você pode conferir o status de conexão com o Firestore e o ID da Aplicação.", highlight: 'db_status' },
        { text: "Para voltar, use a seta no canto superior esquerdo.", highlight: 'back_btn' }
    ];

    const HIGHLIGHT_CLASSES = 'bg-amber-600 text-white shadow-2xl ring-4 ring-amber-400';
    const HIGHLIGHT_BTN_CLASS = 'highlighted-btn'; // Classe CSS customizada para o botão Voltar

    const removeClasses = (element, classes) => {
        classes.split(' ').forEach(cls => element.classList.remove(cls));
    };

    const applyHighlight = useCallback((targetId, isPlaying) => {
        // Limpa o destaque anterior em todos os elementos
        document.querySelectorAll(`#back_btn button, .highlight-item`).forEach(el => {
            removeClasses(el, HIGHLIGHT_CLASSES); // CORRIGIDO: Usa removeClasses
            el.classList.remove(HIGHLIGHT_BTN_CLASS);
        });

        if (isPlaying && targetId) {
            const element = document.getElementById(targetId);

            if (element) {
                if (targetId === 'back_btn') {
                    // Aplica classe especial ao botão Voltar (que está no HUDOverlay)
                    const btn = element.querySelector('button');
                    if (btn) {
                         btn.classList.add(HIGHLIGHT_BTN_CLASS);
                    }
                } else {
                    // Aplica classe de card/item ao elemento de lista
                    element.classList.add(...HIGHLIGHT_CLASSES.split(' ')); // CORRIGIDO: Usa spread operator
                }
            }
        }
    }, []);


    // Função de playback estável com LOG de diagnóstico
    const playSequence = useCallback(async () => {
        const source = 'userInfo';
        
        // Se já estiver tocando, cancela (assume que é clique manual de toggle)
        if (isPlayingRef.current) { 
            console.log(`[${source} - Play] CANCELADO por clique manual.`);
            AudioService.cancel(); 
            setStatus('idle'); 
            isPlayingRef.current = false; 
            applyHighlight(null, false);
            return;
        }

        // Inicia a narração
        if (!isPlayingRef.current) {
            console.log(`[${source} - Play] Iniciando sequência.`);
            setStatus('playing');
            isPlayingRef.current = true;
        }

        for (const step of infoScript) {
            if (!isMounted.current || !isPlayingRef.current) break;
            
            // Aplica o destaque usando o ID
            applyHighlight(step.highlight, true);

            try {
                await AudioService.speak(step.text, () => {});
            } catch(e) { console.error(`Erro ao falar passo ${step.text.substring(0, 10)}`, e); }
            if (isMounted.current && isPlayingRef.current) await new Promise(r => setTimeout(r, 300));
        }
        
        // Limpa o destaque final
        applyHighlight(null, false);

        if (isMounted.current) { 
            setStatus('idle'); 
            isPlayingRef.current = false; 
            console.log(`[${source} - Play] Sequência concluída.`);
        }
    }, [infoScript, applyHighlight]); 


    // Limpeza de estado e áudio
    useEffect(() => {
        return () => { 
            isMounted.current = false; 
            AudioService.cancel(); 
            isPlayingRef.current = false; 
            applyHighlight(null, false);
        };
    }, [applyHighlight]); // Executa apenas no unmount
    
    // Determine Auth Status string
    const authStatus = auth?.currentUser 
        ? (auth.currentUser.isAnonymous ? 'Anônimo' : 'Autenticado (Token)')
        : 'Não Conectado / Carregando';
    
    // Determine Firestore Status
    const dbStatus = db ? 'Conectado' : 'Não Conectado';

    const cardClass = `p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl transition-colors duration-500 ${isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800'}`;
    const itemClass = `flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'} highlight-item`;
    const valueClass = `font-mono font-bold text-sm sm:text-base break-all mt-1 sm:mt-0`;
    const labelClass = `font-medium text-slate-500 text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : ''}`;

    return (
        <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 relative py-20 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
            
            <HUDOverlay 
                onBack={onBack} 
                onAudio={playSequence} // Chamada manual
                isSpeaking={status === 'playing'}
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
                onUserInfo={() => {}} // Desabilitado nesta página
                isAudioButtonHidden={isAudioButtonHidden}
                toggleAudioButtonVisibility={toggleAudioButtonVisibility}
            />
            
            <div className="w-full max-w-7xl mx-auto px-4 md:px-12 flex flex-col items-center relative z-10">
                <h1 className={`text-2xl md:text-4xl font-['Roboto'] font-bold mb-8 text-center w-full animate-fade-in ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                    Informações do Usuário & Status
                </h1>

                <div className={cardClass}>
                    <h2 className={`text-xl font-bold mb-4 border-b pb-2 ${isDarkMode ? 'border-amber-600 text-amber-400' : 'border-amber-200 text-amber-700'}`}>
                        Dados da Sessão
                    </h2>
                    
                    {/* Item 1: User ID */}
                    <div className={itemClass} id="uid_status">
                        <span className={labelClass}>ID do Usuário (UID)</span>
                        <span className={`${valueClass} ${isAuthReady ? (auth?.currentUser?.uid ? 'text-green-500' : 'text-yellow-500') : 'text-gray-500'}`}>
                            {userId || 'N/A'}
                        </span>
                    </div>

                    {/* Item 2: Auth Readiness */}
                    <div className={itemClass}>
                        <span className={labelClass}>Status da Autenticação</span>
                        <span className={`${valueClass} ${isAuthReady ? 'text-green-500' : 'text-red-500'}`}>
                            {isAuthReady ? 'Pronto' : 'Inicializando...'}
                        </span>
                    </div>

                    {/* Item 3: Auth Type */}
                    <div className={itemClass}>
                        <span className={labelClass}>Tipo de Conta</span>
                        <span className={`${valueClass} ${authStatus.includes('Token') ? 'text-blue-500' : 'text-amber-500'}`}>
                            {authStatus}
                        </span>
                    </div>

                    <h2 className={`text-xl font-bold mt-8 mb-4 border-b pb-2 ${isDarkMode ? 'border-amber-600 text-amber-400' : 'border-amber-200 text-amber-700'}`} id="db_status">
                        Status do Firebase
                    </h2>
                    
                    {/* Item 4: Firestore Status */}
                    <div className={itemClass}>
                        <span className={labelClass}>Firestore (DB)</span>
                        <span className={`${valueClass} ${dbStatus.includes('Conectado') ? 'text-green-500' : 'text-red-500'}`}>
                            {dbStatus}
                        </span>
                    </div>
                    
                    {/* Item 5: App ID */}
                     <div className={itemClass} style={{ borderBottom: 'none' }}>
                        <span className={labelClass}>ID da Aplicação (__app_id)</span>
                        <span className={`${valueClass} text-purple-500`}>
                            {appId || 'default-app-id'}
                        </span>
                    </div>
                </div>
                
                <p className={`mt-6 text-sm text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Esta tela exibe dados de debugging. O ID do usuário (UID) é crucial para a persistência de dados.
                </p>
            </div>
        </div>
    );
};

// --- FUNÇÃO DE TEMA ATUALIZADA: Prioriza localStorage e usa sistema como fallback ---
const THEME_KEY = 'theme';
const AUDIO_BUTTON_KEY = 'hideAudioButton';

const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        try {
             const storedTheme = localStorage.getItem(THEME_KEY);
            if (storedTheme !== null) {
                // 1. PRIORIDADE: Tema definido pelo usuário (salvo no localStorage)
                return storedTheme === 'dark';
            }
        } catch (e) {
            console.error("Could not access localStorage for theme preference.");
        }
       
        // 2. FALLBACK: Preferência do sistema
        if (window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
    }
    return false; // Padrão se não houver localStorage ou matchMedia
};

const getInitialAudioButtonVisibility = () => {
     if (typeof window !== 'undefined') {
        try {
            const storedVisibility = localStorage.getItem(AUDIO_BUTTON_KEY);
            // Retorna TRUE se a string salva for 'true' (oculto), caso contrário, retorna false (visível)
            return storedVisibility === 'true'; 
        } catch (e) {
            console.error("Could not access localStorage for audio button preference.");
        }
    }
    return false; // Padrão: Visível
};
// ------------------------------------------------------------------------

// =========================================================
// 6. COMPONENTE PRINCIPAL (ROTEADOR)
// =========================================================
const App = () => {
    // ESTADO INICIAL AJUSTADO: Usa a função getInitialTheme()
    const [currentView, setCurrentView] = useState('home'); 
    const [isDarkMode, setIsDarkMode] = useState(getInitialTheme()); 
    const [isAudioButtonHidden, setIsAudioButtonHidden] = useState(getInitialAudioButtonVisibility()); // NOVO ESTADO
    const [message, setMessage] = useState(null); 
    
    // --- FIREBASE STATE ---
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    // ----------------------
    
    // Ref para armazenar as funções de playback de cada tela
    const screenPlaybackRef = useRef({});

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            const themeName = newMode ? 'Escuro' : 'Claro';
            
            try {
                // AÇÃO ADICIONAL: Salva a nova preferência do usuário no localStorage
                localStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
                 // NOVO: Define e limpa a mensagem de confirmação visual
                setMessage(`Tema salvo: ${themeName}.`);
                setTimeout(() => setMessage(null), 3000);

            } catch (e) {
                console.error("Failed to save theme to localStorage:", e);
                setMessage("Erro ao salvar o tema.");
                setTimeout(() => setMessage(null), 3000);
            }
            
            return newMode;
        });
    };

    // NOVA FUNÇÃO: Toggle Visibilidade do Botão de Áudio
    const toggleAudioButtonVisibility = () => {
        setIsAudioButtonHidden(prev => {
            const newState = !prev;
            const actionText = newState ? 'oculto' : 'visível';

            try {
                localStorage.setItem(AUDIO_BUTTON_KEY, newState ? 'true' : 'false');
                setMessage(`Botão de Áudio agora está ${actionText}.`);
                setTimeout(() => setMessage(null), 3000);
            } catch (e) {
                 console.error("Failed to save audio button visibility:", e);
                setMessage("Erro ao salvar visibilidade do botão.");
                setTimeout(() => setMessage(null), 3000);
            }
            
            return newState;
        });
    };

    const registerPlayback = useCallback((viewName, playFunction) => {
        screenPlaybackRef.current[viewName] = playFunction;
    }, []);


    // --- FIREBASE INITIALIZATION AND AUTH ---
    // Usamos um ref para garantir que a mensagem de autenticação inicial só seja disparada uma vez
    const authMessageSentRef = useRef(false);

    useEffect(() => {
        setLogLevel('Debug');
        
        // Global variables provided by the Canvas environment
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' 
            ? JSON.parse(__firebase_config) 
            : {};
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' 
            ? __initial_auth_token 
            : null;

        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing. Data persistence will not work.");
            // Proceed with fallback state if config is missing
            setIsAuthReady(true);
            setUserId(crypto.randomUUID());
            return;
        }

        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);
        
        setDb(firestoreDb);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                setUserId(user.uid);
                if (!authMessageSentRef.current) {
                    setMessage(`Autenticado como: ${user.uid.substring(0, 8)}...`);
                    authMessageSentRef.current = true;
                    setTimeout(() => setMessage(null), 3000); // Limpa a mensagem após 3s
                }
            } else {
                setUserId(crypto.randomUUID()); // Anonymous/fallback ID
                if (!authMessageSentRef.current) {
                    setMessage('Sessão anônima iniciada.');
                    authMessageSentRef.current = true;
                    setTimeout(() => setMessage(null), 3000); // Limpa a mensagem após 3s
                }
            }
            setIsAuthReady(true);
        });
        
        // Sign in immediately using the provided token or anonymously
        const authenticate = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(firebaseAuth, initialAuthToken);
                } else {
                    await signInAnonymously(firebaseAuth);
                }
            } catch (error) {
                console.error("Firebase Auth failed:", error);
                // Fallback handled by onAuthStateChanged if sign-in fails
            }
        };
        
        authenticate();
        return () => unsubscribe();
    }, []);
    // ----------------------------------------


    const handleNavigate = (target) => {
        if (target === 'education') setCurrentView('education');
    };

    const handlePersonaSelect = (personaId) => {
        // Lógica de seleção (substitui o alert())
        setMessage(`Perfil selecionado: ${personaId.toUpperCase()}.`);
        setTimeout(() => setMessage(null), 3000);
        // Em um app real, você mudaria para a view específica do perfil:
        // setCurrentView(`dashboard-${personaId}`);
    };

    const handleUserInfo = () => {
        setCurrentView('userInfo');
    };
    
    // Obter App ID para o Dashboard de Info
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';


    return (
        <div className={`antialiased transition-colors duration-500 ${isDarkMode ? 'text-slate-100 bg-slate-900 dark-mode' : 'text-slate-900 bg-slate-50'}`}>
            <GlobalStyles />
            {/* Animações Globais CSS */}
             <style dangerouslySetInnerHTML={{__html: `
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
            `}} />
            
            {/* O StatusMessage AGORA SÓ MOSTRA AS MENSAGENS TEMPORÁRIAS, SEM O ID FIXO */}
            <StatusMessage message={message} isDarkMode={isDarkMode} />

            {currentView === 'home' && (
                <GlobalAppDashboard 
                    onNavigate={handleNavigate} 
                    isDarkMode={isDarkMode} 
                    toggleTheme={toggleTheme} 
                    onUserInfo={handleUserInfo}
                    isAudioButtonHidden={isAudioButtonHidden}
                    toggleAudioButtonVisibility={toggleAudioButtonVisibility}
                />
            )}
            
            {currentView === 'education' && (
                <EducationPersonaScreen 
                    onBack={() => setCurrentView('home')} 
                    onSelect={handlePersonaSelect} 
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                    onUserInfo={handleUserInfo}
                    isAudioButtonHidden={isAudioButtonHidden}
                    toggleAudioButtonVisibility={toggleAudioButtonVisibility}
                />
            )}

            {currentView === 'userInfo' && (
                <UserInfoDashboard 
                    onBack={() => setCurrentView('home')} 
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                    userId={userId}
                    isAuthReady={isAuthReady}
                    db={db}
                    auth={auth}
                    appId={appId}
                    isAudioButtonHidden={isAudioButtonHidden}
                    toggleAudioButtonVisibility={toggleAudioButtonVisibility}
                />
            )}
        </div>
    );
};

export default App;
