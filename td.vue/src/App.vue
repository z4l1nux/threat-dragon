<template>
  <div>
    <td-navbar />
    <b-container fluid id="app">
      <b-overlay style="max-height: 100vh;" :show="isLoading" spinner-variant="primary">
        <router-view />
      </b-overlay>
    </b-container>
  </div>
</template>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Ubuntu:400,700");

#app {
  font-size: 20px;
  line-height: 1.42857143;
  margin-top: ($header-height + 15px);
}
</style>

<script>
import { mapState } from 'vuex';

import { LOADER_FINISHED } from '@/store/actions/loader.js';
import TdNavbar from '@/components/Navbar.vue';

export default {
    name: 'TdApp',
    components: {
        TdNavbar
    },
    computed: mapState({
        isLoading: (state) => state.loader.loading
    }),
    mounted() {
        this.$store.dispatch(LOADER_FINISHED);
        
        // Usar MutationObserver em vez de DOMNodeInserted
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.id === 'threat-form' || 
                        (node.classList && node.classList.contains('threat-form'))) {
                        
                        // Verificar se há uma ameaça pendente
                        const pendingThreatJson = localStorage.getItem('pendingThreat');
                        if (pendingThreatJson) {
                            try {
                                const pendingThreat = JSON.parse(pendingThreatJson);
                                
                                // Pequeno atraso para garantir que o formulário foi renderizado
                                setTimeout(() => {
                                    // Tentar encontrar e preencher os campos
                                    const titleField = document.querySelector('input[name="title"]');
                                    const typeField = document.querySelector('select[name="type"]');
                                    const severityField = document.querySelector('select[name="severity"]');
                                    const descriptionField = document.querySelector('textarea[name="description"]');
                                    const mitigationField = document.querySelector('textarea[name="mitigation"]');
                                    
                                    // Preencher se encontrados
                                    if (titleField) titleField.value = pendingThreat.title;
                                    if (typeField) {
                                        typeField.value = pendingThreat.type;
                                        typeField.dispatchEvent(new Event('change', { bubbles: true }));
                                    }
                                    if (severityField) {
                                        severityField.value = pendingThreat.severity;
                                        severityField.dispatchEvent(new Event('change', { bubbles: true }));
                                    }
                                    if (descriptionField) descriptionField.value = pendingThreat.description;
                                    if (mitigationField) mitigationField.value = pendingThreat.mitigation;
                                    
                                    // Limpar depois de preencher
                                    localStorage.removeItem('pendingThreat');
                                    
                                    console.log('Formulário de ameaça preenchido automaticamente');
                                }, 500);
                            } catch (error) {
                                console.error('Erro ao preencher formulário:', error);
                            }
                        }
                    }
                });
            });
        });
        
        // Configurar o observer para monitorar mudanças no DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Limpar o observer quando o componente for destruído
        this.$once('hook:beforeDestroy', () => {
            observer.disconnect();
        });
    }
};
</script>
