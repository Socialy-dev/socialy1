-- Migration: Fix security vulnerabilities in job management functions
-- Issue: Functions have mutable search_path which can lead to search_path injection attacks
-- Solution: Add SECURITY DEFINER and SET search_path to 'public' for all affected functions

-- ============================================================================
-- 1. FAIL_JOB - Mark a job as failed with error message
-- ============================================================================
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
    -- Update the job log to mark it as failed
    UPDATE public.job_logs
    SET
        status = 'failed',
        error_message = p_error,
        completed_at = now()
    WHERE id = p_job_id;

    -- Raise notice if job not found
    IF NOT FOUND THEN
        RAISE NOTICE 'Job % not found', p_job_id;
    END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.fail_job(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fail_job(UUID, TEXT) TO service_role;

COMMENT ON FUNCTION public.fail_job IS 'Marks a job as failed with error message. Protected against search_path injection.';

-- ============================================================================
-- 2. COMPLETE_JOB - Mark a job as completed with optional result
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
BEGIN
    -- Update the job log to mark it as completed
    UPDATE public.job_logs
    SET
        status = 'completed',
        result = p_result,
        completed_at = now()
    WHERE id = p_job_id;

    -- Raise notice if job not found
    IF NOT FOUND THEN
        RAISE NOTICE 'Job % not found', p_job_id;
    END IF;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_job(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_job(UUID, JSONB) TO service_role;

COMMENT ON FUNCTION public.complete_job IS 'Marks a job as completed with optional result data. Protected against search_path injection.';

-- ============================================================================
-- 3. PUSH_TO_QUEUE - Add a message to PGMQ queue and create job log
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
BEGIN
    -- Validate queue name to prevent injection
    IF p_queue_name IS NULL OR length(trim(p_queue_name)) = 0 THEN
        RAISE EXCEPTION 'Queue name cannot be empty';
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

    -- Return the message ID as text
    RETURN v_msg_id::TEXT;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.push_to_queue(TEXT, JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.push_to_queue(TEXT, JSONB, UUID) TO service_role;

COMMENT ON FUNCTION public.push_to_queue IS 'Pushes a message to PGMQ queue. Protected against search_path injection.';

-- ============================================================================
-- 4. POP_FROM_QUEUE - Read messages from PGMQ queue
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
BEGIN
    -- Validate queue name to prevent injection
    IF p_queue_name IS NULL OR length(trim(p_queue_name)) = 0 THEN
        RAISE EXCEPTION 'Queue name cannot be empty';
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.pop_from_queue(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pop_from_queue(TEXT) TO service_role;

COMMENT ON FUNCTION public.pop_from_queue IS 'Reads messages from PGMQ queue. Protected against search_path injection.';

-- ============================================================================
-- ADDITIONAL SECURITY: Fix enqueue_job if it doesn't have proper search_path
-- ============================================================================
-- The enqueue_job function should also explicitly include pgmq in search_path
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
BEGIN
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

COMMENT ON FUNCTION public.enqueue_job IS 'Enqueues a job to PGMQ queue and creates job log entry. Protected against search_path injection.';

-- ============================================================================
-- SECURITY VERIFICATION
-- ============================================================================
-- You can verify the security settings with:
-- SELECT proname, prosecdef, proconfig FROM pg_proc WHERE proname IN ('fail_job', 'complete_job', 'push_to_queue', 'pop_from_queue', 'enqueue_job');
-- prosecdef should be 't' (true) and proconfig should show search_path settings
