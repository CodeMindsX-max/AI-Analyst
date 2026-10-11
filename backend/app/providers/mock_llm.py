import json
from typing import List, Dict, Any, Optional
from app.providers.llm_base import LLMProvider, LLMMessage, LLMResponse

# TODO(STUDENT): Replace this MockLLMProvider with a real provider (e.g. OpenAI, Anthropic, Gemini, or local Ollama/vLLM).
# Contract: accept structured messages/context and return the typed response schema.
# Keep provider credentials in backend environment variables (e.g. OPENAI_API_KEY); never in frontend code or Git.


class MockLLMProvider(LLMProvider):
    """Deterministic Mock LLM Provider for local zero-dependency operation."""

    def __init__(self, model_name: str = "mock-analyst-v1"):
        self.model_name = model_name

    def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.1,
        max_tokens: int = 1024,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> LLMResponse:
        user_message = next((m.content for m in reversed(messages) if m.role == "user"), "")
        lower_q = user_message.lower()

        if "september" in lower_q or "decrease" in lower_q or "drop" in lower_q:
            content = (
                "Executive Summary: Net revenue declined by 14.2% in September 2026 ($284,500 vs $331,600 in August). "
                "Primary driver: EMEA Enterprise SaaS sales experienced a 26.8% dip due to lengthened European procurement cycles, "
                "compounded by a 9.4% drop in Professional Services billings. North America and APAC remained resilient."
            )
        elif "region" in lower_q:
            content = (
                "Regional Analysis: North America continues as top contributor (48.5% total volume, 104.2% quota attainment). "
                "EMEA delivered $112,000 (81.2% quota), impacted by late-quarter deal slippage. APAC grew 18.5% QoQ."
            )
        elif "product" in lower_q:
            content = (
                "Product Contribution: Enterprise SaaS constitutes 62.4% of gross revenue with an 84.1% gross margin. "
                "Analytics Add-on demonstrated highest relative growth (+22.1% YoY)."
            )
        else:
            content = (
                f"Analysis for question '{user_message}': Evaluated seeded business tables (sales_orders, customers, products, regions). "
                "Metrics show consistent Q3 performance with notable seasonal variance in European enterprise contracts."
            )

        return LLMResponse(
            content=content,
            finish_reason="stop",
            usage_tokens=len(content.split()) * 2,
            is_mock=True,
        )

    def generate_structured(
        self,
        prompt: str,
        system_instruction: str,
        expected_schema: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Return deterministic JSON matching the requested structure."""
        return {
            "status": "success",
            "summary": "Deterministic structured mock response",
            "is_mock": True,
        }
