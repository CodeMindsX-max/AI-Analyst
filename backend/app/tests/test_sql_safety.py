def test_sql_validation_permits_safe_select(client):
    """Test safe SELECT statement passes validation."""
    response = client.post(
        "/api/v1/sql/validate",
        json={"query_sql": "SELECT order_id, net_amount FROM sales_orders LIMIT 10;"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["is_read_only"] is True


def test_sql_validation_rejects_drop_table(client):
    """Test malicious DROP TABLE is strictly rejected."""
    response = client.post(
        "/api/v1/sql/validate",
        json={"query_sql": "DROP TABLE sales_orders;"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert any("Prohibited SQL keyword detected" in r or "Statement must begin" in r for r in data["reasons"])


def test_sql_validation_rejects_multi_statements(client):
    """Test semicolon-chained queries are rejected."""
    response = client.post(
        "/api/v1/sql/validate",
        json={"query_sql": "SELECT 1; DELETE FROM customers;"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert any("Multiple statements are prohibited" in r for r in data["reasons"])


def test_sql_execute_runs_read_only(client):
    """Test executing a valid SELECT query against the analytics database."""
    response = client.post(
        "/api/v1/sql/execute",
        json={"query_sql": "SELECT region_name, COUNT(*) as cnt FROM sales_orders GROUP BY region_name LIMIT 5;"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["rows"]) > 0
    assert "region_name" in data["columns"]


def test_sql_execute_zero_rows_honest_reporting(client):
    """Verify empty query result returns 0 rows without injecting fake fallback data."""
    response = client.post(
        "/api/v1/sql/execute",
        json={"query_sql": "SELECT * FROM sales_orders WHERE order_id = 'non-existent-order-id-99999';"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["row_count"] == 0
    assert data["rows"] == []


def test_sql_execute_unsupported_data_source_fails_honestly(client):
    """Verify executing against scaffolded or non-existent remote source fails honestly."""
    response = client.post(
        "/api/v1/sql/execute",
        json={
            "query_sql": "SELECT 1;",
            "source_id": "src-pg-1",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "error"
    assert "scaffolded connector" in data["error_message"].lower() or "not implemented" in data["error_message"].lower()
