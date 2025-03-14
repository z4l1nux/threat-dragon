<template>
    <div>
        <b-row>
            <b-col md="2">
                <div ref="stencil_container"></div>
            </b-col>
            <b-col md="10">
                <b-row>
                    <b-col>
                        <h3 class="td-graph-title">{{ diagram.title }}</h3>
                    </b-col>
                    <b-col align="right">
                        <td-graph-buttons :graph="graph" @saved="saved" @closed="closed" />
                    </b-col>
                </b-row>
                <b-row>
                    <b-col style="display: flex;    width: 100vw; ">
                        <div
                            id="graph-container"
                            ref="graph_container"
                            style="height: 65vh; width: 100%; flex: 1; "
                        ></div>
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
        <td-graph-meta 
            @threatSelected="threatSelected" 
            @threatSuggest="threatSuggest" 
            @aiAnalysis="handleAIAnalysis"
        />

        <div>
            <td-keyboard-shortcuts />
            <td-threat-edit-dialog ref="threatEditDialog" />
            <td-threat-suggest-dialog ref="threatSuggestDialog" />
            <AIAnalysis ref="aiAnalysis" @apply-threats="handleApplyThreats" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.td-graph-title {
    margin-right: 15px;
}
</style>

<script>
import { mapState } from 'vuex';

import TdGraphButtons from '@/components/GraphButtons.vue';
import TdGraphMeta from '@/components/GraphMeta.vue';
import TdKeyboardShortcuts from '@/components/KeyboardShortcuts.vue';
import TdThreatEditDialog from '@/components/ThreatEditDialog.vue';
import TdThreatSuggestDialog from './ThreatSuggestDialog.vue';
import AIAnalysis from './AIAnalysis.vue';

import { getProviderType } from '@/service/provider/providers.js';
import diagramService from '@/service/migration/diagram.js';
import stencil from '@/service/x6/stencil.js';
import tmActions from '@/store/actions/threatmodel.js';
import { logEvent } from '@/utils/debug';
import { debug } from '@/service/debug';

export default {
    name: 'TdGraph',
    components: {
        TdGraphButtons,
        TdGraphMeta,
        TdKeyboardShortcuts,
        TdThreatEditDialog,
        TdThreatSuggestDialog,
        AIAnalysis
    },
    computed: mapState({
        diagram: (state) => state.threatmodel.selectedDiagram,
        providerType: (state) => getProviderType(state.provider.selected)
    }),
    data() {
        return {
            graph: null
        };
    },
    async mounted() {
        this.init();
    },
    methods: {
        init() {
            this.graph = diagramService.edit(this.$refs.graph_container, this.diagram);
            stencil.get(this.graph, this.$refs.stencil_container);
            this.$store.dispatch(tmActions.notModified);
            this.graph.getPlugin('history').on('change', () => {
                const updated = Object.assign({}, this.diagram);
                updated.cells = this.graph.toJSON().cells;
                this.$store.dispatch(tmActions.diagramModified, updated);
            });
        },
        threatSelected(threatId,state) {
            this.$refs.threatEditDialog.editThreat(threatId,state);
        },
        threatSuggest(type){
            this.$refs.threatSuggestDialog.showModal(type);
        },
        saved() {
            console.debug('Save diagram');
            const updated = Object.assign({}, this.diagram);
            updated.cells = this.graph.toJSON().cells;
            this.$store.dispatch(tmActions.diagramSaved, updated);
            this.$store.dispatch(tmActions.saveModel);
        },
        async closed() {
            if (!this.$store.getters.modelChanged || await this.getConfirmModal()) {
                await this.$store.dispatch(tmActions.diagramClosed);
                this.$router.push({ name: `${this.providerType}ThreatModel`, params: this.$route.params });
            }
        },
        getConfirmModal() {
            return this.$bvModal.msgBoxConfirm(this.$t('forms.discardMessage'), {
                title: this.$t('forms.discardTitle'),
                okVariant: 'danger',
                okTitle: this.$t('forms.ok'),
                cancelTitle: this.$t('forms.cancel'),
                hideHeaderClose: true,
                centered: true
            });
        },
        handleAIAnalysis(component) {
            console.log('Botão de análise IA clicado:', component);
            if (this.$refs.aiAnalysis) {
                this.$refs.aiAnalysis.showModal(component);
            } else {
                console.error('Referência para aiAnalysis não encontrada');
            }
        },
        handleApplyThreats({ component, threats }) {
            console.log('Aplicando ameaças ao componente:', component);
            console.log('Ameaças a aplicar:', threats);
            
            try {
                // Apresentar um guia com todas as ameaças
                let guiaDetalhado = '';
                
                threats.forEach((threat, index) => {
                    guiaDetalhado += `## Ameaça ${index + 1}: ${threat.title} (${threat.severity})\n\n`;
                    guiaDetalhado += `- **Tipo:** ${threat.strideType}\n`;
                    guiaDetalhado += `- **CAPECs:** ${threat.capecs}\n\n`;
                    guiaDetalhado += `- **Descrição:** ${threat.description.split('\n')[0]}\n\n`;
                    guiaDetalhado += `- **Mitigação:** ${threat.mitigation.split('\n')[0]}\n\n`;
                    guiaDetalhado += `---\n\n`;
                });
                
                // Mostrar o guia completo
                this.$bvModal.msgBoxOk(
                    `# Guia para Adicionar Ameaças\n\nSiga estes passos para cada ameaça:\n1. Clique em "+ New Threat by Type"\n2. Preencha os campos com os dados abaixo\n3. Repita para todas as ameaças\n\n${guiaDetalhado}`,
                    {
                        title: 'Guia Detalhado de Ameaças',
                        size: 'lg',
                        buttonSize: 'sm',
                        okVariant: 'success',
                        headerClass: 'p-2 bg-info text-white',
                        footerClass: 'p-2',
                        centered: true
                    }
                );
                
                // Salvar as ameaças no localStorage para acesso futuro
                localStorage.setItem('threatAnalysisResults', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    componentId: component.id,
                    componentName: component.attributes?.label?.text || 'Componente',
                    threats: threats
                }));
            } catch (error) {
                console.error('Erro ao processar ameaças:', error);
                
                this.$bvToast.toast(`Erro ao processar ameaças: ${error.message}`, {
                    title: 'Erro',
                    variant: 'danger',
                    solid: true
                });
            }
        },
        handleApplyThreat({ component, threat }) {
            console.log('Aplicando ameaça específica ao componente:', component);
            
            try {
                // Acessar o modelo de ameaças
                const threatModel = this.$store.state.threatmodel.model;
                let currentDiagram = null;

                // Verificar se o modelo de ameaças e o diagrama estão disponíveis
                if (threatModel && threatModel.detail && threatModel.detail.diagrams) {
                    currentDiagram = threatModel.detail.diagrams.find(d => d.id === this.$store.state.threatmodel.diagram.id);
                }

                if (!currentDiagram) {
                    throw new Error('Diagrama atual não encontrado');
                }

                // Garantir que o diagrama tenha uma lista de ameaças
                if (!currentDiagram.threats) {
                    currentDiagram.threats = [];
                }

                // Criar nova ameaça
                const newThreat = {
                    id: `T${Date.now()}${Math.floor(Math.random() * 10000)}`,
                    title: threat.title || threat.strideType,
                    status: 'Open',
                    severity: threat.severity,
                    type: threat.strideType,
                    description: threat.description,
                    mitigation: threat.mitigation,
                    sourceRef: component.id,
                    modelType: 'STRIDE'
                };

                // Adicionar a nova ameaça ao diagrama
                currentDiagram.threats.push(newThreat);
                console.log('Ameaça adicionada ao diagrama:', newThreat);

                // Atualizar o modelo de ameaças no store
                this.$store.dispatch('threatmodel/update', threatModel).then(() => {
                    console.log('Modelo de ameaças atualizado com sucesso');
                    this.$bvToast.toast(`Ameaça "${threat.title}" aplicada com sucesso!`, {
                        title: 'Ameaça Aplicada',
                        variant: 'success',
                        solid: true
                    });
                }).catch(err => {
                    console.error('Erro ao atualizar modelo:', err);
                    this.$bvToast.toast(`Erro ao aplicar ameaça: ${err.message}`, {
                        title: 'Erro',
                        variant: 'danger',
                        solid: true
                    });
                });

                // Atualizar a UI
                this.$root.$emit('threatmodel-updated');
                
            } catch (error) {
                console.error('Erro ao aplicar ameaça:', error);
                this.$bvToast.toast(`Erro ao aplicar ameaça: ${error.message}`, {
                    title: 'Erro',
                    variant: 'danger',
                    solid: true
                });
            }
        },
        // Método para mostrar instruções manuais como fallback
        showThreatInstructions(threat, component) {
            // Copiar detalhes da ameaça para a área de transferência
            const threatDetails = `
            Título: ${threat.title}
            Tipo: ${threat.strideType}
            Severidade: ${threat.severity}
            
            Descrição:
            ${threat.description}
            
            Mitigação:
            ${threat.mitigation}
            
            CAPECs: ${threat.capecs}
            `;
            
            // Copiar para a área de transferência
            navigator.clipboard.writeText(threatDetails).then(() => {
                console.log('Detalhes da ameaça copiados para a área de transferência');
            }).catch(err => {
                console.error('Erro ao copiar para área de transferência:', err);
            });
            
            // Exibir modal com instruções
            this.$bvModal.msgBoxOk(
                `# Instruções para Adicionar Manualmente\n\n` +
                `Não foi possível adicionar a ameaça automaticamente, mas os detalhes foram copiados para sua área de transferência.\n\n` +
                `1. Clique no botão "+ New Threat by Type"\n` +
                `2. Selecione o tipo "${threat.strideType}"\n` +
                `3. Cole os detalhes copiados nos campos apropriados\n` +
                `4. Complete o formulário e salve a ameaça`,
                {
                    title: 'Adicionar Ameaça Manualmente',
                    size: 'lg',
                    buttonSize: 'sm',
                    okVariant: 'primary',
                    headerClass: 'p-2 bg-warning text-dark',
                    footerClass: 'p-2',
                    centered: true
                }
            ).then(() => {
                // Clicar no botão de nova ameaça
                const newThreatButton = document.querySelector('a.new-threat-by-type');
                if (newThreatButton) {
                    newThreatButton.click();
                }
            });
        },
        highestThreatLevel(threats) {
            if (!threats || threats.length === 0) return 'none';
            
            if (threats.some(t => t.severity === 'High')) return 'high';
            if (threats.some(t => t.severity === 'Medium')) return 'medium';
            return 'low';
        },
        getSeverityScore(severity) {
            switch(severity?.toLowerCase()) {
                case 'high': return 3;
                case 'medium': return 2;
                case 'low': return 1;
                default: return 2;
            }
        }
    },
    destroyed() {
        diagramService.dispose(this.graph);
    }
};
</script>