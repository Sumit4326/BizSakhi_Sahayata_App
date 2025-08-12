import google.generativeai as genai
import os
import re
import logging
from typing import Dict, Any, Optional
import json
from dotenv import load_dotenv

# Load environment variables from the correct path
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

class AIProcessor:
    def __init__(self):
        # Initialize multiple Gemini API keys
        self.gemini_keys = [
            os.getenv("GEMINI_API_KEY_1"),
            os.getenv("GEMINI_API_KEY_2"),
            os.getenv("GEMINI_API_KEY_3")
        ]

        # Filter out None and placeholder keys
        self.gemini_keys = [key for key in self.gemini_keys if key and "your-" not in key]

        self.current_gemini_index = 0
        self.model = None
        self.api_available = False

        # Initialize alternative AI providers
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")

        # Try to initialize Gemini with first available key
        self._initialize_gemini()

    def _initialize_gemini(self):
        """Initialize Gemini AI with available API keys"""
        for i, api_key in enumerate(self.gemini_keys):
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.current_gemini_index = i
                self.api_available = True
                logging.info(f"Gemini AI initialized successfully with key {i+1}")
                return
            except Exception as e:
                logging.warning(f"Gemini API key {i+1} failed: {str(e)}")
                continue

        logging.error("All Gemini API keys failed")
        self.api_available = False

    def _get_multi_ai_response(self, prompt: str) -> str:
        """
        Get AI response using all available providers: Grok, Anthropic, Gemini
        """
        # Try Groq first - usually fastest and most reliable
        if self.groq_key and "your-" not in self.groq_key:
            try:
                logging.info("🚀 Trying Groq AI...")
                import requests

                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "messages": [{"role": "user", "content": prompt}],
                        "model": "llama3-8b-8192",
                        "temperature": 0.7,
                        "max_tokens": 1000
                    },
                    timeout=10
                )

                if response.status_code == 200:
                    result = response.json()
                    ai_response = result["choices"][0]["message"]["content"].strip()
                    logging.info("✅ Groq AI response successful!")
                    return ai_response
                else:
                    logging.warning(f"Groq AI failed: {response.status_code} - {response.text[:200]}")

            except Exception as e:
                logging.warning(f"Groq AI error: {str(e)}")

        # Try Anthropic Claude
        if self.anthropic_key and "your-" not in self.anthropic_key:
            try:
                logging.info("🤖 Trying Anthropic Claude...")
                import requests

                response = requests.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": self.anthropic_key,
                        "Content-Type": "application/json",
                        "anthropic-version": "2023-06-01"
                    },
                    json={
                        "model": "claude-3-haiku-20240307",
                        "max_tokens": 1000,
                        "messages": [{"role": "user", "content": prompt}]
                    },
                    timeout=10
                )

                if response.status_code == 200:
                    result = response.json()
                    ai_response = result["content"][0]["text"].strip()
                    logging.info("✅ Anthropic Claude response successful!")
                    return ai_response
                else:
                    logging.warning(f"Anthropic Claude failed: {response.status_code}")

            except Exception as e:
                logging.warning(f"Anthropic Claude error: {str(e)}")

        # Try Gemini as fallback
        if self.api_available and self.model:
            try:
                logging.info("🔮 Trying Gemini AI (fallback)...")
                response = self.model.generate_content(prompt)
                ai_response = response.text.strip()
                logging.info("✅ Gemini AI response successful!")
                return ai_response
            except Exception as e:
                logging.warning(f"Gemini AI error: {str(e)}")

        # Final fallback
        logging.warning("All AI providers failed, using fallback response")
        return "I can analyze this image. It appears to contain visual content that I can process."

    def _rotate_gemini_key(self):
        """Rotate to next Gemini API key when current one fails"""
        if len(self.gemini_keys) <= 1:
            logging.warning("No additional Gemini keys available for rotation")
            return False

        original_index = self.current_gemini_index

        # Try each remaining key
        for _ in range(len(self.gemini_keys) - 1):
            self.current_gemini_index = (self.current_gemini_index + 1) % len(self.gemini_keys)
            next_key = self.gemini_keys[self.current_gemini_index]

            try:
                genai.configure(api_key=next_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logging.info(f"Successfully rotated to Gemini API key {self.current_gemini_index + 1}")
                return True
            except Exception as e:
                logging.warning(f"Gemini key {self.current_gemini_index + 1} also failed: {str(e)}")
                continue

        # All keys failed, reset to original
        self.current_gemini_index = original_index
        logging.error("All Gemini API keys have failed")
        return False

    def _try_alternative_ai(self, prompt: str) -> str:
        """Try alternative AI providers when Gemini fails"""

        # Try Groq (very fast and free)
        if self.groq_key and "your-groq" not in self.groq_key:
            try:
                import requests

                headers = {
                    "Authorization": f"Bearer {self.groq_key}",
                    "Content-Type": "application/json"
                }

                data = {
                    "messages": [{"role": "user", "content": prompt}],
                    "model": "llama3-8b-8192",
                    "max_tokens": 2000,
                    "temperature": 0.3
                }

                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=10
                )

                if response.status_code == 200:
                    result = response.json()
                    logging.info("Used Groq Llama3 as fallback")
                    return result["choices"][0]["message"]["content"]

            except Exception as e:
                logging.warning(f"Groq failed: {str(e)}")

        # Try Anthropic Claude (high quality alternative)
        if self.anthropic_key and "your-anthropic" not in self.anthropic_key:
            try:
                import requests

                headers = {
                    "x-api-key": self.anthropic_key,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                }

                data = {
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 2000,
                    "messages": [{"role": "user", "content": prompt}]
                }

                response = requests.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=headers,
                    json=data,
                    timeout=10
                )

                if response.status_code == 200:
                    result = response.json()
                    logging.info("Used Anthropic Claude as fallback")
                    return result["content"][0]["text"]

            except Exception as e:
                logging.warning(f"Anthropic failed: {str(e)}")

        # If all alternatives fail, return None
        logging.error("All AI providers failed")
        return None

    def _parse_alternative_response(self, response_text: str) -> Dict[str, Any]:
        """Parse and validate response from alternative AI providers"""
        try:
            # Clean up the response
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()

            result = json.loads(response_text)
            result = self._validate_gemini_result(result)

            # Ensure required fields exist
            if 'confidence' not in result:
                result['confidence'] = 0.8
            if 'action' not in result:
                result['action'] = 'add_multiple'
            if 'intent' not in result:
                result['intent'] = 'business_transaction'

            return result

        except Exception as e:
            logging.error(f"Failed to parse alternative AI response: {str(e)}")
            return None

    def parse_intent(self, message: str, language: str = "en", chat_mode: str = "general") -> Dict[str, Any]:
        """
        Parse user intent and provide conversational responses about the business app
        """
        try:
            # Only run fast pattern detection in business mode
            if chat_mode == "business":
                fast_result = self._fast_pattern_detection(message, language)
                if fast_result:
                    logging.info("✅ Fast pattern detection successful - skipping AI call")
                    return fast_result

            # Use multi-AI system for complex queries
            return self._process_conversational_query(message, language, chat_mode)

        except Exception as e:
            logging.warning(f"Conversational AI failed: {str(e)}")
            return self._create_simple_response(message, language)

    def _fast_pattern_detection(self, message: str, language: str = "en") -> Dict[str, Any]:
        """
        Fast pattern-based detection for simple income/expense statements
        Returns result immediately without AI call for common patterns
        """
        import re

        message_lower = message.lower().strip()

        # Income patterns
        income_patterns = [
            # English patterns
            r'income\s+(?:is\s+)?(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'earned\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'received\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'got\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'made\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            # Hindi patterns
            r'आय\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'कमाई\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'मिला\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'पाया\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            # Simple patterns
            r'(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:income|आय|कमाई)',
            r'(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:earned|कमाया)',
        ]

        # Expense patterns - Only match explicit transaction statements
        expense_patterns = [
            # English patterns - Only explicit expense statements
            r'expense\s+(?:is\s+)?(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'spent\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'paid\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'cost\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            # Only match "bought" if it's a clear transaction statement (not in questions)
            r'^(?:i\s+)?bought\s+(?:for\s+)?(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)(?:\s|$)(?!.*\?)',
            # Hindi patterns
            r'खर्च\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'खर्चा\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'दिया\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            r'लगा\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)',
            # Simple patterns - Only explicit statements
            r'(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:expense|खर्च|खर्चा)',
            r'(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:spent|खर्च किया)',
        ]

        # Check for income patterns
        for pattern in income_patterns:
            match = re.search(pattern, message_lower)
            if match:
                # Skip if this looks like a question or calculation
                if any(word in message_lower for word in ['how much', 'what', 'calculate', 'loss', 'profit', 'percent', 'percentage', 'if', 'when', 'why', 'where', 'who', '?', 'how', 'tell me', 'explain']):
                    continue
                    
                amount_str = match.group(1).replace(',', '')
                try:
                    amount = float(amount_str)
                    if amount > 0:
                        response_msg = self._get_success_message("income", amount, language)
                        return {
                            "intent": "income",
                            "action": "add",
                            "confidence": 0.95,
                            "data": {
                                "amount": amount,
                                "description": f"Income - ₹{amount}",
                                "category": "General"
                            },
                            "response_message": response_msg,
                            "is_business_related": True,
                            "fast_detection": True
                        }
                except ValueError:
                    continue

        # Check for expense patterns
        for pattern in expense_patterns:
            match = re.search(pattern, message_lower)
            if match:
                # Skip if this looks like a question or calculation
                if any(word in message_lower for word in ['how much', 'what', 'calculate', 'loss', 'profit', 'percent', 'percentage', 'if', 'when', 'why', 'where', 'who', '?', 'how', 'tell me', 'explain']):
                    continue
                    
                amount_str = match.group(1).replace(',', '')
                try:
                    amount = float(amount_str)
                    if amount > 0:
                        response_msg = self._get_success_message("expense", amount, language)
                        return {
                            "intent": "expense",
                            "action": "add",
                            "confidence": 0.95,
                            "data": {
                                "amount": amount,
                                "description": f"Expense - ₹{amount}",
                                "category": "General"
                            },
                            "response_message": response_msg,
                            "is_business_related": True,
                            "fast_detection": True
                        }
                except ValueError:
                    continue

        # No pattern matched
        return None

    def _get_success_message(self, transaction_type: str, amount: float, language: str) -> str:
        """Generate success message for fast pattern detection"""
        if language == "hi":
            if transaction_type == "income":
                return f"✅ ₹{amount} की आय सफलतापूर्वक दर्ज की गई!"
            else:
                return f"✅ ₹{amount} का खर्च सफलतापूर्वक दर्ज किया गया!"
        elif language == "ta":
            if transaction_type == "income":
                return f"✅ ₹{amount} வருமானம் வெற்றிகரமாக பதிவு செய்யப்பட்டது!"
            else:
                return f"✅ ₹{amount} செலவு வெற்றிகரமாக பதிவு செய்யப்பட்டது!"
        elif language == "ml":
            if transaction_type == "income":
                return f"✅ ₹{amount} വരുമാനം വിജയകരമായി രേഖപ്പെടുത്തി!"
            else:
                return f"✅ ₹{amount} ചെലവ് വിജയകരമായി രേഖപ്പെടുത്തി!"
        else:  # English
            if transaction_type == "income":
                return f"✅ Income of ₹{amount} recorded successfully!"
            else:
                return f"✅ Expense of ₹{amount} recorded successfully!"

    def _process_conversational_query(self, message: str, language: str = "en", chat_mode: str = "general") -> Dict[str, Any]:
        """
        Process conversational queries about the business app using multi-AI system
        """
        prompt = f"""
        You are Sakhi, an intelligent business assistant for BizSakhi - a comprehensive business management app for Indian small businesses. You can answer ANY questions about business management, the app features, and help users with their business needs.

        User Message: "{message}"
        Language: {language}
        Chat Mode: {chat_mode}

        CHAT MODE BEHAVIOR:
        - GENERAL MODE: Focus on answering questions, providing advice, and calculations. DO NOT automatically record transactions unless explicitly requested.
        - BUSINESS MODE: Automatically detect and record business transactions (income, expenses, inventory) when mentioned.

        IMPORTANT: Always respond in the specified language:
        - If language is "en", respond in English
        - If language is "hi", respond in Hindi (हिन्दी)
        - If language is "ta", respond in Tamil (தமிழ்)
        - If language is "ml", respond in Malayalam (മലയാളം)
        - If language is "te", respond in Telugu (తెలుగు)
        - If language is "kn", respond in Kannada (ಕನ್ನಡ)
        - If language is "gu", respond in Gujarati (ગુજરાતી)
        - If language is "bn", respond in Bengali (বাংলা)
        - If language is "mr", respond in Marathi (मराठी)
        - Match the user's language preference exactly

        Your Role & Capabilities:
        - DETECT and PROCESS business transactions (income, expenses, inventory)
        - Help with expense tracking, income management, inventory control
        - Explain app features and how to use them
        - Provide business advice and tips
        - Answer questions about Indian business practices, GST, accounting
        - Help with bill processing, OCR, receipt management
        - Discuss business growth strategies, cost optimization
        - Explain financial concepts in simple terms

        TRANSACTION DETECTION:
        IMPORTANT: Only detect and process transactions in BUSINESS MODE. In GENERAL MODE, treat these as questions.

        BUSINESS MODE (chat_mode = "business"):
        1. INCOME STATEMENTS: If user mentions income/earning/received money, return "intent": "income" with amount
        2. EXPENSE STATEMENTS: If user mentions spending/expense/paid money, return "intent": "expense" with amount
        3. ITEM TRANSACTIONS: If user mentions buying/selling items with quantities, return "intent": "item_clarification"

        GENERAL MODE (chat_mode = "general"):
        1. Treat all financial mentions as questions for advice/calculations
        2. Provide helpful responses without recording transactions
        3. Only record if user explicitly says "add", "record", "save", etc.

        Examples:
        BUSINESS MODE:
        - "income is Rs 10000" → INCOME (amount: 10000)
        - "I earned Rs 5000" → INCOME (amount: 5000)
        - "expense is Rs 2000" → EXPENSE (amount: 2000)
        - "I spent Rs 1500" → EXPENSE (amount: 1500)
        - "I bought 5 phones for Rs.125000" → ITEM_CLARIFICATION

        GENERAL MODE:
        - "if i charge 10 rs for something i bought for 15rs how much loss?" → CONVERSATIONAL (calculate loss)
        - "what's the profit if I sell at Rs 200?" → CONVERSATIONAL (provide calculation)
        - "tell me about my profit and loss" → QUERY (fetch actual data)
        - "what's my total income?" → QUERY (fetch actual data)
        - "How do I add inventory?" → CONVERSATIONAL (provide advice)

        App Features You Can Discuss:
        - Image OCR for bills/receipts (supports handwritten & printed)
        - Automatic expense/income/inventory categorization
        - Voice chat and text chat
        - Multi-language support (Hindi/English/Tamil/Malayalam)
        - Business analytics and summaries
        - Clear data options (expenses, income, chat history)
        - Smart inventory management for resellers

        DEVELOPER INFORMATION:
        If asked about who developed/created BizSakhi or who the developers are, respond:
        "BizSakhi was developed by Nithin and Sharlet, two best friends who came up with this idea to help small businesses in India manage their operations better."

        In Hindi: "BizSakhi को Nithin और Sharlet ने बनाया है, जो दो सबसे अच्छे दोस्त हैं और उन्होंने भारत के छोटे व्यापारियों की मदद के लिए यह आइडिया सोचा है।"

        In Tamil: "BizSakhi-ஐ Nithin மற்றும் Sharlet என்ற இரு சிறந்த நண்பர்கள் உருவாக்கியுள்ளனர், அவர்கள் இந்தியாவில் உள்ள சிறு வணிகங்களுக்கு உதவ இந்த யோசனையை கொண்டு வந்தனர்।"

        In Malayalam: "BizSakhi-യെ Nithin ഉം Sharlet ഉം എന്ന രണ്ട് ഉറ്റ സുഹൃത്തുക്കൾ വികസിപ്പിച്ചെടുത്തു, അവർ ഇന്ത്യയിലെ ചെറുകിട ബിസിനസുകളെ സഹായിക്കാൻ ഈ ആശയം കൊണ്ടുവന്നു।"

        Guidelines:
        - Be conversational, helpful, and friendly
        - Focus on business and app-related topics
        - If asked about non-business topics, politely redirect to business matters
        - Provide practical, actionable advice
        - Use simple language, especially for financial concepts
        - Support both Hindi and English responses

        TRANSACTION PROCESSING:
        IMPORTANT: Only process transactions in BUSINESS MODE. In GENERAL MODE, provide advice instead.

        BUSINESS MODE: If the message contains transaction information (bought, sold, purchased, added inventory), return:
        {{
            "intent": "item_clarification",
            "action": "clarify",
            "confidence": 0.9,
            "data": {{
                "items": [
                    {{
                        "name": "Samsung Galaxy",
                        "quantity": 5,
                        "amount": 125000,
                        "cost_per_unit": 25000,
                        "unit": "pieces",
                        "suggested_category": "inventory",
                        "description": "Samsung Galaxy phones"
                    }}
                ]
            }},
            "response_message": "I found 5 Samsung Galaxy phones for Rs.125000. Please review and confirm the categorization below:",
            "is_business_related": true,
            "needs_clarification": true
        }}

        IMPORTANT: Always extract both total amount and calculate cost_per_unit = amount / quantity. Set suggested_category to "inventory" for resale items, "expense" for consumed items.

        INCOME PROCESSING:
        BUSINESS MODE: For income statements like "income is Rs 10000", return:
        {{
            "intent": "income",
            "action": "add",
            "confidence": 0.9,
            "data": {{
                "amount": 10000,
                "description": "Income",
                "category": "General"
            }},
            "response_message": "✅ Income of Rs.10000 has been recorded successfully!" if language=="en" else "✅ ₹10000 की आय सफलतापूर्वक दर्ज की गई!",
            "is_business_related": true
        }}

        GENERAL MODE: For income questions like "what if I earn Rs 10000", provide advice without recording.

        EXPENSE PROCESSING:
        BUSINESS MODE: For expense statements like "expense is Rs 2000", return:
        {{
            "intent": "expense",
            "action": "add",
            "confidence": 0.9,
            "data": {{
                "amount": 2000,
                "description": "Expense",
                "category": "General"
            }},
            "response_message": "✅ Expense of Rs.2000 has been recorded successfully!" if language=="en" else "✅ ₹2000 का खर्च सफलतापूर्वक दर्ज किया गया!",
            "is_business_related": true
        }}

        GENERAL MODE: For expense questions like "what if I spend Rs 2000", provide advice without recording.

        QUERY RESPONSES:
        For questions asking about existing data (profit/loss, income summary, expense summary), return:
        {{
            "intent": "query",
            "action": "query",
            "confidence": 0.9,
            "data": {{}},
            "response_message": "Let me check your profit and loss data..." if language=="en" else "मैं आपके लाभ-हानि की जानकारी देख रही हूँ...",
            "is_business_related": true
        }}

        CONVERSATIONAL RESPONSES:
        For general questions/advice, return:
        {{
            "intent": "conversational",
            "action": "respond",
            "confidence": 0.9,
            "data": {{}},
            "response_message": "Your helpful response about business/app in the specified language ({language})",
            "is_business_related": true
        }}

        OFF-TOPIC REDIRECT:
        If completely unrelated to business/app, respond politely:
        {{
            "intent": "off_topic",
            "action": "redirect",
            "confidence": 0.9,
            "data": {{}},
            "response_message": "I'm your business assistant focused on helping with BizSakhi app and business management. How can I help you with your business today?",
            "is_business_related": false
        }}
        """

        # Try multi-AI system for conversational responses
        for attempt in range(len(self.gemini_keys)):
            try:
                if self.api_available and self.model:
                    response = self.model.generate_content(prompt)
                    result_text = response.text.strip()

                    # Clean up response
                    if result_text.startswith('```json'):
                        result_text = result_text.replace('```json', '').replace('```', '').strip()
                    elif result_text.startswith('```'):
                        result_text = result_text.replace('```', '').strip()

                    result = json.loads(result_text)

                    # Ensure required fields
                    if 'intent' not in result:
                        result['intent'] = 'conversational'
                    if 'action' not in result:
                        result['action'] = 'respond'
                    if 'confidence' not in result:
                        result['confidence'] = 0.8

                    logging.info(f"Conversational AI response generated successfully")
                    return result

            except Exception as e:
                logging.warning(f"Gemini key {self.current_gemini_index + 1} failed for conversation: {str(e)}")
                if not self._rotate_gemini_key():
                    break

        # Try alternative AI for conversation
        try:
            alternative_response = self._try_alternative_ai(prompt)
            if alternative_response:
                if alternative_response.startswith('```json'):
                    alternative_response = alternative_response.replace('```json', '').replace('```', '').strip()
                elif alternative_response.startswith('```'):
                    alternative_response = alternative_response.replace('```', '').strip()

                result = json.loads(alternative_response)

                # Ensure required fields
                if 'intent' not in result:
                    result['intent'] = 'conversational'
                if 'action' not in result:
                    result['action'] = 'respond'
                if 'confidence' not in result:
                    result['confidence'] = 0.8

                logging.info("Alternative AI provided conversational response")
                return result

        except Exception as e:
            logging.warning(f"Alternative AI conversation failed: {str(e)}")

        # Fallback to simple response
        return self._create_simple_response(message, language)

    def _create_simple_response(self, message: str, language: str = "en") -> Dict[str, Any]:
        """
        Create a simple fallback response when AI is not available
        """
        message_lower = message.lower()

        # Business-related keywords
        business_keywords = [
            'expense', 'income', 'inventory', 'business', 'money', 'profit', 'loss',
            'bill', 'receipt', 'invoice', 'gst', 'tax', 'sale', 'purchase', 'cost',
            'revenue', 'account', 'finance', 'budget', 'cash', 'payment', 'customer',
            'supplier', 'stock', 'product', 'service', 'app', 'feature', 'help'
        ]

        # Check if message is business-related
        is_business_related = any(keyword in message_lower for keyword in business_keywords)

        if is_business_related:
            if language == "hi":
                response = "मैं आपका व्यापारिक सहायक हूँ। मैं खर्च, आय, और इन्वेंटरी के साथ आपकी मदद कर सकता हूँ। कृपया अपना सवाल स्पष्ट करें।"
            else:
                response = "I'm your business assistant! I can help you with expenses, income, inventory management, and app features. Please let me know what you'd like to know about your business or the BizSakhi app."

            return {
                "intent": "conversational",
                "action": "respond",
                "confidence": 0.6,
                "data": {},
                "response_message": response,
                "is_business_related": True
            }
        else:
            if language == "hi":
                response = "मैं BizSakhi का व्यापारिक सहायक हूँ। मैं व्यापार और ऐप की सुविधाओं के बारे में मदद कर सकता हूँ। आज आपके व्यापार में मैं कैसे मदद कर सकता हूँ?"
            else:
                response = "I'm your BizSakhi business assistant focused on helping with business management and app features. How can I help you with your business today?"

            return {
                "intent": "off_topic",
                "action": "redirect",
                "confidence": 0.8,
                "data": {},
                "response_message": response,
                "is_business_related": False
            }
    
    def analyze_image_scene(self, comprehensive_analysis: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        """
        Google Lens-like image analysis using Azure Computer Vision data + AI
        """
        try:
            # Extract data from comprehensive analysis
            scene_description = comprehensive_analysis.get("scene_description", "")
            detected_objects = comprehensive_analysis.get("detected_objects", [])
            detected_brands = comprehensive_analysis.get("detected_brands", [])
            tags = comprehensive_analysis.get("tags", [])
            categories = comprehensive_analysis.get("categories", [])
            ocr_text = comprehensive_analysis.get("ocr_text", "")
            color_info = comprehensive_analysis.get("color_info", {})

            # Build context for AI analysis
            context_parts = []

            if scene_description:
                context_parts.append(f"Scene: {scene_description}")

            if detected_objects:
                objects_list = [f"{obj.get('name', 'unknown')} ({obj.get('confidence', 0):.2f})" for obj in detected_objects[:5]]
                context_parts.append(f"Objects detected: {', '.join(objects_list)}")

            if detected_brands:
                brands_list = [f"{brand.get('name', 'unknown')} ({brand.get('confidence', 0):.2f})" for brand in detected_brands]
                context_parts.append(f"Brands detected: {', '.join(brands_list)}")

            if tags:
                high_confidence_tags = [tag.get('name', 'unknown') for tag in tags if tag.get('confidence', 0) > 0.7]
                if high_confidence_tags:
                    context_parts.append(f"Key features: {', '.join(high_confidence_tags[:8])}")

            if categories:
                category_names = [cat.get('name', 'unknown') for cat in categories if cat.get('score', 0) > 0.3]
                if category_names:
                    context_parts.append(f"Categories: {', '.join(category_names)}")

            if ocr_text.strip():
                context_parts.append(f"Text found: {ocr_text[:200]}...")

            if color_info:
                dominant_colors = color_info.get('dominantColors', [])
                if dominant_colors:
                    context_parts.append(f"Dominant colors: {', '.join(dominant_colors[:3])}")

            # Create AI prompt for Google Lens-like analysis
            analysis_context = "\n".join(context_parts) if context_parts else "Image analysis data available"

            prompt = f"""
            You are an AI assistant that analyzes images like Google Lens. Based on the computer vision analysis below, provide a helpful, conversational response about what you see in the image.

            COMPUTER VISION ANALYSIS:
            {analysis_context}

            INSTRUCTIONS:
            1. Act like Google Lens - be conversational and helpful
            2. Describe what you see in the image in a natural way
            3. If you detect products, brands, or items, mention them
            4. If there's text, summarize what it says
            5. If it looks like a receipt/bill, offer to help extract items
            6. If it's a business-related image, offer relevant assistance
            7. Be concise but informative
            8. Respond in {"Hindi" if language == "hi" else "English"}

            EXAMPLE RESPONSES:
            - "I can see this is a receipt from [store name]. It shows purchases of [items]. Would you like me to help you add these items to your business records?"
            - "This appears to be a product photo showing [brand] [product]. I can see [details]. Is this something you'd like to add to your inventory?"
            - "I can see this is a document with text about [topic]. The main content appears to be [summary]."

            Provide a helpful, Google Lens-style response:
            """

            # Get AI response using multi-provider system (Grok, Anthropic, Gemini)
            ai_response = self._get_multi_ai_response(prompt)

            if ai_response and ai_response.strip():
                return {
                    "intent": "image_analysis",
                    "action": "scene_description",
                    "confidence": 0.9,
                    "response_message": ai_response.strip(),
                    "analysis_data": {
                        "scene_description": scene_description,
                        "detected_objects": detected_objects,
                        "detected_brands": detected_brands,
                        "tags": tags,
                        "categories": categories,
                        "ocr_text": ocr_text,
                        "color_info": color_info
                    }
                }
            else:
                # Fallback response
                fallback_msg = "मैं इस इमेज को देख सकता हूं।" if language == "hi" else "I can see this image."
                if scene_description:
                    fallback_msg = f"मैं देख सकता हूं कि यह {scene_description} है।" if language == "hi" else f"I can see this is {scene_description}."

                return {
                    "intent": "image_analysis",
                    "action": "scene_description",
                    "confidence": 0.7,
                    "response_message": fallback_msg,
                    "analysis_data": comprehensive_analysis
                }

        except Exception as e:
            logging.error(f"Error in image scene analysis: {str(e)}")
            return {
                "intent": "image_analysis",
                "action": "scene_description",
                "confidence": 0.5,
                "response_message": "मैं इस इमेज का विश्लेषण कर सकता हूं।" if language == "hi" else "I can analyze this image.",
                "error": str(e)
            }

    def process_ocr_text(self, ocr_text: str, language: str = "en") -> Dict[str, Any]:
        """
        Process OCR extracted text to structure business data using multi-AI system
        """
        # Validate input
        if not ocr_text or not ocr_text.strip():
            logging.warning("Empty OCR text provided")
            return self._create_fallback_response("", language)

        logging.info(f"Processing OCR text: {len(ocr_text)} characters")

        # Always try AI first - don't pre-judge OCR quality
        if len(self.gemini_keys) > 0 or self.groq_key or self.anthropic_key:
            try:
                logging.info("Attempting AI processing with all available providers...")
                result = self._process_with_gemini(ocr_text, language)

                # Check if we got meaningful results
                if result and result.get('data'):
                    items = result['data'].get('items', [])
                    clear_items = result['data'].get('clear_items', [])
                    unclear_items = result['data'].get('unclear_items', [])

                    total_items = len(items) + len(clear_items) + len(unclear_items)

                    if total_items > 0:
                        logging.info(f"AI processing successful: {total_items} items found")
                        return result
                    else:
                        logging.warning("AI returned no items, trying pattern matching")
                else:
                    logging.warning("AI returned empty/invalid result, trying pattern matching")

            except Exception as e:
                logging.warning(f"AI processing failed: {str(e)}, trying pattern matching")
        else:
            logging.info("No AI providers available, using pattern matching")

        # Fallback to pattern matching
        logging.info("Using pattern matching fallback")
        return self._create_fallback_response(ocr_text, language)


    def _process_with_gemini(self, ocr_text: str, language: str = "en") -> Dict[str, Any]:
        """
        Use Gemini AI (with rotation) or alternative AI to intelligently parse OCR text
        """
        # First, clean and validate the OCR text
        cleaned_ocr = self._clean_ocr_text(ocr_text)

        prompt = f"""
        You are Sakhi, an expert business assistant. The OCR text below may contain errors and garbage. Your job is to:

        1. CLEAN THE OCR TEXT: Fix OCR errors, remove garbage text, and identify real product names
        2. EXTRACT REAL ITEMS: Only extract items that are actual products/services with valid names
        3. CATEGORIZE INTELLIGENTLY: Determine if items are for business use or resale

        RAW OCR TEXT (may contain errors):
        {cleaned_ocr}

        STRICT FILTERING RULES:
        - REJECT items with garbage names like "nAce A", "Nonn)", "xxx", "daten", random characters
        - REJECT invoice metadata like dates, GST numbers, addresses, tax details
        - REJECT unclear text fragments that don't represent real products
        - ONLY ACCEPT items with recognizable product names (minimum 3 characters, real words)

        ITEM CATEGORIZATION:
        - INVENTORY: Items purchased for resale/stock (mobile phones, electronics, laptops, tablets, clothing, books, stationery, products, goods, merchandise)
        - EXPENSE: Items consumed/used (food, beverages, fuel, services, rent, utilities, office supplies for own use, consumables, personal items)
        - INCOME: Sales receipts, payments received from customers, money received

        INVENTORY PRIORITY: When in doubt, items like phones, electronics, books, clothing should go to INVENTORY unless explicitly mentioned as "for office use" or "personal use".

        QUALITY CONTROL:
        - If OCR text is too corrupted or contains mostly garbage, return empty items array
        - Only extract items you're confident are real products
        - Provide meaningful product names, not OCR artifacts

        Return JSON:
        {{
            "intent": "business_analysis",
            "action": "categorize_items",
            "confidence": 0.9,
            "data": {{
                "ocr_quality": "good|poor|terrible",
                "clear_items": [
                    {{
                        "name": "Samsung Galaxy A54",
                        "quantity": 5,
                        "amount": 125000,
                        "unit_price": 25000,
                        "category": "inventory",
                        "reason": "Mobile phones are typically purchased for resale",
                        "confidence": "high"
                    }}
                ],
                "unclear_items": [
                    {{
                        "name": "Office Supplies",
                        "quantity": 10,
                        "amount": 500,
                        "unit_price": 50,
                        "category": "unclear",
                        "options": ["expense", "inventory"],
                        "question": "Are these office supplies for your business use or for selling?"
                    }}
                ],
                "rejected_items": [
                    {{
                        "raw_text": "nAce A",
                        "reason": "OCR garbage - not a recognizable product name"
                    }}
                ],
                "total_amount": 125000,
                "vendor": "Electronics Store"
            }},
            "needs_clarification": false,
            "response_message": "Found 1 clear item. Rejected 1 OCR error."
        }}

        IMPORTANT: Try your best to extract meaningful information even from poor OCR. Only return ocr_failed if the text is completely unreadable gibberish with no recognizable words or numbers.
        """

        # Use multi-AI system (Grok, Anthropic, Gemini)
        logging.info("🤖 Using multi-AI system for OCR processing...")
        result_text = self._get_multi_ai_response(prompt)

        if result_text:
            try:
                logging.info(f"Multi-AI response: {result_text[:500]}...")

                # Clean up the response
                if result_text.startswith('```json'):
                    result_text = result_text.replace('```json', '').replace('```', '').strip()
                elif result_text.startswith('```'):
                    result_text = result_text.replace('```', '').strip()

                result = json.loads(result_text)
                result = self._validate_gemini_result(result)

                # Ensure required fields exist
                if 'confidence' not in result:
                    result['confidence'] = 0.8
                if 'action' not in result:
                    result['action'] = 'add_multiple'
                if 'intent' not in result:
                    result['intent'] = 'business_transaction'

                logging.info(f"Multi-AI processed OCR successfully: {len(result.get('data', {}).get('items', []))} items found")
                return result

            except Exception as e:
                error_msg = str(e)
                logging.warning(f"Gemini key {self.current_gemini_index + 1} failed: {error_msg}")

                # Check if it's a quota error
                if "quota" in error_msg.lower() or "429" in error_msg:
                    logging.warning(f"Quota exceeded for Gemini key {self.current_gemini_index + 1}")
                elif "json" in error_msg.lower():
                    logging.warning(f"JSON parsing error for Gemini key {self.current_gemini_index + 1}")

                logging.warning(f"Multi-AI system failed: {error_msg}")

        # Fallback if multi-AI fails
        logging.warning("Multi-AI system failed, using fallback response")

        try:
            alternative_response = self._try_alternative_ai(prompt)
            if alternative_response:
                # Clean up the response
                if alternative_response.startswith('```json'):
                    alternative_response = alternative_response.replace('```json', '').replace('```', '').strip()
                elif alternative_response.startswith('```'):
                    alternative_response = alternative_response.replace('```', '').strip()

                result = json.loads(alternative_response)
                result = self._validate_gemini_result(result)

                # Ensure required fields exist
                if 'confidence' not in result:
                    result['confidence'] = 0.8
                if 'action' not in result:
                    result['action'] = 'add_multiple'
                if 'intent' not in result:
                    result['intent'] = 'business_transaction'

                logging.info(f"Alternative AI processed OCR successfully: {len(result.get('data', {}).get('items', []))} items found")
                return result

        except Exception as e:
            logging.error(f"Alternative AI processing failed: {str(e)}")

        # If all AI providers fail, raise exception to fall back to pattern matching
        raise Exception("All AI providers failed")

    def _clean_ocr_text(self, ocr_text: str) -> str:
        """
        Clean and preprocess OCR text to remove obvious garbage and improve AI processing
        """
        if not ocr_text:
            return ""

        import re

        # Split into lines and clean each line
        lines = ocr_text.split('\n')
        cleaned_lines = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Remove lines that are clearly garbage
            if len(line) < 2:
                continue

            # Remove lines with too many special characters
            special_char_ratio = len(re.findall(r'[^a-zA-Z0-9\s₹\-\.]', line)) / len(line)
            if special_char_ratio > 0.5:
                continue

            # Remove lines that are mostly numbers without context
            if re.match(r'^[\d\s\-\.]+$', line) and len(line) < 10:
                continue

            # Remove obvious invoice metadata patterns
            metadata_patterns = [
                r'^\d{1,2}/\d{1,2}/\d{4}$',  # Dates
                r'^GST[IN]*\s*:',  # GST numbers
                r'^[A-Z]{2}\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$',  # GST format
                r'^Invoice\s*#',  # Invoice numbers
                r'^Bill\s*No',  # Bill numbers
                r'^Total\s*:?\s*₹?\s*\d+$',  # Total lines
                r'^Sub\s*Total',  # Subtotal
                r'^Tax\s*:',  # Tax lines
                r'^CGST|SGST|IGST',  # Tax types
            ]

            is_metadata = False
            for pattern in metadata_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    is_metadata = True
                    break

            if is_metadata:
                continue

            # Clean up common OCR errors
            line = re.sub(r'[|]', 'I', line)  # | to I
            line = re.sub(r'[0O]', 'O', line)  # Normalize O/0
            line = re.sub(r'\s+', ' ', line)  # Multiple spaces to single

            cleaned_lines.append(line)

        # Join cleaned lines
        cleaned_text = '\n'.join(cleaned_lines)

        # Additional cleaning
        cleaned_text = re.sub(r'\n\s*\n', '\n', cleaned_text)  # Remove empty lines
        cleaned_text = cleaned_text.strip()

        logging.info(f"OCR cleaning: {len(ocr_text)} → {len(cleaned_text)} characters")
        return cleaned_text

    def _is_valid_item_name(self, name: str) -> bool:
        """
        Validate if an item name is a real product name and not OCR garbage
        """
        if not name or len(name) < 3:
            return False

        import re

        # Remove common OCR artifacts and clean
        cleaned_name = re.sub(r'[^\w\s\-\.]', '', name).strip()

        # Reject if too short after cleaning
        if len(cleaned_name) < 3:
            return False

        # Reject obvious garbage patterns
        garbage_patterns = [
            r'^[a-z]{1,2}[A-Z][a-z]?\s*[A-Z]?$',  # nAce A, xYz B
            r'^[A-Z]{1,2}[a-z]{1,2}[A-Z]?$',  # Nonn, Abc
            r'^[a-zA-Z]{1,3}$',  # xxx, abc, XYZ
            r'^\d+[a-zA-Z]{1,2}$',  # 2x, 5a
            r'^[a-zA-Z]\d+$',  # A1, x5
            r'^[^\w\s]+$',  # Only special characters
            r'^general$',  # Generic "general"
            r'^item$',  # Generic "item"
            r'^product$',  # Generic "product"
        ]

        for pattern in garbage_patterns:
            if re.match(pattern, cleaned_name, re.IGNORECASE):
                return False

        # Reject invoice metadata
        metadata_keywords = [
            'invoice', 'bill', 'receipt', 'gstin', 'gst', 'tax', 'cgst', 'sgst', 'igst',
            'total', 'subtotal', 'amount', 'date', 'time', 'address', 'phone', 'email',
            'challan', 'voucher', 'reference', 'serial', 'number', 'code'
        ]

        for keyword in metadata_keywords:
            if keyword in cleaned_name.lower():
                return False

        # Reject if mostly numbers
        digit_ratio = len(re.findall(r'\d', cleaned_name)) / len(cleaned_name)
        if digit_ratio > 0.7:
            return False

        # Reject if too many uppercase letters (likely OCR error)
        upper_ratio = len(re.findall(r'[A-Z]', cleaned_name)) / len(cleaned_name)
        if upper_ratio > 0.6 and len(cleaned_name) < 10:
            return False

        # Must contain at least one vowel (real words have vowels)
        if not re.search(r'[aeiouAEIOU]', cleaned_name):
            return False

        # Must have reasonable character distribution
        unique_chars = len(set(cleaned_name.lower().replace(' ', '')))
        if unique_chars < 3 and len(cleaned_name) > 5:
            return False

        return True

    def _validate_gemini_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and clean Gemini AI result with new clear/unclear item structure
        """
        # Ensure required fields exist
        if 'data' not in result:
            result['data'] = {}

        # Check OCR quality - be more lenient, only reject if completely unusable
        ocr_quality = result['data'].get('ocr_quality', 'unknown')
        if result.get('intent') == 'ocr_failed' and ocr_quality == 'terrible':
            # Only fail if AI explicitly says it's completely unusable
            items = result['data'].get('clear_items', []) + result['data'].get('unclear_items', [])
            if len(items) == 0:
                logging.warning("OCR quality is terrible and no items extracted, returning failure response")
                return {
                    "intent": "ocr_failed",
                    "action": "retry",
                    "confidence": 0.1,
                    "data": {
                        "ocr_quality": "terrible",
                        "clear_items": [],
                        "unclear_items": [],
                        "expense_items": [],
                        "inventory_items": [],
                        "income_items": []
                    },
                    "response_message": "OCR text quality is too poor to extract reliable information. Please try taking a clearer photo with better lighting.",
                    "needs_clarification": False
                }
            else:
                logging.info("OCR quality poor but some items found, proceeding with processing")
        else:
            logging.info(f"OCR quality: {ocr_quality}, proceeding with processing")

        # Handle new structure with clear_items and unclear_items
        clear_items = result['data'].get('clear_items', [])
        unclear_items = result['data'].get('unclear_items', [])
        rejected_items = result['data'].get('rejected_items', [])

        # Clean and validate clear items
        cleaned_clear_items = []
        for item in clear_items:
            if not isinstance(item, dict) or 'name' not in item:
                continue

            # Clean and validate item name
            name = str(item['name']).strip()

            # Strict name validation
            if not self._is_valid_item_name(name):
                logging.warning(f"Rejected invalid item name: '{name}'")
                continue

            # Validate quantity
            quantity = item.get('quantity', 1)
            if not isinstance(quantity, (int, float)) or quantity <= 0 or quantity > 10000:
                quantity = min(max(1, int(quantity)), 10000) if isinstance(quantity, (int, float)) else 1

            # Validate amount
            amount = item.get('amount', 0)
            if not isinstance(amount, (int, float)) or amount < 0 or amount > 10000000:
                amount = max(0, float(amount)) if isinstance(amount, (int, float)) else 0

            # Calculate unit price
            unit_price = item.get('unit_price', amount / quantity if quantity > 0 else 0)

            # Categorization
            category = item.get('category', 'expense').lower()
            is_inventory = category == 'inventory'

            cleaned_clear_items.append({
                'name': name,
                'quantity': int(quantity),
                'amount': float(amount),
                'unit_price': float(unit_price),
                'category': category,
                'is_inventory': is_inventory,
                'reason': item.get('reason', '')
            })

        # Clean and validate unclear items
        cleaned_unclear_items = []
        questions = []

        for item in unclear_items:
            if not isinstance(item, dict) or 'name' not in item:
                continue

            # Clean item name
            name = str(item['name']).strip()
            if len(name) < 2:
                continue

            # Validate quantity and amount
            quantity = item.get('quantity', 1)
            if not isinstance(quantity, (int, float)) or quantity <= 0:
                quantity = 1

            amount = item.get('amount', 0)
            if not isinstance(amount, (int, float)) or amount < 0:
                amount = 0

            unit_price = item.get('unit_price', amount / quantity if quantity > 0 else 0)
            question = item.get('question', f"How do you use {name}? For your business (expense) or for selling (inventory)?")

            cleaned_unclear_items.append({
                'name': name,
                'quantity': int(quantity),
                'amount': float(amount),
                'unit_price': float(unit_price),
                'category': 'unclear',
                'is_inventory': None,
                'question': question,
                'options': item.get('options', ['expense', 'inventory'])
            })

            questions.append(question)

        # Separate clear items by category
        expense_items = [item for item in cleaned_clear_items if item['category'] == 'expense']
        inventory_items = [item for item in cleaned_clear_items if item['category'] == 'inventory']
        income_items = [item for item in cleaned_clear_items if item['category'] == 'income']

        # Update result structure
        result['data']['clear_items'] = cleaned_clear_items
        result['data']['unclear_items'] = cleaned_unclear_items
        result['data']['expense_items'] = expense_items
        result['data']['inventory_items'] = inventory_items
        result['data']['income_items'] = income_items
        result['data']['questions'] = questions

        # Combine all items for backward compatibility
        all_items = cleaned_clear_items + cleaned_unclear_items
        result['data']['items'] = all_items

        # Update response message and clarification status
        if cleaned_unclear_items:
            result['needs_clarification'] = True
            result['response_message'] = f"Found {len(cleaned_clear_items)} clear items and {len(cleaned_unclear_items)} items that need clarification."
        else:
            result['needs_clarification'] = False
            result['response_message'] = f"Receipt processed: {len(expense_items)} expenses, {len(inventory_items)} inventory, {len(income_items)} income"

        return result

    def _create_fallback_response(self, ocr_text: str, language: str = "en") -> Dict[str, Any]:
        """
        Create a fallback response when AI API is not available
        """
        # Simple pattern matching for basic receipt processing
        import re

        # Try to extract amounts using regex (enhanced for GST invoices)
        amount_patterns = [
            r'total[:\s]*[\$₹]?(\d+[,.]?\d*[,.]?\d*)',  # Total amounts
            r'amount[:\s]*[\$₹]?(\d+[,.]?\d*[,.]?\d*)',  # Amount fields
            r'[\$₹](\d+[,.]?\d*[,.]?\d*)',  # Currency symbols
            r'(\d+[,.]?\d*[,.]?\d*)\s*[\$₹]',  # Numbers before currency
            r'(\d+[,.]?\d*[,.]?\d*)\s*rupees?',  # Rupees
            r'(\d+[,.]?\d*[,.]?\d*)\s*rs\.?',  # Rs.
            r'inr\s+(\d+[,.]?\d*[,.]?\d*)',  # INR amounts
            r'(\d+[,.]?\d*[,.]?\d*)\s*only',  # Amounts followed by "only"
        ]

        amounts = []
        for pattern in amount_patterns:
            matches = re.findall(pattern, ocr_text.lower(), re.IGNORECASE)
            for match in matches:
                if match:
                    try:
                        # Clean up Indian number format
                        clean_match = match.strip()

                        # Handle different number formats
                        if ',' in clean_match and '.' in clean_match:
                            # Format like "5,16,000.00" - remove commas, keep last dot as decimal
                            parts = clean_match.split('.')
                            if len(parts) == 2 and len(parts[1]) <= 2:
                                # Last dot is decimal point
                                integer_part = parts[0].replace(',', '')
                                decimal_part = parts[1]
                                amount = float(f"{integer_part}.{decimal_part}")
                            else:
                                # All dots are thousand separators
                                amount = float(clean_match.replace(',', '').replace('.', ''))
                        elif ',' in clean_match:
                            # Format like "7,000" - remove commas
                            amount = float(clean_match.replace(',', ''))
                        elif '.' in clean_match:
                            # Check if it's decimal or thousand separator
                            parts = clean_match.split('.')
                            if len(parts) == 2 and len(parts[1]) <= 2:
                                # Decimal format
                                amount = float(clean_match)
                            else:
                                # Thousand separator format
                                amount = float(clean_match.replace('.', ''))
                        else:
                            # Simple number
                            amount = float(clean_match)

                        if amount > 0:
                            amounts.append(amount)
                    except (ValueError, AttributeError):
                        continue

        # Also look for written amounts (lakhs, crores)
        written_patterns = [
            r'(\d+)\s*lakh',
            r'(\d+)\s*crore',
            r'(\d+)\s*thousand'
        ]

        for pattern in written_patterns:
            matches = re.findall(pattern, ocr_text.lower())
            for match in matches:
                try:
                    base_amount = float(match)
                    if 'lakh' in pattern:
                        amounts.append(base_amount * 100000)
                    elif 'crore' in pattern:
                        amounts.append(base_amount * 10000000)
                    elif 'thousand' in pattern:
                        amounts.append(base_amount * 1000)
                except ValueError:
                    continue

        # Try to extract items with better patterns (enhanced for GST invoices)
        item_patterns = [
            r'(\d+)\s*nos\s*([a-zA-Z\s]+?)[\s-]*(?:rs\.?|₹)?\s*(\d+[,.]?\d*)',  # "500 Nos Mobile Phone Rs.50000"
            r'(\d+)\s*x\s*([a-zA-Z\s]+?)[\s-]*(?:rs\.?|₹)?\s*(\d+[,.]?\d*)',  # "2 x Coffee - Rs.50"
            r'(\d+)\s*([a-zA-Z\s]+?)[\s-]*(?:rs\.?|₹)?\s*(\d+[,.]?\d*)',  # "2 Notebooks Rs.100"
            r'(\d+)\s*x\s*([a-zA-Z\s]+)',  # "1 x T-Shirt"
            r'(\d+)\s*nos\s*([a-zA-Z\s]+)',  # "500 Nos Mobile"
        ]

        items = []
        inventory_keywords = [
            # Stationery
            'notebook', 'pen', 'pencil', 'book', 'stationery', 'paper', 'file', 'folder',
            # Electronics & Mobile
            'mobile', 'phone', 'smartphone', 'tablet', 'laptop', 'computer', 'electronics',
            'charger', 'cable', 'headphone', 'earphone', 'speaker', 'battery',
            # Clothing & Accessories
            'shirt', 'pant', 'cloth', 'fabric', 'material', 'dress', 'shoe', 'bag',
            # General Business Items
            'product', 'item', 'goods', 'stock', 'inventory', 'supply', 'equipment',
            'tool', 'accessory', 'component', 'part', 'device', 'gadget'
        ]

        for pattern in item_patterns:
            matches = re.findall(pattern, ocr_text, re.IGNORECASE)
            for match in matches:
                if len(match) == 3:  # quantity, name, price
                    quantity, item_name, price = match
                    # Parse price with comma handling
                    try:
                        if price:
                            clean_price = price.replace(',', '')
                            item_amount = float(clean_price)
                        else:
                            item_amount = amounts[0] if amounts else 0
                    except (ValueError, AttributeError):
                        item_amount = amounts[0] if amounts else 0
                elif len(match) == 2:  # quantity, name
                    quantity, item_name = match
                    item_amount = amounts[0] / len(matches) if amounts else 0
                else:
                    continue

                item_name = item_name.strip()
                if item_name and not any(word in item_name.lower() for word in ['total', 'amount', 'receipt', 'tax', 'discount', 'invoice', 'challan', 'date', 'gstin']):
                    # Check if item should go to inventory
                    is_inventory_item = any(keyword in item_name.lower() for keyword in inventory_keywords)

                    # Parse and validate quantity (prevent unrealistic quantities)
                    parsed_quantity = 1
                    if quantity.isdigit():
                        parsed_quantity = int(quantity)
                        # Cap quantity at reasonable limits to prevent OCR errors
                        if parsed_quantity > 10000:  # More than 10,000 items is likely an OCR error
                            logging.warning(f"Unrealistic quantity {parsed_quantity} detected, capping at 1000")
                            parsed_quantity = min(parsed_quantity, 1000)

                    # Validate item name (filter out OCR garbage)
                    if len(item_name) > 2 and not any(char in item_name.lower() for char in ['nnn', 'xxx', 'daten']):
                        items.append({
                            "name": item_name,
                            "quantity": parsed_quantity,
                            "amount": item_amount,
                            "is_inventory": is_inventory_item,
                            "category": "inventory" if is_inventory_item else "expense"
                        })

        total_amount = max(amounts) if amounts else None

        if items or total_amount:
            # Separate inventory items from regular expenses
            inventory_items = [item for item in items if item.get('is_inventory', False)]
            expense_items = [item for item in items if not item.get('is_inventory', False)]

            return {
                "intent": "receipt_processing",
                "action": "add_multiple",
                "data": {
                    "total_amount": total_amount,
                    "description": f"Receipt items: {', '.join([item['name'] for item in items])}" if items else "Receipt transaction",
                    "category": "general",
                    "items": items,
                    "expense_items": expense_items,
                    "inventory_items": inventory_items
                },
                "confidence": 0.8,
                "response_message": f"Receipt processed: {len(expense_items)} expenses, {len(inventory_items)} inventory items" if language == "en" else f"रसीद संसाधित: {len(expense_items)} खर्च, {len(inventory_items)} स्टॉक आइटम"
            }
        else:
            return {
                "intent": "general",
                "action": "none",
                "data": {
                    "amount": None,
                    "description": ocr_text,
                    "category": "general",
                    "items": []
                },
                "confidence": 0.0,
                "response_message": f"Text extracted but no transactions found" if language == "en" else "पाठ निकाला गया लेकिन कोई लेनदेन नहीं मिला"
            }
    
    def generate_response(self, intent: str, action: str, data: Dict, language: str = "en") -> str:
        """
        Generate natural language response based on intent and action
        """
        try:
            prompt = f"""
            Generate a friendly response in {language} for a business assistant.
            
            Intent: {intent}
            Action: {action}
            Data: {json.dumps(data, indent=2)}
            
            Examples:
            - Income added: "✅ ₹{data.get('amount', 0)} की आय जोड़ी गई: {data.get('description', '')}"
            - Expense added: "✅ ₹{data.get('amount', 0)} का खर्च जोड़ा गया: {data.get('description', '')}"
            - Inventory updated: "✅ {data.get('product_name', '')} का स्टॉक अपडेट किया गया"
            
            Return only the response message, no JSON.
            """
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
            
        except Exception as e:
            # Fallback responses
            if intent == "income":
                return f"✅ आय जोड़ी गई" if language == "hi" else "✅ Income added"
            elif intent == "expense":
                return f"✅ खर्च जोड़ा गया" if language == "hi" else "✅ Expense added"
            elif intent == "inventory":
                return f"✅ स्टॉक अपडेट किया गया" if language == "hi" else "✅ Inventory updated"
            else:
                return f"✅ कार्य पूरा हुआ" if language == "hi" else "✅ Task completed" 