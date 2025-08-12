from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
import os
import tempfile
import logging
from typing import Optional, Dict, Any
import json
from gtts import gTTS
import io
import uuid

# Import our modules
from database import get_db, create_tables
from ai_processor import AIProcessor
from speech_processor import SpeechProcessor
from business_logic import BusinessLogic
from supabase_business_logic import SupabaseBusinessLogic
from loan_rag_processor import LoanRAGProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="BizSakhi API",
    description="Smart Business Assistant API for Rural Women Entrepreneurs",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors
ai_processor = AIProcessor()
speech_processor = SpeechProcessor()
supabase_business = SupabaseBusinessLogic()
loan_rag_processor = LoanRAGProcessor()

# Authentication helper
def get_user_id_from_auth(authorization: Optional[str] = Header(None)) -> str:
    """Extract user ID from Authorization header or return default"""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user_id = supabase_business.get_user_id_from_token(token)
        if user_id:
            return user_id

    # Fallback to default user for backward compatibility
    return "default_user"

def _ultra_fast_transaction_detection(message: str, language: str, user_id: str, business_logic) -> Optional[Dict[str, Any]]:
    """
    Ultra-fast regex-based transaction detection - processes immediately without AI
    """
    import re

    message_lower = message.lower().strip()

    # Super simple patterns for immediate detection
    patterns = [
        # Income patterns
        (r'income\s+(?:is\s+)?(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'income'),
        (r'earned\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'income'),
        (r'received\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'income'),
        (r'आय\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'income'),
        (r'कमाई\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'income'),

        # Expense patterns
        (r'expense\s+(?:is\s+)?(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'expense'),
        (r'spent\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'expense'),
        (r'paid\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'expense'),
        (r'खर्च\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'expense'),
        (r'खर्चा\s+(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)', 'expense'),

        # Simple amount patterns
        (r'(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:income|आय)', 'income'),
        (r'(?:rs\.?\s*|₹\s*)?(\d+(?:,\d{3})*(?:\.\d{2})?)\s+(?:expense|खर्च)', 'expense'),
    ]

    for pattern, transaction_type in patterns:
        match = re.search(pattern, message_lower)
        if match:
            try:
                amount_str = match.group(1).replace(',', '')
                amount = float(amount_str)

                if amount > 0:
                    # Process immediately
                    if transaction_type == 'income':
                        result = business_logic.add_income(
                            user_id=user_id,
                            amount=amount,
                            description=f"Income - ₹{amount}",
                            category="General",
                            source="fast_detection",
                            language=language
                        )
                    else:
                        result = business_logic.add_expense(
                            user_id=user_id,
                            amount=amount,
                            description=f"Expense - ₹{amount}",
                            category="General",
                            source="fast_detection"
                        )

                    if result.get("success"):
                        # Save to chat history
                        business_logic.save_chat_history(
                            user_id=user_id,
                            message=message,
                            response=result["message"],
                            message_type="text",
                            intent=transaction_type
                        )

                        return {
                            "success": True,
                            "message": result["message"],
                            "intent": transaction_type,
                            "confidence": 0.98,
                            "business_results": [result],
                            "transactions_processed": 1,
                            "fast_detection": True
                        }
            except (ValueError, KeyError):
                continue

    return None

def _get_smart_fallback_response(message: str, language: str) -> Dict[str, Any]:
    """
    Smart fallback responses when AI is unavailable
    """
    message_lower = message.lower().strip()

    # Common greetings
    if any(word in message_lower for word in ["hi", "hello", "hey", "नमस्ते", "हैलो", "வணக்கம்", "ഹലോ"]):
        if language == "en":
            response = "Hello! I'm Sakhi, your business assistant. I can help you track income, expenses, and inventory. Try saying 'income 500' or 'expense 200'!"
        elif language == "hi":
            response = "नमस्ते! मैं सखी हूं, आपकी व्यापारिक सहायक। मैं आपकी आय, खर्च और इन्वेंटरी ट्रैक करने में मदद कर सकती हूं। 'आय 500' या 'खर्च 200' कहकर देखें!"
        elif language == "ta":
            response = "வணக்கம்! நான் சகி, உங்கள் வணிக உதவியாளர். நான் உங்கள் வருமானம், செலவுகள் மற்றும் சரக்குகளை கண்காணிக்க உதவ முடியும். 'வருமானம் 500' அல்லது 'செலவு 200' என்று சொல்லி பாருங்கள்!"
        elif language == "ml":
            response = "ഹലോ! ഞാൻ സഖി, നിങ്ങളുടെ ബിസിനസ് അസിസ്റ്റന്റ്. എനിക്ക് നിങ്ങളുടെ വരുമാനം, ചെലവുകൾ, ഇൻവെന്ററി ട്രാക്ക് ചെയ്യാൻ സഹായിക്കാം. 'വരുമാനം 500' അല്ലെങ്കിൽ 'ചെലവ് 200' എന്ന് പറഞ്ഞു നോക്കൂ!"
        else:
            response = "Hello! I'm Sakhi, your business assistant. I can help you track income, expenses, and inventory!"

    # Help requests
    elif any(word in message_lower for word in ["help", "मदद", "உதவி", "സഹായം"]):
        if language == "en":
            response = "I can help you with:\n• Track income: 'income 500'\n• Track expenses: 'expense 200'\n• Add inventory: 'inventory rice 10kg'\n• Upload receipts for automatic processing\n• Clear data: 'clear all'"
        elif language == "hi":
            response = "मैं इनमें आपकी मदद कर सकती हूं:\n• आय ट्रैक करें: 'आय 500'\n• खर्च ट्रैक करें: 'खर्च 200'\n• इन्वेंटरी जोड़ें: 'इन्वेंटरी चावल 10किलो'\n• रसीदें अपलोड करें\n• डेटा साफ करें: 'सब साफ'"
        elif language == "ta":
            response = "நான் இவற்றில் உங்களுக்கு உதவ முடியும்:\n• வருமானம் கண்காணிக்க: 'வருமானம் 500'\n• செலவு கண்காணிக்க: 'செலவு 200'\n• சரக்கு சேர்க்க: 'சரக்கு அரிசி 10கிலோ'\n• ரசீதுகளை பதிவேற்றவும்\n• தரவு அழிக்க: 'அனைத்தும் அழி'"
        elif language == "ml":
            response = "എനിക്ക് ഇവയിൽ നിങ്ങളെ സഹായിക്കാൻ കഴിയും്:\n• വരുമാനം ട്രാക്ക്: 'വരുമാനം 500'\n• ചെലവ് ട്രാക്ക്: 'ചെലവ് 200'\n• ഇൻവെന്ററി ചേർക്കുക: 'ഇൻവെന്ററി അരി 10കിലോ'\n• രസീതുകൾ അപ്‌ലോഡ് ചെയ്യുക\n• ഡാറ്റ മായ്ക്കുക: 'എല്ലാം മായ്ക്കുക'"
        else:
            response = "I can help you track income, expenses, inventory, and process receipts!"

    # How questions
    elif any(word in message_lower for word in ["how", "कैसे", "எப்படி", "എങ്ങനെ"]):
        if language == "en":
            response = "You can interact with me in simple ways:\n• Say 'income 1000' to add income\n• Say 'expense 500' to add expense\n• Upload receipt photos for automatic processing\n• Ask me about your business data anytime!"
        elif language == "hi":
            response = "आप मुझसे आसान तरीकों से बात कर सकते हैं:\n• 'आय 1000' कहें आय जोड़ने के लिए\n• 'खर्च 500' कहें खर्च जोड़ने के लिए\n• रसीद की फोटो अपलोड करें\n• कभी भी अपने व्यापार के बारे में पूछें!"
        elif language == "ta":
            response = "நீங்கள் என்னுடன் எளிய வழிகளில் பேசலாம்:\n• வருமானம் சேர்க்க 'வருமானம் 1000' என்று சொல்லுங்கள்\n• செலவு சேர்க்க 'செலவு 500' என்று சொல்லுங்கள்\n• ரசீது புகைப்படங்களை பதிவேற்றவும்\n• எப்போது வேண்டுமானாலும் உங்கள் வணிகத்தைப் பற்றி கேளுங்கள்!"
        elif language == "ml":
            response = "നിങ്ങൾക്ക് എന്നോട് ലളിതമായ രീതികളിൽ സംസാരിക്കാം:\n• വരുമാനം ചേർക്കാൻ 'വരുമാനം 1000' എന്ന് പറയുക\n• ചെലവ് ചേർക്കാൻ 'ചെലവ് 500' എന്ന് പറയുക\n• രസീത് ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുക\n• എപ്പോൾ വേണമെങ്കിലും നിങ്ങളുടെ ബിസിനസിനെക്കുറിച്ച് ചോദിക്കുക!"
        else:
            response = "You can say 'income 1000', 'expense 500', or upload receipt photos!"

    # Default fallback
    else:
        if language == "en":
            response = "I'm here to help with your business! Try: 'income 500', 'expense 200', or upload a receipt photo."
        elif language == "hi":
            response = "मैं आपके व्यापार में मदद के लिए यहाँ हूँ! कोशिश करें: 'आय 500', 'खर्च 200', या रसीद की फोटो अपलोड करें।"
        elif language == "ta":
            response = "நான் உங்கள் வணிகத்திற்கு உதவ இங்கே இருக்கிறேன்! முயற்சி செய்யுங்கள்: 'வருமானம் 500', 'செலவு 200', அல்லது ரசீது புகைப்படம் பதிவேற்றவும்."
        elif language == "ml":
            response = "ഞാൻ നിങ്ങളുടെ ബിസിനസിനെ സഹായിക്കാൻ ഇവിടെയുണ്ട്! ശ്രമിക്കുക: 'വരുമാനം 500', 'ചെലവ് 200', അല്ലെങ്കിൽ രസീത് ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക."
        else:
            response = "I'm here to help with your business! Try: 'income 500', 'expense 200', or upload a receipt."

    return {
        "intent": "conversational",
        "response_message": response,
        "confidence": 0.8,
        "is_business_related": True,
        "fallback_used": True
    }

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()
    logger.info("Database tables created successfully")

@app.get("/")
async def root():
    return {"message": "Welcome to BizSakhi API - Smart Business Assistant"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "BizSakhi API is running"}

@app.post("/api/tts")
async def text_to_speech(
    request: Request,
):
    """Convert text to speech using Google TTS"""
    try:
        data = await request.json()
        text = data.get("text", "")
        language = data.get("language", "en")

        if not text:
            return JSONResponse({
                "success": False,
                "message": "Text is required"
            }, status_code=400)

        # Clean text for better speech (remove emojis and symbols)
        import re
        clean_text = text

        # Simple approach: remove common emojis and symbols
        symbols_to_remove = ['✅', '❌', '🔊', '💰', '📊', '📦', '🎤', '🎯', '🌟', '🎉', '⚡', '🚀', '🎨', '🔧', '🌐', '📱', '🎭', '🧹', '⚙️', '🎛️']
        for symbol in symbols_to_remove:
            clean_text = clean_text.replace(symbol, '')

        # Remove other common emojis using character ranges
        clean_text = ''.join(char for char in clean_text if ord(char) < 0x1F600 or ord(char) > 0x1F64F)
        clean_text = ''.join(char for char in clean_text if ord(char) < 0x1F300 or ord(char) > 0x1F5FF)

        # Clean up multiple spaces
        clean_text = re.sub(r'\s+', ' ', clean_text)
        clean_text = clean_text.strip()

        if not clean_text:
            return JSONResponse({
                "success": False,
                "message": "No valid text to convert"
            }, status_code=400)

        # Language mapping for Google TTS
        tts_lang_map = {
            'en': 'en',
            'hi': 'hi',
            'ta': 'ta',
            'ml': 'ml',
            'te': 'te',
            'kn': 'kn',
            'gu': 'gu',
            'bn': 'bn',
            'mr': 'mr'
        }

        tts_lang = tts_lang_map.get(language, 'en')

        # Create TTS object
        tts = gTTS(text=clean_text, lang=tts_lang, slow=False)

        # Generate unique filename
        audio_filename = f"tts_{uuid.uuid4().hex}.mp3"
        audio_path = os.path.join(tempfile.gettempdir(), audio_filename)

        # Save audio file
        tts.save(audio_path)

        # Return audio file
        return FileResponse(
            audio_path,
            media_type="audio/mpeg",
            filename=audio_filename,
            headers={"Cache-Control": "no-cache"}
        )

    except Exception as e:
        logger.error(f"Error in text-to-speech: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Error generating speech",
            "error": str(e)
        }, status_code=500)

@app.post("/api/chat/text")
async def process_text_message(
    message: str = Form(...),
    language: str = Form("en"),
    chat_mode: str = Form("general"),
    authorization: Optional[str] = Header(None)
):
    """
    Process text message and extract business intent
    """
    try:
        # Get user ID from auth token
        user_id = get_user_id_from_auth(authorization)
        logger.info(f"Processing text message for user {user_id}: {message[:50]}...")

        # Use Supabase business logic
        business_logic = supabase_business

        # ULTRA-FAST pattern detection for simple transactions (before any AI calls)
        # Only run in business mode
        if chat_mode == "business":
            fast_result = _ultra_fast_transaction_detection(message, language, user_id, business_logic)
            if fast_result:
                logger.info("⚡ Ultra-fast transaction detection - immediate response!")
                return fast_result
        else:
            logger.info("💬 General mode - skipping transaction detection")

        # Check for clear commands first
        message_lower = message.lower()

        # Clear expenses
        if any(phrase in message_lower for phrase in ["clear expense", "delete expense", "remove expense", "reset expense", "make expense 0", "expense to 0", "खर्च साफ", "खर्च हटा", "खर्च शून्य"]):
            result = business_logic.clear_expenses(user_id=user_id)

            # Override message with language-appropriate response
            if language == "en":
                message_text = "✅ All expenses cleared successfully!"
            elif language == "hi":
                message_text = "✅ सभी खर्च साफ कर दिए गए!"
            elif language == "ta":
                message_text = "✅ அனைத்து செலவுகளும் அழிக்கப்பட்டன!"
            elif language == "ml":
                message_text = "✅ എല്ലാ ചെലവുകളും മായ്ച്ചു!"
            else:
                message_text = result["message"]

            return {
                "success": True,
                "message": message_text,
                "intent": "expense_clear",
                "business_results": [result]
            }

        # Clear income
        elif any(phrase in message_lower for phrase in ["clear income", "delete income", "remove income", "reset income", "make income 0", "income to 0", "आय साफ", "आय हटा", "आय शून्य"]):
            result = business_logic.clear_income(user_id=user_id)

            # Override message with language-appropriate response
            if language == "en":
                message_text = "✅ All income cleared successfully!"
            elif language == "hi":
                message_text = "✅ सभी आय साफ कर दी गई!"
            elif language == "ta":
                message_text = "✅ அனைத்து வருமானமும் அழிக்கப்பட்டது!"
            elif language == "ml":
                message_text = "✅ എല്ലാ വരുമാനവും മായ്ച്ചു!"
            else:
                message_text = result["message"]

            return {
                "success": True,
                "message": message_text,
                "intent": "income_clear",
                "business_results": [result]
            }

        # Clear chat
        elif any(phrase in message_lower for phrase in ["clear chat", "delete chat", "remove chat", "reset chat", "clear history", "delete history", "चैट साफ", "चैट हटा", "इतिहास साफ"]):
            result = business_logic.clear_chat_history(user_id=user_id)

            # Override message with language-appropriate response
            if language == "en":
                message_text = "✅ Chat history cleared successfully!"
            elif language == "hi":
                message_text = "✅ चैट हिस्ट्री साफ कर दी गई!"
            elif language == "ta":
                message_text = "✅ அரட்டை வரலாறு அழிக்கப்பட்டது!"
            elif language == "ml":
                message_text = "✅ ചാറ്റ് ചരിത്രം മായ്ച്ചു!"
            else:
                message_text = result["message"]

            return {
                "success": True,
                "message": message_text,
                "intent": "chat_clear",
                "business_results": [result]
            }

        # Clear all data
        elif any(phrase in message_lower for phrase in ["clear all", "delete all", "reset all", "clear everything", "reset everything", "सब साफ", "सब हटा", "सब कुछ साफ"]):
            result = business_logic.clear_all_data(user_id=user_id)

            # Override message with language-appropriate response
            if language == "en":
                message_text = "✅ All data cleared successfully!"
            elif language == "hi":
                message_text = "✅ सभी डेटा साफ कर दिया गया!"
            elif language == "ta":
                message_text = "✅ அனைத்து தரவுகளும் வெற்றிகரமாக அழிக்கப்பட்டன!"
            elif language == "ml":
                message_text = "✅ എല്ലാ ഡാറ്റയും വിജയകരമായി മായ്ച്ചു!"
            else:
                message_text = result["message"]

            return {
                "success": True,
                "message": message_text,
                "intent": "all_clear",
                "business_results": [result]
            }

        # Parse intent using AI with timeout (now supports conversational responses)
        try:
            import threading
            import time

            # Use threading-based timeout for Windows compatibility
            result_container = {"result": None, "error": None}

            def ai_processing_thread():
                try:
                    # Pass chat mode to AI processor
                    result_container["result"] = ai_processor.parse_intent(message, language, chat_mode)
                except Exception as e:
                    result_container["error"] = e

            # Start AI processing in separate thread
            thread = threading.Thread(target=ai_processing_thread)
            thread.daemon = True
            thread.start()

            # Wait for result with timeout
            thread.join(timeout=15)  # 15 second timeout

            if thread.is_alive():
                # Thread is still running, timeout occurred
                logger.warning("AI processing timed out, using smart fallback response")
                intent_result = _get_smart_fallback_response(message, language)
            elif result_container["error"]:
                # Thread completed with error
                raise result_container["error"]
            else:
                # Thread completed successfully
                intent_result = result_container["result"]

        except Exception as e:
            logger.warning(f"AI processing failed: {str(e)}, using smart fallback response")
            intent_result = _get_smart_fallback_response(message, language)

        # Handle conversational responses
        if intent_result.get("intent") in ["conversational", "off_topic"]:
            response_message = intent_result.get("response_message", "I'm here to help with your business!")

            logger.info(f"Processing conversational message - about to save chat history")

            # Save chat history for conversational messages
            save_result = business_logic.save_chat_history(
                user_id=user_id,
                message=message,
                response=response_message,
                message_type="text",
                intent=intent_result.get("intent", "conversational")
            )

            logger.info(f"Chat history save result: {save_result}")

            return {
                "success": True,
                "message": response_message,
                "intent": intent_result.get("intent"),
                "confidence": intent_result.get("confidence", 0.8),
                "is_business_related": intent_result.get("is_business_related", True),
                "business_results": []
            }

        # Handle item clarification (new interactive system)
        if intent_result.get("intent") == "item_clarification":
            items = intent_result.get("data", {}).get("items", [])
            response_message = intent_result.get("response_message", "Please review and confirm the categorization:")

            logger.info(f"Processing item clarification with {len(items)} items")

            # Save chat history for clarification messages
            business_logic.save_chat_history(
                user_id=user_id,
                message=message,
                response=response_message,
                message_type="text",
                intent="item_clarification"
            )

            return {
                "success": True,
                "message": response_message,
                "intent": "item_clarification",
                "confidence": intent_result.get("confidence", 0.8),
                "needs_clarification": True,
                "clarification_items": items,
                "business_results": []
            }

        # Process business transactions (existing logic)
        response_message = ""
        business_results = []

        # Handle multiple transactions if present
        if "transactions" in intent_result and intent_result["transactions"]:
            for transaction in intent_result["transactions"]:
                if transaction["intent"] == "income" and transaction.get("amount"):
                    result = business_logic.add_income(
                        amount=transaction["amount"],
                        description=transaction.get("description", "Income"),
                        category=transaction.get("category", "General"),
                        source="text",
                        user_id=user_id,
                        language=language
                    )
                    business_results.append(result)

                elif transaction["intent"] == "expense" and transaction.get("amount"):
                    result = business_logic.add_expense(
                        amount=transaction["amount"],
                        description=transaction.get("description", "Expense"),
                        category=transaction.get("category", "General"),
                        source="text",
                        user_id=user_id
                    )
                    business_results.append(result)

                elif transaction["intent"] == "inventory" and transaction.get("product_name") and transaction.get("quantity"):
                    result = business_logic.add_inventory_item(
                        product_name=transaction["product_name"],
                        quantity=transaction["quantity"],
                        unit=transaction.get("unit", "pieces"),
                        cost_per_unit=transaction.get("cost_per_unit", 0.0),
                        user_id=user_id
                    )
                    business_results.append(result)

            # Use AI response message if transactions were processed
            if business_results:
                response_message = intent_result.get("response_message", "Transactions processed successfully!")
            else:
                response_message = intent_result.get("response_message", "No valid transactions found.")

        # Fallback to old format for backward compatibility
        elif intent_result.get("intent") == "income" and intent_result.get("action") == "add":
            data = intent_result.get("data", {})
            if data.get("amount"):
                result = business_logic.add_income(
                    amount=data["amount"],
                    description=data.get("description", "Income"),
                    category=data.get("category", "General"),
                    source="text",
                    user_id=user_id,
                    language=language
                )
                business_results.append(result)
                response_message = result["message"]

        elif intent_result.get("intent") == "expense" and intent_result.get("action") == "add":
            data = intent_result.get("data", {})
            if data.get("amount"):
                result = business_logic.add_expense(
                    amount=data["amount"],
                    description=data.get("description", "Expense"),
                    category=data.get("category", "General"),
                    source="text",
                    user_id=user_id
                )
                business_results.append(result)
                response_message = result["message"]

        else:
            # Handle queries
            logger.info(f"🔍 Query detection - Intent: {intent_result.get('intent')}, Action: {intent_result.get('action')}")
            logger.info(f"🔍 Message: {message}")
            
            # Direct profit/loss detection - fallback if AI doesn't classify correctly
            query_message = message.lower()
            if any(keyword in query_message for keyword in [
                "profit", "loss", 
                "लाभ", "हानि", "नुकसान", "फायदा",  # Hindi
                "இலாபம்", "நஷ்டம்", "லாபம்", "नुकसान்",  # Tamil
                "ലാഭം", "നഷ്ടം", "കാശ്", "പണം"  # Malayalam
            ]):
                logger.info("🎯 Direct profit/loss detection triggered!")
                # Get profit and loss summary
                profit_loss = business_logic.get_profit_loss_summary(user_id)
                if profit_loss["success"]:
                    total_income = profit_loss["total_income"]
                    total_expenses = profit_loss["total_expenses"]
                    net_profit = profit_loss["net_profit"]
                    profit_margin = profit_loss["profit_margin_percentage"]
                    profit_status = profit_loss["summary"]["profit_status"]
                    
                    if language == "hi":
                        if net_profit > 0:
                            response_message = f"📊 आपका व्यापार लाभ में है!\n\n💰 कुल आय: ₹{total_income:,.2f}\n💸 कुल खर्च: ₹{total_expenses:,.2f}\n✅ शुद्ध लाभ: ₹{net_profit:,.2f}\n📈 लाभ मार्जिन: {profit_margin:.1f}%\n\nबधाई हो! आपका व्यापार अच्छा चल रहा है। 🎉"
                        elif net_profit < 0:
                            response_message = f"📊 आपके व्यापार में हानि हो रही है।\n\n💰 कुल आय: ₹{total_income:,.2f}\n💸 कुल खर्च: ₹{total_expenses:,.2f}\n❌ शुद्ध हानि: ₹{abs(net_profit):,.2f}\n📉 हानि मार्जिन: {abs(profit_margin):.1f}%\n\nसुझाव: खर्च कम करने या आय बढ़ाने के तरीकों पर विचार करें।"
                        else:
                            response_message = f"📊 आपका व्यापार ब्रेक-ईवन पर है।\n\n💰 कुल आय: ₹{total_income:,.2f}\n💸 कुल खर्च: ₹{total_expenses:,.2f}\n⚖️ शुद्ध परिणाम: ₹0\n\nआप न तो लाभ में हैं न हानि में।"
                    elif language == "ta":
                        if net_profit > 0:
                            response_message = f"📊 உங்கள் வணிகம் லாபத்தில் உள்ளது!\n\n💰 மொத்த வருமானம்: ₹{total_income:,.2f}\n💸 மொத்த செலவுகள்: ₹{total_expenses:,.2f}\n✅ நிகர லாபம்: ₹{net_profit:,.2f}\n📈 லாப விகிதம்: {profit_margin:.1f}%\n\nவாழ்த்துகள்! உங்கள் வணிகம் நன்றாக நடந்து கொண்டிருக்கிறது। 🎉"
                        elif net_profit < 0:
                            response_message = f"📊 உங்கள் வணிகத்தில் நஷ்டம் ஏற்பட்டுள்ளது।\n\n💰 மொத்த வருமானம்: ₹{total_income:,.2f}\n💸 மொத்த செலவுகள்: ₹{total_expenses:,.2f}\n❌ நிகர நஷ்டம்: ₹{abs(net_profit):,.2f}\n📉 நஷ்ட விகிதம்: {abs(profit_margin):.1f}%\n\nபரிந்துரை: செலவுகளை குறைக்க அல்லது வருமானத்தை அதிகரிக்க வழிகளை பரிசீலிக்கவும்।"
                        else:
                            response_message = f"📊 உங்கள் வணிகம் பிரேக்-ஈவன் நிலையில் உள்ளது।\n\n💰 மொத்த வருமானம்: ₹{total_income:,.2f}\n💸 மொத்த செலவுகள்: ₹{total_expenses:,.2f}\n⚖️ நிகர முடிவு: ₹0\n\nநீங்கள் லாபத்திலும் இல்லை நஷ்டத்திலும் இல்லை।"
                    elif language == "ml":
                        if net_profit > 0:
                            response_message = f"📊 നിങ്ങളുടെ ബിസിനസ്സ് ലാഭത്തിലാണ്!\n\n💰 മൊത്തം വരുമാനം: ₹{total_income:,.2f}\n💸 മൊത്തം ചെലവുകൾ: ₹{total_expenses:,.2f}\n✅ നെറ്റ് ലാഭം: ₹{net_profit:,.2f}\n📈 ലാഭ മാർജിൻ: {profit_margin:.1f}%\n\nഅഭിനന്ദനങ്ങൾ! നിങ്ങളുടെ ബിസിനസ്സ് നന്നായി പോകുന്നു। 🎉"
                        elif net_profit < 0:
                            response_message = f"📊 നിങ്ങളുടെ ബിസിനസ്സിൽ നഷ്ടം സംഭവിച്ചിരിക്കുന്നു।\n\n💰 മൊത്തം വരുമാനം: ₹{total_income:,.2f}\n💸 മൊത്തം ചെലവുകൾ: ₹{total_expenses:,.2f}\n❌ നെറ്റ് നഷ്ടം: ₹{abs(net_profit):,.2f}\n📉 നഷ്ട മാർജിൻ: {abs(profit_margin):.1f}%\n\nനിർദ്ദേശം: ചെലവുകൾ കുറയ്ക്കാനോ വരുമാനം വർദ്ധിപ്പിക്കാനോ ഉള്ള വഴികൾ പരിഗണിക്കുക।"
                        else:
                            response_message = f"📊 നിങ്ങളുടെ ബിസിനസ്സ് ബ്രേക്ക്-ഈവൻ നിലയിലാണ്।\n\n💰 മൊത്തം വരുമാനം: ₹{total_income:,.2f}\n💸 മൊത്തം ചെലവുകൾ: ₹{total_expenses:,.2f}\n⚖️ നെറ്റ് ഫലം: ₹0\n\nനിങ്ങൾ ലാഭത്തിലോ നഷ്ടത്തിലോ അല്ല।"
                    else:
                        if net_profit > 0:
                            response_message = f"📊 Your business is profitable!\n\n💰 Total Income: ₹{total_income:,.2f}\n💸 Total Expenses: ₹{total_expenses:,.2f}\n✅ Net Profit: ₹{net_profit:,.2f}\n📈 Profit Margin: {profit_margin:.1f}%\n\nCongratulations! Your business is doing well. 🎉"
                        elif net_profit < 0:
                            response_message = f"📊 Your business is showing a loss.\n\n💰 Total Income: ₹{total_income:,.2f}\n💸 Total Expenses: ₹{total_expenses:,.2f}\n❌ Net Loss: ₹{abs(net_profit):,.2f}\n📉 Loss Margin: {abs(profit_margin):.1f}%\n\nSuggestion: Consider ways to reduce expenses or increase income."
                        else:
                            response_message = f"📊 Your business is at break-even.\n\n💰 Total Income: ₹{total_income:,.2f}\n💸 Total Expenses: ₹{total_expenses:,.2f}\n⚖️ Net Result: ₹0\n\nYou're neither in profit nor loss."
                else:
                    response_message = "मुझे आपके profit और loss की जानकारी पाने में समस्या हो रही है। कृपया कुछ income और expense डेटा जोड़ें।" if language == "hi" else "I'm having trouble getting your profit and loss information. Please add some income and expense data first."
            
            elif any(keyword in query_message for keyword in [
                "income", "revenue",
                "आय", "कमाई",  # Hindi
                "வருமானம்", "வருவாய்", "சம்பாதனை",  # Tamil
                "വരുമാനം", "സമ്പാദ്യം", "കമ്പനി"  # Malayalam
            ]) and not ("today" in query_message or "आज" in query_message):
                logger.info("🎯 Direct income detection triggered!")
                # Get overall income summary
                income_summary = business_logic.get_income_summary(user_id)
                if income_summary["success"] and income_summary["total_income"] > 0:
                    total_income = income_summary["total_income"]
                    count = income_summary["count"]
                    response_message = f"💰 आपकी कुल आय: ₹{total_income:,.2f}\n📊 कुल लेन-देन: {count}\n\nयह आपके सभी income entries का योग है।" if language == "hi" else f"💰 Your total income: ₹{total_income:,.2f}\n📊 Total transactions: {count}\n\nThis is the sum of all your income entries."
                else:
                    response_message = "अभी तक कोई आय दर्ज नहीं की गई है। कृपया कुछ income entries जोड़ें।" if language == "hi" else "No income recorded yet. Please add some income entries."
            
            elif any(keyword in query_message for keyword in [
                "expense", "spending",
                "खर्च", "खर्चा",  # Hindi
                "செலவு", "खर्चा", "व्यय",  # Tamil
                "ചെലവ്", "खर्चा", "പണം"  # Malayalam
            ]) and not ("today" in query_message or "आज" in query_message):
                logger.info("🎯 Direct expense detection triggered!")
                # Get overall expense summary
                expense_summary = business_logic.get_expense_summary(user_id)
                if expense_summary["success"] and expense_summary["total_expenses"] > 0:
                    total_expenses = expense_summary["total_expenses"]
                    count = expense_summary["count"]
                    response_message = f"💸 आपका कुल खर्च: ₹{total_expenses:,.2f}\n📊 कुल लेन-देन: {count}\n\nयह आपके सभी expense entries का योग है।" if language == "hi" else f"💸 Your total expenses: ₹{total_expenses:,.2f}\n📊 Total transactions: {count}\n\nThis is the sum of all your expense entries."
                else:
                    response_message = "अभी तक कोई खर्च दर्ज नहीं किया गया है। कृपया कुछ expense entries जोड़ें।" if language == "hi" else "No expenses recorded yet. Please add some expense entries."
            
            elif intent_result.get("action") == "query":
                query_message = message.lower()
                if "expense" in query_message and ("today" in query_message or "आज" in query_message):
                    # Get today's expenses
                    today_expenses = business_logic.get_today_expenses(user_id)
                    if today_expenses["success"] and today_expenses["count"] > 0:
                        response_message = f"आज का कुल खर्च ₹{today_expenses['total_expenses']} है। {today_expenses['count']} लेन-देन हुए हैं।" if language == "hi" else f"Today's total expense is ₹{today_expenses['total_expenses']}. You have {today_expenses['count']} transactions."
                    else:
                        response_message = "आज कोई खर्च नहीं हुआ है।" if language == "hi" else "No expenses recorded for today."
                elif "income" in query_message and ("today" in query_message or "आज" in query_message):
                    # Get today's income (you can implement this similarly)
                    response_message = intent_result.get("response_message", "Income query functionality coming soon!")
                elif any(keyword in query_message for keyword in ["profit", "loss", "लाभ", "हानि", "नुकसान", "फायदा"]):
                    # Get profit and loss summary
                    profit_loss = business_logic.get_profit_loss_summary(user_id)
                    if profit_loss["success"]:
                        total_income = profit_loss["total_income"]
                        total_expenses = profit_loss["total_expenses"]
                        net_profit = profit_loss["net_profit"]
                        profit_margin = profit_loss["profit_margin_percentage"]
                        profit_status = profit_loss["summary"]["profit_status"]
                        
                        if language == "hi":
                            if net_profit > 0:
                                response_message = f"📊 आपका व्यापार लाभ में है!\n\n💰 कुल आय: ₹{total_income:,.2f}\n💸 कुल खर्च: ₹{total_expenses:,.2f}\n✅ शुद्ध लाभ: ₹{net_profit:,.2f}\n📈 लाभ मार्जिन: {profit_margin:.1f}%\n\nबधाई हो! आपका व्यापार अच्छा चल रहा है। 🎉"
                            elif net_profit < 0:
                                response_message = f"📊 आपके व्यापार में हानि हो रही है।\n\n💰 कुल आय: ₹{total_income:,.2f}\n💸 कुल खर्च: ₹{total_expenses:,.2f}\n❌ शुद्ध हानि: ₹{abs(net_profit):,.2f}\n📉 हानि मार्जिन: {abs(profit_margin):.1f}%\n\nसुझाव: खर्च कम करने या आय बढ़ाने के तरीकों पर विचार करें।"
                            else:
                                response_message = f"📊 आपका व्यापार ब्रेक-ईवन पर है।\n\n💰 कुल आय: ₹{total_income:,.2f}\n💸 कुल खर्च: ₹{total_expenses:,.2f}\n⚖️ शुद्ध परिणाम: ₹0\n\nआप न तो लाभ में हैं न हानि में।"
                        else:
                            if net_profit > 0:
                                response_message = f"📊 Your business is profitable!\n\n💰 Total Income: ₹{total_income:,.2f}\n💸 Total Expenses: ₹{total_expenses:,.2f}\n✅ Net Profit: ₹{net_profit:,.2f}\n📈 Profit Margin: {profit_margin:.1f}%\n\nCongratulations! Your business is doing well. 🎉"
                            elif net_profit < 0:
                                response_message = f"📊 Your business is showing a loss.\n\n💰 Total Income: ₹{total_income:,.2f}\n💸 Total Expenses: ₹{total_expenses:,.2f}\n❌ Net Loss: ₹{abs(net_profit):,.2f}\n📉 Loss Margin: {abs(profit_margin):.1f}%\n\nSuggestion: Consider ways to reduce expenses or increase income."
                            else:
                                response_message = f"📊 Your business is at break-even.\n\n💰 Total Income: ₹{total_income:,.2f}\n💸 Total Expenses: ₹{total_expenses:,.2f}\n⚖️ Net Result: ₹0\n\nYou're neither in profit nor loss."
                    else:
                        response_message = "मुझे आपके profit और loss की जानकारी पाने में समस्या हो रही है। कृपया कुछ income और expense डेटा जोड़ें।" if language == "hi" else "I'm having trouble getting your profit and loss information. Please add some income and expense data first."
                elif any(keyword in query_message for keyword in ["income", "आय", "कमाई", "revenue"]) and not ("today" in query_message or "आज" in query_message):
                    # Get overall income summary
                    income_summary = business_logic.get_income_summary(user_id)
                    if income_summary["success"] and income_summary["total_income"] > 0:
                        total_income = income_summary["total_income"]
                        count = income_summary["count"]
                        response_message = f"💰 आपकी कुल आय: ₹{total_income:,.2f}\n📊 कुल लेन-देन: {count}\n\nयह आपके सभी income entries का योग है।" if language == "hi" else f"💰 Your total income: ₹{total_income:,.2f}\n📊 Total transactions: {count}\n\nThis is the sum of all your income entries."
                    else:
                        response_message = "अभी तक कोई आय दर्ज नहीं की गई है। कृपया कुछ income entries जोड़ें।" if language == "hi" else "No income recorded yet. Please add some income entries."
                elif any(keyword in query_message for keyword in ["expense", "खर्च", "खर्चा", "spending"]) and not ("today" in query_message or "आज" in query_message):
                    # Get overall expense summary
                    expense_summary = business_logic.get_expense_summary(user_id)
                    if expense_summary["success"] and expense_summary["total_expenses"] > 0:
                        total_expenses = expense_summary["total_expenses"]
                        count = expense_summary["count"]
                        response_message = f"💸 आपका कुल खर्च: ₹{total_expenses:,.2f}\n📊 कुल लेन-देन: {count}\n\nयह आपके सभी expense entries का योग है।" if language == "hi" else f"💸 Your total expenses: ₹{total_expenses:,.2f}\n📊 Total transactions: {count}\n\nThis is the sum of all your expense entries."
                    else:
                        response_message = "अभी तक कोई खर्च दर्ज नहीं किया गया है। कृपया कुछ expense entries जोड़ें।" if language == "hi" else "No expenses recorded yet. Please add some expense entries."
                else:
                    response_message = intent_result.get("response_message", "I'm here to help with your business needs!")
            else:
                # General query or fallback
                response_message = intent_result.get("response_message", "I'm here to help with your business needs!")
        
        # Save chat history
        business_logic.save_chat_history(
            user_id=user_id,
            message=message,
            response=response_message,
            message_type="text",
            intent=intent_result.get("primary_intent", intent_result.get("intent", "general"))
        )

        return JSONResponse({
            "success": True,
            "message": response_message,
            "intent": intent_result.get("primary_intent", intent_result.get("intent", "general")),
            "confidence": intent_result.get("confidence", 0.0),
            "business_results": business_results,
            "transactions_processed": len(business_results)
        })
        
    except Exception as e:
        logger.error(f"Error processing text message: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "माफ़ करें, कुछ गलत हो गया। कृपया दोबारा कोशिश करें।" if language == "hi" else "Sorry, something went wrong. Please try again.",
            "error": str(e)
        }, status_code=500)

@app.post("/api/chat/voice")
async def process_voice_message(
    audio_file: UploadFile = File(...),
    language: str = Form("hi"),
    authorization: Optional[str] = Header(None)
):
    """
    Process voice message and extract business intent
    """
    try:
        # Get user ID from auth token
        user_id = get_user_id_from_auth(authorization)
        logger.info(f"Processing voice message from user: {user_id}")

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await audio_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        try:
            # Transcribe audio
            transcribed_text, confidence, detected_language = speech_processor.transcribe_with_language_detection(temp_file_path)

            if not transcribed_text:
                return JSONResponse({
                    "success": False,
                    "message": "आवाज़ को समझ नहीं पाई। कृपया दोबारा बोलें।" if language == "hi" else "Could not understand voice. Please speak again."
                })

            # Process transcribed text
            intent_result = ai_processor.parse_intent(transcribed_text, detected_language or language)

            # Use Supabase business logic
            business_logic = supabase_business
            
            # Process based on intent (same logic as text processing)
            response_message = ""
            business_results = []

            # Handle multiple transactions if present
            if "transactions" in intent_result and intent_result["transactions"]:
                for transaction in intent_result["transactions"]:
                    if transaction["intent"] == "income" and transaction.get("amount"):
                        result = business_logic.add_income(
                            amount=transaction["amount"],
                            description=transaction.get("description", "Income"),
                            category=transaction.get("category", "General"),
                            source="voice",
                            user_id=user_id
                        )
                        business_results.append(result)

                    elif transaction["intent"] == "expense" and transaction.get("amount"):
                        result = business_logic.add_expense(
                            amount=transaction["amount"],
                            description=transaction.get("description", "Expense"),
                            category=transaction.get("category", "General"),
                            source="voice",
                            user_id=user_id
                        )
                        business_results.append(result)

                    elif transaction["intent"] == "inventory" and transaction.get("product_name") and transaction.get("quantity"):
                        result = business_logic.add_inventory_item(
                            product_name=transaction["product_name"],
                            quantity=transaction["quantity"],
                            unit=transaction.get("unit", "pieces"),
                            cost_per_unit=transaction.get("cost_per_unit", 0.0),
                            user_id=user_id
                        )
                        business_results.append(result)

                # Use AI response message if transactions were processed
                if business_results:
                    response_message = intent_result.get("response_message", "Transactions processed successfully!")
                else:
                    response_message = intent_result.get("response_message", "No valid transactions found.")

            # Fallback to old format for backward compatibility
            elif intent_result.get("intent") == "income" and intent_result.get("action") == "add":
                data = intent_result.get("data", {})
                if data.get("amount"):
                    result = business_logic.add_income(
                        amount=data["amount"],
                        description=data.get("description", "Income"),
                        category=data.get("category", "General"),
                        source="voice",
                        user_id=user_id
                    )
                    business_results.append(result)
                    response_message = result["message"]

            elif intent_result.get("intent") == "expense" and intent_result.get("action") == "add":
                data = intent_result.get("data", {})
                if data.get("amount"):
                    result = business_logic.add_expense(
                        amount=data["amount"],
                        description=data.get("description", "Expense"),
                        category=data.get("category", "General"),
                        source="voice",
                        user_id=user_id
                    )
                    business_results.append(result)
                    response_message = result["message"]

            else:
                # Handle queries
                if intent_result.get("action") == "query":
                    query_message = transcribed_text.lower()
                    if "expense" in query_message and ("today" in query_message or "आज" in query_message):
                        today_expenses = business_logic.get_today_expenses(user_id)
                        if today_expenses["success"] and today_expenses["count"] > 0:
                            response_message = f"आज का कुल खर्च ₹{today_expenses['total_expenses']} है। {today_expenses['count']} लेन-देन हुए हैं।" if language == "hi" else f"Today's total expense is ₹{today_expenses['total_expenses']}. You have {today_expenses['count']} transactions."
                        else:
                            response_message = "आज कोई खर्च नहीं हुआ है।" if language == "hi" else "No expenses recorded for today."
                    else:
                        response_message = intent_result.get("response_message", "I'm here to help with your business needs!")
                else:
                    response_message = intent_result.get("response_message", "I'm here to help with your business needs!")
            
            # Save chat history
            business_logic.save_chat_history(
                user_id=user_id,
                message=transcribed_text,
                response=response_message,
                message_type="voice",
                intent=intent_result.get("primary_intent", intent_result.get("intent", "general"))
            )

            return JSONResponse({
                "success": True,
                "transcribed_text": transcribed_text,
                "message": response_message,
                "intent": intent_result.get("primary_intent", intent_result.get("intent", "general")),
                "confidence": confidence,
                "detected_language": detected_language,
                "business_results": business_results,
                "transactions_processed": len(business_results)
            })
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
        
    except Exception as e:
        logger.error(f"Error processing voice message: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "आवाज़ प्रोसेसिंग में त्रुटि हुई।" if language == "hi" else "Error processing voice message.",
            "error": str(e)
        }, status_code=500)

@app.post("/api/chat/image")
async def process_image_message(
    image_file: UploadFile = File(...),
    language: str = Form("en"),
    authorization: Optional[str] = Header(None)
):
    """
    Process image (bill/receipt) and extract business data
    """
    try:
        # Get user ID from auth token
        user_id = get_user_id_from_auth(authorization)
        logger.info(f"Processing image from user: {user_id}, content_type: {image_file.content_type}")

        # Validate file type
        if not image_file.content_type or not image_file.content_type.startswith("image/"):
            logger.warning(f"Invalid content type: {image_file.content_type}")
            return JSONResponse({
                "success": False,
                "message": "कृपया एक वैध छवि फ़ाइल अपलोड करें।" if language == "hi" else "Please upload a valid image file."
            }, status_code=400)
        
        # Save uploaded file temporarily with proper extension
        file_extension = ".jpg"  # Default
        if image_file.content_type:
            if "png" in image_file.content_type.lower():
                file_extension = ".png"
            elif "jpeg" in image_file.content_type.lower() or "jpg" in image_file.content_type.lower():
                file_extension = ".jpg"
            elif "gif" in image_file.content_type.lower():
                file_extension = ".gif"
            elif "bmp" in image_file.content_type.lower():
                file_extension = ".bmp"

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            content = await image_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        logger.info(f"Saved uploaded image to: {temp_file_path} (content-type: {image_file.content_type})")
        
        try:
            # Use Simple Receipt Processor (your working code)
            logger.info(f"🧾 Processing receipt with your Azure Document Intelligence code: {temp_file_path}")

            from simple_receipt_processor import SimpleReceiptProcessor
            processor = SimpleReceiptProcessor()

            # Process receipt with your exact approach
            receipt_data = processor.process_receipt(temp_file_path)
            logger.info(f"Receipt processing result: success={receipt_data.get('success')}, items={receipt_data.get('item_count', 0)}")

            if receipt_data.get("success"):
                items = receipt_data.get("items", [])
                merchant = receipt_data.get("merchant", {})
                total_amount = receipt_data.get("total_amount", 0)

                logger.info(f"✅ Receipt processed successfully!")
                logger.info(f"Merchant: {merchant.get('name', 'Unknown')}")
                logger.info(f"Items found: {len(items)}")
                logger.info(f"Total amount: {total_amount}")

                if items:
                    # Use your simple processor to format items for clarification
                    items_for_clarification = processor.format_items_for_clarification(receipt_data)

                    # Create business data for clarification
                    business_data = {
                        "intent": "item_clarification",
                        "action": "categorize_items",
                        "confidence": 0.9,
                        "response_message": f"I found {len(items_for_clarification)} items from your receipt. Please review and confirm the categorization:",
                        "data": {
                            "receipt_info": merchant,
                            "total_amount": total_amount,
                            "items_for_clarification": items_for_clarification
                        }
                    }
                else:
                    # No items found, but receipt was processed
                    business_data = {
                        "intent": "receipt_processed",
                        "action": "no_items",
                        "confidence": 0.8,
                        "response_message": f"I processed your receipt from {merchant.get('name', 'the store')}, but couldn't extract specific items. The total amount was {total_amount}.",
                        "data": {
                            "receipt_info": merchant,
                            "total_amount": total_amount
                        }
                    }

            else:
                # Document Intelligence failed
                error_msg = receipt_data.get("error", "Unknown error")
                logger.warning(f"Document Intelligence failed: {error_msg}")

                business_data = {
                    "intent": "error",
                    "action": "processing_failed",
                    "confidence": 0.1,
                    "response_message": "I couldn't process this receipt. Please make sure the image is clear and contains a valid receipt.",
                    "data": {"error": error_msg}
                }

            # Use Supabase business logic
            business_logic = supabase_business

            # Process business results based on Document Intelligence output
            business_results = []
            intent_result = {
                "intent": business_data.get("intent", "receipt_processed"),
                "action": business_data.get("action", "processed"),
                "confidence": business_data.get("confidence", 0.9)
            }
            response_message = business_data.get("response_message", "Receipt processed successfully")

            # Save chat history
            business_logic.save_chat_history(
                user_id=user_id,
                message=f"Receipt uploaded: {receipt_data.get('merchant', {}).get('name', 'Unknown store')}",
                response=response_message,
                message_type="image",
                intent=intent_result["intent"]
            )

            # Prepare clean response
            response_data = {
                "success": True,
                "business_data": business_data,
                "message": response_message,
                "intent": intent_result["intent"],
                "confidence": intent_result["confidence"],
                "business_results": business_results,
                "analysis_type": "azure_document_intelligence"
            }

            # Add Receipt data if available
            if 'receipt_data' in locals() and receipt_data.get("success"):
                response_data.update({
                    "receipt_data": {
                        "merchant": receipt_data.get("merchant", {}),
                        "items": receipt_data.get("items", []),
                        "totals": receipt_data.get("totals", {}),
                        "item_count": receipt_data.get("item_count", 0),
                        "total_amount": receipt_data.get("total_amount", 0),
                        "confidence": receipt_data.get("confidence", 0),
                        "service_used": receipt_data.get("service_used", "azure_document_intelligence")
                    }
                })

            # Handle item clarification
            if intent_result.get("intent") == "item_clarification" and business_data.get("data", {}).get("items_for_clarification"):
                response_data.update({
                    "needs_clarification": True,
                    "clarification_items": business_data["data"]["items_for_clarification"]
                })

            return JSONResponse(response_data)

        finally:
            # Clean up temporary file
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "छवि प्रोसेसिंग में त्रुटि हुई।" if language == "hi" else "Error processing image.",
            "error": str(e)
        }, status_code=500)

# Summary endpoints
@app.get("/api/summary/income")
async def get_income_summary(
    authorization: Optional[str] = Header(None)
):
    """Get income summary"""
    user_id = get_user_id_from_auth(authorization)
    return supabase_business.get_income_summary(user_id)

@app.get("/api/summary/expense")
async def get_expense_summary(
    authorization: Optional[str] = Header(None)
):
    """Get expense summary"""
    user_id = get_user_id_from_auth(authorization)
    return supabase_business.get_expense_summary(user_id)

@app.post("/api/expenses")
async def add_expense(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Add a new expense"""
    try:
        data = await request.json()
        user_id = get_user_id_from_auth(authorization)

        result = supabase_business.add_expense(
            user_id=user_id,
            amount=data.get("amount"),
            description=data.get("description"),
            category=data.get("category", "general"),
            source="manual"
        )

        return result
    except Exception as e:
        logger.error(f"Error adding expense: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to add expense",
            "error": str(e)
        }, status_code=500)

@app.post("/api/inventory")
async def add_inventory_item(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Add a new inventory item"""
    try:
        data = await request.json()
        user_id = get_user_id_from_auth(authorization)

        result = supabase_business.add_inventory_item(
            user_id=user_id,
            product_name=data.get("product_name"),
            quantity=data.get("quantity"),
            cost_per_unit=data.get("cost_per_unit"),
            unit=data.get("unit", "pieces")
        )

        return result
    except Exception as e:
        logger.error(f"Error adding inventory item: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to add inventory item",
            "error": str(e)
        }, status_code=500)

@app.post("/api/income")
async def add_income(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Add a new income entry"""
    try:
        data = await request.json()
        user_id = get_user_id_from_auth(authorization)

        result = supabase_business.add_income(
            user_id=user_id,
            amount=data.get("amount"),
            description=data.get("description"),
            category=data.get("category", "general"),
            source="manual",
            language=data.get("language", "hi")
        )

        return result
    except Exception as e:
        logger.error(f"Error adding income: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to add income",
            "error": str(e)
        }, status_code=500)

@app.get("/api/summary/inventory")
async def get_inventory_summary(
    authorization: Optional[str] = Header(None)
):
    """Get inventory summary"""
    user_id = get_user_id_from_auth(authorization)
    return supabase_business.get_inventory_summary(user_id)

@app.put("/api/inventory/{item_id}")
async def update_inventory_item(
    item_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Update an existing inventory item"""
    try:
        data = await request.json()
        user_id = get_user_id_from_auth(authorization)

        result = supabase_business.update_inventory_item(
            item_id=item_id,
            user_id=user_id,
            product_name=data.get("product_name"),
            quantity=data.get("quantity"),
            cost_per_unit=data.get("cost_per_unit"),
            unit=data.get("unit", "pieces")
        )

        return result
    except Exception as e:
        logger.error(f"Error updating inventory item: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to update inventory item",
            "error": str(e)
        }, status_code=500)

@app.delete("/api/inventory/{item_id}")
async def delete_inventory_item(
    item_id: str,
    authorization: Optional[str] = Header(None)
):
    """Delete an inventory item"""
    try:
        user_id = get_user_id_from_auth(authorization)
        result = supabase_business.delete_inventory_item(item_id, user_id)
        return result
    except Exception as e:
        logger.error(f"Error deleting inventory item: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to delete inventory item",
            "error": str(e)
        }, status_code=500)

# Income and Expense individual item endpoints
@app.put("/api/income/{income_id}")
async def update_income_item(
    income_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Update an existing income item"""
    try:
        data = await request.json()
        user_id = get_user_id_from_auth(authorization)

        result = supabase_business.update_income_item(
            income_id=income_id,
            user_id=user_id,
            amount=data.get("amount"),
            description=data.get("description"),
            category=data.get("category", "general")
        )

        return result
    except Exception as e:
        logger.error(f"Error updating income item: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to update income item",
            "error": str(e)
        }, status_code=500)

@app.delete("/api/income/{income_id}")
async def delete_income_item(
    income_id: str,
    authorization: Optional[str] = Header(None)
):
    """Delete an income item"""
    try:
        user_id = get_user_id_from_auth(authorization)
        result = supabase_business.delete_income_item(income_id, user_id)
        return result
    except Exception as e:
        logger.error(f"Error deleting income item: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to delete income item",
            "error": str(e)
        }, status_code=500)

@app.put("/api/expenses/{expense_id}")
async def update_expense_item(
    expense_id: str,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Update an existing expense item"""
    try:
        data = await request.json()
        user_id = get_user_id_from_auth(authorization)

        result = supabase_business.update_expense_item(
            expense_id=expense_id,
            user_id=user_id,
            amount=data.get("amount"),
            description=data.get("description"),
            category=data.get("category", "general")
        )

        return result
    except Exception as e:
        logger.error(f"Error updating expense item: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to update expense item",
            "error": str(e)
        }, status_code=500)

@app.delete("/api/expenses/{expense_id}")
async def delete_expense_item(
    expense_id: str,
    authorization: Optional[str] = Header(None)
):
    """Delete an expense item"""
    try:
        user_id = get_user_id_from_auth(authorization)
        result = supabase_business.delete_expense_item(expense_id, user_id)
        return result
    except Exception as e:
        logger.error(f"Error deleting expense item: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to delete expense item",
            "error": str(e)
        }, status_code=500)

# USER PROFILE ENDPOINTS
@app.get("/api/profile")
async def get_user_profile(authorization: Optional[str] = Header(None)):
    """Get user profile"""
    try:
        user_id = get_user_id_from_auth(authorization)
        result = supabase_business.get_user_profile(user_id)
        return result
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to get user profile",
            "error": str(e)
        }, status_code=500)

@app.put("/api/profile")
async def update_user_profile(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Update user profile"""
    try:
        data = await request.json()
        user_id = get_user_id_from_auth(authorization)
        
        result = supabase_business.update_user_profile(user_id, data)
        return result
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to update user profile",
            "error": str(e)
        }, status_code=500)

@app.post("/api/settings")
async def save_user_settings(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Save user settings"""
    try:
        data = await request.json()
        user_id = get_user_id_from_auth(authorization)
        
        result = supabase_business.save_user_settings(user_id, data)
        return result
    except Exception as e:
        logger.error(f"Error saving user settings: {str(e)}")
        return JSONResponse({
            "success": False,
            "message": "Failed to save user settings",
            "error": str(e)
        }, status_code=500)

# Clear data endpoints
@app.delete("/api/expenses/clear")
async def clear_expenses(
    authorization: Optional[str] = Header(None)
):
    """Clear all expenses for a user"""
    try:
        user_id = get_user_id_from_auth(authorization)
        result = supabase_business.clear_expenses(user_id)
        return {"success": True, "message": result["message"]}
    except Exception as e:
        logger.error(f"Error clearing expenses: {str(e)}")
        return JSONResponse({"success": False, "message": "Failed to clear expenses"}, status_code=500)

@app.delete("/api/income/clear")
async def clear_income(
    authorization: Optional[str] = Header(None)
):
    """Clear all income for a user"""
    try:
        user_id = get_user_id_from_auth(authorization)
        result = supabase_business.clear_income(user_id)
        return {"success": True, "message": result["message"]}
    except Exception as e:
        logger.error(f"Error clearing income: {str(e)}")
        return JSONResponse({"success": False, "message": "Failed to clear income"}, status_code=500)

@app.delete("/api/chat/clear")
async def clear_chat_history(
    authorization: Optional[str] = Header(None)
):
    """Clear all chat history for a user"""
    try:
        user_id = get_user_id_from_auth(authorization)
        result = supabase_business.clear_chat_history(user_id)
        return {"success": True, "message": result["message"]}
    except Exception as e:
        logger.error(f"Error clearing chat history: {str(e)}")
        return JSONResponse({"success": False, "message": "Failed to clear chat history"}, status_code=500)

@app.delete("/api/all/clear")
async def clear_all_data(
    authorization: Optional[str] = Header(None)
):
    """Clear all data for a user (expenses, income, inventory, chat)"""
    try:
        user_id = get_user_id_from_auth(authorization)
        result = supabase_business.clear_all_data(user_id)
        return {"success": True, "message": result["message"]}
    except Exception as e:
        logger.error(f"Error clearing all data: {str(e)}")
        return JSONResponse({"success": False, "message": "Failed to clear all data"}, status_code=500)

@app.get("/api/chat/history")
async def get_chat_history(
    limit: int = 50,
    authorization: Optional[str] = Header(None)
):
    """Get chat history for a user"""
    user_id = get_user_id_from_auth(authorization)
    return supabase_business.get_chat_history(user_id, limit)

@app.post("/api/chat/confirm-items")
async def confirm_items(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Process user-confirmed items from clarification table"""
    try:
        data = await request.json()
        user_id = get_user_id_from_auth(authorization)
        confirmed_items = data.get("items", [])

        logger.info(f"Processing {len(confirmed_items)} confirmed items for user {user_id}")

        business_results = []

        for item in confirmed_items:
            category = item.get("category", "expense")
            name = item.get("name", "Unknown Item")
            quantity = float(item.get("quantity", 1))
            amount = float(item.get("amount", 0))
            cost_per_unit = float(item.get("cost_per_unit", 0))
            unit = item.get("unit", "pieces")

            if category == "income":
                result = supabase_business.add_income(
                    user_id=user_id,
                    amount=amount,
                    description=f"{quantity}x {name}" if quantity > 1 else name,
                    category="sales",
                    source="user_confirmed"
                )
                business_results.append(result)

            elif category == "expense":
                result = supabase_business.add_expense(
                    user_id=user_id,
                    amount=amount,
                    description=f"{quantity}x {name}" if quantity > 1 else name,
                    category="general",
                    source="user_confirmed"
                )
                business_results.append(result)

            elif category == "inventory":
                logger.info(f"Adding inventory item: name={name}, quantity={quantity}, cost_per_unit={cost_per_unit}, user_id={user_id}")
                result = supabase_business.add_inventory_item(
                    user_id=user_id,
                    product_name=name,
                    quantity=quantity,
                    unit=unit,
                    cost_per_unit=cost_per_unit
                )
                logger.info(f"Inventory item result: {result}")
                business_results.append(result)

        # Create summary message
        success_count = len([r for r in business_results if r.get("success", False)])
        summary_message = f"✅ Successfully processed {success_count} items!"

        # Save confirmation to chat history
        supabase_business.save_chat_history(
            user_id=user_id,
            message=f"Confirmed {len(confirmed_items)} items",
            response=summary_message,
            message_type="confirmation",
            intent="item_confirmation"
        )

        return {
            "success": True,
            "message": summary_message,
            "business_results": business_results,
            "processed_count": success_count
        }

    except Exception as e:
        logger.error(f"Error processing confirmed items: {str(e)}")
        return JSONResponse(
            {"success": False, "message": f"Error processing items: {str(e)}"},
            status_code=500
        )

@app.post("/api/loan/query")
async def process_loan_query(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """
    Process loan queries using RAG pipeline
    """
    try:
        data = await request.json()
        query = data.get("query", "")
        language = data.get("language", "en")
        user_id = get_user_id_from_auth(authorization)

        if not query.strip():
            return JSONResponse(
                {"success": False, "message": "Query is required"},
                status_code=400
            )

        logger.info(f"Processing loan query: '{query}' for user {user_id} in {language}")

        # Process the loan query using RAG
        result = loan_rag_processor.process_loan_query(query, language)

        # Save to chat history
        if result.get("success", False):
            supabase_business.save_chat_history(
                user_id=user_id,
                message=query,
                response=result["response"],
                message_type="loan_query",
                intent="loan_inquiry"
            )

        return result

    except Exception as e:
        logger.error(f"Error processing loan query: {str(e)}")
        return JSONResponse(
            {"success": False, "message": f"Error processing loan query: {str(e)}"},
            status_code=500
        )

@app.get("/api/loan/schemes")
async def get_loan_schemes(
    authorization: Optional[str] = Header(None)
):
    """
    Get all available loan schemes
    """
    try:
        user_id = get_user_id_from_auth(authorization)
        schemes = loan_rag_processor.load_schemes_data()
        
        return {
            "success": True,
            "schemes": schemes,
            "total_schemes": len(schemes)
        }

    except Exception as e:
        logger.error(f"Error getting loan schemes: {str(e)}")
        return JSONResponse(
            {"success": False, "message": f"Error getting loan schemes: {str(e)}"},
            status_code=500
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 