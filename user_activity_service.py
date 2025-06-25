import logging
import json # Not strictly needed here if JsonFormatter handles it, but good for context
from datetime import datetime, timezone
# Assuming json_formatter.py is in the same directory or accessible in PYTHONPATH
from json_formatter import JsonFormatter

# --- User Activity Logger Setup ---
# Create a specific logger for user activities.
# This allows its output to be handled differently from general application logs if needed
# (e.g., different file, different log level, different downstream processing).
activity_logger = logging.getLogger("user_activity")
activity_logger.setLevel(logging.INFO) # Set the level for this specific logger

# Prevent activity logs from propagating to the root logger if you want them completely separate
# activity_logger.propagate = False

# Ensure it has a handler and formatter (could be the same JsonFormatter)
# If you want activity logs to go to a different destination (e.g., a specific file or stream for Fluentd)
# configure a new handler here. For simplicity, we can reuse JsonFormatter and StreamHandler,
# but in a real setup, you might have a FileHandler or a network handler.

# Check if handlers are already configured (e.g. by a global config)
# This is a simple check; more robust would be to check by handler type or name
if not activity_logger.handlers:
    activity_console_handler = logging.StreamHandler() # Outputs to stderr by default
    activity_console_handler.setFormatter(JsonFormatter()) # Use the same JSON formatter
    activity_logger.addHandler(activity_console_handler)
    print("User activity logger configured with new StreamHandler and JsonFormatter.")
else:
    print("User activity logger already has handlers.")
# --- End User Activity Logger Setup ---


class UserActivityService:
    @staticmethod
    def record_activity(
        actor_id: str,
        action_verb: str,
        target_type: str = None,
        target_id: str = None,
        status: str = "success",
        ip_address: str = None,
        user_agent: str = None,
        additional_details: dict = None
    ):
        """
        Records a user activity event.

        Args:
            actor_id: The ID of the user/system performing the action.
            action_verb: The action performed (e.g., "login", "create_document", "delete_user").
            target_type: The type of object the action was performed on (e.g., "document", "user_account").
            target_id: The ID of the object the action was performed on.
            status: "success" or "failure".
            ip_address: The IP address of the actor.
            user_agent: The user agent of the actor's client.
            additional_details: A dictionary for any other relevant information.
        """
        activity_data = {
            "event_type": "user_activity", # To distinguish these logs
            "actor": {"id": actor_id},
            "action": {
                "verb": action_verb,
                "status": status,
            },
            "target": {
                "type": target_type,
                "id": target_id,
            },
            "network": {
                "ip_address": ip_address,
                "user_agent": user_agent,
            },
            "details": additional_details if additional_details else {}
        }

        # The message part of the log can be a summary
        log_message = f"User {actor_id} performed {action_verb}"
        if target_type and target_id:
            log_message += f" on {target_type}:{target_id}"
        log_message += f" (status: {status})"

        # Log using the dedicated activity_logger
        # The `extra` argument merges its content into the log record's __dict__,
        # which JsonFormatter can then pick up.
        activity_logger.info(log_message, extra=activity_data)


# --- Example Usage (can be run directly for testing the logger) ---
if __name__ == "__main__":
    print("Testing UserActivityService...")

    # Configure root logger for basic visibility if JsonFormatter is not set up globally
    # logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

    UserActivityService.record_activity(
        actor_id="user_123",
        action_verb="login",
        status="success",
        ip_address="192.168.1.100",
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
        additional_details={"login_method": "password"}
    )

    UserActivityService.record_activity(
        actor_id="user_456",
        action_verb="create_document",
        target_type="document",
        target_id="doc_abc_789",
        status="success",
        ip_address="10.0.0.52",
        user_agent="MyAppClient/1.2",
        additional_details={"document_title": "My Important Report", "folder_id": "folder_xyz"}
    )

    UserActivityService.record_activity(
        actor_id="admin_001",
        action_verb="delete_user",
        target_type="user_account",
        target_id="user_789",
        status="failure",
        ip_address="203.0.113.45",
        user_agent="AdminConsole/2.0",
        additional_details={"reason": "User account locked", "attempted_by_admin": True}
    )

    UserActivityService.record_activity(
        actor_id="system_batch_process",
        action_verb="purge_temp_files",
        target_type="filesystem_path",
        target_id="/tmp/batch_uploads/*",
        status="success",
        additional_details={"files_deleted": 1024, "space_freed_mb": 256}
    )

    print("Test activities logged. Check your console/log output.")
    print("If JsonFormatter is correctly configured for 'user_activity' logger, output should be JSON.")
```
