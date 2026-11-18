"""Small, bounded HTTP downloader for official source adapters."""

import logging
import time
from dataclasses import dataclass
from datetime import UTC, datetime
from email.utils import parsedate_to_datetime
from http.client import HTTPException, HTTPMessage
from typing import IO
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

LOGGER = logging.getLogger(__name__)
MAX_BYTES = 10 * 1024 * 1024


class AcquisitionError(RuntimeError):
    """An official response could not be retrieved or safely validated."""


def check_url(url: str, allowed_hosts: tuple[str, ...]) -> None:
    """Restrict downloads and redirects to the adapter's approved HTTPS hosts."""
    parsed = urlsplit(url)
    if (
        parsed.scheme != "https"
        or parsed.hostname not in allowed_hosts
        or parsed.port not in (None, 443)
        or parsed.username is not None
        or parsed.password is not None
    ):
        raise AcquisitionError(f"URL is outside the approved HTTPS source: {url}")


class OfficialRedirects(HTTPRedirectHandler):
    """Check destinations before urllib follows a redirect."""

    def __init__(self, allowed_hosts: tuple[str, ...]) -> None:
        self.allowed_hosts = allowed_hosts

    def redirect_request(
        self, req: Request, fp: IO[bytes], code: int, msg: str, headers: HTTPMessage, newurl: str
    ) -> Request | None:
        check_url(newurl, self.allowed_hosts)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


@dataclass(frozen=True)
class Download:
    """Unmodified response body and retrieval evidence."""

    body: bytes
    requested_url: str
    final_url: str
    retrieved_at_utc: str
    content_type: str
    etag: str | None
    last_modified: str | None


def fetch(url: str, allowed_hosts: tuple[str, ...]) -> Download:
    """GET with a 30-second socket timeout and at most three attempts.

    Retry transient transport errors and HTTP 429/5xx responses, never access denials.
    Long server-requested delays stop the run so a later invocation can respect them.
    """
    check_url(url, allowed_hosts)
    opener = build_opener(OfficialRedirects(allowed_hosts))
    request = Request(url, headers={"User-Agent": "IndustryResilience/0.1 research-acquisition"})
    for attempt in range(3):
        delay = float(2**attempt)
        try:
            LOGGER.info("Downloading %s (attempt %d/3)", url, attempt + 1)
            with opener.open(request, timeout=30) as response:
                body = response.read(MAX_BYTES + 1)
                if not body or len(body) > MAX_BYTES:
                    raise AcquisitionError("Response is empty or exceeds the 10 MiB limit")
                check_url(response.url, allowed_hosts)
                return Download(
                    body=body,
                    requested_url=url,
                    final_url=response.url,
                    retrieved_at_utc=datetime.now(UTC).isoformat(),
                    content_type=response.headers.get("Content-Type", ""),
                    etag=response.headers.get("ETag"),
                    last_modified=response.headers.get("Last-Modified"),
                )
        except HTTPError as exc:
            status = exc.code
            retry_after = exc.headers.get("Retry-After")
            exc.close()
            if status not in (429, 500, 502, 503, 504) or attempt == 2:
                raise AcquisitionError(f"HTTP {status} from {url}; no data acquired") from exc
            if retry_after:
                try:
                    delay = max(delay, float(retry_after))
                except ValueError:
                    try:
                        retry_at = parsedate_to_datetime(retry_after)
                        delay = max(delay, (retry_at - datetime.now(UTC)).total_seconds())
                    except (TypeError, ValueError):
                        raise AcquisitionError("Invalid Retry-After; retry manually later") from exc
                if delay > 60:
                    raise AcquisitionError(
                        f"Source requests a {delay:.0f}s delay; retry manually later"
                    ) from exc
            LOGGER.warning("HTTP %d; retrying in %.0fs", status, delay)
        except (URLError, OSError, HTTPException) as exc:
            if attempt == 2:
                raise AcquisitionError(f"Cannot retrieve {url}: {exc}") from exc
            LOGGER.warning("Transport error; retrying in %.0fs: %s", delay, exc)
        time.sleep(delay)
    raise AssertionError("Unreachable retry state")
