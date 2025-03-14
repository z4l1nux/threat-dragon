// Base de conhecimento completa STRIDE-CAPEC
export const strideCapecMap = {
  // SPOOFING
  "Spoofing": {
    description: "Falsificação de identidade ou origem",
    categories: [
      {
        name: "Identity Spoofing",
        capecs: ["151", "89", "98", "165", "164", "656", "473", "479"]
      },
      {
        name: "Content Spoofing",
        capecs: ["148", "216", "600", "627", "628", "275", "583", "545", "544", "433", "587", "196"]
      },
      {
        name: "Action Spoofing",
        capecs: ["175", "181", "222", "103", "201", "654", "506", "504"]
      },
      {
        name: "Resource Location Spoofing",
        capecs: ["154", "141", "142", "505", "616", "611", "615", "617", "630", "631", "632", "667"]
      },
      {
        name: "Social Engineering",
        capecs: ["416", "417", "407", "426", "425", "429", "414", "415", "413", "412"]
      }
    ],
    commonCapecs: ["151", "98", "416", "154", "103", "196"]
  },
  
  // TAMPERING
  "Tampering": {
    description: "Modificação não autorizada de dados ou código",
    categories: [
      {
        name: "Hardware Tampering",
        capecs: ["276", "438", "624"]
      },
      {
        name: "Data Structure Manipulation",
        capecs: ["255", "129", "133", "149", "252", "253"]
      },
      {
        name: "Command Injection",
        capecs: ["183", "248", "77", "78", "79"]
      },
      {
        name: "Man in the Middle",
        capecs: ["94"]
      },
      {
        name: "Buffer Manipulation",
        capecs: ["122", "123", "135", "130", "463"]
      }
    ],
    commonCapecs: ["94", "248", "255", "183", "129"]
  },
  
  // REPUDIATION
  "Repudiation": {
    description: "Negação de ações realizadas por uma entidade",
    categories: [
      {
        name: "Audit Log Manipulation",
        capecs: ["268", "81", "93"]
      },
      {
        name: "Identity Spoofing",
        capecs: ["195", "597", "599"]
      },
      {
        name: "Log Tampering",
        capecs: ["197", "93", "268"]
      },
      {
        name: "Blocking Audit",
        capecs: ["571"]
      }
    ],
    commonCapecs: ["268", "93", "81", "571"]
  },
  
  // INFORMATION DISCLOSURE
  "Information Disclosure": {
    description: "Exposição de informações a entidades não autorizadas",
    categories: [
      {
        name: "Data Gathering",
        capecs: ["116", "169", "224", "309", "651"]
      },
      {
        name: "Information Leakage",
        capecs: ["150", "118", "12", "13", "144", "16", "165", "166"]
      },
      {
        name: "Session Hijacking",
        capecs: ["167", "31", "37", "39", "65"]
      },
      {
        name: "Reverse Engineering",
        capecs: ["188", "187", "190", "191"]
      },
      {
        name: "Code Analysis",
        capecs: ["192", "107", "108", "157"]
      }
    ],
    commonCapecs: ["118", "31", "150", "116", "65", "37"]
  },
  
  // DENIAL OF SERVICE
  "Denial of Service": {
    description: "Negação ou degradação de serviço para usuários legítimos",
    categories: [
      {
        name: "Flooding",
        capecs: ["125", "482", "488", "489", "490", "491", "492", "493", "494", "495", "496", "497", "498", "499", "500", "501", "502", "546", "601", "841"]
      },
      {
        name: "Resource Exhaustion",
        capecs: ["130", "131", "197", "601"]
      },
      {
        name: "Protocol Exploitation",
        capecs: ["192", "227"]
      },
      {
        name: "Service Lockout",
        capecs: ["2"]
      }
    ],
    commonCapecs: ["125", "130", "131", "2", "227", "490", "494"]
  },
  
  // ELEVATION OF PRIVILEGE
  "Elevation of Privilege": {
    description: "Obtenção de acesso ou privilégios não autorizados",
    categories: [
      {
        name: "Privilege Abuse",
        capecs: ["122", "233"]
      },
      {
        name: "Buffer Exploitation",
        capecs: ["123", "100", "14", "24", "35", "44", "45", "46", "47"]
      },
      {
        name: "Injection Attacks",
        capecs: ["248", "250", "251", "252", "253", "76", "242"]
      },
      {
        name: "Process Hijacking",
        capecs: ["234"]
      },
      {
        name: "Execution Attacks",
        capecs: ["17", "159", "43", "69"]
      }
    ],
    commonCapecs: ["233", "123", "248", "76", "17", "234"]
  }
};

// Detalhes dos CAPECs para referência
export const capecDetails = {
  // Spoofing
  "151": {
    name: "Identity Spoofing",
    description: "Falsificação de identidade para ganhar acesso não autorizado",
    mitigation: "Implementar autenticação forte, multifator e verificação contínua de identidade"
  },
  "98": {
    name: "Phishing",
    description: "Enganar usuários para revelar informações sensíveis",
    mitigation: "Treinamento de usuários, filtros anti-phishing e autenticação multifator"
  },
  "103": {
    name: "Clickjacking",
    description: "Enganar usuários a clicar em algo diferente do que percebem",
    mitigation: "Implementar cabeçalhos X-Frame-Options e Content-Security-Policy"
  },
  
  // Tampering
  "94": {
    name: "Man in the Middle Attack",
    description: "Interceptação de comunicação entre duas partes",
    mitigation: "Usar HTTPS, pinning de certificados e HSTS"
  },
  "248": {
    name: "Command Injection",
    description: "Injeção de comandos do sistema através de entradas não sanitizadas",
    mitigation: "Validar e sanitizar entradas, usar APIs seguras ao invés de chamadas de sistema"
  },
  "255": {
    name: "Manipulate Data Structures",
    description: "Manipulação de estruturas de dados internas para alterar o comportamento do programa",
    mitigation: "Validar estruturas de dados, implementar verificações de integridade"
  },
  
  // Repudiation
  "268": {
    name: "Audit Log Manipulation",
    description: "Alteração ou exclusão de logs para ocultar atividades",
    mitigation: "Implementar logs seguros, assinados e distribuídos, com backup imediato"
  },
  "93": {
    name: "Log Injection/Tampering/Forging",
    description: "Manipulação de logs para inserir, modificar ou remover entradas",
    mitigation: "Sanitizar entradas de log, usar formatos à prova de injeção"
  },
  
  // Information Disclosure
  "118": {
    name: "Data Leakage",
    description: "Exposição não intencional de dados confidenciais",
    mitigation: "Classificar dados, implementar controles de acesso e criptografia adequada"
  },
  "31": {
    name: "Accessing/Intercepting/Modifying HTTP Cookies",
    description: "Manipulação de cookies para roubar informações ou sessões",
    mitigation: "Usar cookies HttpOnly, Secure e SameSite; implementar validação de sessão"
  },
  "150": {
    name: "Information Disclosure",
    description: "Exposição não autorizada de informações sensíveis",
    mitigation: "Implementar controle de acesso rigoroso, criptografia e princípio do menor privilégio"
  },
  
  // Denial of Service
  "125": {
    name: "Flooding",
    description: "Sobrecarregar recursos com volume excessivo de solicitações",
    mitigation: "Implementar rate limiting, escalabilidade automática e proteção contra DDoS"
  },
  "130": {
    name: "Excessive Allocation",
    description: "Alocar recursos excessivos para esgotar a disponibilidade do sistema",
    mitigation: "Implementar limites de alocação, monitoramento e timeout de solicitações"
  },
  "494": {
    name: "TCP SYN Flood",
    description: "Inundar o sistema com pacotes SYN incompletos",
    mitigation: "Implementar SYN cookies, firewall e proteção contra DDoS"
  },
  
  // Elevation of Privilege
  "233": {
    name: "Privilege Escalation",
    description: "Explorar falhas para ganhar privilégios adicionais",
    mitigation: "Aplicar princípio do menor privilégio, atualizações de segurança regulares"
  },
  "123": {
    name: "Buffer Overflow",
    description: "Explorar gerenciamento inadequado de memória para executar código",
    mitigation: "Usar linguagens seguras, sanitização de entrada e validação de limites"
  },
  "76": {
    name: "Manipulating Input to File System Calls",
    description: "Manipular entradas para acessar ou modificar arquivos não autorizados",
    mitigation: "Validar caminhos, usar listas de permissão e controles de acesso"
  }
};

// Muitos outros CAPECs omitidos por brevidade

// Função para avaliar componente e selecionar CAPECs relevantes
export function analyzeComponentForCapecs(component) {
  const componentType = component.type || '';
  const componentName = component.attributes?.label?.text || '';
  const description = component.attributes?.description || '';
  
  // Resultado da análise
  const analysis = {
    spoofing: { applicable: false, risk: 'Low', capecs: [] },
    tampering: { applicable: false, risk: 'Low', capecs: [] },
    repudiation: { applicable: false, risk: 'Low', capecs: [] },
    informationDisclosure: { applicable: false, risk: 'Low', capecs: [] },
    denialOfService: { applicable: false, risk: 'Low', capecs: [] },
    elevationOfPrivilege: { applicable: false, risk: 'Low', capecs: [] }
  };
  
  // Análise baseada no tipo de componente
  if (componentType.includes('Process')) {
    analysis.tampering.applicable = true;
    analysis.tampering.risk = 'Medium';
    analysis.tampering.capecs = ['123', '248', '250'];
    
    analysis.denialOfService.applicable = true;
    analysis.denialOfService.risk = 'Medium';
    analysis.denialOfService.capecs = ['125', '130'];
  }
  
  if (componentType.includes('Store')) {
    analysis.informationDisclosure.applicable = true;
    analysis.informationDisclosure.risk = 'High';
    analysis.informationDisclosure.capecs = ['150', '118', '37'];
    
    analysis.tampering.applicable = true;
    analysis.tampering.risk = 'High';
    analysis.tampering.capecs = ['129', '276'];
  }
  
  if (componentType.includes('Actor') || componentName.toLowerCase().includes('user')) {
    analysis.spoofing.applicable = true;
    analysis.spoofing.risk = 'High';
    analysis.spoofing.capecs = ['151', '98', '416'];
  }
  
  if (componentType.includes('Flow') || componentName.toLowerCase().includes('data')) {
    analysis.informationDisclosure.applicable = true;
    analysis.informationDisclosure.risk = 'High';
    analysis.informationDisclosure.capecs = ['94', '167', '116'];
    
    analysis.tampering.applicable = true;
    analysis.tampering.risk = 'Medium';
    analysis.tampering.capecs = ['94', '183'];
  }
  
  // Análise baseada no nome do componente
  if (componentName.toLowerCase().includes('auth') || 
      componentName.toLowerCase().includes('login') ||
      description.toLowerCase().includes('autenticação')) {
    analysis.spoofing.applicable = true;
    analysis.spoofing.risk = 'High';
    analysis.spoofing.capecs = ['151', '196', '593'];
    
    analysis.elevationOfPrivilege.applicable = true;
    analysis.elevationOfPrivilege.risk = 'High';
    analysis.elevationOfPrivilege.capecs = ['123', '233', '122'];
  }
  
  if (componentName.toLowerCase().includes('api') || 
      componentName.toLowerCase().includes('service') ||
      description.toLowerCase().includes('serviço')) {
    analysis.denialOfService.applicable = true;
    analysis.denialOfService.risk = 'High';
    analysis.denialOfService.capecs = ['125', '227', '130'];
    
    analysis.informationDisclosure.applicable = true;
    analysis.informationDisclosure.risk = 'Medium';
    analysis.informationDisclosure.capecs = ['116', '664'];
  }
  
  if (componentName.toLowerCase().includes('db') || 
      componentName.toLowerCase().includes('database') ||
      description.toLowerCase().includes('dados')) {
    analysis.informationDisclosure.applicable = true;
    analysis.informationDisclosure.risk = 'High';
    analysis.informationDisclosure.capecs = ['66', '118', '150'];
    
    analysis.tampering.applicable = true;
    analysis.tampering.risk = 'High';
    analysis.tampering.capecs = ['248', '66', '255'];
  }
  
  if (componentName.toLowerCase().includes('alb') || 
      componentName.toLowerCase().includes('load balancer') ||
      description.toLowerCase().includes('balanceador')) {
    analysis.denialOfService.applicable = true;
    analysis.denialOfService.risk = 'High';
    analysis.denialOfService.capecs = ['125', '482', '490', '494'];
    
    analysis.spoofing.applicable = true;
    analysis.spoofing.risk = 'Medium';
    analysis.spoofing.capecs = ['154', '148', '151'];
  }
  
  // Retorna o resultado da análise
  return analysis;
} 