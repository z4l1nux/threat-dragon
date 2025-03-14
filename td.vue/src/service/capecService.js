import axios from 'axios';

// Mock de dados CAPEC por não existir API pública fácil de usar
const MOCK_CAPEC_DATABASE = {
    'S': [
        { id: '151', name: 'Identity Spoofing', summary: 'Um atacante usa informações de identificação de outra entidade para se passar por ela.', risk: 'Alto' },
        { id: '196', name: 'Session Credential Falsification through Forging', summary: 'Um atacante falsifica as credenciais da sessão para se autenticar como outro usuário.', risk: 'Alto' },
        { id: '593', name: 'Session Hijacking', summary: 'Um atacante rouba uma sessão ativa de outro usuário após a autenticação.', risk: 'Alto' }
    ],
    'T': [
        { id: '66', name: 'SQL Injection', summary: 'Um atacante modifica consultas SQL enviadas de um aplicativo para o banco de dados.', risk: 'Alto' },
        { id: '137', name: 'Parameter Injection', summary: 'Um atacante manipula os parâmetros trocados entre o cliente e o servidor.', risk: 'Médio' },
        { id: '268', name: 'Audit Log Manipulation', summary: 'Um atacante manipula os registros de auditoria para ocultar atividades maliciosas.', risk: 'Médio' }
    ],
    'R': [
        { id: '93', name: 'Log Injection-Tampering-Forging', summary: 'Um atacante falsifica ou manipula informações em registros de log.', risk: 'Médio' },
        { id: '638', name: 'Altered Audit Trail', summary: 'Um atacante altera os registros de auditoria para remover evidências.', risk: 'Médio' },
        { id: '305', name: 'Reflection Attack in Authentication Protocol', summary: 'Um atacante reflete dados de autenticação para enganar um sistema.', risk: 'Alto' }
    ],
    'I': [
        { id: '116', name: 'Excavation', summary: 'Um atacante extrai sistematicamente informações protegidas de fontes públicas.', risk: 'Médio' },
        { id: '118', name: 'Cache Poisoning', summary: 'Um atacante corrompe o cache de DNS para redirecionar tráfego.', risk: 'Alto' },
        { id: '545', name: 'Pull Data from System Resources', summary: 'Um atacante extrai dados de recursos do sistema.', risk: 'Médio' }
    ],
    'D': [
        { id: '125', name: 'Flooding', summary: 'Um atacante consome recursos enviando um volume excessivo de requisições.', risk: 'Alto' },
        { id: '130', name: 'Excessive Allocation', summary: 'Um atacante aloca recursos excessivamente para causar escassez.', risk: 'Médio' },
        { id: '146', name: 'Resource Exhaustion through Allocation', summary: 'Um atacante esgota os recursos do sistema através de múltiplas alocações.', risk: 'Alto' }
    ],
    'E': [
        { id: '122', name: 'Privilege Escalation', summary: 'Um atacante ganha acesso privilegiado a recursos protegidos.', risk: 'Alto' },
        { id: '233', name: 'Privilege Escalation', summary: 'Um atacante explora vulnerabilidades para elevar seus privilégios no sistema.', risk: 'Alto' },
        { id: '17', name: 'Using Malicious Files', summary: 'Um atacante usa arquivos maliciosos para executar código privilegiado.', risk: 'Alto' }
    ]
};

class CAPECService {
    constructor() {
        // Na implementação real, usaríamos uma API pública do CAPEC
        // No momento, não existe uma API pública fácil de usar
        this.useRealAPI = false;
        this.baseUrl = 'https://capec.mitre.org/data/api';
    }

    async getCAPECsBySTRIDE(strideCategory) {
        if (this.useRealAPI) {
            try {
                const response = await axios.get(`${this.baseUrl}/attack-patterns`, {
                    params: {
                        stride: strideCategory
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching CAPECs:', error);
                // Fallback para os dados simulados
                return MOCK_CAPEC_DATABASE[strideCategory] || [];
            }
        } else {
            // Usar dados simulados
            return MOCK_CAPEC_DATABASE[strideCategory] || [];
        }
    }

    async getCAPECDetails(capecId) {
        if (this.useRealAPI) {
            try {
                const response = await axios.get(`${this.baseUrl}/attack-patterns/${capecId}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching CAPEC details:', error);
                // Buscar nos dados simulados
                for (const category in MOCK_CAPEC_DATABASE) {
                    const capec = MOCK_CAPEC_DATABASE[category].find(c => c.id === capecId);
                    if (capec) return capec;
                }
                return null;
            }
        } else {
            // Buscar nos dados simulados
            for (const category in MOCK_CAPEC_DATABASE) {
                const capec = MOCK_CAPEC_DATABASE[category].find(c => c.id === capecId);
                if (capec) return capec;
            }
            return null;
        }
    }

    async findRelevantCAPECs(component, threats) {
        const relevantCAPECs = [];
        
        try {
            // Para cada ameaça, buscar CAPECs relacionados à categoria STRIDE
            for (const threat of threats) {
                const strideCategory = this._mapThreatToSTRIDE(threat.type);
                if (!strideCategory) continue;
                
                const capecs = await this.getCAPECsBySTRIDE(strideCategory);
                
                // Filtrar os 2 CAPECs mais relevantes para cada ameaça
                if (capecs && capecs.length > 0) {
                    relevantCAPECs.push(...capecs.slice(0, 2));
                }
            }
            
            // Remover duplicatas
            const uniqueCAPECs = [];
            const capecIds = new Set();
            
            for (const capec of relevantCAPECs) {
                if (!capecIds.has(capec.id)) {
                    capecIds.add(capec.id);
                    uniqueCAPECs.push(capec);
                }
            }
            
            return uniqueCAPECs;
        } catch (error) {
            console.error('Error finding relevant CAPECs:', error);
            return [];
        }
    }

    _mapThreatToSTRIDE(threatType) {
        // Mapeamento de tipos de ameaças para categorias STRIDE
        const typeMapping = {
            'Spoofing': 'S',
            'Tampering': 'T',
            'Repudiation': 'R',
            'Information disclosure': 'I',
            'Information Disclosure': 'I',
            'Denial of service': 'D',
            'Denial of Service': 'D',
            'Elevation of privilege': 'E',
            'Elevation of Privilege': 'E'
        };
        
        return typeMapping[threatType] || null;
    }

    _isRelevantToComponent(capec, component) {
        // Na implementação real, poderíamos fazer uma análise mais sofisticada
        // baseada no tipo de componente e nas características do CAPEC
        return true;
    }
}

export default new CAPECService(); 