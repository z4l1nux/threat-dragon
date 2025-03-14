<template>
  <b-modal ref="apiKeyModal" hide-footer title="Insira a Chave de API do Gemini">
    <b-form @submit.prevent="saveApiKey">
      <b-form-group label="Chave de API" label-for="api-key-input">
        <b-form-input
          id="api-key-input"
          v-model="apiKey"
          type="password"
          placeholder="Digite sua chave de API aqui"
          required
        ></b-form-input>
        <small class="text-muted">
          A chave será armazenada apenas durante esta sessão do navegador.
        </small>
      </b-form-group>
      <div class="mt-3">
        <b-button type="submit" variant="primary" class="mr-2">Salvar</b-button>
        <b-button variant="secondary" @click="hideModal">Cancelar</b-button>
      </div>
    </b-form>
  </b-modal>
</template>

<script>
export default {
  name: 'GeminiApiKeyInput',
  data() {
    return {
      apiKey: ''
    };
  },
  methods: {
    showModal() {
      // Carregar chave existente, se houver
      this.apiKey = sessionStorage.getItem('geminiApiKey') || '';
      this.$refs.apiKeyModal.show();
    },
    hideModal() {
      this.$refs.apiKeyModal.hide();
    },
    saveApiKey() {
      if (this.apiKey) {
        // Armazenar a chave de API na sessão
        sessionStorage.setItem('geminiApiKey', this.apiKey);
        
        this.$bvToast.toast('Chave de API salva com sucesso! (válida até fechar o navegador)', {
          title: 'Sucesso',
          variant: 'success',
          solid: true
        });
        
        // Emitir evento de chave salva
        this.$emit('api-key-saved');
        
        this.hideModal();
      }
    }
  }
};
</script>

<style scoped>
#api-key-input {
  margin-bottom: 8px;
}
</style> 