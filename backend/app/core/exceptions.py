from typing import Any, Optional
from fastapi import HTTPException, status


class AnalystAIException(HTTPException):
    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        detail: str = "An error occurred",
        code: str = "APP_ERROR",
        extra: Optional[Any] = None,
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code
        self.extra = extra


class ResourceNotFoundException(AnalystAIException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id '{identifier}' was not found",
            code="NOT_FOUND",
        )


class ValidationError(AnalystAIException):
    def __init__(self, detail: str, extra: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            code="VALIDATION_ERROR",
            extra=extra,
        )


class UnsafeQueryException(AnalystAIException):
    def __init__(self, detail: str = "Query failed safety validation"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            code="UNSAFE_QUERY",
        )


class UnauthorizedException(AnalystAIException):
    def __init__(self, detail: str = "Invalid credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="UNAUTHORIZED",
        )
