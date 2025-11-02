import logging

def log_action(user_id: str, action: str, details: str):
    logging.info(f"user_id={user_id}, action='{action}', details='{details}'")
