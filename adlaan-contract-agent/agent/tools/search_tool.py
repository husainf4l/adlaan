"""
Google Search tool for the agent using Google Custom Search Engine API.
"""

import os
import asyncio
from typing import List, Dict, Any, Optional
import httpx
from agent.tools.validation import sanitize_user_input


class GoogleSearchTool:
    """Google Custom Search Engine tool for web searches."""

    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        self.cse_id = os.getenv("GOOGLE_CSE_ID")
        self.base_url = "https://www.googleapis.com/customsearch/v1"

        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        if not self.cse_id:
            raise ValueError("GOOGLE_CSE_ID environment variable is required")

    async def search(
        self,
        query: str,
        num_results: int = 5,
        language: str = "lang_ar",
        safe_search: str = "active",
    ) -> List[Dict[str, Any]]:
        """
        Perform a Google search and return structured results.

        Args:
            query: Search query string
            num_results: Number of results to return (max 10)
            language: Search language (lang_ar for Arabic, lang_en for English)
            safe_search: Safe search setting (active, moderate, off)

        Returns:
            List of search result dictionaries
        """
        # Sanitize the search query
        clean_query = sanitize_user_input(query, max_length=200)
        if not clean_query:
            return []

        # Limit results to reasonable range
        num_results = min(max(1, num_results), 10)

        params = {
            "key": self.api_key,
            "cx": self.cse_id,
            "q": clean_query,
            "num": num_results,
            "lr": language,
            "safe": safe_search,
            "fields": "items(title,link,snippet,displayLink,formattedUrl)",
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(self.base_url, params=params)
                response.raise_for_status()

                data = response.json()
                items = data.get("items", [])

                # Format results for agent consumption
                results = []
                for item in items:
                    result = {
                        "title": item.get("title", ""),
                        "url": item.get("link", ""),
                        "snippet": item.get("snippet", ""),
                        "display_url": item.get("displayLink", ""),
                        "formatted_url": item.get("formattedUrl", ""),
                    }
                    results.append(result)

                return results

        except httpx.HTTPError as e:
            print(f"HTTP error during search: {e}")
            return []
        except Exception as e:
            print(f"Unexpected error during search: {e}")
            return []

    def format_search_results(self, results: List[Dict[str, Any]]) -> str:
        """
        Format search results for display to the agent/user.

        Args:
            results: List of search result dictionaries

        Returns:
            Formatted string representation of results
        """
        if not results:
            return "لم يتم العثور على نتائج بحث."

        formatted = "نتائج البحث:\n\n"
        for i, result in enumerate(results, 1):
            formatted += f"{i}. **{result['title']}**\n"
            formatted += f"   الرابط: {result['url']}\n"
            formatted += f"   الوصف: {result['snippet']}\n\n"

        return formatted

    async def search_contracts_info(self, topic: str) -> str:
        """
        Search for contract-related information on a specific topic.

        Args:
            topic: Contract topic to search for

        Returns:
            Formatted search results focused on contract information
        """
        # Create contract-specific search query
        arabic_query = f"عقد {topic} القانون السعودي شروط بنود"
        english_query = f"contract {topic} saudi law terms conditions"

        # Search in Arabic first
        arabic_results = await self.search(
            arabic_query, num_results=3, language="lang_ar"
        )

        # Search in English for additional context
        english_results = await self.search(
            english_query, num_results=2, language="lang_en"
        )

        all_results = arabic_results + english_results

        if not all_results:
            return f"لم يتم العثور على معلومات قانونية حول {topic}"

        formatted = f"معلومات قانونية حول عقود {topic}:\n\n"
        for i, result in enumerate(all_results, 1):
            formatted += f"{i}. **{result['title']}**\n"
            formatted += f"   {result['snippet']}\n"
            formatted += f"   المصدر: {result['display_url']}\n\n"

        return formatted

    async def search_legal_precedents(self, contract_type: str) -> str:
        """
        Search for legal precedents and examples for specific contract types.

        Args:
            contract_type: Type of contract (employment, service, lease, etc.)

        Returns:
            Formatted search results with legal precedents
        """
        search_query = f"نموذج عقد {contract_type} السعودية قانوني محكمة سابقة"

        results = await self.search(search_query, num_results=5, language="lang_ar")

        if not results:
            return f"لم يتم العثور على سوابق قانونية لعقود {contract_type}"

        formatted = f"سوابق ونماذج قانونية لعقود {contract_type}:\n\n"
        for i, result in enumerate(results, 1):
            formatted += f"{i}. **{result['title']}**\n"
            formatted += f"   {result['snippet']}\n"
            formatted += f"   الرابط: {result['url']}\n\n"

        return formatted


# Global search tool instance (lazy initialization)
_search_tool = None


def get_search_tool() -> GoogleSearchTool:
    """Get or create the global search tool instance."""
    global _search_tool
    if _search_tool is None:
        _search_tool = GoogleSearchTool()
    return _search_tool


async def web_search(query: str, num_results: int = 5) -> str:
    """
    Perform a web search and return formatted results.

    Args:
        query: Search query
        num_results: Number of results to return

    Returns:
        Formatted search results string
    """
    try:
        search_tool = get_search_tool()
        results = await search_tool.search(query, num_results)
        return search_tool.format_search_results(results)
    except Exception as e:
        return f"Search failed: {str(e)}"


async def contract_research(topic: str) -> str:
    """
    Research contract information for a specific topic.

    Args:
        topic: Contract topic to research

    Returns:
        Formatted research results
    """
    try:
        search_tool = get_search_tool()
        return await search_tool.search_contracts_info(topic)
    except Exception as e:
        return f"Contract research failed: {str(e)}"


async def legal_precedent_search(contract_type: str) -> str:
    """
    Search for legal precedents for a contract type.

    Args:
        contract_type: Type of contract

    Returns:
        Formatted legal precedent results
    """
    try:
        search_tool = get_search_tool()
        return await search_tool.search_legal_precedents(contract_type)
    except Exception as e:
        return f"Legal precedent search failed: {str(e)}"


# Test function for development
async def test_search():
    """Test the search functionality."""
    try:
        # Test basic search
        print("Testing basic search...")
        results = await web_search("عقد العمل السعودية", 3)
        print(results)

        # Test contract research
        print("\nTesting contract research...")
        research = await contract_research("العمل")
        print(research)

        # Test legal precedents
        print("\nTesting legal precedents...")
        precedents = await legal_precedent_search("الخدمات")
        print(precedents)

    except Exception as e:
        print(f"Test failed: {e}")


if __name__ == "__main__":
    asyncio.run(test_search())
