def test_analyst_run_variance_pipeline(client):
    """Test running analysis on the September revenue variance question."""
    response = client.post(
        "/api/v1/analyst/runs",
        json={"question": "Why did revenue decrease in September compared with August?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert "result" in data
    assert data["result"] is not None

    result = data["result"]
    assert "executive_answer" in result
    assert len(result["findings"]) > 0
    assert len(result["charts"]) > 0
    assert len(result["evidence"]) > 0
    assert result["is_demo_generated"] is True

    # Check 9-step timeline events exist
    assert len(data["events"]) == 9
    step_names = [e["step_name"] for e in data["events"]]
    assert "Understand Request" in step_names
    assert "Generate SQL" in step_names
    assert "Synthesize Explanation" in step_names


def test_save_analysis_persistence(client):
    """Test saving an analysis and verifying its persistence in library."""
    # First generate run
    run_resp = client.post(
        "/api/v1/analyst/runs",
        json={"question": "Compare regional sales performance this quarter"},
    )
    run_id = run_resp.json()["id"]

    # Save it
    save_resp = client.post(
        f"/api/v1/analyst/analyses/{run_id}/save",
        json={"title": "Q3 Regional Performance Review", "run_id": run_id, "tags": ["regional", "q3"]},
    )
    assert save_resp.status_code == 200
    saved_data = save_resp.json()
    assert saved_data["title"] == "Q3 Regional Performance Review"

    # Verify listed in saved-analyses
    list_resp = client.get("/api/v1/saved-analyses")
    assert list_resp.status_code == 200
    all_saved = list_resp.json()
    assert any(s["id"] == saved_data["id"] for s in all_saved)
