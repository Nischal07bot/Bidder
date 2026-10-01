CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    item_id UUID NOT NULL
        REFERENCES items(id)
        ON DELETE RESTRICT,

    starting_price BIGINT NOT NULL,
    current_price BIGINT NOT NULL,
    minimum_increment BIGINT NOT NULL,

    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,

    status TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT auctions_price_non_negative
        CHECK (starting_price >= 0),

    CONSTRAINT auctions_current_price_valid
        CHECK (current_price >= starting_price),

    CONSTRAINT auctions_minimum_increment_positive
        CHECK (minimum_increment > 0),

    CONSTRAINT auctions_valid_time_range
        CHECK (starts_at < ends_at),

    CONSTRAINT auctions_valid_status
        CHECK (status IN ('SCHEDULED', 'ACTIVE', 'CLOSED', 'CANCELLED'))
);