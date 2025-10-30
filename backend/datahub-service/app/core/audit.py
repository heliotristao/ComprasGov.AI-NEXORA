import logging

# Configure logging
logging.basicConfig(level=logging.INFO, filename='audit.log', filemode='a',
                    format='%(asctime)s - %(message)s')


def log_action(action: str, user: str, details: dict):
    """
    Logs an audit event.
    """
    log_message = f"Action: {action}, User: {user}, Details: {details}"
    logging.info(log_message)
