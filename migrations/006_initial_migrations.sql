CREATE TABLE auth_sessions(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),/*this is my primary key which is basically the sessionid*/
    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    absolute_expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
     CONSTRAINT auth_sessions_valid_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT auth_sessions_valid_absolute_expiry
        CHECK (absolute_expires_at > created_at),

    CONSTRAINT auth_sessions_expiry_within_absolute
        CHECK (expires_at <= absolute_expires_at)
);
CREATE INDEX auth_sessions_user_created_idx
    ON auth_sessions(user_id, created_at DESC);

CREATE INDEX auth_sessions_expires_idx
    ON auth_sessions(expires_at);