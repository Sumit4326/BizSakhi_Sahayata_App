# Loan RAG System

This module implements a comprehensive RAG (Retrieval-Augmented Generation) pipeline for loan scheme queries, specifically designed for Indian women entrepreneurs with **conversational AI support** and **multi-language capabilities**.

## 🎯 **Key Features**

- **🤖 Conversational AI**: Handles natural, chat-like queries in any language
- **🌍 Multi-language Support**: Supports 9+ Indian languages with auto-detection
- **🔍 Smart Search**: TF-IDF vectorization with conversational query preprocessing
- **📊 Comprehensive Data**: 21+ popular loan schemes for women entrepreneurs
- **🎨 User-Friendly**: Natural, friendly responses with application guidance
- **⚡ Real-time Processing**: Fast response with loading states and error handling

## 🌍 **Supported Languages**

1. **English** (en) - Default language
2. **Hindi** (hi) - हिन्दी
3. **Tamil** (ta) - தமிழ்
4. **Malayalam** (ml) - മലയാളം
5. **Telugu** (te) - తెలుగు
6. **Kannada** (kn) - ಕನ್ನಡ
7. **Gujarati** (gu) - ગુજરાતી
8. **Bengali** (bn) - বাংলা
9. **Marathi** (mr) - मराठी

## 💬 **Conversational Query Examples**

### English Queries
- "I need some money to start my food business"
- "Can you help me find a loan for my small shop?"
- "I'm a woman entrepreneur looking for financial support"
- "What are the best loan options for starting a business?"

### Hindi Queries
- "मुझे अपना खाने का धंधा शुरू करने के लिए पैसे चाहिए"
- "क्या आप मुझे मेरी छोटी दुकान के लिए लोन ढूंढने में मदद कर सकते हैं?"
- "मैं एक महिला उद्यमी हूं और वित्तीय सहायता की तलाश में हूं"

### Tamil Queries
- "எனது உணவு வணிகத்தைத் தொடங்க பணம் தேவை"
- "எனது சிறிய கடைக்கு கடன் கண்டுபிடிக்க உதவ முடியுமா?"
- "நான் ஒரு பெண் தொழில்முனைவோர், நிதி ஆதரவு தேடுகிறேன்"

## 🏗️ **Architecture**

### Components

1. **LoanRAGProcessor**: Main class handling all RAG operations
2. **Conversational Preprocessing**: Extracts keywords from natural language queries
3. **Language Detection**: Auto-detects language from query text
4. **Vector Processing**: TF-IDF vectorization for semantic search
5. **Query Processing**: RAG pipeline with Gemini AI integration
6. **Response Generation**: Contextual, friendly responses with application guidance

### Data Structure

Each loan scheme includes:
- Basic information (name, description, eligibility)
- Financial details (max amount, interest rate, tenure)
- Application process and required documents
- Benefits and advantages
- Contact information and website
- Multi-language support (Hindi translations)

## 🚀 **Usage**

### Backend API

```python
from loan_rag_processor import LoanRAGProcessor

# Initialize processor
processor = LoanRAGProcessor()

# Process conversational query (auto-detects language)
result = processor.process_loan_query(
    query="I need some money to start my food business",
    language="auto"  # Auto-detects language
)

# Get relevant schemes
schemes = processor.search_schemes("food business", top_k=5)
```

### Frontend Integration

```typescript
// Send conversational loan query
const response = await fetch('/api/loan/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "I need some money to start my food business",
    language: "auto"  // Auto-detects language
  })
});

const result = await response.json();
// result.detected_language - shows detected language
// result.response - conversational response
```

## 📡 **API Endpoints**

### POST /api/loan/query
Process conversational loan queries using RAG pipeline

**Request:**
```json
{
  "query": "I need some money to start my food business",
  "language": "auto"
}
```

**Response:**
```json
{
  "success": true,
  "query": "I need some money to start my food business",
  "response": "Hello! I understand you want to start a food business...",
  "relevant_schemes": [...],
  "total_schemes_found": 3,
  "language": "en",
  "detected_language": "en"
}
```

### GET /api/loan/schemes
Get all available loan schemes

**Response:**
```json
{
  "success": true,
  "schemes": [...],
  "total_schemes": 21
}
```

## 🔧 **Installation**

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
GEMINI_API_KEY_1=your_gemini_api_key
```

3. Test the system:
```bash
python test_loan_rag.py
```

## 🧪 **Testing**

Run the test script to verify functionality:
```bash
cd backend
python test_loan_rag.py
```

The test script includes:
- Conversational queries in multiple languages
- Language detection testing
- RAG pipeline validation
- Response quality assessment

## 🎨 **User Experience Features**

### Conversational Interface
- **Natural Language**: Users can ask questions in their own words
- **Friendly Tone**: Responses are warm and encouraging
- **Contextual Help**: Provides relevant information based on query
- **Multi-language**: Supports 9+ Indian languages

### Smart Processing
- **Language Auto-detection**: Automatically detects query language
- **Keyword Extraction**: Extracts relevant terms from conversational queries
- **Fallback Search**: Ensures results even with vague queries
- **Contextual Responses**: Provides relevant, actionable advice

### Rich Information Display
- **Detailed Cards**: Comprehensive loan scheme information
- **Application Guidance**: Step-by-step application process
- **Contact Information**: Direct contact details for schemes
- **Benefits Highlighting**: Key advantages of each scheme

## 🔮 **Future Enhancements**

1. **Enhanced Language Models**: BERT or other transformer models
2. **Voice Integration**: Voice-based loan queries
3. **Personalization**: User-specific recommendations
4. **Application Tracking**: Track loan application status
5. **Document Processing**: OCR for loan documents
6. **Real-time Updates**: Automatic data refresh from sources
7. **Chat History**: Persistent conversation context

## 📊 **Performance**

- **Response Time**: < 2 seconds for most queries
- **Accuracy**: High relevance scores for conversational queries
- **Language Support**: 9+ Indian languages
- **Scalability**: Handles multiple concurrent users

## 🤝 **Contributing**

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure legal compliance
5. Test with multiple languages
6. Maintain conversational tone

## 📄 **License**

This project is part of BizSakhi and follows the same licensing terms. 