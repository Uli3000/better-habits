
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎯',
  weekly_target INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Daily checks table
CREATE TABLE public.daily_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  mood TEXT,
  satisfaction INTEGER,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(goal_id, date)
);
ALTER TABLE public.daily_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own checks" ON public.daily_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own checks" ON public.daily_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own checks" ON public.daily_checks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own checks" ON public.daily_checks FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_daily_checks_updated_at BEFORE UPDATE ON public.daily_checks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Timer sessions table
CREATE TABLE public.timer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  duration INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.timer_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions" ON public.timer_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.timer_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.timer_sessions FOR DELETE USING (auth.uid() = user_id);

-- Motivation items table
CREATE TABLE public.motivation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('quote', 'image')),
  content TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.motivation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own motivation" ON public.motivation_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own motivation" ON public.motivation_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own motivation" ON public.motivation_items FOR DELETE USING (auth.uid() = user_id);
