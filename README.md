<img width="1119" height="939" alt="Untitled-2026-09-03-1513" src="https://github.com/user-attachments/assets/f9f5be28-505a-4085-8f64-ccb52a122ba0" />
Relationship for the first version:-

```text
┌───────────┐
│   Item    │
└─────┬─────┘
      │
      │ 1:N
      ▼
┌───────────┐
│  Auction  │
└─────┬─────┘
      │
      │ 1:N
      ▼
┌───────────┐
│    Bid    │
└─────┬─────┘
      ▲
      │ N:1
      │
┌─────┴─────┘
│   User    │
└───────────┘─┘
```
## System Architecture & Design Decisions

### 1. Bid Storage & Price Denormalization
**Context:**  
To display the current price of an auction, the system needs to determine the highest bid. Calculating this on the fly (`SELECT MAX(amount) FROM bids WHERE auction_id = ?`) requires scanning the bid table on every read, which becomes a bottleneck during high-traffic read operations.

**Decision:**  
We denormalized the database by adding a `current_price` column directly to the `Auction` table. The `Bid` table is maintained as an append-only ledger for historical records and auditability.

**Consequences & Trade-offs:**  
*   **Fast Reads ($O(1)$):** Fetching an auction immediately returns the current price without aggregating the `Bid` table.
*   **Data Redundancy:** The highest bid amount exists in both the `Bid` and `Auction` tables.
*   **Strict Transaction Requirements:** Bid placement now requires a multi-step ACID transaction (inserting the bid and updating the auction row). 
*   **Concurrency Bottlenecks:** Because every bid updates the same `Auction` row, it creates row-level write contention. This intentionally forces the system to rely on a robust concurrency control model to prevent race conditions during high-volume bidding.
  ### 2. Concurrency Control & Deterministic Ordering
**Context:**  
When two bids arrive at the exact same time, wall-clock timestamps (`created_at`) are an unreliable correctness mechanism due to network latency, microsecond collisions, and server clock drift. 

**Decision:**  
We do not use timestamps to determine the "winner" of a race condition. Instead, we rely strictly on **database serialization** (using database-generated sequences and row-level locking / optimistic concurrency control). 

**Consequences:**  
*   The system evaluates bids based on the exact order the database engine queues and commits the transactions, guaranteeing mathematically strict serializability. 
*   `created_at` is retained purely for auditing and UI display, not for state machine logic.

### 3. The Immutable Bid Ledger (Event Sourcing)
**Context:**  
Storing only the highest bid on the `Auction` table saves space, but destroys the historical context. If a winning bidder's payment fails, or if a user is flagged for fraud, a system without history cannot determine who the second-highest bidder was.

**Decision:**  
The `Bid` table is designed as an **immutable, append-only ledger**. We strictly forbid `UPDATE` operations on bid amounts or statuses to alter accepted bids. 

**Consequences:**  
*   **Fault Tolerance & Rollbacks:** If the highest bid is invalidated, the system can instantly query the ledger to gracefully fall back to the next valid bid.
*   **Auditability:** Every state change is cryptographically backed by a sequence of events, eliminating user disputes over "who bid first" and protecting the platform's integrity.
*   **State Reconstruction:** The `Auction.current_price` acts merely as a projection (cache) of the `Bid` table. If the `Auction` state is ever corrupted, it can be perfectly reconstructed by replaying the immutable bid events.
SCHEMA for version 1 (decided for now will be adding the pk,fk,indexing etc and desing choices as well as in why and what)
### 4. Pragmatic Indexing Driven by Access Patterns
**Context:**  
Adding indexes indiscriminately to foreign keys or individual columns increases write overhead, inflates index maintenance costs during updates, and wastes memory. A database index should never be created purely based on schema definition; it must serve a verified, high-frequency query access pattern.

**Decision:**  
We strictly design indexes based on actual application access patterns rather than speculative schema coverage:

1.  **Leverage Native Primary Key Indexes:**  
    Primary keys (`users.id`, `auctions.id`, `bids.id`) automatically generate unique B-tree indexes in PostgreSQL. We strictly avoid redundant index creation on primary key lookup queries (e.g., `WHERE id = ?`).

2.  **Optimize High-Traffic Bidding Lookups:**  
    The primary bid display query requires fetching recent bids for an auction ordered by sequence:
    ```sql
    SELECT * FROM bids 
    WHERE auction_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50;
    ```
    To support this without in-memory sorting (`filesort`), we establish a **composite index** on `(auction_id, created_at DESC)`. This enables a fast range scan that directly returns pre-sorted records.

3.  **Filtered / Active State Indexes:**  
    Querying active auctions (`WHERE status = 'ACTIVE' AND ends_at <= ?`) uses composite or partial indexes targeting only non-terminated auctions, preventing full-table scans during peak catalog browsing.

**Consequences:**  
*   **Optimal Write Throughput:** By avoiding useless indexes on append-heavy tables like `Bid`, write latency and lock durations remain minimal.
*   **Zero Redundancy:** Avoids common anti-patterns like creating duplicate indexes on standard primary key fields.
*   # 🗄️ Database Design & Indexing Strategy

Our database architecture is driven by **access patterns**, not just logical data structures. We do not preemptively index columns based on "business importance"; we index based on proven, measured query requirements.

## 1. The Query Contract

Before writing migrations, we define the exact query contracts for our core tables. Indexes are built specifically to support these access paths.

| Entity | Primary Query / Access Pattern | Target Index Strategy |
| :--- | :--- | :--- |
| **USER** | Lookup by ID; Authentication by Email | `PK(id)`, `UNIQUE(email)` |
| **ITEM** | Fetch item details; Fetch by seller | `PK(id)`, `INDEX(seller_id)` |
| **AUCTION** | Load auction page; List by item | `PK(id)`, `INDEX(item_id)` |
| **BID** | Fetch recent bids for an auction | `INDEX(auction_id, created_at DESC)` |
| **BID** | Fetch bid history for a user | `INDEX(bidder_id, created_at DESC)` |

## 2. Core Indexing Principles

### Composite Indexes & The Leftmost-Prefix Rule
When filtering and sorting, the order of columns in an index is critical. For fetching bids, a simple index on `auction_id` forces the database to fetch the rows and then perform an expensive in-memory sort for the latest bids.

Instead, we use a composite index:
```sql
CREATE INDEX idx_bids_auction_created ON bids(auction_id, created_at DESC);
USER
 ├── id
 ├── email
 ├── password_hash
 ├── name
 └── timestamps

ITEM
 ├── id
 ├── seller_id → USER
 ├── name
 ├── description
 ├── condition
 └── timestamps

AUCTION
 ├── id
 ├── item_id → ITEM
 ├── starting_price
 ├── current_price
 ├── minimum_increment
 ├── starts_at
 ├── ends_at
 ├── status
 └── timestamps

BID
 ├── id
 ├── auction_id → AUCTION
 ├── bidder_id → USER
 ├── amount
 └── created_at
# BidForge

BidForge is a project for creating, managing, and comparing bids.

## Status

Early development. Project details and setup instructions will be added as the application takes shape.

## Getting Started

This project is not yet configured with a runtime or build system.

## License

License information will be added in a future commit.
