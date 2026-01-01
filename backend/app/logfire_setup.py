"""Logfire configuration for user-generated apps.

Sends structured logs to Appifex's Logfire project, tagged by project_id.
Falls back to stdout-only logging if Logfire is not configured.
"""

import logging
import os
import sys

# Environment variables (injected by Appifex during deployment)
LOGFIRE_TOKEN = os.getenv("LOGFIRE_TOKEN")
PROJECT_ID = os.getenv("APPIFEX_PROJECT_ID", "unknown")
SESSION_ID = os.getenv("APPIFEX_SESSION_ID", "unknown")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

_logfire_configured = False


def setup_logging() -> logging.Logger:
    """Configure logging with optional Logfire integration.

    If LOGFIRE_TOKEN is set, sends logs to Logfire with service_name
    set to 'user-app-{project_id}' for easy querying.

    Always logs to stdout as fallback (captured by Vercel).
    """
    global _logfire_configured

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
    root_logger.handlers.clear()

    # Always add stdout handler (Vercel captures this)
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
    )
    root_logger.addHandler(stdout_handler)

    # Try to configure Logfire if token is available
    if LOGFIRE_TOKEN and not _logfire_configured:
        try:
            import logfire

            logfire.configure(
                token=LOGFIRE_TOKEN,
                service_name=f"user-app-{PROJECT_ID}",
                service_version=SESSION_ID,
                send_to_logfire=True,
                console=False,
            )
            root_logger.addHandler(logfire.LogfireLoggingHandler())
            _logfire_configured = True
            root_logger.info(f"Logfire configured for project {PROJECT_ID}")

        except ImportError:
            root_logger.warning("Logfire not installed, using stdout only")
        except Exception as e:
            root_logger.warning(f"Logfire configuration failed: {e}")

    return root_logger


def instrument_app(app) -> None:
    """Instrument FastAPI app with Logfire tracing.

    Adds automatic tracing for:
    - HTTP requests/responses (FastAPI) with headers
    - Database queries (SQLAlchemy)
    - Outbound HTTP calls (httpx, requests) with headers and bodies

    Only instruments if Logfire is configured (LOGFIRE_TOKEN is set).
    Fails silently if instrumentation is not available.
    """
    if not _logfire_configured:
        return

    try:
        import logfire

        logfire.instrument_fastapi(app, capture_headers=True)
        logfire.instrument_httpx(capture_all=True)
        logfire.instrument_requests()
        logfire.instrument_sqlalchemy()
    except Exception:
        pass
