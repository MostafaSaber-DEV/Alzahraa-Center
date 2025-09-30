-- RLS Policies for profiles table
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- RLS Policies for students table
CREATE POLICY "students_select_own" ON public.students
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "students_insert_own" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "students_update_own" ON public.students
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "students_delete_own" ON public.students
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for groups table
CREATE POLICY "groups_select_own" ON public.groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "groups_insert_own" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "groups_update_own" ON public.groups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "groups_delete_own" ON public.groups
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for subscriptions table
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_delete_own" ON public.subscriptions
  FOR DELETE USING (auth.uid() = user_id);
