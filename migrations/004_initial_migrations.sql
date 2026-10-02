CREATE TABLE bids(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL
        REFERENCES auctions(id)
        ON DELETE RESTRICT, 
    bidder_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,
    amount BIGINT NOT NULL,
    idempotency_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bids_amount_positive
        CHECK (amount > 0),
    CONSTRAINT bids_bidder_id_idempotency_key_unique
        UNIQUE(bidder_id, idempotency_key)/*so here we are making a composite unique constraint where 
        any bidder with same idempotency key cannot make a bid twice thus securing idemptency on db level*/
)
/*restrict vs cascade: restrict prevents deletion of a referenced row if there are dependent rows, 
while cascade allows deletion of the referenced row and automatically deletes all dependent rows.*/