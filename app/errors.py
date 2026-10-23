"""Shared API error. `extra` carries machine-readable fields (for example a reason code or seconds to wait)."""


class Error(Exception):
    def __init__(self, message, status=400, **extra):
        super().__init__(message)
        self.status = status
        self.extra = extra
