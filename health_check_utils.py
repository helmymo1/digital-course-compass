# health_check_utils.py
import time
import logging # For logging issues within checks if necessary

logger = logging.getLogger(__name__) # Logger for health check utilities

# --- Database Check ---
# This is a placeholder. In a real application, you would import your database
# client (e.g., SQLAlchemy, psycopg2, PyMongo) and perform a real check.
# For example, try to establish a connection and run a simple query like "SELECT 1".

# Simulating a global DB client or a way to get one
# class SimulatedDBClient:
#     def connected(self):
#         # Simulate occasional failure for testing
#         # import random
#         # return random.choice([True, True, True, False])
#         return True
#     def simple_query(self):
#         if self.connected():
#             time.sleep(0.01) # Simulate query time
#             return True
#         return False

# db_client_instance = SimulatedDBClient() # Global instance for demo

def check_database_status(db_connection_func=None):
    """
    Checks the status of the database connection.

    Args:
        db_connection_func: A callable that attempts to connect to the DB
                            and returns (True, "message") or (False, "error message").
                            If None, uses a simulation.

    Returns:
        tuple: (bool, str) indicating health status and a message.
    """
    if db_connection_func:
        try:
            return db_connection_func()
        except Exception as e:
            logger.error(f"Health Check: Database connection function error: {e}", exc_info=True)
            return False, f"Database check function failed: {str(e)}"

    # --- Simulation if no actual function is provided ---
    # In a real app, replace this with actual DB client logic
    # For example:
    # try:
    #     # from your_project.db import SessionLocal # Assuming SQLAlchemy
    #     # db = SessionLocal()
    #     # db.execute("SELECT 1")
    #     # db.close()
    #     # return True, "Database connection successful and query executed."
    # except Exception as e:
    #     # logger.error(f"Health Check: Database error: {e}", exc_info=True)
    #     # return False, f"Database connection failed: {str(e)}"
    # --- End real app example ---

    # Simulated check:
    time.sleep(0.01) # Simulate time taken for a quick DB check
    # is_connected = db_client_instance.simple_query()
    is_connected = True # Assume connected for basic simulation
    if is_connected:
        return True, "Database connection simulated as healthy."
    else:
        return False, "Database connection simulated as unhealthy."


# --- Cache Check (e.g., Redis) ---
# This is also a placeholder. You'd use your Redis client (e.g., redis-py).

# Simulating a global Redis client
# class SimulatedRedisClient:
#     def ping(self):
#         # Simulate occasional failure
#         # import random
#         # return random.choice([True, True, False])
#         return True

# redis_client_instance = SimulatedRedisClient() # Global instance for demo

def check_cache_status(cache_client_ping_func=None):
    """
    Checks the status of the cache (e.g., Redis).

    Args:
        cache_client_ping_func: A callable that attempts to ping the cache and
                                returns (True, "message") or (False, "error message").
                                If None, uses a simulation.
    Returns:
        tuple: (bool, str) indicating health status and a message.
    """
    if cache_client_ping_func:
        try:
            return cache_client_ping_func()
        except Exception as e:
            logger.error(f"Health Check: Cache ping function error: {e}", exc_info=True)
            return False, f"Cache check function failed: {str(e)}"

    # --- Simulation if no actual function is provided ---
    # In a real app, replace this with actual cache client logic
    # For example, using redis-py:
    # try:
    #     # from your_project.cache import redis_client # Assuming you have a redis_client instance
    #     # if redis_client.ping():
    #     #     return True, "Cache connection successful (PING OK)."
    #     # else:
    #     #     return False, "Cache connection failed (PING returned False)." # Should not happen with .ping()
    # except Exception as e: # Catches redis.exceptions.ConnectionError etc.
    #     # logger.error(f"Health Check: Cache error: {e}", exc_info=True)
    #     # return False, f"Cache connection failed: {str(e)}"
    # --- End real app example ---

    # Simulated check:
    time.sleep(0.005) # Simulate time taken for a quick cache check
    # can_ping = redis_client_instance.ping()
    can_ping = True # Assume pingable for basic simulation
    if can_ping:
        return True, "Cache connection simulated as healthy."
    else:
        return False, "Cache connection simulated as unhealthy."

if __name__ == "__main__":
    # Test the check functions
    db_ok, db_msg = check_database_status()
    print(f"Database Status: {'OK' if db_ok else 'FAIL'} - {db_msg}")

    cache_ok, cache_msg = check_cache_status()
    print(f"Cache Status: {'OK' if cache_ok else 'FAIL'} - {cache_msg}")

    # Example with hypothetical actual check functions
    def my_actual_db_check():
        # ... real db logic ...
        # raise ValueError("DB error for test") # to test exception handling
        return True, "Real DB is A-OK!"

    def my_actual_cache_check():
        # ... real cache logic ...
        return False, "Real Cache is having a moment."

    db_ok_real, db_msg_real = check_database_status(my_actual_db_check)
    print(f"Real DB Status: {'OK' if db_ok_real else 'FAIL'} - {db_msg_real}")

    cache_ok_real, cache_msg_real = check_cache_status(my_actual_cache_check)
    print(f"Real Cache Status: {'OK' if cache_ok_real else 'FAIL'} - {cache_msg_real}")
```
