import os
import json
from typing import Optional, List, Dict
import httpx
from core.config import settings

def get_system_prompt_for_mode(mode: str, topic_context: Optional[str] = None) -> str:
    topic_str = f"Current Topic Focus: {topic_context}." if topic_context else ""
    base = (
        "You are JavaQuest AI Mentor, an encouraging, patient, and expert Java tutor.\n"
        "Your student is learning Java and Object-Oriented Programming alongside her institute classes.\n"
        "RULES:\n"
        "1. Never immediately dump the complete solution code.\n"
        "2. Keep explanations beginner-friendly, structured, and warm.\n"
        "3. Emphasize WHY something works in Java memory/syntax.\n"
        "4. This is advisory educational mentoring, not a verified live compiler.\n"
        f"{topic_str}\n\n"
    )

    if mode == "explain":
        return base + (
            "MODE: EXPLAIN MODE\n"
            "Explain concepts simply. Use short analogies, followed by a minimal Java code example and a 3-bullet breakdown."
        )
    elif mode == "python_vs_java":
        return base + (
            "MODE: PYTHON VS JAVA MODE\n"
            "The student or her companion is familiar with Python. Compare Python syntax and runtime behaviors with Java equivalents.\n"
            "Highlight Java's static typing, class-first requirements, type declarations, and JVM bytecode vs Python's dynamic duck-typing."
        )
    elif mode == "debug":
        return base + (
            "MODE: DEBUG MODE\n"
            "Help the student identify and fix bugs without just rewriting everything for her.\n"
            "1. Explain what the compiler or runtime error actually means.\n"
            "2. Point to the specific line/mechanism that failed.\n"
            "3. Ask the student what change she thinks would resolve it before giving the fix."
        )
    elif mode == "progressive_hint":
        return base + (
            "MODE: PROGRESSIVE HINT MODE\n"
            "NEVER reveal the full solution! Give only ONE small nudge or directional hint at a time.\n"
            "Ask what she has tried and guide her thought process."
        )
    elif mode == "quiz":
        return base + (
            "MODE: QUIZ MODE\n"
            "Ask a targeted question about the current topic. Wait for her response before evaluating."
        )
    elif mode == "explain_back":
        return base + (
            "MODE: EXPLAIN IT BACK MODE\n"
            "Prompt the student to explain a concept in her own words. Review her explanation, validate what she got right, and gently correct any misconceptions."
        )
    return base

class AIMentorService:
    @staticmethod
    async def generate_response(
        mode: str,
        topic_context: Optional[str],
        messages_history: List[Dict[str, str]],
        new_user_message: str,
        hint_level: int = 0
    ) -> str:
        # Check if Gemini or OpenAI keys are present
        if settings.GEMINI_API_KEY:
            try:
                return await AIMentorService._call_gemini(mode, topic_context, messages_history, new_user_message)
            except Exception as e:
                # Fallback gracefully to smart mock
                pass

        if settings.OPENAI_API_KEY:
            try:
                return await AIMentorService._call_openai(mode, topic_context, messages_history, new_user_message)
            except Exception as e:
                # Fallback gracefully to smart mock
                pass

        # Offline Smart Mock Response
        return AIMentorService._generate_smart_mock(mode, topic_context, new_user_message, hint_level)

    @staticmethod
    async def _call_gemini(mode: str, topic_context: Optional[str], history: List[Dict[str, str]], message: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        system_prompt = get_system_prompt_for_mode(mode, topic_context)
        
        contents = [{"role": "user", "parts": [{"text": system_prompt}]}]
        for m in history[-6:]:
            role = "user" if m["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": m["content"]}]})
        contents.append({"role": "user", "parts": [{"text": message}]})

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json={"contents": contents})
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    @staticmethod
    async def _call_openai(mode: str, topic_context: Optional[str], history: List[Dict[str, str]], message: str) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        system_prompt = get_system_prompt_for_mode(mode, topic_context)
        
        messages = [{"role": "system", "content": system_prompt}]
        for m in history[-6:]:
            messages.append({"role": m["role"], "content": m["content"]})
        messages.append({"role": "user", "content": message})

        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, headers=headers, json={
                "model": "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.7
            })
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    @staticmethod
    def _generate_smart_mock(mode: str, topic_context: Optional[str], message: str, hint_level: int = 0) -> str:
        ctx = topic_context or "Java OOP"
        msg_lower = message.lower()

        if mode == "python_vs_java":
            return (
                f"### Python vs Java Comparison: {ctx}\n\n"
                "Here is how Python compares with Java on this concept:\n\n"
                "| Feature | Python | Java |\n"
                "| :--- | :--- | :--- |\n"
                "| **Typing** | Dynamic (`x = 10`) | Static (`int x = 10;`) |\n"
                "| **Classes** | Optional (can write top-level script) | Mandatory (everything in a `class`) |\n"
                "| **Access Modifiers** | Conventions (`_private`) | Keyword-enforced (`private`, `public`) |\n"
                "| **Constructors** | `__init__(self, ...)` | Same name as class `ClassName(...)` |\n"
                "| **This/Self** | Explicit parameter `self` | Implicit keyword `this` |\n\n"
                "**Equivalent Code Example:**\n\n"
                "```python\n"
                "# Python\n"
                "class Account:\n"
                "    def __init__(self, owner, balance=0):\n"
                "        self.owner = owner\n"
                "        self._balance = balance\n"
                "```\n\n"
                "```java\n"
                "// Java Equivalent\n"
                "public class Account {\n"
                "    private String owner;\n"
                "    private double balance;\n\n"
                "    public Account(String owner, double balance) {\n"
                "        this.owner = owner;\n"
                "        this.balance = balance;\n"
                "    }\n"
                "}\n"
                "```\n\n"
                "Notice how in Java, every field must specify its exact data type, and visibility is strictly controlled by `private`!"
            )
        elif mode == "progressive_hint":
            if hint_level == 0:
                return (
                    f"**Hint 1 for {ctx}:**\n\n"
                    "Before looking at the syntax, step back and ask:\n"
                    "- What is the input type and what should be returned?\n"
                    "- Which object holds the state needed for this calculation?\n\n"
                    "What data does your class currently store, and how are you trying to access it?"
                )
            elif hint_level == 1:
                return (
                    f"**Hint 2 for {ctx}:**\n\n"
                    "Think about variable scopes. In Java, if a local parameter shares the same name as an instance field, the parameter shadows the field.\n"
                    "Have you used `this.fieldName` to differentiate the instance variable from the parameter?"
                )
            else:
                return (
                    f"**Hint 3 for {ctx}:**\n\n"
                    "Check your method signature and access modifier. If you need callers from outside the package to invoke it, make sure it is marked `public` and that the return type matches what you return inside the method body."
                )
        elif mode == "debug":
            return (
                f"### Debugging Advisory for {ctx}\n\n"
                "Let's break down the issue:\n"
                "1. **Check Types**: Are you assigning a wider primitive or mismatched object reference without casting?\n"
                "2. **Check Scope & Instantiation**: Did you instantiate the object using `new` before invoking its methods? A common pitfall is `NullPointerException` when calling methods on an uninitialized reference.\n"
                "3. **Check Semicolons & Braces**: Java requires terminating semicolons on statements, but NOT on class or method declarations.\n\n"
                "Paste the exact compiler error message or snippet you are encountering, and tell me what you expect the output to be!"
            )
        elif mode == "explain_back":
            return (
                f"### Assessing Your Explanation of {ctx}\n\n"
                "**Great job taking the initiative to explain it in your own words!**\n\n"
                "- **Strong understanding:** You accurately identified the distinction between the blueprint (class) and the real instance (object).\n"
                "- **Key nuance to remember:** Remember that instance variables get fresh memory per object on the heap, whereas static variables reside in metaspace/class memory.\n\n"
                "Now try this: Can you explain how a constructor plays into this lifecycle?"
            )
        else: # explain mode
            return (
                f"### Understanding {ctx}\n\n"
                f"In Java, **{ctx}** is all about clarity, contract, and structure.\n\n"
                "1. **The Core Concept**: Instead of letting code change variables from anywhere, Java encourages encapsulating data inside objects.\n"
                "2. **Real World Analogy**: Think of a microwave oven. You press the buttons on the interface (public methods), but you cannot reach directly inside the heating magnetron (private state) while it runs.\n"
                "3. **Simple Syntax Pattern**:\n"
                "```java\n"
                "public class Microwave {\n"
                "    private int seconds = 0; // hidden data\n\n"
                "    public void start(int time) { // public interface\n"
                "        if (time > 0) {\n"
                "            this.seconds = time;\n"
                "            System.out.println(\"Cooking for \" + time + \"s\");\n"
                "        }\n"
                "    }\n"
                "}\n"
                "```\n\n"
                "What part of this concept felt most confusing during your institute lecture?"
            )
