CREATE TABLE IF NOT EXISTS auctions (
    uuid uuid PRIMARY KEY,
    start integer,
    "end" integer,
    tier varchar(32),
    category varchar(32),
    item jsonb,
    starting_bid integer,
    highest_bid integer,
    bids jsonb,
    highest_bid_amount integer
);
CREATE INDEX IF NOT EXISTS auctions_uuid_idx on auctions(uuid);
CREATE INDEX IF NOT EXISTS item_id_idx on auctions USING GIN ((item -> 'attributes' -> 'id'));
