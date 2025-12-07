import { Hume, HumeClient } from 'hume';

let humeClient = null;

// Create Hume AI client for empathic voice interface
export function createHumeClient(apiKey) {
  if (!humeClient && apiKey) {
    humeClient = new HumeClient({
      apiKey: apiKey,
    });
  }
  return humeClient;
}

// Initialize Hume EVI (Empathic Voice Interface) configuration
export async function initializeEVI(apiKey, configId) {
  const client = createHumeClient(apiKey);
  
  if (!client) {
    throw new Error('Hume client not initialized. API key required.');
  }

  return {
    client,
    configId: configId || 'default', // Use default config or custom one
  };
}

// Helper to get available voices
export async function getAvailableVoices(apiKey) {
  try {
    const client = createHumeClient(apiKey);
    // Hume will provide voice options through their API
    return await client.empathicVoice.getVoices();
  } catch (error) {
    console.error('Failed to fetch Hume voices:', error);
    return [];
  }
}

