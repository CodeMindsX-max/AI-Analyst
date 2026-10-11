def test_list_data_sources(client):
    """Test data sources endpoint lists seeded demo dataset."""
    response = client.get("/api/v1/data-sources")
    assert response.status_code == 200
    sources = response.json()
    assert len(sources) >= 1
    demo_src = next((s for s in sources if s["kind"] == "demo_dataset"), None)
    assert demo_src is not None
    assert demo_src["status"] == "active"


def test_test_connection_demo_vs_scaffold(client):
    """Test connection behavior: successful for demo sqlite, honest scaffold message for postgres."""
    # Test demo source
    res1 = client.post("/api/v1/data-sources/demo-source-1/test-connection")
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["success"] is True
    assert d1["tables_found"] >= 4

    # Test scaffold postgres
    res2 = client.post("/api/v1/data-sources/src-pg-1/test-connection")
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["success"] is False
    assert d2["is_simulated"] is True
    assert "scaffold" in d2["message"].lower()
