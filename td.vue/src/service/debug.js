// Serviço simples para facilitar o debug
export const debug = (component, method, data) => {
  console.log(`[${component}] ${method}:`, data);
}; 