-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================

ALTER TABLE contributors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_votes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_log        ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- contributors
-- Anyone can view profiles; only the owner can update their own
-- ============================================================

CREATE POLICY "contributors_select_public"
  ON contributors FOR SELECT
  USING (true);

CREATE POLICY "contributors_update_own"
  ON contributors FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- requirements
-- Public: approved, submitted, in_review
-- Private: contributors can see and edit their own drafts
-- Admins: controlled via service role or separate admin table
-- ============================================================

CREATE POLICY "requirements_select"
  ON requirements FOR SELECT
  USING (
    status IN ('approved', 'in_review', 'submitted')
    OR contributor_id = auth.uid()
  );

CREATE POLICY "requirements_insert"
  ON requirements FOR INSERT
  WITH CHECK (contributor_id = auth.uid());

-- Contributors may only update their own requirements while still in draft
CREATE POLICY "requirements_update_own_draft"
  ON requirements FOR UPDATE
  USING (contributor_id = auth.uid() AND status = 'draft')
  WITH CHECK (contributor_id = auth.uid() AND status = 'draft');

-- ============================================================
-- requirement_votes
-- Anyone can read votes; authenticated users can cast / retract their own
-- ============================================================

CREATE POLICY "votes_select_public"
  ON requirement_votes FOR SELECT
  USING (true);

CREATE POLICY "votes_insert_authenticated"
  ON requirement_votes FOR INSERT
  WITH CHECK (contributor_id = auth.uid());

CREATE POLICY "votes_delete_own"
  ON requirement_votes FOR DELETE
  USING (contributor_id = auth.uid());

-- ============================================================
-- requirement_comments
-- Visible on public requirements; authenticated users can comment
-- Contributors can delete only their own comments
-- ============================================================

CREATE POLICY "comments_select"
  ON requirement_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requirements r
      WHERE r.id = requirement_id
        AND (
          r.status IN ('approved', 'in_review', 'submitted')
          OR r.contributor_id = auth.uid()
        )
    )
  );

CREATE POLICY "comments_insert_authenticated"
  ON requirement_comments FOR INSERT
  WITH CHECK (
    contributor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM requirements r
      WHERE r.id = requirement_id
        AND r.status IN ('approved', 'in_review', 'submitted')
    )
  );

CREATE POLICY "comments_delete_own"
  ON requirement_comments FOR DELETE
  USING (contributor_id = auth.uid());

-- ============================================================
-- ai_usage_log
-- Contributors can view their own usage records only
-- Inserts happen via service role key from API routes (bypasses RLS)
-- ============================================================

CREATE POLICY "ai_log_select_own"
  ON ai_usage_log FOR SELECT
  USING (contributor_id = auth.uid());
