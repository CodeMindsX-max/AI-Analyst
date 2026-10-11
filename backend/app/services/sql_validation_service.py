import re
from typing import List, Tuple
from app.schemas.sql import SqlValidateResponse

# TODO(STUDENT): Enhance SQL security validation using an AST parser such as sqlglot or sqlparse.
# Add custom checks for:
# 1. Column-level access permissions.
# 2. Maximum subquery nesting depth.
# 3. Execution complexity bounds (e.g., disallowing Cartesian products / unrestricted CROSS JOINs).


class SqlValidationService:
    """Service validating SQL queries for read-only safety, statement count, and table allowlists."""

    ALLOWED_TABLES = {"sales_orders", "customers", "products", "regions"}

    PROHIBITED_KEYWORDS = [
        "DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "CREATE", "TRUNCATE",
        "ATTACH", "DETACH", "PRAGMA", "REINDEX", "VACUUM", "EXEC", "EXECUTE",
        "GRANT", "REVOKE", "SHUTDOWN", "ALTER TABLE", "INTO OUTFILE", "LOAD_FILE",
    ]

    def validate_query(self, query: str) -> SqlValidateResponse:
        clean_q = query.strip()
        reasons: List[str] = []

        if not clean_q:
            return SqlValidateResponse(
                is_valid=False,
                is_read_only=False,
                tables_referenced=[],
                message="Query cannot be empty.",
                reasons=["Empty query"],
            )

        # Check for multiple statements (semicolon inside or separating queries)
        semi_count = clean_q.count(";")
        if semi_count > 1 or (semi_count == 1 and not clean_q.endswith(";")):
            reasons.append("Multiple statements are prohibited. Only one query can be executed at a time.")

        # Strip trailing semicolon for keyword checking
        normalized = clean_q.rstrip(";").strip()

        # Check leading keyword: must be SELECT or WITH
        first_token = normalized.split()[0].upper() if normalized.split() else ""
        if first_token not in ("SELECT", "WITH"):
            reasons.append(f"Statement must begin with SELECT or WITH (found: '{first_token}'). Write/DDL statements are forbidden.")

        # Check for prohibited write/admin keywords
        tokens = re.findall(r"\b[A-Za-z_]+\b", normalized.upper())
        for prohibited in self.PROHIBITED_KEYWORDS:
            if prohibited in tokens:
                reasons.append(f"Prohibited SQL keyword detected: '{prohibited}'. Only safe read-only queries are allowed.")

        # Extract referenced tables using regex
        referenced_tables = []
        table_matches = re.findall(r"\bFROM\s+([A-Za-z0-9_]+)|\bJOIN\s+([A-Za-z0-9_]+)", normalized, re.IGNORECASE)
        for m in table_matches:
            tbl = (m[0] or m[1]).lower()
            if tbl and tbl not in referenced_tables:
                referenced_tables.append(tbl)

        # Check against allowed tables
        for tbl in referenced_tables:
            if tbl not in self.ALLOWED_TABLES and not tbl.startswith("cte_") and tbl != "sub":
                reasons.append(f"Table '{tbl}' is not in the allowed business tables list: {list(self.ALLOWED_TABLES)}")

        is_valid = len(reasons) == 0
        message = "Query passed all read-only safety checks." if is_valid else "Query validation failed safety checks."

        return SqlValidateResponse(
            is_valid=is_valid,
            is_read_only=is_valid,
            tables_referenced=referenced_tables,
            message=message,
            reasons=reasons,
        )


sql_validation_service = SqlValidationService()
