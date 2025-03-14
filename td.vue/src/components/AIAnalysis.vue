<template>
  <div>
    <!-- Modal de Análise de IA -->
    <b-modal ref="aiModal" size="lg" hide-footer :title="$t('threatmodel.analyzeWithAI')">
      <template #modal-title>
        <h5 class="modal-title">{{ $t('threatmodel.analyzeWithAI') }}</h5>
        <small v-if="selectedComponent && selectedComponent.attributes" class="text-muted">
          {{ selectedComponent.attributes.label?.text || 'Componente selecionado' }}
        </small>
      </template>
      
      <div v-if="analysisResults" class="analysis-results">
        <div v-if="generatedThreats.length > 0">
          <div class="mb-4">
            <h5>{{ $t('threats.title') }}</h5>
            <div v-for="(threat, index) in generatedThreats" :key="index" class="threat-card">
              <b-card>
                <b-card-title class="threat-title">
                  {{ threat.title }}
                  <b-badge variant="info" class="float-right">{{ threat.type }}</b-badge>
                </b-card-title>
                <b-card-text>
                  <div class="threat-description mb-2">{{ threat.description }}</div>
                  <div v-if="threat.mitigation" class="mb-2">
                    <strong>{{ $t('threats.properties.mitigation') }}:</strong>
                    <div class="threat-description">{{ threat.mitigation }}</div>
                  </div>
                  <div v-if="threat.capecs" class="mb-2">
                    <strong>CAPECs:</strong>
                    <div>
                      <b-badge 
                        v-for="capec in threat.capecs.split(',')" 
                        :key="capec"
                        variant="secondary"
                        class="capec-badge"
                      >
                        {{ capec.trim() }}
                      </b-badge>
                    </div>
                  </div>
                  <b-button 
                    @click="applyThreat(threat)"
                    variant="danger"
                    size="sm"
                    class="mt-2"
                  >
                    {{ $t('threatmodel.ai.applyThreat') }}
                  </b-button>
                </b-card-text>
              </b-card>
            </div>
          </div>
          
          <div class="text-center mt-4">
            <b-button 
              @click="applyAllThreats"
              variant="danger"
              class="mr-2"
            >
              <i class="fa fa-check-circle mr-2"></i> {{ $t('threatmodel.ai.applyAllThreats') }}
            </b-button>
            <b-button variant="secondary" @click="$refs.aiModal.hide()">
              {{ $t('forms.close') }}
            </b-button>
          </div>
        </div>
        <div v-else class="text-center my-4">
          <p class="alert alert-warning">
            {{ $t('threatmodel.ai.noThreats') }}
          </p>
          <button class="btn btn-secondary" @click="$refs.aiModal.hide()">{{ $t('forms.close') }}</button>
        </div>
      </div>
      
      <div v-else-if="isAnalyzing" class="text-center">
        <b-spinner class="loading-spinner" :label="$t('threatmodel.ai.analyzing')"></b-spinner>
        <p>{{ $t('threatmodel.ai.analyzing') }}</p>
      </div>
      
      <div v-else-if="!selectedProvider || !hasApiKey" class="text-center my-4">
        <p class="alert alert-info">
          {{ $t('threatmodel.ai.configureProvider') }}
        </p>
        <b-button @click="showProviderMenu" variant="danger">
          {{ $t('threatmodel.ai.configureButton') }}
        </b-button>
      </div>
      
      <div v-else class="text-center my-4">
        <b-button 
          @click="startAnalysis" 
          variant="danger" 
          :disabled="isAnalyzing"
        >
          {{ $t('threatmodel.analyzeWithAI') }}
        </b-button>
        <p class="mt-2">{{ $t('threatmodel.ai.analyzing') }}</p>
      </div>
    </b-modal>

    <!-- Menu de Provedores de IA -->
    <AIProviderMenu ref="providerMenu" @provider-selected="onProviderSelected" @api-key-saved="onApiKeySaved" />
  </div>
</template>

<script>
import { threatAnalyzer } from '@/service/threatAnalyzer';
import AIProviderMenu from './AIProviderMenu.vue';
import { createNewTypedThreat } from '@/service/threats/index.js';
import { CELL_DATA_UPDATED } from '@/store/actions/cell.js';
import tmActions from '@/store/actions/threatmodel.js';
import dataChanged from '@/service/x6/graph/data-changed.js';

export default {
  name: 'AIAnalysis',
  components: {
    AIProviderMenu
  },
  data() {
    return {
      selectedComponent: null,
      isAnalyzing: false,
      analysisResults: null,
      generatedThreats: [],
      capecList: [],
      selectedProvider: null,
      hasApiKey: false
    };
  },
  computed: {
    uniqueCapecs() {
      const allCapecs = [];
      this.generatedThreats.forEach(threat => {
        if (threat.capecs) {
          const capecs = threat.capecs.split(',').map(c => c.trim());
          allCapecs.push(...capecs);
        }
      });
      return [...new Set(allCapecs)];
    }
  },
  methods: {
    showModal(component) {
      console.log('Abrindo modal para componente:', component);
      this.selectedComponent = JSON.parse(JSON.stringify(component)); // Criar uma cópia profunda
      this.analysisResults = null;
      this.isAnalyzing = false;
      this.generatedThreats = [];
      this.capecList = [];
      
      this.checkProviderConfig();
      
      this.$refs.aiModal.show();
    },
    
    showProviderMenu() {
      this.$refs.providerMenu.showModal();
    },
    
    checkProviderConfig() {
      const provider = sessionStorage.getItem('selectedAIProvider');
      const hasKey = sessionStorage.getItem(`${provider}ApiKey`);
      
      this.selectedProvider = provider;
      this.hasApiKey = !!hasKey;
    },
    
    onProviderSelected(provider) {
      this.selectedProvider = provider;
      sessionStorage.setItem('selectedAIProvider', provider);
    },
    
    onApiKeySaved() {
      this.hasApiKey = true;
    },
    
    async startAnalysis() {
      if (!this.selectedComponent) {
        this.$bvToast.toast(this.$t('threatmodel.ai.noThreats'), {
          title: this.$t('forms.error'),
          variant: 'danger',
          solid: true
        });
        return;
      }

      // Mostrar o menu de configuração e aguardar a resposta
      await new Promise(resolve => {
        this.$refs.providerMenu.$once('api-key-saved', () => {
          resolve();
        });
        this.showProviderMenu();
      });
      
      this.isAnalyzing = true;
      
      try {
        const provider = sessionStorage.getItem('selectedAIProvider');
        const apiKey = sessionStorage.getItem(`${provider}ApiKey`);
        
        if (!provider || !apiKey) {
          throw new Error('Configuração de IA incompleta');
        }

        const config = {
          provider: provider,
          apiKey: apiKey
        };
        
        const analysis = await threatAnalyzer.analyzeComponent(this.selectedComponent, config);
        console.log('Resultado da análise:', analysis);
        
        const threats = threatAnalyzer.generateThreatDescriptions(analysis);
        console.log('Ameaças geradas:', threats);
        
        this.analysisResults = analysis;
        this.generatedThreats = threats;
        
        const allCapecs = [];
        threats.forEach(threat => {
          if (threat.capecs) {
            const capecs = threat.capecs.split(',').map(c => c.trim());
            allCapecs.push(...capecs);
          }
        });
        this.capecList = [...new Set(allCapecs)];
        
      } catch (error) {
        console.error('Erro durante a análise:', error);
        this.$bvToast.toast(this.$t('threatmodel.ai.error'), {
          title: this.$t('forms.error'),
          variant: 'danger',
          solid: true
        });
      } finally {
        this.isAnalyzing = false;
      }
    },
    
    applyThreat(threat) {
      console.log('Aplicando ameaça específica:', threat);
      
      try {
        // Extrair o tipo correto da ameaça
        const strideType = threat.title.split(':')[0].trim();
        
        // Criar nova ameaça com dados simplificados
        const threatData = {
          title: threat.title || '',
          description: threat.description || '',
          type: strideType, // Usar o tipo específico do STRIDE
          mitigation: threat.mitigation || '',
          severity: threat.severity || 'Medium',
          status: 'Open',
          modelType: 'STRIDE'
        };
        
        // Criar nova ameaça usando o factory
        const newThreat = createNewTypedThreat(
          threatData.modelType,
          this.selectedComponent.type,
          this.selectedComponent.threats ? this.selectedComponent.threats.length + 1 : 1
        );
        
        // Atualizar a ameaça com os dados
        Object.assign(newThreat, threatData);
        
        // Inicializar array de ameaças se necessário
        if (!this.selectedComponent.threats) {
          this.selectedComponent.threats = [];
        }
        
        // Adicionar a nova ameaça
        this.selectedComponent.threats.push(newThreat);
        this.selectedComponent.hasOpenThreats = true;
        
        // Criar uma cópia simplificada do componente para atualização
        const componentUpdate = {
          id: this.selectedComponent.id,
          threats: [...this.selectedComponent.threats],
          hasOpenThreats: true,
          type: this.selectedComponent.type,
          diagramType: this.selectedComponent.diagramType,
          data: this.selectedComponent.data || {},
          attributes: this.selectedComponent.attributes || {}
        };
        
        // Atualizar o estado
        this.$store.dispatch(CELL_DATA_UPDATED, componentUpdate);
        this.$store.dispatch(tmActions.modified);
        
        // Atualizar estilos apenas se o componente tiver o método getData
        if (typeof this.selectedComponent.getData === 'function') {
          dataChanged.updateStyleAttrs(this.selectedComponent);
        }
        
        // Feedback visual
        this.$bvToast.toast(this.$t('threatmodel.ai.appliedSuccess', { title: threat.title }), {
          title: this.$t('forms.success'),
          variant: 'success',
          solid: true
        });
        
      } catch (error) {
        console.error('Erro ao aplicar ameaça:', error);
        this.$bvToast.toast(this.$t('threatmodel.ai.error'), {
          title: this.$t('forms.error'),
          variant: 'danger',
          solid: true
        });
      }
    },
    
    async applyAllThreats() {
      console.log('Aplicando todas as ameaças');
      
      try {
        // Inicializar array de ameaças se necessário
        if (!this.selectedComponent.threats) {
          this.selectedComponent.threats = [];
        }
        
        // Aplicar cada ameaça
        for (const threat of this.generatedThreats) {
          // Extrair o tipo correto da ameaça
          const strideType = threat.title.split(':')[0].trim();
          
          const threatData = {
            title: threat.title || '',
            description: threat.description || '',
            type: strideType, // Usar o tipo específico do STRIDE
            mitigation: threat.mitigation || '',
            severity: threat.severity || 'Medium',
            status: 'Open',
            modelType: 'STRIDE'
          };
          
          const newThreat = createNewTypedThreat(
            threatData.modelType,
            this.selectedComponent.type,
            this.selectedComponent.threats.length + 1
          );
          
          Object.assign(newThreat, threatData);
          this.selectedComponent.threats.push(newThreat);
        }
        
        this.selectedComponent.hasOpenThreats = true;
        
        // Criar uma cópia simplificada do componente para atualização
        const componentUpdate = {
          id: this.selectedComponent.id,
          threats: [...this.selectedComponent.threats],
          hasOpenThreats: true,
          type: this.selectedComponent.type,
          diagramType: this.selectedComponent.diagramType,
          data: this.selectedComponent.data || {},
          attributes: this.selectedComponent.attributes || {}
        };
        
        // Atualizar o estado
        this.$store.dispatch(CELL_DATA_UPDATED, componentUpdate);
        this.$store.dispatch(tmActions.modified);
        
        // Atualizar estilos apenas se o componente tiver o método getData
        if (typeof this.selectedComponent.getData === 'function') {
          dataChanged.updateStyleAttrs(this.selectedComponent);
        }
        
        // Feedback visual
        this.$bvToast.toast(this.$t('threatmodel.ai.appliedAllSuccess', { count: this.generatedThreats.length }), {
          title: this.$t('forms.success'),
          variant: 'success',
          solid: true
        });
        
        // Fechar o modal
        this.$refs.aiModal.hide();
        
      } catch (error) {
        console.error('Erro ao aplicar todas as ameaças:', error);
        this.$bvToast.toast(this.$t('threatmodel.ai.error'), {
          title: this.$t('forms.error'),
          variant: 'danger',
          solid: true
        });
      }
    },
    
    copyThreatToClipboard(threat) {
      const threatData = `
      Título: ${threat.title}
      Tipo: ${threat.strideType}
      Severidade: ${threat.severity}
      
      Descrição:
      ${threat.description}
      
      Mitigação:
      ${threat.mitigation}
      
      CAPECs: ${threat.capecs}
      `;
      
      // Cria elemento temporário para copiar
      const el = document.createElement('textarea');
      el.value = threatData;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      
      this.$bvToast.toast('Detalhes da ameaça copiados para a área de transferência!', {
        title: 'Copiado',
        variant: 'success',
        solid: true,
        autoHideDelay: 2000
      });
    },
    
    getRiskClass(severity) {
      switch(severity.toLowerCase()) {
        case 'high': return 'risk-high';
        case 'medium': return 'risk-medium';
        case 'low': return 'risk-low';
        default: return 'risk-medium';
      }
    },
    
    saveThreatLocally(threat) {
      try {
        // Obter ameaças salvas anteriormente
        let savedThreats = JSON.parse(localStorage.getItem('savedThreats') || '[]');
        
        // Adicionar a nova ameaça
        savedThreats.push({
          ...threat,
          componentId: this.selectedComponent.id,
          componentName: this.selectedComponent.attributes?.label?.text || 'Componente',
          timestamp: new Date().toISOString()
        });
        
        // Salvar de volta ao localStorage
        localStorage.setItem('savedThreats', JSON.stringify(savedThreats));
        
        console.log('Ameaça salva localmente');
        
        this.$bvToast.toast('Ameaça salva localmente como backup. Você pode recuperá-la se necessário.', {
          title: 'Backup Criado',
          variant: 'info',
          solid: true,
          autoHideDelay: 3000
        });
      } catch (error) {
        console.error('Erro ao salvar ameaça localmente:', error);
      }
    }
  }
};
</script>

<style scoped>
.analysis-results {
  margin-top: 20px;
}

.threat-list {
  margin-top: 15px;
}

.threat-item {
  padding: 12px;
  border-left: 4px solid #6c757d;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.threat-header {
  margin-bottom: 8px;
}

.threat-type {
  font-size: 1.1em;
  color: #495057;
}

.threat-risk {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  font-weight: bold;
}

.risk-high {
  background-color: #dc3545;
  color: white;
}

.risk-medium {
  background-color: #ffc107;
  color: #212529;
}

.risk-low {
  background-color: #28a745;
  color: white;
}

.capec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.capec-item {
  background-color: #e9ecef;
  padding: 6px 10px;
  border-radius: 4px;
  color: #495057;
  font-family: monospace;
  font-size: 0.9em;
}

.threat-actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.threat-card {
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.threat-card .card {
  border: none;
}

.threat-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.threat-description {
  white-space: pre-wrap;
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 1rem;
}

.capec-badge {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #6c757d;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-size: 0.85rem;
}

.loading-spinner {
  margin: 2rem auto;
  width: 3rem;
  height: 3rem;
}

.alert {
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.alert-info {
  background-color: #cce5ff;
  border-color: #b8daff;
  color: #004085;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffeeba;
  color: #856404;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0069d9;
  border-color: #0062cc;
}

.btn-danger {
  background-color: #ed1c24;
  border-color: #ed1c24;
}

.btn-danger:hover {
  background-color: #d31920;
  border-color: #c8181e;
}

.modal-title {
  color: #333;
  font-weight: 600;
}
</style> 