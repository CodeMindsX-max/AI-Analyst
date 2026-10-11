from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class LLMMessage(BaseModel):
    role: str  # system, user, assistant
    content: str


class LLMResponse(BaseModel):
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None
    finish_reason: str = "stop"
    usage_tokens: int = 0
    is_mock: bool = False


class LLMProvider(ABC):
    """Abstract Base Class for Large Language Model Providers."""

    @abstractmethod
    def generate(
        self,
        messages: List[LLMMessage],
        temperature: float = 0.1,
        max_tokens: int = 1024,
        tools: Optional[List[Dict[str, Any]]] = None,
    ) -> LLMResponse:
        """Generate response from LLM."""
        pass

    @abstractmethod
    def generate_structured(
        self,
        prompt: str,
        system_instruction: str,
        expected_schema: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Generate structured JSON matching the expected schema."""
        pass
