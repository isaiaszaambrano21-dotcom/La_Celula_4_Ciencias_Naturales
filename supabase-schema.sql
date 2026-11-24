-- ============================================
-- BASE DE DATOS RED "LA CÉLULA" - 4° GRADO
-- ============================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  grade TEXT DEFAULT '4° Grado',
  school TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de actividades del RED
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'drag_drop', 'puzzle', 'memory', 'hotspot', 'word_search'
  max_points INTEGER DEFAULT 100,
  unit TEXT DEFAULT 'Unidad 2 - La Célula',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de resultados/evaluaciones
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  attempts INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB,
  feedback TEXT
);

-- Tabla de progreso del estudiante
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  best_score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  UNIQUE(user_id, activity_id)
);

-- Tabla de badges/logros
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirement TEXT -- JSON con condiciones
);

-- Tabla de badges obtenidos
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Tabla de leaderboard
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  total_score INTEGER DEFAULT 0,
  activities_completed INTEGER DEFAULT 0,
  rank_position INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DATOS INICIALES: Actividades
-- ============================================
INSERT INTO activities (title, description, type, max_points) VALUES
('Identifica el organismo más pequeño', 'Observa las imágenes y arrastra el organismo más pequeño al recuadro correcto.', 'drag_drop', 100),
('Partes de la célula', 'Arrastra cada organelo a su lugar correcto en el diagrama celular.', 'drag_drop', 100),
('Rompecabezas celular', 'Arma el rompecabezas de una célula animal.', 'puzzle', 100),
('Memoria de organelos', 'Encuentra las parejas de organelos y sus funciones.', 'memory', 100),
('Explorador de la célula', 'Haz clic en las partes interactivas de la célula para descubrir sus funciones.', 'hotspot', 100),
('Sopa de letras celular', 'Encuentra los términos relacionados con la célula.', 'word_search', 100);

-- ============================================
-- DATOS INICIALES: Badges
-- ============================================
INSERT INTO badges (name, description, icon, requirement) VALUES
('Explorador Celular', 'Completa tu primera actividad', '🔬', '{"activity_count": 1}'),
('Científico Junior', 'Completa 3 actividades con más de 70%', '🧪', '{"activities_70plus": 3}'),
('Maestro de la Célula', 'Completa todas las actividades con más de 80%', '🏆', '{"all_activities_80plus": true}'),
('Sin Errores', 'Completa una actividad con 100%', '⭐', '{"perfect_score": true}'),
('Velocista', 'Completa una actividad en menos de 2 minutos', '⚡', '{"under_2min": true}');

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Función para actualizar leaderboard
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO leaderboard (user_id, total_score, activities_completed, updated_at)
  SELECT 
    NEW.user_id,
    COALESCE(SUM(r.score), 0),
    COUNT(DISTINCT r.activity_id),
    NOW()
  FROM results r
  WHERE r.user_id = NEW.user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_score = EXCLUDED.total_score,
    activities_completed = EXCLUDED.activities_completed,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_result_inserted
  AFTER INSERT ON results
  FOR EACH ROW EXECUTE FUNCTION update_leaderboard();

-- Habilitar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own results" ON results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own results" ON results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view leaderboard" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can view badges" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Users can view their badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON user_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
