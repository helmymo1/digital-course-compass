# Data Archiving Strategy

This document outlines the strategy for archiving old or inactive data from the MongoDB database to manage database size, improve performance, and potentially reduce storage costs.

## 1. Goals of Data Archiving
-   Reduce the size of primary operational database collections.
-   Improve query performance on active data.
-   Manage storage costs effectively.
-   Retain historical data for compliance, auditing, or long-term analysis.

## 2. Data Candidates for Archiving
The following collections and data types are considered candidates for archiving:

-   **`ActivityLog`**: User activity logs.
-   **`SearchAnalytics`**: Logs of user search queries.
-   **`Feedback`**: User-submitted feedback entries.
-   **`QuizAttempt`**: Records of user attempts at quizzes.
-   **`ForumPost`**: Old posts in forum discussions.
-   **`Content` with 'archived' status**: While already marked, these could be physically moved.
-   **Soft-deleted records**: Documents across various collections where `deletedAt` is set (i.e., they are soft-deleted).

## 3. Archiving Criteria (Examples)
Specific criteria will determine when data is eligible for archiving. These are examples and should be tuned based on business requirements and data access patterns:

-   **`ActivityLog`**: Archive entries older than 12 months.
-   **`SearchAnalytics`**: Archive entries older than 24 months.
-   **`Feedback`**: Archive entries with status 'resolved' or 'wont-fix' that are older than 18 months.
-   **`QuizAttempt`**: Archive attempts older than 36 months, or attempts by users who have been inactive for over 24 months.
-   **`ForumPost`**: Archive posts in threads with no new activity for over 24 months.
-   **Soft-deleted records**: Move records where `deletedAt` is older than 6-12 months to the archive storage.

## 4. Proposed Archiving Mechanism

A phased approach is recommended:

### Phase 1: Archive to Separate Collections (Within the Same MongoDB Instance)

-   **Description**: Move eligible historical data from primary collections to corresponding "archive" collections (e.g., `ActivityLog` -> `ActivityLog_archive`).
-   **Process**:
    1.  **Create Archive Collections**: For each primary collection to be archived, create a new collection (e.g., `ActivityLog_archive`) with a similar schema. Indexes on these archive collections should be optimized for how archived data will be queried (often fewer indexes than primary collections, or different ones).
    2.  **Archiving Script**: Develop scripts (e.g., Node.js with Mongoose) that:
        a.  Query the primary collection for documents meeting the archiving criteria.
        b.  Iterate through these documents in batches.
        c.  For each document, insert it into the corresponding `_archive` collection.
        d.  After successful insertion and verification (optional, but recommended for critical data), delete the document from the primary collection.
-   **Pros**:
    -   Simpler to implement and manage initially.
    -   Archived data remains accessible via MongoDB queries and Mongoose.
    -   Maintains data within the same database environment.
-   **Cons**:
    -   Still consumes storage on the primary MongoDB server/cluster. Cost savings might be limited unless archive collections can be moved to slower/cheaper disk tiers if the infrastructure supports it.

### Phase 2 (Future Consideration): Export to External Cold Storage

-   **Description**: If Phase 1 is insufficient for cost or performance goals, move data from archive collections (or directly from primary collections) to external, low-cost storage.
-   **Process**:
    1.  **Export Data**: Scripts query for eligible data and export it to a structured format (e.g., JSON Lines, Avro, Parquet).
    2.  **Store Externally**: Upload exported files to a cloud storage service (e.g., AWS S3 Glacier, Google Cloud Storage Archive, Azure Blob Archive).
    3.  **Delete from MongoDB**: After successful export and verification, delete the data from the MongoDB archive collections (or primary collections if bypassing Phase 1).
-   **Pros**:
    -   Significant reduction in primary database storage costs and size.
    -   Potential for further performance improvements on the primary database.
-   **Cons**:
    -   More complex to implement.
    -   Accessing archived data is slower and more involved, requiring retrieval from cold storage and potentially loading into a query engine.

**Initial Recommendation**: Implement Phase 1. Evaluate its impact before considering Phase 2. If using a managed service like MongoDB Atlas, explore their Online Archive feature as an alternative.

## 5. Accessing Archived Data

-   **Phase 1 (Archive Collections)**:
    -   Query directly using MongoDB tools or Mongoose, targeting the `_archive` collections.
    -   Specific UIs or reporting tools may need to be developed or adapted to include data from these archive collections if users need to access it.
    -   Consider read-only access for most users to archive collections.
-   **Phase 2 (External Storage)**:
    -   **For Analysis**: Use query services like AWS Athena, Google BigQuery, or Azure Synapse Analytics to query data directly in cloud storage.
    -   **For Specific Record Retrieval**: Develop a process to locate, download, and parse archive files. This data might be loaded into a temporary collection or presented directly.
    -   Data restoration from external storage will be slower than from internal archive collections.

## 6. Automation and Scheduling
-   **Archiving Scripts**: Develop robust scripts for the archiving process. These scripts should:
    -   Be idempotent where possible (running multiple times doesn't cause issues).
    -   Process data in batches to avoid overloading the database.
    -   Include comprehensive logging.
    -   Have a "dry run" mode to report what would be archived without making changes.
-   **Scheduling**: Use a scheduler (e.g., cron on the server, or a workflow orchestration tool) to run archiving scripts automatically.
-   **Frequency**: Schedule archiving runs based on data growth and archiving criteria (e.g., weekly, monthly). Run during off-peak hours.
-   **Monitoring**: Monitor the execution of archiving jobs for successes, failures, and performance.

## 7. Data Integrity and Recovery
-   **Transactional Behavior**: Archiving (copy then delete) is not a single transaction across collections or systems. Implement checks and balances:
    -   Ensure data is successfully written to the archive before deleting from the source.
    -   Consider a "soft delete" or "marked for archive" status in the primary collection before actual deletion, allowing for a verification window.
-   **Backup of Archives**: If using internal archive collections (Phase 1), ensure these are included in the regular database backup procedures. If using external storage (Phase 2), rely on the durability and backup features of the cloud storage provider.

## 8. Review and Adjustment
The archiving strategy, particularly the criteria and choice of mechanism, should be reviewed periodically (e.g., annually) to ensure it still meets business needs and technical constraints.
