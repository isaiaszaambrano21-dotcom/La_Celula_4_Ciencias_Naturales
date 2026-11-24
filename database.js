// ============================================
// OPERACIONES DE BASE DE DATOS
// ============================================

import { supabase } from './config.js';

class DatabaseManager {
  constructor() {}

  // ========== RESULTADOS ==========
  async saveResult(userId, activityId, score, maxScore, answers, feedback) {
    const percentage = ((score / maxScore) * 100).toFixed(2);
    const { data, error } = await supabase
      .from('results')
      .insert([{
        user_id: userId,
        activity_id: activityId,
        score,
        max_score: maxScore,
        percentage,
        answers: JSON.stringify(answers),
        feedback
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserResults(userId) {
    const { data, error } = await supabase
      .from('results')
      .select(`
        *,
        activities (title, type, max_points)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getActivityResults(activityId) {
    const { data, error } = await supabase
      .from('results')
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .eq('activity_id', activityId)
      .order('percentage', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ========== PROGRESO ==========
  async updateProgress(userId, activityId, status, score) {
    const { data, error } = await supabase
      .from('progress')
      .upsert([{
        user_id: userId,
        activity_id: activityId,
        status,
        best_score: Math.max(score || 0, 0),
        attempts: supabase.rpc('increment_attempts', { row_id: activityId }),
        last_attempt_at: new Date().toISOString()
      }], { onConflict: 'user_id,activity_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from('progress')
      .select(`
        *,
        activities (title, type, max_points)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  // ========== LEADERBOARD ==========
  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select(`
        *,
        profiles (full_name, avatar_url, level)
      `)
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // ========== BADGES ==========
  async checkAndAwardBadges(userId) {
    const results = await this.getUserResults(userId);
    const completedActivities = results.length;
    const perfectScores = results.filter(r => r.percentage >= 100).length;
    const highScores = results.filter(r => r.percentage >= 70).length;

    const badgesToAward = [];

    // Explorador Celular - 1 actividad completada
    if (completedActivities >= 1) {
      badgesToAward.push(1);
    }

    // Científico Junior - 3 actividades con 70%+
    if (highScores >= 3) {
      badgesToAward.push(2);
    }

    // Sin Errores - al menos una con 100%
    if (perfectScores >= 1) {
      badgesToAward.push(4);
    }

    // Award badges
    for (const badgeId of badgesToAward) {
      await supabase
        .from('user_badges')
        .insert([{ user_id: userId, badge_id: badgeId }])
        .select();
    }

    return badgesToAward;
  }

  async getUserBadges(userId) {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badges (name, description, icon)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  // ========== ESTADÍSTICAS ==========
  async getUserStats(userId) {
    const results = await this.getUserResults(userId);
    const progress = await this.getUserProgress(userId);
    const badges = await this.getUserBadges(userId);

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const avgPercentage = results.length > 0
      ? (results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / results.length).toFixed(1)
      : 0;

    return {
      totalActivities: results.length,
      totalScore,
      averagePercentage: avgPercentage,
      badgesEarned: badges.length,
      progress: progress
    };
  }

  // ========== ACTIVIDADES ==========
  async getAllActivities() {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('id');

    if (error) throw error;
    return data;
  }

  async getActivityById(id) {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}

window.dbManager = new DatabaseManager();
export default window.dbManager;
