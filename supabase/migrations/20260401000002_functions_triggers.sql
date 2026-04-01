-- ============================================================
-- handle_new_user
-- Auto-create a contributor row when a user signs up via Supabase Auth
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.contributors (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- handle_updated_at
-- Keep requirements.updated_at current on any row change
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_requirement_updated
  BEFORE UPDATE ON public.requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Vote count denormalization
-- Keeps requirements.upvotes / downvotes in sync without joins
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_vote_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.vote_type = 'up' THEN
    UPDATE public.requirements SET upvotes   = upvotes   + 1 WHERE id = NEW.requirement_id;
  ELSE
    UPDATE public.requirements SET downvotes = downvotes + 1 WHERE id = NEW.requirement_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_vote_inserted
  AFTER INSERT ON public.requirement_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vote_insert();

CREATE OR REPLACE FUNCTION public.handle_vote_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF OLD.vote_type = 'up' THEN
    UPDATE public.requirements SET upvotes   = GREATEST(upvotes   - 1, 0) WHERE id = OLD.requirement_id;
  ELSE
    UPDATE public.requirements SET downvotes = GREATEST(downvotes - 1, 0) WHERE id = OLD.requirement_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE TRIGGER on_vote_deleted
  AFTER DELETE ON public.requirement_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_vote_delete();

-- ============================================================
-- Comment count denormalization
-- Keeps requirements.comment_count in sync without joins
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_comment_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.requirements SET comment_count = comment_count + 1 WHERE id = NEW.requirement_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_comment_inserted
  AFTER INSERT ON public.requirement_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_insert();

CREATE OR REPLACE FUNCTION public.handle_comment_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.requirements SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.requirement_id;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE TRIGGER on_comment_deleted
  AFTER DELETE ON public.requirement_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_delete();

-- ============================================================
-- find_similar_requirements
-- pg_trgm similarity search used for pre-AI duplicate detection
-- Called with the AI-refined title before sending to Claude
-- ============================================================

CREATE OR REPLACE FUNCTION public.find_similar_requirements(
  search_title        text,
  similarity_threshold float DEFAULT 0.3,
  result_limit         integer DEFAULT 20
)
RETURNS TABLE (
  id            uuid,
  refined_title text,
  status        requirement_status,
  similarity    float
)
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = extensions, public
AS $$
  SELECT
    r.id,
    r.refined_title,
    r.status,
    similarity(r.refined_title, search_title) AS similarity
  FROM public.requirements r
  WHERE
    r.status NOT IN ('rejected')
    AND r.refined_title IS NOT NULL
    AND similarity(r.refined_title, search_title) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT result_limit;
$$;
