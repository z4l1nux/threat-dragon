import { strideCapecMap, capecDetails } from './strideCapecMap';

// Analisador inteligente de ameaças para componentes
export class ThreatAnalyzer {
  constructor() {
    this.strideMap = strideCapecMap;
    this.capecDetails = capecDetails;
  }
  
  // Analisa um componente para identificar ameaças aplicáveis
  analyzeComponent(component) {
    // Extrai informações relevantes do componente
    const componentInfo = this.extractComponentInfo(component);
    console.log('Informações do componente:', componentInfo);
    
    // Determina quais categorias STRIDE são aplicáveis
    const applicableThreats = this.determineApplicableThreats(componentInfo);
    console.log('Ameaças aplicáveis:', applicableThreats);
    
    // Seleciona CAPECs relevantes para cada ameaça
    const threatAnalysis = this.selectRelevantCapecs(applicableThreats, componentInfo);
    console.log('Análise completa:', threatAnalysis);
    
    return threatAnalysis;
  }
  
  // Extrai informações relevantes do componente
  extractComponentInfo(component) {
    return {
      id: component.id,
      name: component.attributes?.label?.text || component.attributes?.name || 'Componente sem nome',
      type: component.type || 'tm.Process',
      description: component.attributes?.description || component.attributes?.attrs?.description || '',
      outOfScope: component.attributes?.outOfScope || false,
      hasAuth: this.hasAuthFeatures(component),
      storesData: this.storesData(component),
      isEntryPoint: this.isEntryPoint(component),
      isExternalEntity: this.isExternalEntity(component)
    };
  }
  
  // Verifica se o componente tem recursos de autenticação
  hasAuthFeatures(component) {
    const text = `${component.attributes?.label?.text || ''} ${component.attributes?.description || ''}`.toLowerCase();
    return text.includes('auth') || 
           text.includes('login') || 
           text.includes('senha') || 
           text.includes('credential') || 
           text.includes('token');
  }
  
  // Verifica se o componente armazena dados
  storesData(component) {
    const text = `${component.attributes?.label?.text || ''} ${component.attributes?.description || ''}`.toLowerCase();
    return text.includes('database') || 
           text.includes('db') || 
           text.includes('store') || 
           text.includes('dados') || 
           text.includes('storage') ||
           component.type?.includes('Store');
  }
  
  // Verifica se o componente é um ponto de entrada
  isEntryPoint(component) {
    const text = `${component.attributes?.label?.text || ''} ${component.attributes?.description || ''}`.toLowerCase();
    return text.includes('api') || 
           text.includes('endpoint') || 
           text.includes('interface') || 
           text.includes('gateway') || 
           text.includes('entrada');
  }
  
  // Verifica se o componente é uma entidade externa
  isExternalEntity(component) {
    const text = `${component.attributes?.label?.text || ''} ${component.attributes?.description || ''}`.toLowerCase();
    return text.includes('external') || 
           text.includes('third party') || 
           text.includes('user') || 
           text.includes('cliente') || 
           text.includes('externo');
  }
  
  // Determina quais categorias STRIDE são aplicáveis ao componente
  determineApplicableThreats(componentInfo) {
    const applicable = {
      "Spoofing": false,
      "Tampering": false,
      "Repudiation": false,
      "Information Disclosure": false,
      "Denial of Service": false,
      "Elevation of Privilege": false
    };
    
    // Regras de aplicabilidade baseadas no tipo e características do componente
    
    // Spoofing
    if (componentInfo.hasAuth || componentInfo.isExternalEntity) {
      applicable["Spoofing"] = true;
    }
    
    // Tampering
    if (!componentInfo.outOfScope) {
      applicable["Tampering"] = true;
    }
    
    // Repudiation
    if (componentInfo.hasAuth) {
      applicable["Repudiation"] = true;
    }
    
    // Information Disclosure
    if (componentInfo.storesData || !componentInfo.outOfScope) {
      applicable["Information Disclosure"] = true;
    }
    
    // Denial of Service
    if (componentInfo.isEntryPoint || componentInfo.type.includes('Process')) {
      applicable["Denial of Service"] = true;
    }
    
    // Elevation of Privilege
    if (componentInfo.hasAuth || !componentInfo.outOfScope) {
      applicable["Elevation of Privilege"] = true;
    }
    
    return applicable;
  }
  
  // Seleciona CAPECs relevantes para cada ameaça aplicável
  selectRelevantCapecs(applicableThreats, componentInfo) {
    const analysis = {};
    
    // Para cada tipo STRIDE aplicável
    Object.keys(applicableThreats).forEach(strideType => {
      if (applicableThreats[strideType]) {
        // Determina o nível de risco
        const risk = this.determineRiskLevel(strideType, componentInfo);
        
        // Seleciona CAPECs relevantes
        const capecs = this.getRelevantCapecs(strideType, componentInfo);
        
        // Adiciona à análise
        analysis[strideType] = {
          applicable: true,
          risk: risk,
          capecs: capecs,
          description: this.strideMap[strideType].description
        };
      }
    });
    
    return analysis;
  }
  
  // Determina o nível de risco para uma categoria STRIDE
  determineRiskLevel(strideType, componentInfo) {
    // Lógica de avaliação de risco baseada no tipo de componente e categoria STRIDE
    if (strideType === "Information Disclosure" && componentInfo.storesData) {
      return "High";
    }
    
    if (strideType === "Spoofing" && componentInfo.hasAuth) {
      return "High";
    }
    
    if (strideType === "Denial of Service" && componentInfo.isEntryPoint) {
      return "High";
    }
    
    if (strideType === "Elevation of Privilege" && componentInfo.hasAuth) {
      return "High";
    }
    
    // Risco padrão
    return "Medium";
  }
  
  // Obtém CAPECs relevantes para uma categoria STRIDE
  getRelevantCapecs(strideType, componentInfo) {
    // Obtém os CAPECs comuns para este tipo STRIDE
    const commonCapecs = this.strideMap[strideType].commonCapecs || [];
    
    // Seleciona CAPECs adicionais com base nas características do componente
    let additionalCapecs = [];
    
    if (strideType === "Spoofing") {
      if (componentInfo.hasAuth) {
        additionalCapecs.push("151", "98");
      }
      if (componentInfo.isExternalEntity) {
        additionalCapecs.push("196", "416");
      }
    }
    
    if (strideType === "Tampering") {
      if (componentInfo.storesData) {
        additionalCapecs.push("248", "76");
      }
      if (componentInfo.isEntryPoint) {
        additionalCapecs.push("94", "183");
      }
    }
    
    if (strideType === "Information Disclosure") {
      if (componentInfo.storesData) {
        additionalCapecs.push("118", "150");
      }
      if (componentInfo.isEntryPoint) {
        additionalCapecs.push("31", "94");
      }
    }
    
    if (strideType === "Denial of Service") {
      if (componentInfo.isEntryPoint) {
        additionalCapecs.push("125", "494");
      }
      if (componentInfo.type.includes("Process")) {
        additionalCapecs.push("130", "131");
      }
    }
    
    if (strideType === "Elevation of Privilege") {
      if (componentInfo.hasAuth) {
        additionalCapecs.push("233", "122");
      }
      if (componentInfo.isEntryPoint) {
        additionalCapecs.push("248", "76");
      }
    }
    
    // Combina os CAPECs comuns com os adicionais e remove duplicatas
    const allCapecs = [...new Set([...commonCapecs, ...additionalCapecs])];
    
    // Retorna até 5 CAPECs relevantes
    return allCapecs.slice(0, 5);
  }
  
  // Gera descrições para as ameaças
  generateThreatDescriptions(threatAnalysis) {
    const threats = [];
    
    Object.entries(threatAnalysis).forEach(([strideType, analysis]) => {
      if (analysis.applicable) {
        // Cria a descrição da ameaça
        let description = `${analysis.description}\n\n`;
        description += `Nível de risco: ${analysis.risk}\n\n`;
        
        // Adiciona detalhes de mitigação
        let mitigation = "Mitigações recomendadas:\n";
        
        // Adiciona CAPECs com seus detalhes
        description += "CAPECs associados:\n";
        analysis.capecs.forEach(capecId => {
          const capecInfo = this.capecDetails[capecId] || { 
            name: `CAPEC-${capecId}`, 
            description: "Padrão de ataque comum", 
            mitigation: "Implementar medidas de segurança apropriadas" 
          };
          
          description += `- CAPEC-${capecId}: ${capecInfo.name}\n  ${capecInfo.description}\n`;
          mitigation += `- Para CAPEC-${capecId}: ${capecInfo.mitigation}\n`;
        });
        
        // Adiciona a ameaça à lista
        threats.push({
          title: strideType,
          type: "STRIDE",
          strideType: strideType,
          status: "Open",
          severity: this.mapRiskToSeverity(analysis.risk),
          description: description,
          mitigation: mitigation,
          capecs: analysis.capecs.map(id => `CAPEC-${id}`).join(', ')
        });
      }
    });
    
    return threats;
  }
  
  // Mapeia nível de risco para severidade
  mapRiskToSeverity(risk) {
    switch(risk.toLowerCase()) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  }
}

// Exporta o analisador
export const threatAnalyzer = new ThreatAnalyzer(); 