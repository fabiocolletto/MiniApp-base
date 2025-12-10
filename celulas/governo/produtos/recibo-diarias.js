import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, X, Truck, Utensils, Bed, BarChart3, Clipboard, Check, AlertTriangle, Loader2, User, ArrowRight } from 'lucide-react';

const PRIMARY_COLOR = '#004a99';
const DB_KEY = 'prestacaoContasDB';

const formatarMoeda = (value) => {
    return (parseFloat(value) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'currency', currency: 'BRL' });
};

const loadData = async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); 
    try {
        const json = localStorage.getItem(DB_KEY);
        if (json) {
            console.log("Dados carregados com sucesso.");
            return JSON.parse(json);
        }
        return null;
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        return null;
    }
};

const saveData = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 50)); 
    try {
        const json = JSON.stringify(data);
        localStorage.setItem(DB_KEY, json);
        console.log("Dados salvos automaticamente.");
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
    }
};


const ComprovanteTempList = ({ comprovantes, onRemove }) => {
    if (comprovantes.length === 0) {
        return <p className="text-sm text-gray-500 text-center py-4">Nenhum comprovante anexado a este item.</p>;
    }

    return (
        <div className="space-y-1">
            {comprovantes.map((item, index) => (
                <div key={item.id} className="flex items-center bg-white p-2 rounded shadow-sm border border-gray-200">
                    <div className="flex-1">
                        <strong className="text-sm text-blue-700">{item.tipoDespesa}</strong>
                        <span className="block text-xs font-bold text-green-600">{formatarMoeda(item.valor)}</span>
                    </div>
                    <button
                        onClick={() => onRemove(index)}
                        className="bg-red-100 text-red-700 p-1 rounded-full hover:bg-red-200 transition"
                        title="Remover Comprovante"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};

// Componente para adicionar um novo comprovante (sem grandes mudanças aqui)
const ComprovanteInput = ({ onAdd, tipoOptions, totalItem, totalLabel }) => {
    const [tipo, setTipo] = useState('');
    const [valor, setValor] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setArquivo({
                file: file,
                base64: reader.result,
                mimeType: file.type
            });
            setLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleAdd = () => {
        if (!tipo || parseFloat(valor) <= 0 || !arquivo) {
            alert("Preencha o tipo, valor e anexe um comprovante válido.");
            return;
        }

        const tipoDespesa = tipoOptions.find(o => o.value === tipo)?.label || 'Outro';

        onAdd({
            id: Date.now(),
            tipoDespesa,
            valor: parseFloat(valor),
            imagemBase64: arquivo.base64,
            mimeType: arquivo.mimeType,
        });

        setTipo('');
        setValor('');
        setArquivo(null);
        document.getElementById('file-input-reset').value = '';
    };

    return (
        <div className="border border-dashed border-blue-700 p-4 rounded-md bg-white/70 mt-4">
            <h4 className="text-sm font-bold text-blue-700 mb-3 border-b border-gray-300 pb-1">Adicionar Novo Comprovante</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Tipo da Despesa:</label>
                    <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="p-2 border rounded text-sm focus:border-blue-500">
                        <option value="">Selecione...</option>
                        {tipoOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Valor (R$):</label>
                    <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" className="p-2 border rounded text-sm focus:border-blue-500" />
                </div>
            </div>
            
            <div className="flex flex-col mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1">Anexar Comprovante (Imagem/PDF):</label>
                <input id="file-input-reset" type="file" accept="image/*, application/pdf" onChange={handleFileChange} className="p-1 border rounded text-sm bg-white" />
                {loading && <p className="text-xs text-gray-500 mt-1">Carregando arquivo...</p>}
                {arquivo && (
                    <div className="mt-2 p-1 border border-green-300 rounded bg-green-50 text-xs text-green-700 flex items-center">
                        <Check size={14} className="mr-1"/>
                        Arquivo anexado: {arquivo.file.name}
                    </div>
                )}
            </div>
            
            <div className="text-right">
                <button
                    onClick={handleAdd}
                    className="bg-blue-700 text-white px-3 py-1 text-sm font-semibold rounded hover:bg-blue-800 transition"
                >
                    <Plus size={14} className="inline mr-1" /> ADICIONAR COMPROVANTE
                </button>
            </div>
            
            <div className="mt-4 p-2 bg-yellow-100 border border-yellow-400 rounded text-right font-bold text-sm text-yellow-800">
                {totalLabel}: {formatarMoeda(totalItem)}
            </div>
        </div>
    );
};

const CostList = ({ items, onRemove, title, mainColor }) => {
    if (items.length === 0) {
        return (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum item de {title.toLowerCase()} adicionado.</p>
        );
    }

    return (
        <div className="space-y-2 mt-4">
             <p className="text-sm font-bold border-b border-dashed pb-1" style={{ color: mainColor }}>
                {title} Adicionados ({items.length} Item(s)):
            </p>
            {items.map((item, index) => {
                const comprovantesCount = item.comprovantes.length;
                const comprovantesTotal = item.comprovantes.reduce((sum, c) => sum + c.valor, 0);
                
                return (
                    <div key={item.id} className="cost-list-item flex items-center bg-white border border-gray-300 p-3 rounded-md shadow-sm">
                        <div className="flex-1">
                            <strong className="text-base" style={{ color: mainColor }}>{item.descricao.toUpperCase()}</strong>
                            <span className="block text-xs text-gray-600">{item.detalhes}</span>
                            <span className="block text-xs text-gray-500 mt-1">
                                Comprovantes: {comprovantesCount} ({formatarMoeda(comprovantesTotal)})
                            </span>
                            <span className="block text-sm font-bold text-blue-700 mt-1">
                                Valor Total Item: {formatarMoeda(item.valor)}
                            </span>
                        </div>
                        <button
                            onClick={() => onRemove(item.id)}
                            className="btn-remove bg-red-100 text-red-700 px-2 py-1 text-xs rounded hover:bg-red-200 transition"
                        >
                            <X size={12} className="inline mr-1" /> Remover
                        </button>
                    </div>
                );
            })}
        </div>
    );
};


const GenericExpenseSection = ({ 
    list, 
    onAdd, 
    onRemove, 
    title, 
    icon: Icon, 
    category, 
    itemOptions, 
    comprovanteOptions,
    totalDisplayBg,
    mainPlaceholder,
    onNextTab
}) => {
    
    const [detalhe, setDetalhe] = useState('');
    const [comprovantesTemp, setComprovantesTemp] = useState([]);
    const [tipoPrincipal, setTipoPrincipal] = useState(itemOptions.length > 0 ? itemOptions[0].value : '');
    
    const totalItem = comprovantesTemp.reduce((sum, item) => sum + item.valor, 0);

    const handleAddComprovante = useCallback((newComprovante) => {
        setComprovantesTemp(prev => [...prev, newComprovante]);
    }, []);

    const handleRemoveComprovante = useCallback((index) => {
        setComprovantesTemp(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleConfirm = () => {
        if (!detalhe) {
             alert("Por favor, preencha o campo de Detalhe.");
             return;
        }
        if (comprovantesTemp.length === 0 || totalItem <= 0) {
             alert("Pelo menos um comprovante válido (com valor maior que zero) deve ser anexado.");
             return;
        }
        
        const tipoLabel = itemOptions.find(o => o.value === tipoPrincipal)?.label || mainPlaceholder;
        let descricaoCompleta = `${tipoLabel}`;
        if (detalhe) {
            descricaoCompleta += ` (${detalhe})`;
        }

        const novoItem = {
            id: Date.now(),
            categoria: category,
            descricao: descricaoCompleta,
            detalhes: detalhe,
            valor: totalItem,
            comprovantes: comprovantesTemp,
            tipo: 'Diarias/Outros'
        };

        onAdd(novoItem);
        
        setDetalhe('');
        setComprovantesTemp([]);
        setTipoPrincipal(itemOptions.length > 0 ? itemOptions[0].value : '');
    };
    
    const sectionList = useMemo(() => list.filter(d => d.categoria === category), [list, category]);
    const totalSection = useMemo(() => sectionList.reduce((sum, item) => sum + item.valor, 0), [sectionList]);


    return (
        <div className="form-section-box">
            {/* Campos de formulário abertos permanentemente */}
            <div id={`dados_${category.toLowerCase()}_container`} className="mt-4"> 
                <h4 className="text-lg font-bold text-blue-800 mb-3">Adicionar {mainPlaceholder}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {itemOptions.length > 1 && (
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Tipo de Item:</label>
                            <select value={tipoPrincipal} onChange={(e) => setTipoPrincipal(e.target.value)} className="p-2 border rounded focus:border-blue-500">
                                <option value="">Selecione...</option>
                                {itemOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div className={`flex flex-col ${itemOptions.length === 1 ? 'col-span-1 sm:col-span-2' : ''}`}>
                        <label className="text-sm font-semibold text-gray-700 mb-1">Detalhe (Ex: Roteiro, Nome do Restaurante/Hotel):</label>
                        <input type="text" value={detalhe} onChange={(e) => setDetalhe(e.target.value)} placeholder="Detalhe/Período" className="p-2 border rounded focus:border-blue-500" />
                    </div>
                </div>

                {/* Linha e título "Comprovantes do Item (OBRIGATÓRIO)" removidos */}
                <h4 className="text-sm font-bold text-blue-700 mb-2 mt-4">Comprovantes</h4>
                <ComprovanteTempList 
                    comprovantes={comprovantesTemp} 
                    onRemove={handleRemoveComprovante} 
                />
                
                <ComprovanteInput
                    onAdd={handleAddComprovante}
                    tipoOptions={comprovanteOptions}
                    totalItem={totalItem}
                    totalLabel="Total Reembolsável Deste Item"
                />

                <div className="text-right mt-6 pt-4 border-t border-gray-300">
                    {/* Botão de Adicionar Novo Item (apenas salva e limpa o formulário) */}
                    <button className="btn-add bg-blue-700 text-white px-4 py-2 text-sm font-semibold rounded hover:bg-blue-800 transition" onClick={() => {
                        handleConfirm();
                    }}>
                         <Plus size={16} className="inline mr-1" /> ADICIONAR NOVO ITEM
                    </button>
                </div>
            </div>

            {/* Lista de Itens Existentes */}
            <CostList 
                items={sectionList} 
                onRemove={onRemove} 
                title={mainPlaceholder} 
                mainColor={PRIMARY_COLOR} 
            />
            
            {totalSection > 0 && (
                <div className={`mt-4 p-2 rounded font-bold text-right text-sm`} style={{ background: totalDisplayBg, border: `1px solid ${PRIMARY_COLOR}` }}>
                    Total {title}: <span className="text-base">{formatarMoeda(totalSection)}</span>
                </div>
            )}
        </div>
    );
};

// Componente dedicado para a Seção de Dados Pessoais (Item 1)
const PersonalDataSection = ({ nome, setNome, matricula, setMatricula, cpf, setCpf, banco, setBanco, agencia, setAgencia, conta, setConta, onNextTab }) => {
    
    const handleNext = () => {
        // Lógica simples de validação para forçar o preenchimento mínimo
        if (!nome || !cpf) {
             alert("Por favor, preencha o Nome Completo e o CPF antes de continuar.");
             return;
        }
        if (onNextTab) onNextTab();
    }

    return (
        <div className="form-section-box">
            {/* Área de Detalhes (Formulário Aberto Permanentemente) */}
            <div id="dados_pessoais_ocultos_container" className="mt-4">
                
                <h4 className="text-lg font-bold text-blue-800 mb-3">Detalhes do Servidor</h4>

                {/* 1.1 Nome Completo */}
                <div className="text-sm mb-4">
                    <label className="font-semibold text-gray-700">1.1 Nome Completo:</label>
                    <input 
                        type="text" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        className="w-full p-2 border rounded focus:border-blue-500 mt-1"
                        placeholder="Nome Completo do Servidor"
                    />
                </div>

                {/* 1.2 CPF e Matrícula - Responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">1.2 Matrícula:</label>
                        <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} placeholder="Ex: 12345" className="p-2 border rounded focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">1.2 CPF (apenas números):</label>
                        <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="p-2 border rounded focus:border-blue-500" />
                    </div>
                </div>
                
                <h4 className="text-lg font-bold text-blue-800 mb-3 mt-6 border-t pt-3 border-gray-300">Dados Bancários</h4>

                {/* 1.3 Banco, Agência, Conta - Responsivo em 3 colunas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">1.3 Banco:</label>
                        <input type="text" value={banco} onChange={(e) => setBanco(e.target.value)} placeholder="Nome do Banco" className="p-2 border rounded focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">1.3 Agência:</label>
                        <input type="text" value={agencia} onChange={(e) => setAgencia(e.target.value)} placeholder="0000-X" className="p-2 border rounded focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">1.3 Conta:</label>
                        <input type="text" value={conta} onChange={(e) => setConta(e.target.value)} placeholder="00000-0" className="p-2 border rounded focus:border-blue-500" />
                    </div>
                </div>

                <div className="text-right mt-6 pt-4 border-t border-gray-300">
                    {/* Botão de Próxima Ação MANTIDO AQUI para guiar o usuário na primeira aba (configuração) */}
                    <button 
                        className="btn-add bg-blue-700 text-white px-4 py-2 text-sm font-semibold rounded hover:bg-blue-800 transition"
                        onClick={handleNext}
                    >
                        SALVAR E PRÓXIMO <ArrowRight size={16} className="inline ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};


const App = () => {
    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [cpf, setCpf] = useState('');
    const [banco, setBanco] = useState('');
    const [agencia, setAgencia] = useState('');
    const [conta, setConta] = useState('');
    
    const [listaCustosTransporte, setListaCustosTransporte] = useState([]);
    const [listaOutrasDespesas, setListaOutrasDespesas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal'); 

    // Define a ordem das abas
    const TAB_KEYS = ['personal', 'transporte', 'alimentacao', 'hospedagem', 'resumo', 'finalizar'];

    // Função para mudar para a próxima aba
    const goToNextTab = useCallback(() => {
        const currentIndex = TAB_KEYS.indexOf(activeTab);
        if (currentIndex < TAB_KEYS.length - 1) {
            setActiveTab(TAB_KEYS[currentIndex + 1]);
        }
    }, [activeTab]);

    // Mover handlers para antes de useMemo (e TAB_STRUCTURE)
    const handleAddTransporte = useCallback((newCost) => {
        setListaCustosTransporte(prev => [...prev, newCost]);
    }, []);

    const handleRemoveTransporte = useCallback((id) => {
        setListaCustosTransporte(prev => prev.filter(item => item.id !== id));
    }, []);

    const handleAddOutraDespesa = useCallback((newExpense) => {
        setListaOutrasDespesas(prev => [...prev, newExpense]);
    }, []);

    const handleRemoveOutraDespesa = useCallback((id) => {
        setListaOutrasDespesas(prev => prev.filter(item => item.id !== id));
    }, []);
    
    // TAB_STRUCTURE agora é definido após os handlers
    const TAB_STRUCTURE = useMemo(() => [
        { key: 'personal', title: '1. Dados Pessoais', Icon: User, component: 'Personal' },
        { key: 'transporte', title: '2. Transporte', Icon: Truck, category: 'TRANSPORTE', list: listaCustosTransporte, onAdd: handleAddTransporte, onRemove: handleRemoveTransporte, mainPlaceholder: "Trecho de Transporte", totalDisplayBg: "#fff3cd", itemOptions: [{ value: 'CARRO_OFICIAL', label: 'Carro Oficial (Frota)' }, { value: 'VEICULO_PROPRIO', label: 'Veículo Próprio (Reembolso KM)' }, { value: 'ONIBUS_RODOVIARIO', label: 'Ônibus Rodoviário' }], comprovanteOptions: [{ value: 'Combustível', label: 'Combustível / Abastecimento' }, { value: 'Pedágio', label: 'Pedágio' }, { value: 'Passagem', label: 'Passagem (Ônibus/App)' }] },
        { key: 'alimentacao', title: '3. Alimentação', Icon: Utensils, category: 'ALIMENTACAO', list: listaOutrasDespesas, onAdd: handleAddOutraDespesa, onRemove: handleRemoveOutraDespesa, mainPlaceholder: "Item de Alimentação", totalDisplayBg: "#e6f7ff", itemOptions: [{ value: 'ALIMENTACAO', label: 'Diária de Alimentação' }], comprovanteOptions: [{ value: 'Almoço', label: 'Almoço' }, { value: 'Jantar', label: 'Jantar' }, { value: 'Lanche', label: 'Lanche / Café' }] },
        { key: 'hospedagem', title: '4. Hospedagem', Icon: Bed, category: 'HOSPEDAGEM_OUTROS', list: listaOutrasDespesas, onAdd: handleAddOutraDespesa, onRemove: handleRemoveOutraDespesa, mainPlaceholder: "Hospedagem ou Gasto Extra", totalDisplayBg: "#e6f7ff", itemOptions: [{ value: 'HOSPEDAGEM', label: 'Hospedagem / Hotel (Diária)' }, { value: 'OUTRO_ANEXO', label: 'Outro Gasto Comprovado' }], comprovanteOptions: [{ value: 'NotaHotel', label: 'Nota Fiscal do Hotel' }, { value: 'TaxaEvento', label: 'Taxa de Evento/Inscrição' }, { value: 'OutroGeral', label: 'Outro (Geral)' }] },
        { key: 'resumo', title: '5. Resumo Final', Icon: BarChart3, component: 'Summary' },
        { key: 'finalizar', title: '6. Gerar Documento', Icon: Clipboard, component: 'Finalize' }, // NOVO ITEM
    ], [listaCustosTransporte, listaOutrasDespesas, handleAddTransporte, handleRemoveTransporte, handleAddOutraDespesa, handleRemoveOutraDespesa]);


    const totals = useMemo(() => {
        const totalTransp = listaCustosTransporte.reduce((sum, item) => sum + item.valor, 0);
        const totalAlim = listaOutrasDespesas.filter(d => d.categoria === 'ALIMENTACAO').reduce((sum, item) => sum + item.valor, 0);
        const totalHospOutros = listaOutrasDespesas.filter(d => d.categoria !== 'ALIMENTACAO').reduce((sum, item) => sum + item.valor, 0);
        const saldoFinal = totalTransp + totalAlim + totalHospOutros;
        
        return { totalTransp, totalAlim, totalHospOutros, saldoFinal };
    }, [listaCustosTransporte, listaOutrasDespesas]);


    useEffect(() => {
        const fetchSavedData = async () => {
            const savedData = await loadData();
            if (savedData) {
                // Carrega dados pessoais e bancários
                setNome(savedData.nome || '');
                setMatricula(savedData.matricula || '');
                setCpf(savedData.cpf || '');
                setBanco(savedData.banco || '');
                setAgencia(savedData.agencia || '');
                setConta(savedData.conta || '');
                
                // Carrega listas de despesas
                setListaCustosTransporte(savedData.custosTransporte || []);
                setListaOutrasDespesas(savedData.despesasDiarias || []);
            } else {
                 setNome('');
            }
            setIsLoading(false);
        };
        fetchSavedData();
    }, []);


    useEffect(() => {
        if (isLoading) return;

        const jsonReportModel = {
            // Novos campos de dados pessoais
            nome: nome,
            matricula: matricula,
            cpf: cpf,
            banco: banco,
            agencia: agencia,
            conta: conta,
            
            dataGeracao: new Date().toISOString(),
            custosTransporte: listaCustosTransporte,
            despesasDiarias: listaOutrasDespesas,
            totais: totals
        };

        const timeoutId = setTimeout(() => {
            saveData(jsonReportModel);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [nome, matricula, cpf, banco, agencia, conta, listaCustosTransporte, listaOutrasDespesas, totals, isLoading]);
    
    
    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-center pt-20"> {/* Mantendo padding na tela de loading */}
                <Loader2 size={48} className="animate-spin text-blue-500 mx-auto" />
                <p className="mt-4 text-lg font-semibold text-gray-700">Carregando dados salvos...</p>
            </div>
        );
    }
    
    const renderTabContent = () => {
        const activeTabData = TAB_STRUCTURE.find(tab => tab.key === activeTab);

        if (!activeTabData) return null;

        if (activeTabData.component === 'Personal') {
            return (
                <PersonalDataSection
                    nome={nome} setNome={setNome}
                    matricula={matricula} setMatricula={setMatricula}
                    cpf={cpf} setCpf={setCpf}
                    banco={banco} setBanco={setBanco}
                    agencia={agencia} setAgencia={setAgencia}
                    conta={conta} setConta={setConta}
                    onNextTab={goToNextTab}
                 />
            );
        }
        
        if (activeTabData.component === 'Summary') {
            return (
                <div className="form-section-box">
                    <div className="resumo-final-card p-4 rounded-md shadow-md" style={{ background: '#f0f7ff', border: `1px solid ${PRIMARY_COLOR}` }}>
                        <p className="text-sm text-gray-700 mb-3">Totalização de todos os custos declarados:</p>
                        
                        <div className="space-y-1">
                            <div className="flex justify-between border-b border-dashed pb-1">
                                <span className="font-semibold text-gray-700">Total de Custos de Transporte (Item 2):</span>
                                <span className="font-bold text-blue-700">{formatarMoeda(totals.totalTransp)}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed pb-1">
                                <span className="font-semibold text-gray-700">Total de Alimentação (Item 3):</span>
                                <span className="font-bold text-blue-700">{formatarMoeda(totals.totalAlim)}</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed pb-1">
                                <span className="font-semibold text-gray-700">Total de Hospedagem e Outros (Item 4):</span>
                                <span className="font-bold text-blue-700">{formatarMoeda(totals.totalHospOutros)}</span>
                            </div>
                        </div>
                        
                        <div className="resumo-final-total mt-4 pt-3 border-t-2 font-extrabold text-lg text-right" style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}>
                            <span>SALDO FINAL: {formatarMoeda(totals.saldoFinal)}</span>
                        </div>

                        {totals.saldoFinal === 0 && (
                            <p className="text-xs mt-2 font-semibold text-red-600 flex items-center">
                                <AlertTriangle size={14} className="mr-1" /> O saldo está R$ 0,00. Confirme se os dados estão corretos.
                            </p>
                        )}
                    </div>
                     <div className="mt-8 text-center">
                        <button 
                            className="bg-blue-500 text-white px-6 py-2 text-sm font-semibold rounded hover:bg-blue-600 transition"
                            onClick={goToNextTab}
                        >
                            IR PARA 6. GERAR DOCUMENTO <ArrowRight size={16} className="inline ml-1" />
                        </button>
                    </div>
                </div>
            );
        }
        
        if (activeTabData.component === 'Finalize') {
            return (
                <div className="form-section-box text-center py-10">
                    <h3 className="text-xl font-bold mb-4" style={{ color: PRIMARY_COLOR }}>Tudo pronto para gerar seu relatório!</h3>
                    <p className="text-gray-600 mb-8">Revise o Resumo Final na aba anterior e clique no botão abaixo para baixar o documento oficial.</p>
                    
                    <button 
                        className="btn-success bg-green-600 text-white px-8 py-3 text-lg font-bold rounded-md hover:bg-green-700 transition shadow-lg"
                        onClick={() => alert(`Gerando PDF para ${nome} com saldo de ${formatarMoeda(totals.saldoFinal)}. Verifique o console para o modelo JSON salvo!`)}
                    >
                        <Clipboard size={20} className="inline mr-2" /> GERAR E BAIXAR DOCUMENTO
                    </button>
                </div>
            );
        }

        return (
            <GenericExpenseSection
                list={activeTabData.list}
                onAdd={activeTabData.onAdd}
                onRemove={activeTabData.onRemove}
                title={activeTabData.title}
                icon={activeTabData.Icon}
                category={activeTabData.category}
                mainPlaceholder={activeTabData.mainPlaceholder}
                totalDisplayBg={activeTabData.totalDisplayBg}
                itemOptions={activeTabData.itemOptions}
                comprovanteOptions={activeTabData.comprovanteOptions}
                onNextTab={goToNextTab}
            />
        );
    };

    return (
        // Removendo max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 para ocupar a largura total do container pai (iframe/canvas)
        <div className="min-h-screen"> 
            
            {/* Cabeçalho centralizado (agora ocupa a largura total, mas o texto é centrado) */}
            <div className="p-4 sm:p-6 lg:p-8"> 
                <h1 className="text-2xl font-bold text-center mb-6" style={{ color: PRIMARY_COLOR }}>
                    Prestação de Contas - Diárias (React)
                </h1>

                <p className="text-xs text-center mb-4 text-green-600 font-medium flex items-center justify-center">
                     <Check size={14} className="mr-1"/> O progresso é salvo automaticamente a cada alteração.
                </p>
            </div>
            
            {/* Container principal das abas, expandindo para a largura total */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden mx-4 sm:mx-6 lg:mx-8">
                
                {/* 1. BARRA DE NAVEGAÇÃO DE ABAS */}
                <div className="flex bg-gray-100 border-b border-gray-300 overflow-x-auto">
                    {TAB_STRUCTURE.map(tab => {
                        const isActive = tab.key === activeTab;
                        const borderColor = isActive ? PRIMARY_COLOR : 'transparent';
                        const textColor = isActive ? PRIMARY_COLOR : 'rgb(75, 85, 99)';

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                                    flex items-center justify-center flex-shrink-0 px-4 py-3 text-sm font-semibold transition duration-200 
                                    border-b-2 hover:bg-gray-200 focus:outline-none 
                                    ${isActive ? 'bg-white' : ''}
                                `}
                                style={{ borderColor: borderColor, color: textColor }}
                            >
                                <tab.Icon size={18} className="mr-2" />
                                {tab.title}
                            </button>
                        );
                    })}
                </div>

                {/* 2. CONTEÚDO DA ABA ATIVA - Padding interno mantido para legibilidade */}
                <div className="p-4 sm:p-6">
                    {renderTabContent()}
                </div>

            </div>
        </div>
    );
};

export default App;
