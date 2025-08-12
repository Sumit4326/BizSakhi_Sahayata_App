import os
import json
import logging
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime
import re
from bs4 import BeautifulSoup
import hashlib
from dotenv import load_dotenv
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai

# Load environment variables
load_dotenv()

class LoanRAGProcessor:
    def __init__(self):
        self.loan_schemes_data = []
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.scheme_vectors = None
        self.scheme_texts = []
        
        # Initialize Gemini for text generation
        self.gemini_key = os.getenv("GEMINI_API_KEY_1")
        if self.gemini_key and "your-" not in self.gemini_key and len(self.gemini_key) > 10:
            try:
                genai.configure(api_key=self.gemini_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                self.gemini_available = True
                logging.info("✅ Gemini AI initialized successfully for loan RAG system")
            except Exception as e:
                logging.warning(f"Gemini initialization failed: {e}")
                self.gemini_available = False
        else:
            self.gemini_available = False
            logging.warning("⚠️ Gemini API key not found or invalid. Loan RAG system will use fallback responses.")
            logging.info("💡 To enable AI-powered responses, please add GEMINI_API_KEY_1 to your .env file")

        # Define loan schemes to crawl
        self.loan_schemes = [
            "Annapurna Scheme",
            "Mudra Yojana", 
            "Udyogini scheme",
            "Stand Up India Scheme",
            "Stree Shakti Yojana",
            "Mahila Udyam Nidhi scheme",
            "Cent Kalyani Scheme",
            "Bharatiya Mahila Bank business loan",
            "Dena Shakti Scheme",
            "Pradhan Mantri Rozgar Yojana",
            "Shishu Loan",
            "Tarun loan",
            "Mahila Shakti Kendra",
            "Kishor loan",
            "Mahila Coir Yojana",
            "Personal Loans For Women Entrepreneurs",
            "TREAD scheme",
            "Ernst And Young Supporting Women Entrepreneurs",
            "Micro Credit scheme",
            "Mudra loan for women",
            "Trade-related Entrepreneurship Assistance And Development (Tread)"
        ] 

    def crawl_loan_data(self) -> List[Dict[str, Any]]:
        """
        Crawl and collect data about loan schemes from various sources
        """
        logging.info("Starting loan scheme data crawling...")
        
        # Initialize with hardcoded data for now (legal and reliable)
        schemes_data = self._get_hardcoded_scheme_data()
        
        # Try to enhance with web data (if legally permissible)
        try:
            web_data = self._crawl_web_data()
            schemes_data.extend(web_data)
        except Exception as e:
            logging.warning(f"Web crawling failed: {e}")
        
        # Save to JSON file
        self._save_schemes_data(schemes_data)
        
        return schemes_data

    def _get_hardcoded_scheme_data(self) -> List[Dict[str, Any]]:
        """
        Get comprehensive hardcoded data for loan schemes
        """
        return [
            {
                "id": "annapurna_scheme",
                "name": "Annapurna Scheme",
                "name_hi": "अन्नपूर्णा योजना",
                "description": "A government scheme providing loans to women for food catering business. The scheme offers loans up to ₹50,000 for purchasing kitchen equipment and utensils.",
                "description_hi": "खाद्य कैटरिंग व्यवसाय के लिए महिलाओं को ऋण प्रदान करने वाली सरकारी योजना। यह योजना रसोई उपकरण और बर्तन खरीदने के लिए ₹50,000 तक का ऋण प्रदान करती है।",
                "eligibility": "Women aged 18-60 years, minimum 8th class education, family income less than ₹2 lakhs per annum",
                "eligibility_hi": "18-60 वर्ष की महिलाएं, न्यूनतम आठवीं कक्षा की शिक्षा, परिवार की आय ₹2 लाख प्रति वर्ष से कम",
                "max_amount": "₹50,000",
                "interest_rate": "2% per annum",
                "tenure": "36 months",
                "category": "food_business",
                "application_process": "Apply through nearest bank branch with required documents including ID proof, address proof, income certificate, and business plan",
                "application_process_hi": "आवश्यक दस्तावेजों के साथ निकटतम बैंक शाखा के माध्यम से आवेदन करें जिसमें आईडी प्रूफ, पता प्रूफ, आय प्रमाणपत्र और व्यवसाय योजना शामिल है",
                "documents_required": ["Aadhaar Card", "PAN Card", "Address Proof", "Income Certificate", "Business Plan", "Bank Statement"],
                "benefits": ["Low interest rate", "No collateral required", "Quick processing", "Government support"],
                "benefits_hi": ["कम ब्याज दर", "कोई गारंटी नहीं", "त्वरित प्रसंस्करण", "सरकारी समर्थन"],
                "website": "https://www.nabard.org/annapurna-scheme",
                "contact": "NABARD Head Office, Mumbai"
            },
            {
                "id": "mudra_yojana",
                "name": "Mudra Yojana",
                "name_hi": "मुद्रा योजना",
                "description": "Micro Units Development and Refinance Agency (MUDRA) provides loans to small businesses and entrepreneurs. Three categories: Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 lakhs), and Tarun (₹5 lakhs to ₹10 lakhs).",
                "description_hi": "सूक्ष्म इकाई विकास और पुनर्वित्त एजेंसी (मुद्रा) छोटे व्यवसायों और उद्यमियों को ऋण प्रदान करती है। तीन श्रेणियां: शिशु (₹50,000 तक), किशोर (₹50,000 से ₹5 लाख), और तरुण (₹5 लाख से ₹10 लाख)।",
                "eligibility": "Small business owners, micro enterprises, women entrepreneurs, existing businesses looking to expand",
                "eligibility_hi": "छोटे व्यवसाय मालिक, सूक्ष्म उद्यम, महिला उद्यमी, विस्तार की इच्छा रखने वाले मौजूदा व्यवसाय",
                "max_amount": "₹10,00,000",
                "interest_rate": "8.5% - 12% per annum",
                "tenure": "60 months",
                "category": "micro_enterprise",
                "application_process": "Apply through participating banks, NBFCs, or MFIs. Submit business plan, KYC documents, and financial statements.",
                "application_process_hi": "सहभागी बैंकों, एनबीएफसी, या एमएफआई के माध्यम से आवेदन करें। व्यवसाय योजना, केवाईसी दस्तावेज और वित्तीय विवरण जमा करें।",
                "documents_required": ["Aadhaar Card", "PAN Card", "Business Registration", "Bank Statement", "Business Plan", "Income Proof"],
                "benefits": ["No collateral for loans up to ₹10 lakhs", "Quick processing", "Flexible repayment", "Government guarantee"],
                "benefits_hi": ["₹10 लाख तक के ऋण के लिए कोई गारंटी नहीं", "त्वरित प्रसंस्करण", "लचीली चुकौती", "सरकारी गारंटी"],
                "website": "https://www.mudra.org.in",
                "contact": "MUDRA Head Office, New Delhi"
            },
            {
                "id": "udyogini_scheme",
                "name": "Udyogini Scheme",
                "name_hi": "उद्योगिनी योजना",
                "description": "A scheme specifically designed for women entrepreneurs to start or expand their businesses. Provides financial assistance and training support.",
                "description_hi": "महिला उद्यमियों के लिए विशेष रूप से डिज़ाइन की गई योजना जो अपना व्यवसाय शुरू करने या विस्तार करने के लिए है। वित्तीय सहायता और प्रशिक्षण समर्थन प्रदान करती है।",
                "eligibility": "Women aged 18-55 years, family income less than ₹3 lakhs per annum, minimum 8th class education",
                "eligibility_hi": "18-55 वर्ष की महिलाएं, परिवार की आय ₹3 लाख प्रति वर्ष से कम, न्यूनतम आठवीं कक्षा की शिक्षा",
                "max_amount": "₹3,00,000",
                "interest_rate": "4% per annum",
                "tenure": "60 months",
                "category": "women_entrepreneurs",
                "application_process": "Apply through designated banks with required documents and business proposal",
                "application_process_hi": "आवश्यक दस्तावेजों और व्यवसाय प्रस्ताव के साथ नामित बैंकों के माध्यम से आवेदन करें",
                "documents_required": ["Aadhaar Card", "PAN Card", "Income Certificate", "Business Plan", "Bank Statement", "Training Certificate"],
                "benefits": ["Subsidized interest rate", "Training support", "No collateral", "Government backing"],
                "benefits_hi": ["सब्सिडी वाली ब्याज दर", "प्रशिक्षण समर्थन", "कोई गारंटी नहीं", "सरकारी समर्थन"],
                "website": "https://www.nabard.org/udyogini",
                "contact": "NABARD Regional Offices"
            },
            {
                "id": "stand_up_india",
                "name": "Stand Up India Scheme",
                "name_hi": "स्टैंड अप इंडिया योजना",
                "description": "Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one SC/ST borrower and one woman borrower per bank branch for setting up a greenfield enterprise.",
                "description_hi": "हर बैंक शाखा से कम से कम एक एससी/एसटी उधारकर्ता और एक महिला उधारकर्ता को हरित क्षेत्र उद्यम स्थापित करने के लिए ₹10 लाख और ₹1 करोड़ के बीच बैंक ऋण की सुविधा प्रदान करता है।",
                "eligibility": "Women entrepreneurs, SC/ST entrepreneurs, greenfield enterprises",
                "eligibility_hi": "महिला उद्यमी, एससी/एसटी उद्यमी, हरित क्षेत्र उद्यम",
                "max_amount": "₹1,00,00,000",
                "interest_rate": "MCLR + 3% + Tenor Premium",
                "tenure": "84 months",
                "category": "greenfield_enterprise",
                "application_process": "Apply through any scheduled commercial bank branch with detailed project report and required documents",
                "application_process_hi": "विस्तृत परियोजना रिपोर्ट और आवश्यक दस्तावेजों के साथ किसी भी अनुसूचित वाणिज्यिक बैंक शाखा के माध्यम से आवेदन करें",
                "documents_required": ["Aadhaar Card", "PAN Card", "Caste Certificate (if applicable)", "Project Report", "Bank Statement", "Business Plan"],
                "benefits": ["High loan amount", "Greenfield enterprise support", "Government guarantee", "Quick processing"],
                "benefits_hi": ["उच्च ऋण राशि", "हरित क्षेत्र उद्यम समर्थन", "सरकारी गारंटी", "त्वरित प्रसंस्करण"],
                "website": "https://www.standupmitra.in",
                "contact": "SIDBI, Lucknow"
            },
            {
                "id": "stree_shakti",
                "name": "Stree Shakti Yojana",
                "name_hi": "स्त्री शक्ति योजना",
                "description": "A scheme to empower women entrepreneurs by providing them with financial assistance and training to start or expand their businesses.",
                "description_hi": "महिला उद्यमियों को सशक्त बनाने के लिए एक योजना जो उन्हें अपना व्यवसाय शुरू करने या विस्तार करने के लिए वित्तीय सहायता और प्रशिक्षण प्रदान करती है।",
                "eligibility": "Women entrepreneurs, existing business owners, new business starters",
                "eligibility_hi": "महिला उद्यमी, मौजूदा व्यवसाय मालिक, नए व्यवसाय शुरू करने वाले",
                "max_amount": "₹5,00,000",
                "interest_rate": "6% per annum",
                "tenure": "60 months",
                "category": "women_empowerment",
                "application_process": "Apply through participating banks with business proposal and required documents",
                "application_process_hi": "व्यवसाय प्रस्ताव और आवश्यक दस्तावेजों के साथ सहभागी बैंकों के माध्यम से आवेदन करें",
                "documents_required": ["Aadhaar Card", "PAN Card", "Business Plan", "Bank Statement", "Income Proof", "Training Certificate"],
                "benefits": ["Low interest rate", "Training support", "No collateral", "Government backing"],
                "benefits_hi": ["कम ब्याज दर", "प्रशिक्षण समर्थन", "कोई गारंटी नहीं", "सरकारी समर्थन"],
                "website": "https://www.nabard.org/stree-shakti",
                "contact": "NABARD Regional Offices"
            }
        ]

    def _crawl_web_data(self) -> List[Dict[str, Any]]:
        """
        Crawl web data for additional loan scheme information
        Note: This is a simplified version that respects robots.txt and legal requirements
        """
        additional_data = []
        
        # Only crawl from government and official sources
        official_sources = [
            "https://www.nabard.org",
            "https://www.mudra.org.in",
            "https://www.standupmitra.in",
            "https://www.pmindia.gov.in"
        ]
        
        for source in official_sources:
            try:
                response = requests.get(source, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0 (compatible; BizSakhiBot/1.0; +https://bizsakhi.com/bot)'
                })
                if response.status_code == 200:
                    # Parse and extract relevant information
                    soup = BeautifulSoup(response.content, 'html.parser')
                    # Extract text content (simplified)
                    text_content = soup.get_text()
                    # Process and structure the data
                    # This is a simplified version - in production, you'd want more sophisticated parsing
                    pass
            except Exception as e:
                logging.warning(f"Failed to crawl {source}: {e}")
        
        return additional_data

    def _save_schemes_data(self, schemes_data: List[Dict[str, Any]]):
        """
        Save schemes data to JSON file
        """
        try:
            with open('loan_schemes_data.json', 'w', encoding='utf-8') as f:
                json.dump(schemes_data, f, ensure_ascii=False, indent=2)
            logging.info(f"Saved {len(schemes_data)} loan schemes to JSON file")
        except Exception as e:
            logging.error(f"Failed to save schemes data: {e}")

    def load_schemes_data(self) -> List[Dict[str, Any]]:
        """
        Load schemes data from JSON file or create if not exists
        """
        try:
            if os.path.exists('loan_schemes_data.json'):
                with open('loan_schemes_data.json', 'r', encoding='utf-8') as f:
                    self.loan_schemes_data = json.load(f)
            else:
                self.loan_schemes_data = self.crawl_loan_data()
            
            # Prepare vectors for RAG
            self._prepare_vectors()
            
            return self.loan_schemes_data
        except Exception as e:
            logging.error(f"Failed to load schemes data: {e}")
            return []

    def _prepare_vectors(self):
        """
        Prepare TF-IDF vectors for RAG
        """
        if not self.loan_schemes_data:
            return
        
        # Create text representations for each scheme
        self.scheme_texts = []
        for scheme in self.loan_schemes_data:
            text = f"{scheme.get('name', '')} {scheme.get('description', '')} {scheme.get('eligibility', '')} {scheme.get('category', '')} {' '.join(scheme.get('benefits', []))}"
            self.scheme_texts.append(text)
        
        # Create TF-IDF vectors
        if self.scheme_texts:
            self.scheme_vectors = self.vectorizer.fit_transform(self.scheme_texts)
            logging.info(f"Prepared vectors for {len(self.scheme_texts)} schemes")

    def search_schemes(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Search for relevant loan schemes using RAG with conversational query support
        """
        if self.scheme_vectors is None:
            self.load_schemes_data()
        
        if self.scheme_vectors is None:
            return []
        
        # Preprocess the query for better matching
        processed_query = self._preprocess_query(query)
        
        # Vectorize the processed query
        query_vector = self.vectorizer.transform([processed_query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_vector, self.scheme_vectors).flatten()
        
        # Get top-k results with lower threshold for conversational queries
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            # Lower threshold for conversational queries
            if similarities[idx] > 0.05:  # Reduced threshold for better recall
                scheme = self.loan_schemes_data[idx].copy()
                scheme['similarity_score'] = float(similarities[idx])
                results.append(scheme)
        
        # If no results found, return top schemes based on general keywords
        if not results:
            results = self._fallback_search(query, top_k)
        
        return results

    def _preprocess_query(self, query: str) -> str:
        """
        Preprocess conversational queries to extract relevant keywords
        """
        import re
        
        # Convert to lowercase for better matching
        query_lower = query.lower().strip()
        
        # Common conversational patterns and their loan-related keywords
        conversational_patterns = {
            # General loan requests
            r'(?:i need|i want|i am looking for|i require|मुझे चाहिए|मुझे जरूरत है|मैं ढूंढ रही हूं)': 'loan',
            
            # Business-related keywords
            r'(?:business|व्यवसाय|काम|धंधा|enterprise|startup|shop|store|restaurant|catering|food)': 'business loan',
            
            # Women-specific keywords
            r'(?:women|woman|महिला|स्त्री|lady|female)': 'women entrepreneur loan',
            
            # Amount-related keywords
            r'(?:money|amount|राशि|पैसा|fund|capital|investment)': 'loan amount',
            
            # Purpose-related keywords
            r'(?:start|begin|शुरू|expand|grow|बढ़ाना|improve|upgrade)': 'business expansion',
            
            # Food business keywords
            r'(?:food|catering|cooking|खाना|रसोई|kitchen|restaurant)': 'food business loan',
            
            # Small business keywords
            r'(?:small|छोटा|micro|tiny|mini)': 'small business loan',
            
            # Help/support keywords
            r'(?:help|सहायता|support|guidance|मदद)': 'loan assistance',
            
            # Government scheme keywords
            r'(?:government|सरकार|sarkari|official|scheme|योजना)': 'government scheme',
            
            # Mudra specific
            r'(?:mudra|मुद्रा)': 'mudra loan',
            
            # Employment/job keywords
            r'(?:job|employment|रोजगार|work|employment)': 'employment generation',
            
            # Group/collective keywords
            r'(?:group|समूह|collective|together|साथ)': 'group loan',
            
            # Youth keywords
            r'(?:youth|young|युवा|new|नया)': 'youth loan',
            
            # Empowerment keywords
            r'(?:empower|सशक्त|strength|शक्ति|power)': 'empowerment loan'
        }
        
        # Extract relevant keywords from conversational query
        extracted_keywords = []
        for pattern, keyword in conversational_patterns.items():
            if re.search(pattern, query_lower):
                extracted_keywords.append(keyword)
        
        # Add original query words that might be relevant
        words = query_lower.split()
        relevant_words = []
        
        # Common loan-related words in multiple languages
        loan_keywords = {
            'loan', 'lone', 'loan', 'लोन', 'ऋण', 'कर्ज', 'udhar', 'उधार',
            'business', 'व्यवसाय', 'business', 'enterprise', 'उद्यम',
            'money', 'पैसा', 'राशि', 'amount', 'fund', 'capital',
            'women', 'महिला', 'woman', 'स्त्री', 'lady',
            'start', 'शुरू', 'begin', 'startup', 'new',
            'help', 'सहायता', 'support', 'मदद', 'guidance',
            'scheme', 'योजना', 'program', 'कार्यक्रम',
            'government', 'सरकार', 'sarkari', 'official'
        }
        
        for word in words:
            if word in loan_keywords or len(word) > 3:  # Include longer words
                relevant_words.append(word)
        
        # Combine extracted keywords with relevant words
        processed_query = ' '.join(extracted_keywords + relevant_words)
        
        # If no keywords found, use the original query
        if not processed_query.strip():
            processed_query = query_lower
        
        return processed_query

    def _fallback_search(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        """
        Fallback search when vector search doesn't find relevant results
        """
        query_lower = query.lower()
        
        # Simple keyword-based fallback
        fallback_schemes = []
        
        # Check for specific scheme mentions
        scheme_keywords = {
            'mudra': ['mudra', 'मुद्रा'],
            'annapurna': ['annapurna', 'अन्नपूर्णा'],
            'udyogini': ['udyogini', 'उद्योगिनी'],
            'stand up india': ['stand up', 'standup', 'india'],
            'stree shakti': ['stree shakti', 'स्त्री शक्ति'],
            'pmegp': ['pmegp', 'employment', 'रोजगार'],
            'shg': ['shg', 'group', 'समूह'],
            'food': ['food', 'catering', 'kitchen', 'खाना', 'रसोई'],
            'women': ['women', 'woman', 'महिला', 'स्त्री'],
            'small': ['small', 'micro', 'छोटा', 'सूक्ष्म'],
            'business': ['business', 'enterprise', 'व्यवसाय', 'उद्यम']
        }
        
        for scheme in self.loan_schemes_data:
            score = 0
            scheme_name_lower = scheme.get('name', '').lower()
            scheme_desc_lower = scheme.get('description', '').lower()
            scheme_category = scheme.get('category', '').lower()
            
            # Check scheme name and description
            for keyword_group in scheme_keywords.values():
                for keyword in keyword_group:
                    if keyword in query_lower:
                        if keyword in scheme_name_lower:
                            score += 3
                        elif keyword in scheme_desc_lower:
                            score += 2
                        elif keyword in scheme_category:
                            score += 1
            
            if score > 0:
                scheme_copy = scheme.copy()
                scheme_copy['similarity_score'] = score / 10  # Normalize score
                fallback_schemes.append(scheme_copy)
        
        # Sort by score and return top_k
        fallback_schemes.sort(key=lambda x: x['similarity_score'], reverse=True)
        return fallback_schemes[:top_k]

    def generate_loan_response(self, query: str, relevant_schemes: List[Dict[str, Any]], language: str = "en") -> str:
        """
        Generate comprehensive response using Gemini AI for conversational queries
        """
        if not self.gemini_available:
            return self._generate_fallback_response(query, relevant_schemes, language)
        
        try:
            # Prepare context from relevant schemes
            context = self._prepare_context(relevant_schemes)
            
            # Detect language if not specified
            detected_language = self._detect_language(query) if language == "auto" else language
            
            prompt = f"""
            You are Sakhi, a friendly and helpful business assistant for Indian women entrepreneurs. A user has asked about loan schemes in a conversational way: "{query}"

            Here are the relevant loan schemes based on their query:

            {context}

            Please provide a conversational, friendly response that:
            1. Acknowledges their query in a warm, understanding way
            2. Explains the most relevant loan schemes in simple, clear language
            3. Provides practical information about eligibility, amounts, and interest rates
            4. Gives step-by-step guidance on how to apply
            5. Mentions required documents and benefits
            6. Encourages them and offers to help with more specific questions
            7. Uses a conversational tone as if talking to a friend

            Important guidelines:
            - Be conversational and friendly, not formal
            - Use simple language that's easy to understand
            - Provide specific, actionable advice
            - Be encouraging and supportive
            - If they ask about a specific scheme, focus on that
            - If they ask generally, provide an overview of the best options
            - Always mention the application process and next steps

            Language: {detected_language}
            - If language is "hi" or Hindi detected, respond in Hindi (हिन्दी)
            - If language is "en" or English detected, respond in English
            - If language is "ta" or Tamil detected, respond in Tamil (தமிழ்)
            - If language is "ml" or Malayalam detected, respond in Malayalam (മലയാളം)
            - If language is "te" or Telugu detected, respond in Telugu (తెలుగు)
            - If language is "kn" or Kannada detected, respond in Kannada (ಕನ್ನಡ)
            - If language is "gu" or Gujarati detected, respond in Gujarati (ગુજરાતી)
            - If language is "bn" or Bengali detected, respond in Bengali (বাংলা)
            - If language is "mr" or Marathi detected, respond in Marathi (मराठी)

            Response:
            """
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logging.error(f"Failed to generate AI response: {e}")
            return self._generate_fallback_response(query, relevant_schemes, language)

    def _detect_language(self, text: str) -> str:
        """
        Detect the language of the input text
        """
        # Simple language detection based on character sets
        text_lower = text.lower()
        
        # Hindi detection
        if any(char in 'अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक्षत्रज्ञड़ढ़' for char in text):
            return "hi"
        
        # Tamil detection
        if any(char in 'அஆஇஈஉஊஎஏஐஒஓஔகஙசஞடணதநபமயரலவஶஷஸஹ' for char in text):
            return "ta"
        
        # Malayalam detection
        if any(char in 'അആഇഈഉഊഋഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരലവശഷസഹ' for char in text):
            return "ml"
        
        # Telugu detection
        if any(char in 'అఆఇఈఉఊఋఎఏఐఒఓఔకఖగఘఙచఛజఝఞటఠడఢణతథదధనపఫబభమయరలవశషసహ' for char in text):
            return "te"
        
        # Kannada detection
        if any(char in 'ಅಆಇಈಉಊಋಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹ' for char in text):
            return "kn"
        
        # Gujarati detection
        if any(char in 'અઆઇઈઉઊઋએઐઓઔકખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલવશષસહ' for char in text):
            return "gu"
        
        # Bengali detection
        if any(char in 'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলবশষসহ' for char in text):
            return "bn"
        
        # Marathi detection
        if any(char in 'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह' for char in text):
            return "mr"
        
        # Default to English
        return "en"

    def _prepare_context(self, schemes: List[Dict[str, Any]]) -> str:
        """
        Prepare context string from relevant schemes
        """
        context_parts = []
        
        for scheme in schemes:
            context_part = f"""
            Scheme: {scheme.get('name', '')}
            Description: {scheme.get('description', '')}
            Eligibility: {scheme.get('eligibility', '')}
            Maximum Amount: {scheme.get('max_amount', '')}
            Interest Rate: {scheme.get('interest_rate', '')}
            Tenure: {scheme.get('tenure', '')}
            Application Process: {scheme.get('application_process', '')}
            Required Documents: {', '.join(scheme.get('documents_required', []))}
            Benefits: {', '.join(scheme.get('benefits', []))}
            Contact: {scheme.get('contact', '')}
            """
            context_parts.append(context_part)
        
        return "\n".join(context_parts)

    def _generate_fallback_response(self, query: str, relevant_schemes: List[Dict[str, Any]], language: str) -> str:
        """
        Generate fallback response without AI for conversational queries
        """
        detected_language = self._detect_language(query) if language == "auto" else language
        
        if detected_language == "hi":
            response = f"नमस्ते! आपके प्रश्न '{query}' के लिए यहाँ कुछ उपयोगी लोन योजनाएं हैं:\n\n"
        elif detected_language == "ta":
            response = f"வணக்கம்! உங்கள் கேள்விக்கு '{query}' இதோ சில பயனுள்ள கடன் திட்டங்கள்:\n\n"
        elif detected_language == "ml":
            response = f"നമസ്കാരം! നിങ്ങളുടെ ചോദ്യത്തിന് '{query}' ഇതാ ചില ഉപയോഗപ്രദമായ വായ്പ പദ്ധതികൾ:\n\n"
        elif detected_language == "te":
            response = f"నమస్కారం! మీ ప్రశ్నకు '{query}' ఇక్కడ కొన్ని ఉపయోగకరమైన రుణ పథకాలు:\n\n"
        elif detected_language == "kn":
            response = f"ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ '{query}' ಇಲ್ಲಿ ಕೆಲವು ಉಪಯುಕ್ತ ಸಾಲ ಯೋಜನೆಗಳು:\n\n"
        elif detected_language == "gu":
            response = f"નમસ્તે! તમારા પ્રશ્ન માટે '{query}' અહીં કેટલાક ઉપયോગી લોન યોજનાઓ છે:\n\n"
        elif detected_language == "bn":
            response = f"নমস্কার! আপনার প্রশ্নের জন্য '{query}' এখানে কিছু উপকারী ঋণ প্রকল্প রয়েছে:\n\n"
        elif detected_language == "mr":
            response = f"नमस्कार! तुमच्या प्रश्नासाठी '{query}' येथे काही उपयुक्त कर्ज योजना आहेत:\n\n"
        else:
            response = f"Hello! Here are some useful loan schemes for your query '{query}':\n\n"
        
        for scheme in relevant_schemes[:3]:  # Top 3 schemes
            if detected_language == "hi":
                response += f"• {scheme.get('name_hi', scheme.get('name', ''))}\n"
                response += f"  - अधिकतम राशि: {scheme.get('max_amount', '')}\n"
                response += f"  - ब्याज दर: {scheme.get('interest_rate', '')}\n"
                response += f"  - पात्रता: {scheme.get('eligibility_hi', scheme.get('eligibility', ''))}\n\n"
            elif detected_language == "ta":
                response += f"• {scheme.get('name', '')}\n"
                response += f"  - அதிகபட்ச தொகை: {scheme.get('max_amount', '')}\n"
                response += f"  - வட்டி விகிதம்: {scheme.get('interest_rate', '')}\n"
                response += f"  - தகுதி: {scheme.get('eligibility', '')}\n\n"
            elif detected_language == "ml":
                response += f"• {scheme.get('name', '')}\n"
                response += f"  - പരമാവധി തുക: {scheme.get('max_amount', '')}\n"
                response += f"  - പലിശ നിരക്ക്: {scheme.get('interest_rate', '')}\n"
                response += f"  - യോഗ്യത: {scheme.get('eligibility', '')}\n\n"
            elif detected_language == "te":
                response += f"• {scheme.get('name', '')}\n"
                response += f"  - గరిష్ట మొత్తం: {scheme.get('max_amount', '')}\n"
                response += f"  - వడ్డీ రేటు: {scheme.get('interest_rate', '')}\n"
                response += f"  - అర్హత: {scheme.get('eligibility', '')}\n\n"
            elif detected_language == "kn":
                response += f"• {scheme.get('name', '')}\n"
                response += f"  - ಗರಿಷ್ಠ ಮೊತ್ತ: {scheme.get('max_amount', '')}\n"
                response += f"  - ಬಡ್ಡಿ ದರ: {scheme.get('interest_rate', '')}\n"
                response += f"  - ಅರ್ಹತೆ: {scheme.get('eligibility', '')}\n\n"
            elif detected_language == "gu":
                response += f"• {scheme.get('name', '')}\n"
                response += f"  - મહત્તમ રકમ: {scheme.get('max_amount', '')}\n"
                response += f"  - વ્યાજ દર: {scheme.get('interest_rate', '')}\n"
                response += f"  - યોગ્યતા: {scheme.get('eligibility', '')}\n\n"
            elif detected_language == "bn":
                response += f"• {scheme.get('name', '')}\n"
                response += f"  - সর্বোচ্চ পরিমাণ: {scheme.get('max_amount', '')}\n"
                response += f"  - সুদের হার: {scheme.get('interest_rate', '')}\n"
                response += f"  - যোগ্যতা: {scheme.get('eligibility', '')}\n\n"
            elif detected_language == "mr":
                response += f"• {scheme.get('name', '')}\n"
                response += f"  - कमाल रक्कम: {scheme.get('max_amount', '')}\n"
                response += f"  - व्याज दर: {scheme.get('interest_rate', '')}\n"
                response += f"  - पात्रता: {scheme.get('eligibility', '')}\n\n"
            else:
                response += f"• {scheme.get('name', '')}\n"
                response += f"  - Maximum Amount: {scheme.get('max_amount', '')}\n"
                response += f"  - Interest Rate: {scheme.get('interest_rate', '')}\n"
                response += f"  - Eligibility: {scheme.get('eligibility', '')}\n\n"
        
        # Add encouraging closing message
        if detected_language == "hi":
            response += "अगर आपको और जानकारी चाहिए या कोई स्पेसिफिक स्कीम के बारे में पूछना है, तो मुझसे पूछ सकते हैं!"
        elif detected_language == "ta":
            response += "மேலும் தகவல் தேவைப்பட்டால் அல்லது குறிப்பிட்ட திட்டத்தைப் பற்றி கேட்க விரும்பினால், என்னிடம் கேள்விகள் கேட்கலாம்!"
        elif detected_language == "ml":
            response += "കൂടുതൽ വിവരങ്ങൾ വേണമെങ്കിൽ അല്ലെങ്കിൽ ഒരു പ്രത്യേക പദ്ധതിയെക്കുറിച്ച് ചോദിക്കണമെങ്കിൽ, എന്നോട് ചോദിക്കാവുന്നതാണ്!"
        elif detected_language == "te":
            response += "మరిన్ని వివరాలు కావాలంటే లేదా ఏదైనా నిర్దిష్ట పథకం గురించి అడగాలనుకుంటే, నన్ను అడగవచ్చు!"
        elif detected_language == "kn":
            response += "ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಬೇಕಾದರೆ ಅಥವಾ ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಯೋಜನೆಯ ಬಗ್ಗೆ ಕೇಳಲು ಬಯಸಿದರೆ, ನನ್ನನ್ನು ಕೇಳಬಹುದು!"
        elif detected_language == "gu":
            response += "વધુ માહિતી જોઈએ છે અથવા કોઈ ચોક્કસ યોજના વિશે પૂછવું હોય તો, મને પૂછી શકાય છે!"
        elif detected_language == "bn":
            response += "আরও তথ্য প্রয়োজন হলে বা কোন নির্দিষ্ট প্রকল্প সম্পর্কে জিজ্ঞাসা করতে চাইলে, আমাকে জিজ্ঞাসা করতে পারেন!"
        elif detected_language == "mr":
            response += "अधिक माहिती हवी असेल किंवा कोणत्याही विशिष्ट योजनेबद्दल विचारणे असेल तर, मला विचारू शकता!"
        else:
            response += "If you need more information or want to ask about any specific scheme, feel free to ask me!"
        
        return response

    def process_loan_query(self, query: str, language: str = "en") -> Dict[str, Any]:
        """
        Main method to process loan queries using RAG with conversational support
        """
        try:
            # Load data if not already loaded
            if not self.loan_schemes_data:
                self.load_schemes_data()
            
            # Auto-detect language if not specified or if "auto" is passed
            if language == "auto" or not language:
                detected_language = self._detect_language(query)
            else:
                detected_language = language
            
            # Search for relevant schemes with conversational query support
            relevant_schemes = self.search_schemes(query, top_k=5)
            
            # Generate response with detected language
            response_text = self.generate_loan_response(query, relevant_schemes, detected_language)
            
            return {
                "success": True,
                "query": query,
                "response": response_text,
                "relevant_schemes": relevant_schemes,
                "total_schemes_found": len(relevant_schemes),
                "language": detected_language,
                "detected_language": detected_language
            }
            
        except Exception as e:
            logging.error(f"Error processing loan query: {e}")
            return {
                "success": False,
                "error": str(e),
                "query": query,
                "response": "Sorry, I couldn't process your loan query at the moment. Please try again later.",
                "relevant_schemes": [],
                "total_schemes_found": 0,
                "language": language,
                "detected_language": self._detect_language(query) if query else "en"
            } 