// ============================================
// CONFIGURACIÓN - Reemplaza con tus credenciales
// ============================================

const SUPABASE_CONFIG = {
  url: 'https://TU_PROYECTO.supabase.co',
  anonKey: 'TU_ANON_KEY_AQUI'
};

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// Configuración de la aplicación
const APP_CONFIG = {
  name: 'RED La Célula - Unidad 2',
  grade: '4° Grado',
  subject: 'Ciencias Naturales',
  objectives: [
    'Concepto de célula y sus funciones.',
    'Elementos fundamentales de una célula y sus funciones.',
    'Niveles de organización de los seres vivos.'
  ],
  passingScore: 70,
  maxAttempts: 3
};

export { supabase, APP_CONFIG, SUPABASE_CONFIG };
