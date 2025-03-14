import axios from 'axios';
import { AI_CONFIG } from '../config/ai';

class AIService {
    constructor() {
        this.apiKey = null;
        this.aiProvider = null;
    }

    setConfiguration(apiKey, provider) {
        this.apiKey = apiKey;
        this.aiProvider = provider;
    }

    async analyzeComponent(component, config = {}) {
        if (!component) {
            throw new Error('Componente não fornecido para análise');
        }

        const prompt = `Analise o seguinte componente para potenciais ameaças de segurança usando a metodologia STRIDE:
        
        Componente: ${component.name || 'Sem nome'}
        Tipo: ${component.type || 'Desconhecido'}
        Descrição: ${component.description || 'Sem descrição'}
        
        Por favor, forneça:
        1. Ameaças STRIDE potenciais
        2. Nível de risco para cada ameaça
        3. Sugestões de mitigação
        4. CAPECs relacionados`;

        const data = {
            component: component,
            prompt: prompt,
            config: config
        };

        return await this._callAI(data);
    }

    async _callAI(data) {
        const { config = {} } = data;
        const provider = config.provider || 'local';
        const apiKey = config.apiKey || '';
        
        try {
            console.log(`Usando provedor de IA: ${provider}`);
            
            // Se for simulação local, retornar dados simulados
            if (provider === 'local') {
                console.log('Simulando chamada à API com dados:', data);
                return this.simulateAIResponse(data);
            }
            
            // Verificar se a API key foi fornecida
            if (!apiKey) {
                throw new Error('API key não fornecida');
            }
            
            // Implementar chamadas reais para diferentes provedores
            if (provider === 'anthropic') {
                return this.callAnthropic(data, apiKey);
            } else if (provider === 'openai') {
                return this.callOpenAI(data, apiKey);
            } else if (provider === 'gemini') {
                return await this.callGemini(data, apiKey);
            } else {
                throw new Error(`Provedor de IA não suportado: ${provider}`);
            }
        } catch (error) {
            console.error('Error calling AI service:', error);
            throw error;
        }
    }

    simulateAIResponse(data) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Análise de ameaças para o componente ${data.component.name || 'selecionado'}:\n\n` +
                          '**Spoofing**: Este componente pode ser vulnerável a ataques de spoofing se não implementar autenticação adequada. (Risco: Médio)\n' +
                          'Mitigação: Implementar autenticação forte, como OAuth 2.0 ou certificados SSL/TLS.\n\n' +
                          
                          '**Tampering**: Dados podem ser modificados durante a transmissão se não forem protegidos. (Risco: Médio)\n' +
                          'Mitigação: Utilizar HTTPS para todas as comunicações e implementar assinaturas digitais.\n\n' +
                          
                          '**Repudiation**: Sem registro de auditoria adequado, ações podem ser negadas. (Risco: Médio)\n' +
                          'Mitigação: Implementar logs detalhados e armazená-los de forma segura.\n\n' +
                          
                          '**Information Disclosure**: Informações sensíveis podem vazar se não forem criptografadas. (Risco: Alto)\n' +
                          'Mitigação: Criptografar dados sensíveis e implementar controles de acesso adequados.\n\n' +
                          
                          '**Denial of Service**: O componente pode ser sobrecarregado por múltiplas requisições. (Risco: Alto)\n' +
                          'Mitigação: Implementar rate limiting, escalabilidade automática e proteção contra DDoS.\n\n' +
                          
                          '**Elevation of Privilege**: Acesso não autorizado pode ocorrer se os controles de acesso forem fracos. (Risco: Médio)\n' +
                          'Mitigação: Implementar o princípio do menor privilégio e validar todas as entradas.\n\n' +
                          
                          'CAPECs Relacionados:\n' +
                          '- CAPEC-31: Acessar/Interceptar/Modificar Parâmetros HTTP\n' +
                          '- CAPEC-66: SQL Injection\n' +
                          '- CAPEC-212: Exploração de Autenticação'
                }
            ]
        };
    }

    async callAnthropic(data, apiKey) {
        try {
            console.log('Chamando API da Anthropic');
            
            // Aqui você implementaria a chamada real à API da Anthropic
            // Por enquanto, vamos simular a resposta
            return this.simulateAIResponse(data);
            
            /* Implementação real (comentada por enquanto)
            const response = await axios.post('https://api.anthropic.com/v1/messages', {
              model: 'claude-3-sonnet-20240229',
              max_tokens: 4000,
              messages: [
                {
                  role: 'user',
                  content: data.prompt
                }
              ]
            }, {
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
              }
            });
            
            return response.data;
            */
        } catch (error) {
            console.error('Erro ao chamar API da Anthropic:', error);
            throw error;
        }
    }

    async callOpenAI(data, apiKey) {
        try {
            console.log('Chamando API da OpenAI');
            
            // Aqui você implementaria a chamada real à API da OpenAI
            // Por enquanto, vamos simular a resposta
            return this.simulateAIResponse(data);
            
            /* Implementação real (comentada por enquanto)
            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
              model: 'gpt-4',
              max_tokens: 4000,
              messages: [
                {
                  role: 'user',
                  content: data.prompt
                }
              ]
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              }
            });
            
            return {
              content: [
                {
                  type: 'text',
                  text: response.data.choices[0].message.content
                }
              ]
            };
            */
        } catch (error) {
            console.error('Erro ao chamar API da OpenAI:', error);
            throw error;
        }
    }

    async callGemini(data, apiKey) {
        try {
            // Obter informações do componente corretamente
            const componentName = data.component.attributes?.label?.text || 'Processo';
            const componentType = data.component.type || 'tm.Process';
            const description = data.component.attributes?.description || 'Sem descrição';
            
            // Endpoint correto para Gemini API conforme o exemplo
            const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
            
            console.log('Analisando componente:', {
                nome: componentName,
                tipo: componentType,
                descricao: description
            });
            
            // Formatação EXATA conforme o exemplo do curl
            const requestBody = {
                contents: [{
                    parts: [{
                        text: `Analise o seguinte componente para potenciais ameaças de segurança usando a metodologia STRIDE:
                            
                            Componente: ${componentName}
                            Tipo: ${componentType}
                            Descrição: ${description}
                            
                            Forneça uma análise detalhada considerando:
                            1. Cada categoria STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
                            2. Para cada categoria, indique o nível de risco (Alto, Médio, Baixo) baseado nas informações disponíveis
                            3. Forneça sugestões específicas de mitigação para cada ameaça
                            4. Liste os CAPECs (Common Attack Pattern Enumeration and Classification) relacionados a cada ameaça
                            
                            Responda em formato estruturado para facilitar o processamento.`
                    }]
                }]
            };
            
            console.log('Enviando requisição para Gemini:', requestBody);
            
            try {
                const response = await axios.post(
                    `${endpoint}?key=${apiKey}`,
                    requestBody,
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                console.log('Resposta do Gemini:', response.data);
                
                if (response.data && response.data.candidates && response.data.candidates[0]) {
                    return {
                        content: [{
                            type: 'text',
                            text: response.data.candidates[0].content.parts[0].text
                        }]
                    };
                }
            } catch (apiError) {
                console.error('Erro ao chamar API do Gemini:', apiError);
                if (apiError.response) {
                    console.error('Detalhes do erro:', apiError.response.data);
                }
                // Continuar para a simulação
            }
            
            console.log('Usando simulação como fallback');
            return this.simulateAIResponse(data);
        } catch (error) {
            console.error('Erro geral na função callGemini:', error);
            return this.simulateAIResponse(data);
        }
    }

    _createRequestBody(prompt, providerConfig) {
        switch (this.aiProvider) {
            case 'openai':
                return {
                    model: providerConfig.model,
                    messages: [
                        { role: 'system', content: 'Você é um especialista em segurança da informação especializado em modelagem de ameaças.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: providerConfig.maxTokens,
                    temperature: 0.7
                };
            case 'anthropic':
                return {
                    model: providerConfig.model,
                    max_tokens: providerConfig.maxTokens,
                    messages: [
                        { role: 'user', content: prompt }
                    ]
                };
            case 'google':
                return {
                    contents: [
                        {
                            parts: [
                                { text: prompt }
                            ]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: providerConfig.maxTokens,
                        temperature: 0.7
                    }
                };
            default:
                throw new Error('Unsupported AI provider');
        }
    }

    _getAIEndpoint() {
        const providerConfig = AI_CONFIG.providers[this.aiProvider];
        return providerConfig ? providerConfig.endpoint : null;
    }
}

// Função principal de análise
export async function analyzeComponent(component, config = {}) {
    if (!component) {
        throw new Error('Componente não fornecido para análise');
    }

    try {
        const provider = config.provider || 'gemini';
        const apiKey = config.apiKey || '';

        console.log(`Usando provedor de IA: ${provider}`);

        if (provider === 'gemini') {
            return await callGemini(component, apiKey);
        } else {
            // Manter a simulação como fallback
            return simulateAIResponse(component);
        }
    } catch (error) {
        console.error('Erro durante a análise:', error);
        throw error;
    }
}

async function callGemini(component, apiKey) {
    try {
        // Obter informações do componente corretamente
        const componentName = component.attributes?.label?.text || 'Processo';
        const componentType = component.type || 'tm.Process';
        const description = component.attributes?.description || 'Sem descrição';
        
        // Endpoint correto para Gemini API conforme o exemplo
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        
        console.log('Analisando componente:', {
            nome: componentName,
            tipo: componentType,
            descricao: description
        });
        
        // Formatação EXATA conforme o exemplo do curl
        const requestBody = {
            contents: [{
                parts: [{
                    text: `Analise o seguinte componente para potenciais ameaças de segurança usando a metodologia STRIDE:
                        
                        Componente: ${componentName}
                        Tipo: ${componentType}
                        Descrição: ${description}
                        
                        Forneça uma análise detalhada considerando:
                        1. Cada categoria STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
                        2. Para cada categoria, indique o nível de risco (Alto, Médio, Baixo) baseado nas informações disponíveis
                        3. Forneça sugestões específicas de mitigação para cada ameaça
                        4. Liste os CAPECs (Common Attack Pattern Enumeration and Classification) relacionados a cada ameaça
                        
                        Responda em formato estruturado para facilitar o processamento.`
                }]
            }]
        };
        
        console.log('Enviando requisição para Gemini:', requestBody);
        
        try {
            const response = await axios.post(
                `${endpoint}?key=${apiKey}`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Resposta do Gemini:', response.data);
            
            if (response.data && response.data.candidates && response.data.candidates[0]) {
                return {
                    content: [{
                        type: 'text',
                        text: response.data.candidates[0].content.parts[0].text
                    }]
                };
            }
        } catch (apiError) {
            console.error('Erro ao chamar API do Gemini:', apiError);
            if (apiError.response) {
                console.error('Detalhes do erro:', apiError.response.data);
            }
            // Continuar para a simulação
        }
        
        console.log('Usando simulação como fallback');
        return simulateAIResponse(component);
    } catch (error) {
        console.error('Erro geral na função callGemini:', error);
        return simulateAIResponse(component);
    }
}

// Função para simulação melhorada
function simulateAIResponse(component) {
    // Extrair informações do componente corretamente
    const componentName = component.attributes?.label?.text || 'Processo';
    const componentType = component.type || 'tm.Process';
    const description = component.attributes?.description || 'Sem descrição';
    
    console.log('Simulando análise para:', {
        nome: componentName,
        tipo: componentType,
        descricao: description
    });
    
    // Lógica específica baseada no tipo de componente
    let spoofingRisco = 'Médio';
    let tamperingRisco = 'Médio';
    let dosRisco = 'Médio';
    
    // Personalizações baseadas no nome/tipo do componente
    if (componentName.includes('ALB') || 
        componentName.includes('Load Balancer') || 
        componentType.includes('Boundary')) {
        dosRisco = 'Alto';
    }
    
    return {
        content: [
            {
                type: 'text',
                text: `Análise de ameaças para o componente ${componentName} (${componentType}):
                
**Spoofing**: Este componente pode ser vulnerável a ataques de spoofing se não implementar autenticação adequada. (Risco: ${spoofingRisco})
Mitigação: Implementar autenticação forte, como OAuth 2.0 ou certificados SSL/TLS.

**Tampering**: Dados podem ser modificados durante a transmissão se não forem protegidos. (Risco: ${tamperingRisco})
Mitigação: Utilizar HTTPS para todas as comunicações e implementar assinaturas digitais.

**Repudiation**: Sem registro de auditoria adequado, ações podem ser negadas. (Risco: Médio)
Mitigação: Implementar logs detalhados e armazená-los de forma segura.

**Information Disclosure**: Informações sensíveis podem vazar se não forem criptografadas. (Risco: Alto)
Mitigação: Criptografar dados sensíveis e implementar controles de acesso adequados.

**Denial of Service**: O componente pode ser sobrecarregado por múltiplas requisições. (Risco: ${dosRisco})
Mitigação: Implementar rate limiting, escalabilidade automática e proteção contra DDoS.

**Elevation of Privilege**: Acesso não autorizado pode ocorrer se os controles de acesso forem fracos. (Risco: Médio)
Mitigação: Implementar o princípio do menor privilégio e validar todas as entradas.

CAPECs Relacionados:
- CAPEC-31: Acessar/Interceptar/Modificar Parâmetros HTTP
- CAPEC-66: SQL Injection
- CAPEC-212: Exploração de Autenticação`
            }
        ]
    };
} 