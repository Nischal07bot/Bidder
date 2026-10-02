ALTER TABLE bids
DROP CONSTRAINT bids_bidder_id_idempotency_key_unique;

ALTER TABLE bids 
ADD CONSTRAINT bids_bidder_id_idempotency_key_unique
UNIQUE(bidder_id, auction_id, idempotency_key)/*so here we are making a composite unique 
constraint where any bidder with same idempotency key cannot make a bid 
twice for the same auction thus securing idemptency on db level*/;