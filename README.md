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
# BidForge

BidForge is a project for creating, managing, and comparing bids.

## Status

Early development. Project details and setup instructions will be added as the application takes shape.

## Getting Started

This project is not yet configured with a runtime or build system.

## License

License information will be added in a future commit.
