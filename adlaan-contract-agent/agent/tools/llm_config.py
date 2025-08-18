"""
LLM configuration for the agent.
Following best practices for LLM integration with LangGraph.
"""

import os
from typing import AsyncIterator
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


# Contract Style Code system prompt - Enhanced for Arabic contracts
CONTRACT_SYSTEM_PROMPT = """
أنت مساعد ذكي متخصص في إنشاء العقود القانونية باللغة العربية والإنجليزية. 

رموز أنواع المحتوى (للعقود فقط):
- [CH] - رأس العقد (العنوان، اسم الاتفاقية، تعريف الأطراف)
- [CB] - نص العقد الرئيسي (البنود، الشروط، الواجبات، التعويض)
- [CF] - ختام العقد (التوقيعات، الإشعارات القانونية، إخلاء المسؤولية)

تعليمات بسيطة:
1. للمحتوى العادي: اكتب بشكل طبيعي بدون رموز
2. لمحتوى العقود: أضف [CH] أو [CB] أو [CF] في نهاية الفقرات
3. الواجهة تتولى التصميم والتنسيق
4. حافظ على المحتوى مهني وقانوني

مثال على تنسيق العقد العربي:
**عقد عمل** [CH]

يُبرم هذا العقد بين الشركة والموظف في تاريخ... [CH]

يتعهد الموظف بأداء واجباته كمطور أول وتشمل... [CB]

الراتب السنوي هو 120,000 ريال يُدفع كل أسبوعين... [CB]

التوقيعات: [CF]
[مساحات التوقيع والإشعارات القانونية] [CF]

ملاحظة: أضف الرموز فقط لمحتوى العقود. المحادثات العادية لا تحتاج رموز.
"""

# Enhanced Arabic contract system prompt
ARABIC_CONTRACT_PROMPT = """
أنت خبير قانوني متخصص في صياغة العقود باللغة العربية وفقاً للقوانين السعودية والشريعة الإسلامية.

المبادئ الأساسية:
1. استخدم المصطلحات القانونية العربية الصحيحة
2. اتبع التسلسل المنطقي للعقود (مقدمة، بنود، خاتمة)
3. تأكد من الامتثال للقوانين السعودية
4. اكتب بوضوح ودقة قانونية

أنواع المحتوى:
- [CH] رأس العقد - للعناوين والتعريفات والمقدمة
- [CB] نص العقد - للبنود والشروط الأساسية
- [CF] ختام العقد - للتوقيعات والإشعارات القانونية

إرشادات الصياغة:
- ابدأ بتحديد الأطراف بوضوح
- استخدم اللغة الرسمية والدقيقة
- اشر إلى القوانين السعودية ذات الصلة
- تجنب الالتباس والغموض
- اختتم بالتوقيعات والبيانات القانونية المطلوبة
"""


def get_llm():
    """Get the configured LLM instance."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "GOOGLE_API_KEY not found in environment variables. "
            "Please set your Google API key."
        )

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.3,  # Balance between creativity and consistency
        top_p=0.8,
        top_k=40,
        max_tokens=2048,
        streaming=True,  # Enable streaming
    )

    return llm


async def get_streaming_response(
    messages: list, system_prompt: str = CONTRACT_SYSTEM_PROMPT
) -> AsyncIterator[str]:
    """
    Get streaming response from the LLM.

    Args:
        messages: List of message objects
        system_prompt: System prompt to use

    Yields:
        str: Streaming chunks of the response
    """
    llm = get_llm()

    # Prepare messages with system prompt
    full_messages = [SystemMessage(content=system_prompt)] + messages

    # Stream the response
    async for chunk in llm.astream(full_messages):
        if chunk.content:
            yield chunk.content


def create_enhanced_prompt(language: str = "arabic") -> str:
    """
    Create enhanced system prompt based on language.

    Args:
        language: "arabic" or "english"

    Returns:
        str: The appropriate system prompt
    """
    if language.lower() == "arabic":
        return ARABIC_CONTRACT_PROMPT
    else:
        return CONTRACT_SYSTEM_PROMPT
