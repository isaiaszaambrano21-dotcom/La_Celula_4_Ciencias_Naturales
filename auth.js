// ============================================
// SISTEMA DE AUTENTICACIÓN CON SUPABASE
// ============================================

import { supabase } from './config.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.onAuthChange = null;
    this.init();
  }

  async init() {
    // Verificar sesión existente
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.currentUser = session.user;
      await this.loadProfile();
    }

    // Escuchar cambios de autenticación
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.currentUser = session.user;
        this.loadProfile();
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
      }
      if (this.onAuthChange) this.onAuthChange(event, session);
    });
  }

  async register(fullName, email, password, school) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            school: school
          }
        }
      });

      if (error) throw error;

      // Actualizar perfil con datos adicionales
      if (data.user) {
        await supabase.from('profiles').update({
          full_name: fullName,
          school: school,
          grade: '4° Grado'
        }).eq('id', data.user.id);
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      this.currentUser = data.user;
      await this.loadProfile();
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async loadProfile() {
    if (!this.currentUser) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', this.currentUser.id)
      .single();

    if (error) return null;
    this.profile = data;
    return data;
  }

  async updateProfile(updates) {
    if (!this.currentUser) return null;
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', this.currentUser.id)
      .select()
      .single();

    if (error) return null;
    this.profile = data;
    return data;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getProfile() {
    return this.profile;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }
}

// Exportar instancia global
window.authManager = new AuthManager();
export default window.authManager;
