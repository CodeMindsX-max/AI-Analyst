def test_glossary_crud_lifecycle(client):
    """Test creating, reading, updating, and deleting a glossary term."""
    # Create
    create_resp = client.post(
        "/api/v1/glossary",
        json={
            "term": "Net Retention Rate",
            "definition": "Annualized percentage of recurring revenue retained from existing customers.",
            "formula": "(Ending ARR - Churn + Expansion) / Beginning ARR * 100",
            "domain": "Sales",
        },
    )
    assert create_resp.status_code == 200
    term_data = create_resp.json()
    term_id = term_data["id"]
    assert term_data["term"] == "Net Retention Rate"

    # Read
    read_resp = client.get(f"/api/v1/glossary/{term_id}")
    assert read_resp.status_code == 200
    assert read_resp.json()["term"] == "Net Retention Rate"

    # Update
    patch_resp = client.patch(
        f"/api/v1/glossary/{term_id}",
        json={"formula": "Updated Formula Expression"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["formula"] == "Updated Formula Expression"

    # Delete
    del_resp = client.delete(f"/api/v1/glossary/{term_id}")
    assert del_resp.status_code == 200

    # Verify not found
    get_again = client.get(f"/api/v1/glossary/{term_id}")
    assert get_again.status_code == 404


def test_knowledge_retrieval_preview(client):
    """Test retrieval preview returns deterministic chunks with demo label."""
    response = client.post(
        "/api/v1/knowledge/retrieval-preview",
        json={"query": "revenue recognition policy and sales cycles", "top_k": 2},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) > 0
    assert data["results"][0]["is_demo"] is True
    assert "Demo" in data["retrieval_mode"]
