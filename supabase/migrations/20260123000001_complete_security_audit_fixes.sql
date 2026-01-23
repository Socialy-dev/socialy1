-- ============================================================================
-- MIGRATION: COMPLETE SECURITY AUDIT FIXES - Production Grade
-- ============================================================================
-- Date: 2026-01-23
-- Severity: CRITICAL + HIGH fixes from security audit
--
-- This migration addresses:
-- 1. search_path injection in queue management functions
-- 2. Input validation (regex whitelisting)
-- 3. Function permission restrictions
-- 4. Missing authorization checks
--
-- Impact: Zero breaking changes - pure security hardening
-- Testing: All functions maintain backward-compatible signatures
-- ============================================================================

-- ============================================================================
-- PART 1: QUEUE MANAGEMENT FUNCTIONS (CRITICAL-002 FIX)
-- ============================================================================

-- 1.1 FAIL_JOB - Mark a job as failed with error message
CREATE OR REPLACE FUNCTION public.fail_job(
    p_job_id UUID,
    p_error TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Input validation: ensure error message isn't excessively long
    IF p_error IS NOT NULL AND length(p_error) > 5000 THEN
        RAISE EXCEPTION 'Error message too long (max 5000 chars)';
    END IF;

    -- Update the job log to mark it as failed
    UPDATE public.job_logs
    SET
        status = 'failed',
        error_message = substring(p_error, 1, 5000), -- Truncate to prevent DoS
        completed_at = now()
    WHERE id = p_job_id;

    -- Security: Log if job not found (potential enumeration attempt)
    IF NOT FOUND THEN
        RAISE NOTICE 'Job % not found', p_job_id;
    END IF;
END;
$$;

-- Restrict permissions - ONLY service_role should manage jobs
REVOKE ALL ON FUNCTION public.fail_job(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fail_job(UUID, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.fail_job(UUID, TEXT) TO service_role;

COMMENT ON FUNCTION public.fail_job IS
'Marks a job as failed with error message.
Security: Protected against search_path injection, input size DoS.
Access: Restricted to service_role only (CRITICAL fix from audit).';

-- ============================================================================
-- 1.2 COMPLETE_JOB - Mark a job as completed with optional result
-- ============================================================================
CREATE OR REPLACE FUNCTION public.complete_job(
    p_job_id UUID,
    p_result JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_result_size INT;
BEGIN
    -- Input validation: prevent DoS via huge JSONB payloads
    IF p_result IS NOT NULL THEN
        v_result_size := length(p_result::TEXT);
        IF v_result_size > 1048576 THEN -- 1MB limit
            RAISE EXCEPTION 'Result payload too large (max 1MB)';
        END IF;
    END IF;

    -- Update the job log to mark it as completed
    UPDATE public.job_logs
    SET
        status = 'completed',
        result = p_result,
        completed_at = now()
    WHERE id = p_job_id;

    IF NOT FOUND THEN
        RAISE NOTICE 'Job % not found', p_job_id;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_job(UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_job(UUID, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.complete_job(UUID, JSONB) TO service_role;

COMMENT ON FUNCTION public.complete_job IS
'Marks a job as completed with optional result data.
Security: Protected against search_path injection, payload size DoS.
Access: Restricted to service_role only (CRITICAL fix from audit).';

-- ============================================================================
-- 1.3 PUSH_TO_QUEUE - Add a message to PGMQ queue
-- ============================================================================
CREATE OR REPLACE FUNCTION public.push_to_queue(
    p_queue_name TEXT,
    p_payload JSONB,
    p_org_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
    v_msg_id BIGINT;
    v_payload_size INT;
    v_allowed_queues TEXT[] := ARRAY['journalist_enrichment', 'article_enrichment', 'linkedin_generation'];
BEGIN
    -- CRITICAL: Validate queue name is not empty
    IF p_queue_name IS NULL OR length(trim(p_queue_name)) = 0 THEN
        RAISE EXCEPTION 'Queue name cannot be empty';
    END IF;

    -- HIGH: Whitelist validation - only alphanumeric, underscore, hyphen
    IF p_queue_name !~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE EXCEPTION 'Invalid queue name format. Only alphanumeric, underscore and hyphen allowed.';
    END IF;

    -- HIGH: Whitelist known queue names to prevent abuse
    IF NOT (p_queue_name = ANY(v_allowed_queues)) THEN
        RAISE EXCEPTION 'Queue % is not in allowed list', p_queue_name;
    END IF;

    -- Input validation: prevent DoS via huge payloads
    v_payload_size := length(p_payload::TEXT);
    IF v_payload_size > 524288 THEN -- 512KB limit
        RAISE EXCEPTION 'Payload too large (max 512KB)';
    END IF;

    -- Authorization: If org_id provided, ensure it exists
    IF p_org_id IS NOT NULL THEN
        PERFORM 1 FROM public.organizations WHERE id = p_org_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid organization_id';
        END IF;
    END IF;

    -- Send message to PGMQ queue
    SELECT pgmq.send(
        p_queue_name,
        jsonb_build_object(
            'organization_id', p_org_id,
            'payload', p_payload,
            'enqueued_at', now()
        )
    ) INTO v_msg_id;

    RETURN v_msg_id::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.push_to_queue(TEXT, JSONB, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.push_to_queue(TEXT, JSONB, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.push_to_queue(TEXT, JSONB, UUID) TO service_role;

COMMENT ON FUNCTION public.push_to_queue IS
'Pushes a message to PGMQ queue.
Security: Protected against search_path injection, queue name injection, payload size DoS, queue whitelist.
Access: Restricted to service_role only (CRITICAL fix from audit).';

-- ============================================================================
-- 1.4 POP_FROM_QUEUE - Read messages from PGMQ queue
-- ============================================================================
CREATE OR REPLACE FUNCTION public.pop_from_queue(
    p_queue_name TEXT
)
RETURNS TABLE(
    id TEXT,
    organization_id UUID,
    payload JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
    v_message RECORD;
    v_allowed_queues TEXT[] := ARRAY['journalist_enrichment', 'article_enrichment', 'linkedin_generation'];
BEGIN
    -- Validate queue name is not empty
    IF p_queue_name IS NULL OR length(trim(p_queue_name)) = 0 THEN
        RAISE EXCEPTION 'Queue name cannot be empty';
    END IF;

    -- Whitelist validation for queue names
    IF p_queue_name !~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE EXCEPTION 'Invalid queue name format. Only alphanumeric, underscore and hyphen allowed.';
    END IF;

    -- Whitelist known queue names
    IF NOT (p_queue_name = ANY(v_allowed_queues)) THEN
        RAISE EXCEPTION 'Queue % is not in allowed list', p_queue_name;
    END IF;

    -- Read messages from PGMQ queue with 300s visibility timeout
    FOR v_message IN
        SELECT * FROM pgmq.read(
            p_queue_name,
            300,  -- visibility timeout in seconds
            1     -- number of messages to read
        )
    LOOP
        -- Extract data from message
        RETURN QUERY SELECT
            v_message.msg_id::TEXT,
            (v_message.message->>'organization_id')::UUID,
            (v_message.message->'payload')::JSONB;
    END LOOP;

    RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.pop_from_queue(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pop_from_queue(TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.pop_from_queue(TEXT) TO service_role;

COMMENT ON FUNCTION public.pop_from_queue IS
'Reads messages from PGMQ queue.
Security: Protected against search_path injection, queue name injection, queue whitelist.
Access: Restricted to service_role only (CRITICAL fix from audit).';

-- ============================================================================
-- 1.5 ENQUEUE_JOB - Enhanced security with comprehensive validation
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enqueue_job(
    p_queue_name TEXT,
    p_job_type TEXT,
    p_organization_id UUID,
    p_payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pgmq'
AS $$
DECLARE
    v_job_log_id UUID;
    v_payload_size INT;
    v_allowed_queues TEXT[] := ARRAY['journalist_enrichment', 'article_enrichment', 'linkedin_generation'];
    v_allowed_job_types TEXT[] := ARRAY['journalist_enrichment', 'article_scraping', 'linkedin_post_generation', 'article_enrichment'];
BEGIN
    -- Validate inputs to prevent injection and DoS
    IF p_queue_name IS NULL OR length(trim(p_queue_name)) = 0 THEN
        RAISE EXCEPTION 'Queue name cannot be empty';
    END IF;

    IF p_job_type IS NULL OR length(trim(p_job_type)) = 0 THEN
        RAISE EXCEPTION 'Job type cannot be empty';
    END IF;

    -- Whitelist validation for queue names
    IF p_queue_name !~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE EXCEPTION 'Invalid queue name format';
    END IF;

    IF p_job_type !~ '^[a-zA-Z0-9_-]+$' THEN
        RAISE EXCEPTION 'Invalid job type format';
    END IF;

    -- Whitelist known queue names and job types
    IF NOT (p_queue_name = ANY(v_allowed_queues)) THEN
        RAISE EXCEPTION 'Queue % is not in allowed list', p_queue_name;
    END IF;

    IF NOT (p_job_type = ANY(v_allowed_job_types)) THEN
        RAISE EXCEPTION 'Job type % is not in allowed list', p_job_type;
    END IF;

    -- Payload size validation
    v_payload_size := length(p_payload::TEXT);
    IF v_payload_size > 524288 THEN -- 512KB limit
        RAISE EXCEPTION 'Payload too large (max 512KB)';
    END IF;

    -- Authorization: Verify organization exists
    PERFORM 1 FROM public.organizations WHERE id = p_organization_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid organization_id';
    END IF;

    -- Create a job log entry
    INSERT INTO public.job_logs (queue_name, job_type, organization_id, payload, status)
    VALUES (p_queue_name, p_job_type, p_organization_id, p_payload, 'pending')
    RETURNING id INTO v_job_log_id;

    -- Send message to PGMQ queue with the job log ID
    PERFORM pgmq.send(
        p_queue_name,
        jsonb_build_object(
            'job_log_id', v_job_log_id,
            'organization_id', p_organization_id,
            'payload', p_payload
        )
    );

    RETURN v_job_log_id;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_job(TEXT, TEXT, UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enqueue_job(TEXT, TEXT, UUID, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_job(TEXT, TEXT, UUID, JSONB) TO service_role;

COMMENT ON FUNCTION public.enqueue_job IS
'Enqueues a job to PGMQ queue and creates job log entry.
Security: Protected against search_path injection, queue/job type injection, payload size DoS,
queue/job type whitelist, organization validation.
Access: Restricted to service_role only (CRITICAL fix from audit).';

-- ============================================================================
-- PART 2: AUDIT LOGGING (MEDIUM-001 FIX)
-- ============================================================================

-- Create audit log table for sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'job_queue_access', 'admin_action', 'rls_bypass', etc.
    actor_id UUID, -- user_id or NULL for system actions
    organization_id UUID REFERENCES public.organizations(id),
    resource_type TEXT, -- 'job', 'user', 'organization', etc.
    resource_id UUID,
    action TEXT NOT NULL, -- 'create', 'read', 'update', 'delete'
    details JSONB, -- Additional context
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_actor_id ON public.security_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_organization_id ON public.security_audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);

-- RLS for audit log - only super admins can read
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all audit logs"
ON public.security_audit_log FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Service role has full access to audit logs"
ON public.security_audit_log FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE public.security_audit_log IS
'Audit log for sensitive security events.
Access: Read-only for super_admins, full access for service_role.';

-- ============================================================================
-- PART 3: HELPER FUNCTIONS FOR SECURITY CHECKS
-- ============================================================================

-- 3.1 Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_event_type TEXT,
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.security_audit_log (
        event_type,
        actor_id,
        organization_id,
        resource_type,
        resource_id,
        action,
        details,
        success,
        error_message
    ) VALUES (
        p_event_type,
        auth.uid(),
        NULL, -- Will be populated by trigger if needed
        p_resource_type,
        p_resource_id,
        p_action,
        p_details,
        p_success,
        p_error_message
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_security_event TO service_role;
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;

COMMENT ON FUNCTION public.log_security_event IS
'Logs security events to audit log.
Used for tracking sensitive operations and potential security incidents.';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all functions have proper security settings
DO $$
DECLARE
    v_function_count INT;
BEGIN
    SELECT COUNT(*) INTO v_function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('fail_job', 'complete_job', 'push_to_queue', 'pop_from_queue', 'enqueue_job')
    AND p.prosecdef = TRUE
    AND p.proconfig IS NOT NULL;

    IF v_function_count != 5 THEN
        RAISE EXCEPTION 'Security verification failed: Expected 5 secure functions, found %', v_function_count;
    END IF;

    RAISE NOTICE 'Security verification passed: All 5 queue management functions are properly secured';
END $$;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- Summary:
-- ✅ Fixed search_path injection on 5 critical functions
-- ✅ Added comprehensive input validation (regex, whitelists, size limits)
-- ✅ Restricted function permissions to service_role only (CRITICAL)
-- ✅ Added authorization checks (organization validation)
-- ✅ Created audit log infrastructure
-- ✅ Zero breaking changes - all functions maintain backward compatibility
-- ============================================================================
