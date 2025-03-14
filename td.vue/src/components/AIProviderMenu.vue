<template>
  <div>
    <b-modal ref="providerMenuModal" hide-footer title="Escolha o Provedor de IA">
      <b-form-group label="Selecione o Provedor">
        <b-form-select v-model="selectedProvider" :options="providers"></b-form-select>
      </b-form-group>
      <div class="mt-3">
        <b-button @click="openApiKeyInput" variant="primary" class="mr-2">Inserir Chave de API</b-button>
        <b-button variant="secondary" @click="hideModal">Cancelar</b-button>
      </div>
    </b-modal>

    <GeminiApiKeyInput 
      ref="geminiApiKeyInput" 
      @api-key-saved="onApiKeySaved" 
    />
  </div>
</template>

<script>
import GeminiApiKeyInput from './GeminiApiKeyInput.vue';

export default {
  name: 'AIProviderMenu',
  components: {
    GeminiApiKeyInput
  },
  data() {
    return {
      selectedProvider: null,
      providers: [
        { value: 'gemini', text: 'Gemini' },
        { value: 'anthropic', text: 'Anthropic (Em breve)' },
        { value: 'openai', text: 'OpenAI (Em breve)' }
      ]
    };
  },
  methods: {
    showModal() {
      // Carregar provedor selecionado anteriormente
      this.selectedProvider = sessionStorage.getItem('selectedAIProvider') || null;
      this.$refs.providerMenuModal.show();
    },
    hideModal() {
      this.$refs.providerMenuModal.hide();
    },
    openApiKeyInput() {
      if (!this.selectedProvider) {
        this.$bvToast.toast('Por favor, selecione um provedor primeiro.', {
          title: 'Aviso',
          variant: 'warning',
          solid: true
        });
        return;
      }

      if (this.selectedProvider === 'gemini') {
        this.$refs.geminiApiKeyInput.showModal();
      } else {
        this.$bvToast.toast('Este provedor ainda não está implementado.', {
          title: 'Aviso',
          variant: 'warning',
          solid: true
        });
      }
    },
    onApiKeySaved() {
      this.$emit('api-key-saved');
      this.$emit('provider-selected', this.selectedProvider);
      this.hideModal();
    }
  },
  watch: {
    selectedProvider(newValue) {
      if (newValue) {
        this.$emit('provider-selected', newValue);
      }
    }
  }
};
</script>

<style scoped>
.provider-select {
  margin-bottom: 15px;
}
</style> 