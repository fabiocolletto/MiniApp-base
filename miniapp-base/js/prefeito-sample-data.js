(function(root){
  const SAMPLE_KEY = 'report_data_prefeito_seed';
  const SAMPLE_ENTRIES = [
    { sector:'saude', period:'2024-04', rating:4.1, previous:3.9, delta:0.2, responses:80, gender:'female', age:'25-34', neighborhood:'Centro' },
    { sector:'saude', period:'2024-04', rating:4.0, previous:3.8, delta:0.2, responses:60, gender:'male', age:'35-44', neighborhood:'Batel' },
    { sector:'saude', period:'2024-05', rating:4.2, previous:4.0, delta:0.2, responses:90, gender:'female', age:'25-34', neighborhood:'Rebouças' },
    { sector:'saude', period:'2024-05', rating:4.1, previous:3.9, delta:0.2, responses:70, gender:'male', age:'45-59', neighborhood:'Boqueirão' },
    { sector:'saude', period:'2024-06', rating:4.4, previous:4.2, delta:0.2, responses:100, gender:'female', age:'35-44', neighborhood:'Água Verde' },
    { sector:'saude', period:'2024-06', rating:4.3, previous:4.1, delta:0.2, responses:80, gender:'male', age:'45-59', neighborhood:'Cajuru' },
    { sector:'educacao', period:'2024-04', rating:3.8, previous:3.6, delta:0.2, responses:70, gender:'female', age:'25-34', neighborhood:'Cabral' },
    { sector:'educacao', period:'2024-04', rating:3.7, previous:3.5, delta:0.2, responses:60, gender:'male', age:'35-44', neighborhood:'Pilarzinho' },
    { sector:'educacao', period:'2024-05', rating:3.9, previous:3.7, delta:0.2, responses:90, gender:'female', age:'25-34', neighborhood:'Portão' },
    { sector:'educacao', period:'2024-05', rating:3.8, previous:3.6, delta:0.2, responses:70, gender:'male', age:'35-44', neighborhood:'Boqueirão' },
    { sector:'educacao', period:'2024-06', rating:4.0, previous:3.8, delta:0.2, responses:95, gender:'female', age:'35-44', neighborhood:'Santa Felicidade' },
    { sector:'educacao', period:'2024-06', rating:3.9, previous:3.7, delta:0.2, responses:75, gender:'male', age:'45-59', neighborhood:'Centro' },
    { sector:'transporte', period:'2024-04', rating:3.4, previous:3.2, delta:0.2, responses:85, gender:'female', age:'35-44', neighborhood:'Rebouças' },
    { sector:'transporte', period:'2024-04', rating:3.3, previous:3.1, delta:0.2, responses:70, gender:'male', age:'25-34', neighborhood:'CIC' },
    { sector:'transporte', period:'2024-05', rating:3.5, previous:3.3, delta:0.2, responses:95, gender:'female', age:'25-34', neighborhood:'Boqueirão' },
    { sector:'transporte', period:'2024-05', rating:3.4, previous:3.2, delta:0.2, responses:75, gender:'male', age:'35-44', neighborhood:'Batel' },
    { sector:'transporte', period:'2024-06', rating:3.6, previous:3.4, delta:0.2, responses:105, gender:'female', age:'16-24', neighborhood:'Centro' },
    { sector:'transporte', period:'2024-06', rating:3.5, previous:3.3, delta:0.2, responses:80, gender:'male', age:'25-34', neighborhood:'Pinheirinho' },
    { sector:'seguranca', period:'2024-04', rating:3.6, previous:3.4, delta:0.2, responses:60, gender:'female', age:'35-44', neighborhood:'Água Verde' },
    { sector:'seguranca', period:'2024-04', rating:3.5, previous:3.3, delta:0.2, responses:55, gender:'male', age:'45-59', neighborhood:'Centro' },
    { sector:'seguranca', period:'2024-05', rating:3.7, previous:3.5, delta:0.2, responses:70, gender:'female', age:'25-34', neighborhood:'Batel' },
    { sector:'seguranca', period:'2024-05', rating:3.6, previous:3.4, delta:0.2, responses:65, gender:'male', age:'45-59', neighborhood:'Cajuru' },
    { sector:'seguranca', period:'2024-06', rating:3.8, previous:3.6, delta:0.2, responses:80, gender:'female', age:'35-44', neighborhood:'Cabral' },
    { sector:'seguranca', period:'2024-06', rating:3.7, previous:3.5, delta:0.2, responses:70, gender:'male', age:'60+', neighborhood:'Boa Vista' },
    { sector:'meioambiente', period:'2024-04', rating:4.0, previous:3.8, delta:0.2, responses:75, gender:'female', age:'35-44', neighborhood:'Santa Felicidade' },
    { sector:'meioambiente', period:'2024-04', rating:3.9, previous:3.7, delta:0.2, responses:65, gender:'male', age:'45-59', neighborhood:'Portão' },
    { sector:'meioambiente', period:'2024-05', rating:4.1, previous:3.9, delta:0.2, responses:85, gender:'female', age:'25-34', neighborhood:'Centro' },
    { sector:'meioambiente', period:'2024-05', rating:4.0, previous:3.8, delta:0.2, responses:70, gender:'male', age:'35-44', neighborhood:'Rebouças' },
    { sector:'meioambiente', period:'2024-06', rating:4.2, previous:4.0, delta:0.2, responses:95, gender:'female', age:'16-24', neighborhood:'Juvevê' },
    { sector:'meioambiente', period:'2024-06', rating:4.1, previous:3.9, delta:0.2, responses:80, gender:'male', age:'25-34', neighborhood:'Batel' },
    { sector:'saude', period:'2024-05', rating:4.0, previous:3.9, delta:0.1, responses:30, gender:'nonbinary', age:'16-24', neighborhood:'Centro' },
    { sector:'educacao', period:'2024-06', rating:3.7, previous:3.6, delta:0.1, responses:25, gender:'nonbinary', age:'25-34', neighborhood:'Rebouças' },
    { sector:'transporte', period:'2024-04', rating:3.2, previous:3.1, delta:0.1, responses:20, gender:'other', age:'60+', neighborhood:'Ahú' }
  ];

  function countEntries(list){
    return Array.isArray(list) ? list.length : 0;
  }

  async function ensureSampleReportData(){
    const relatorio = root.relatorioUtils;
    if(!relatorio || typeof relatorio.openIndexedDB !== 'function'){
      return false;
    }
    try{
      await relatorio.openIndexedDB();
      const existing = await relatorio.loadDataFromCache?.(SAMPLE_KEY);
      if(existing && countEntries(existing.data) >= countEntries(SAMPLE_ENTRIES)){
        return false;
      }
      await relatorio.saveDataToCache(SAMPLE_KEY, SAMPLE_ENTRIES);
      return true;
    }catch(err){
      console.warn('Prefeito sample data: falha ao semear IndexedDB', err);
      return false;
    }
  }

  root.PrefeitoSampleData = {
    ensureSampleReportData,
    SAMPLE_KEY,
    SAMPLE_ENTRIES
  };
})(window);
