import os
import pytesseract
from PIL import Image
import logging
from typing import Optional, List, Dict, Any
import re
import platform
import requests
import base64
from dotenv import load_dotenv

# Load environment variables from the correct path
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Configure Tesseract path for Windows
if platform.system() == "Windows":
    # Common Tesseract installation paths on Windows
    possible_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe".format(os.getenv('USERNAME', '')),
    ]

    for path in possible_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            logging.info(f"Found Tesseract at: {path}")
            break
    else:
        logging.warning("Tesseract not found in common paths. Please ensure it's installed and in PATH.")

# Try to import OCR libraries (optional)
try:
    from paddleocr import PaddleOCR
    PADDLEOCR_AVAILABLE = True
except ImportError:
    PADDLEOCR_AVAILABLE = False

try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False

if not PADDLEOCR_AVAILABLE and not EASYOCR_AVAILABLE:
    logging.warning("Only Tesseract OCR available. Install easyocr for better results: pip install easyocr")

class OCRProcessor:
    def __init__(self, engine: str = "azure_vision"):
        """
        Initialize OCR processor

        Args:
            engine: "azure_vision" (student tier), "google_vision_simple", "ocr_space", etc.
        """
        self.engine = engine
        self.max_file_size_mb = 1  # OCR.space limit

        # Initialize OCR.space
        self.ocr_space_api_key = os.getenv("OCR_SPACE_API_KEY", "helloworld")
        self.ocr_space_url = "https://api.ocr.space/parse/image"

        # Check Azure Computer Vision availability
        self.azure_vision_available = False
        azure_key = os.getenv("AZURE_VISION_KEY", "")
        azure_endpoint = os.getenv("AZURE_VISION_ENDPOINT", "")
        if (azure_key and azure_key != "your-azure-key-here" and
            azure_endpoint and azure_endpoint != "https://your-region.cognitiveservices.azure.com/"):
            self.azure_vision_available = True
            logging.info("Azure Computer Vision API ready")
        else:
            logging.warning("Azure Computer Vision not configured")

        # Set engine based on availability
        if engine == "azure_vision":
            if self.azure_vision_available:
                logging.info("Using Azure Computer Vision API")
            else:
                logging.warning("Azure Vision not available, falling back to OCR.space")
                self.engine = "ocr_space"
        elif engine == "easyocr" and EASYOCR_AVAILABLE:
            self.easy_reader = easyocr.Reader(['en', 'hi'])  # English and Hindi
        elif engine == "easyocr" and not EASYOCR_AVAILABLE:
            logging.warning("EasyOCR not available, falling back to Tesseract")
            self.engine = "tesseract"
        elif engine == "paddleocr" and PADDLEOCR_AVAILABLE:
            self.paddle_ocr = PaddleOCR(use_angle_cls=True, lang='en')
        elif engine == "paddleocr" and not PADDLEOCR_AVAILABLE:
            logging.warning("PaddleOCR not available, falling back to Tesseract")
            self.engine = "tesseract"
    
    def extract_text_tesseract(self, image_path: str, language: str = "eng+hin") -> str:
        """
        Extract text using Tesseract OCR
        
        Args:
            image_path: Path to the image file
            language: Language codes for OCR
            
        Returns:
            Extracted text
        """
        try:
            # Check if Tesseract is available
            try:
                pytesseract.get_tesseract_version()
            except pytesseract.TesseractNotFoundError:
                error_msg = """
                Tesseract OCR is not installed or not found in PATH.

                To install on Windows:
                1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
                2. Install and add to PATH
                3. Restart your application

                Alternative: Use EasyOCR by changing OCR_ENGINE in .env file
                """
                logging.error(error_msg)
                return ""

            # Open image
            image = Image.open(image_path)

            # Configure Tesseract
            custom_config = r'--oem 3 --psm 6'

            # Extract text
            text = pytesseract.image_to_string(image, lang=language, config=custom_config)

            # Clean up text
            text = self._clean_ocr_text(text)

            logging.info(f"Tesseract OCR completed: {text[:100]}...")

            return text

        except Exception as e:
            logging.error(f"Error in Tesseract OCR: {str(e)}")
            return ""

    def extract_text_easyocr(self, image_path: str) -> str:
        """
        Extract text using EasyOCR

        Args:
            image_path: Path to the image file

        Returns:
            Extracted text
        """
        try:
            # Extract text using EasyOCR
            results = self.easy_reader.readtext(image_path)

            # Combine all detected text
            text_parts = []
            for (bbox, text, confidence) in results:
                if confidence > 0.5:  # Only include high-confidence text
                    text_parts.append(text)

            text = ' '.join(text_parts)

            # Clean up text
            text = self._clean_ocr_text(text)

            logging.info(f"EasyOCR completed: {text[:100]}...")

            return text

        except Exception as e:
            logging.error(f"Error in EasyOCR: {str(e)}")
            return ""



    def extract_text_ocr_space(self, image_path: str) -> str:
        """
        Extract text using OCR.space API

        Args:
            image_path: Path to the image file

        Returns:
            Extracted text
        """
        try:
            # Read and encode image as base64
            with open(image_path, 'rb') as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')

            # Prepare API request
            payload = {
                'apikey': self.ocr_space_api_key,
                'base64Image': f'data:image/jpeg;base64,{image_data}',
                'language': 'eng',  # English, can be changed to support other languages
                'isOverlayRequired': False,
                'detectOrientation': True,
                'scale': True,
                'OCREngine': 2,  # Engine 2 is more accurate
            }

            # Make API request
            response = requests.post(self.ocr_space_url, data=payload, timeout=30)
            response.raise_for_status()

            result = response.json()

            # Check for errors
            if result.get('IsErroredOnProcessing'):
                error_msg = result.get('ErrorMessage', 'Unknown error')
                logging.error(f"OCR.space API error: {error_msg}")
                return ""

            # Extract text from all parsed results
            text_parts = []
            for parsed_result in result.get('ParsedResults', []):
                if parsed_result.get('ParsedText'):
                    text_parts.append(parsed_result['ParsedText'])

            text = '\n'.join(text_parts)

            # Clean up text
            text = self._clean_ocr_text(text)

            logging.info(f"OCR.space API completed: {text[:100]}...")

            return text

        except requests.exceptions.RequestException as e:
            logging.error(f"OCR.space API request error: {str(e)}")
            return ""
        except Exception as e:
            logging.error(f"Error in OCR.space API: {str(e)}")
            return ""



    def extract_text_azure_vision(self, image_path: str) -> str:
        """
        Extract text using Azure Computer Vision API

        Args:
            image_path: Path to the image file

        Returns:
            Extracted text
        """
        try:
            # Get Azure credentials
            azure_key = os.getenv("AZURE_VISION_KEY", "")
            azure_endpoint = os.getenv("AZURE_VISION_ENDPOINT", "")

            logging.info(f"Azure OCR processing image: {image_path}")
            logging.info(f"Azure endpoint: {azure_endpoint}")
            logging.info(f"Azure key configured: {bool(azure_key and azure_key != 'your-azure-key-here')}")

            if not azure_key or azure_key == "your-azure-key-here":
                logging.error("Azure Vision API key not configured")
                return ""

            if not azure_endpoint or azure_endpoint == "https://your-region.cognitiveservices.azure.com/":
                logging.error("Azure Vision endpoint not configured")
                return ""

            # Check if image file exists and get size
            if not os.path.exists(image_path):
                logging.error(f"Image file not found: {image_path}")
                return ""

            file_size = os.path.getsize(image_path)
            logging.info(f"Image file size: {file_size} bytes ({file_size/1024/1024:.2f} MB)")

            # Validate and convert image to ensure it's in a supported format
            try:
                from PIL import Image as PILImage
                import io

                # Open and validate the image
                with PILImage.open(image_path) as img:
                    logging.info(f"Original image format: {img.format}, size: {img.size}, mode: {img.mode}")

                    # Enhance image for better handwriting recognition
                    img = self._enhance_image_for_handwriting(img)

                    # Convert to RGB if necessary (Azure prefers RGB)
                    if img.mode in ('RGBA', 'P', 'L'):
                        logging.info(f"Converting image from {img.mode} to RGB")
                        img = img.convert('RGB')

                    # Save as JPEG with high quality to ensure compatibility
                    img_bytes = io.BytesIO()
                    img.save(img_bytes, format='JPEG', quality=95)
                    image_data = img_bytes.getvalue()

                    logging.info(f"Enhanced image data: {len(image_data)} bytes (JPEG format)")

                    # Check Azure size limits (4MB max)
                    if len(image_data) > 4 * 1024 * 1024:
                        logging.warning(f"Image too large ({len(image_data)} bytes), compressing...")
                        # Compress further if needed
                        img_bytes = io.BytesIO()
                        img.save(img_bytes, format='JPEG', quality=70)
                        image_data = img_bytes.getvalue()
                        logging.info(f"Compressed image data: {len(image_data)} bytes")

            except Exception as img_error:
                logging.error(f"Image validation/conversion failed: {str(img_error)}")
                # Fallback: try to read the original file
                try:
                    with open(image_path, 'rb') as image_file:
                        image_data = image_file.read()
                    logging.info(f"Using original image data: {len(image_data)} bytes")
                except Exception as read_error:
                    logging.error(f"Failed to read image file: {str(read_error)}")
                    return ""

            # Try Azure Read API first (better for handwriting)
            text = self._extract_with_read_api(azure_endpoint, azure_key, image_data)

            # If Read API fails, fallback to OCR API
            if not text.strip():
                logging.info("Read API failed, trying OCR API fallback...")
                text = self._extract_with_ocr_api(azure_endpoint, azure_key, image_data)

            if not text.strip():
                logging.warning("No text extracted from image - image may be blank, too blurry, or contain no readable text")
                return ""

            # Clean up text
            text = self._clean_ocr_text(text)

            logging.info(f"Azure Computer Vision completed successfully: {len(text)} characters extracted")
            logging.info(f"Extracted text preview: {text[:200]}...")

            return text

        except requests.exceptions.RequestException as e:
            logging.error(f"Azure Vision API request error: {str(e)}")
            return ""
        except Exception as e:
            logging.error(f"Error in Azure Computer Vision: {str(e)}")
            import traceback
            logging.error(f"Full traceback: {traceback.format_exc()}")
            return ""

    def analyze_image_comprehensive(self, image_path: str) -> Dict[str, Any]:
        """
        Advanced Azure Computer Vision analysis (Google Lens alternative)
        Extracts text, objects, brands, products, and scene information
        """
        try:
            if not self.azure_vision_available:
                return {"error": "Azure Computer Vision not available", "success": False}

            # Get Azure credentials
            azure_key = os.getenv("AZURE_VISION_KEY", "")
            azure_endpoint = os.getenv("AZURE_VISION_ENDPOINT", "")

            # Read image
            with open(image_path, 'rb') as image_file:
                image_data = image_file.read()

            logging.info(f"Starting comprehensive Azure analysis for: {image_path}")

            # 1. Get OCR text first
            ocr_text = self.extract_text_azure_vision(image_path)

            # 2. Azure Computer Vision Analyze API (v3.2) - Like Google Lens
            analyze_url = f"{azure_endpoint.rstrip('/')}/vision/v3.2/analyze"

            headers = {
                'Ocp-Apim-Subscription-Key': azure_key,
                'Content-Type': 'application/octet-stream'
            }

            # Request comprehensive analysis (features available in Azure student subscription)
            params = {
                'visualFeatures': 'Categories,Description,Objects,Brands,Tags,Color,ImageType',
                'language': 'en'
            }

            response = requests.post(analyze_url, headers=headers, params=params, data=image_data, timeout=30)

            if response.status_code == 200:
                analysis_result = response.json()

                # Extract meaningful information
                description = analysis_result.get('description', {})
                objects = analysis_result.get('objects', [])
                brands = analysis_result.get('brands', [])
                tags = analysis_result.get('tags', [])
                categories = analysis_result.get('categories', [])

                # Build comprehensive analysis
                comprehensive_analysis = {
                    "success": True,
                    "ocr_text": ocr_text,
                    "scene_description": description.get('captions', [{}])[0].get('text', '') if description.get('captions') else '',
                    "confidence": description.get('captions', [{}])[0].get('confidence', 0) if description.get('captions') else 0,
                    "detected_objects": [
                        {
                            "name": obj.get('object', ''),
                            "confidence": obj.get('confidence', 0),
                            "rectangle": obj.get('rectangle', {})
                        } for obj in objects
                    ],
                    "detected_brands": [
                        {
                            "name": brand.get('name', ''),
                            "confidence": brand.get('confidence', 0),
                            "rectangle": brand.get('rectangle', {})
                        } for brand in brands
                    ],
                    "tags": [
                        {
                            "name": tag.get('name', ''),
                            "confidence": tag.get('confidence', 0)
                        } for tag in tags if tag.get('confidence', 0) > 0.5
                    ],
                    "categories": [
                        {
                            "name": cat.get('name', ''),
                            "score": cat.get('score', 0)
                        } for cat in categories if cat.get('score', 0) > 0.1
                    ],
                    "color_info": analysis_result.get('color', {}),
                    "image_type": analysis_result.get('imageType', {})
                }

                logging.info(f"Azure comprehensive analysis completed successfully")
                logging.info(f"Scene: {comprehensive_analysis['scene_description']}")
                logging.info(f"Objects: {len(comprehensive_analysis['detected_objects'])}")
                logging.info(f"Brands: {len(comprehensive_analysis['detected_brands'])}")
                logging.info(f"Tags: {len(comprehensive_analysis['tags'])}")

                return comprehensive_analysis

            else:
                logging.error(f"Azure analysis failed: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"Azure analysis failed: {response.status_code}",
                    "ocr_text": ocr_text  # At least return OCR text
                }

        except Exception as e:
            logging.error(f"Error in Azure comprehensive analysis: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "ocr_text": self.extract_text_azure_vision(image_path) if hasattr(self, 'azure_vision_available') and self.azure_vision_available else ""
            }

    def _extract_with_read_api(self, azure_endpoint: str, azure_key: str, image_data: bytes) -> str:
        """
        Extract text using Azure Read API (better for handwriting)
        """
        try:
            import time

            # Step 1: Submit image for analysis
            read_url = f"{azure_endpoint.rstrip('/')}/vision/v3.2/read/analyze"

            headers = {
                'Ocp-Apim-Subscription-Key': azure_key,
                'Content-Type': 'application/octet-stream'
            }

            logging.info("Submitting image to Azure Read API...")
            response = requests.post(read_url, headers=headers, data=image_data, timeout=30)

            if response.status_code != 202:
                logging.error(f"Read API submit failed: {response.status_code} - {response.text}")
                return ""

            # Get operation location from response headers
            operation_location = response.headers.get('Operation-Location')
            if not operation_location:
                logging.error("No Operation-Location header in Read API response")
                return ""

            logging.info(f"Read API operation started: {operation_location}")

            # Step 2: Poll for results
            max_attempts = 30  # 30 seconds max wait
            for attempt in range(max_attempts):
                time.sleep(1)  # Wait 1 second between polls

                result_response = requests.get(operation_location, headers={'Ocp-Apim-Subscription-Key': azure_key}, timeout=10)

                if result_response.status_code != 200:
                    logging.error(f"Read API result failed: {result_response.status_code}")
                    return ""

                result = result_response.json()
                status = result.get('status', '')

                logging.info(f"Read API status (attempt {attempt + 1}): {status}")

                if status == 'succeeded':
                    # Extract text from results
                    text_parts = []

                    for page in result.get('analyzeResult', {}).get('readResults', []):
                        for line in page.get('lines', []):
                            text_parts.append(line.get('text', ''))
                            logging.info(f"Read API line: {line.get('text', '')}")

                    text = '\\n'.join(text_parts)
                    logging.info(f"Read API completed successfully: {len(text)} characters")
                    return text

                elif status == 'failed':
                    logging.error("Read API analysis failed")
                    return ""

                # Status is 'running' or 'notStarted', continue polling

            logging.warning("Read API timed out after 30 seconds")
            return ""

        except Exception as e:
            logging.error(f"Error in Read API: {str(e)}")
            return ""

    def _extract_with_ocr_api(self, azure_endpoint: str, azure_key: str, image_data: bytes) -> str:
        """
        Extract text using Azure OCR API (fallback for printed text)
        """
        try:
            # Azure Computer Vision OCR endpoint
            ocr_url = f"{azure_endpoint.rstrip('/')}/vision/v3.2/ocr"

            headers = {
                'Ocp-Apim-Subscription-Key': azure_key,
                'Content-Type': 'application/octet-stream'
            }

            params = {
                'language': 'unk',  # Auto-detect language
                'detectOrientation': 'true'
            }

            logging.info("Making Azure OCR API request (fallback)...")
            response = requests.post(ocr_url, headers=headers, params=params, data=image_data, timeout=30)

            if response.status_code != 200:
                logging.error(f"OCR API error: {response.status_code} - {response.text}")
                return ""

            result = response.json()

            # Extract text from Azure OCR response
            text_parts = []
            for region in result.get('regions', []):
                for line in region.get('lines', []):
                    words = line.get('words', [])
                    line_text = ' '.join([word['text'] for word in words])
                    text_parts.append(line_text)

            text = '\\n'.join(text_parts)
            logging.info(f"OCR API completed: {len(text)} characters")
            return text

        except Exception as e:
            logging.error(f"Error in OCR API: {str(e)}")
            return ""

    def _enhance_image_for_handwriting(self, img):
        """
        Enhance image quality for better handwriting recognition
        """
        try:
            from PIL import ImageEnhance, ImageFilter

            logging.info("Enhancing image for handwriting recognition...")

            # Convert to grayscale first for better processing
            if img.mode != 'L':
                img_gray = img.convert('L')
            else:
                img_gray = img.copy()

            # Increase contrast to make handwriting more distinct
            contrast_enhancer = ImageEnhance.Contrast(img_gray)
            img_enhanced = contrast_enhancer.enhance(1.5)  # Increase contrast by 50%

            # Increase sharpness to make text clearer
            sharpness_enhancer = ImageEnhance.Sharpness(img_enhanced)
            img_enhanced = sharpness_enhancer.enhance(2.0)  # Double the sharpness

            # Apply a slight blur to reduce noise, then sharpen
            img_enhanced = img_enhanced.filter(ImageFilter.MedianFilter(size=3))

            # Convert back to RGB for Azure API
            img_final = img_enhanced.convert('RGB')

            logging.info("Image enhancement completed")
            return img_final

        except Exception as e:
            logging.warning(f"Image enhancement failed, using original: {str(e)}")
            return img
    
    def extract_text_paddleocr(self, image_path: str) -> str:
        """
        Extract text using PaddleOCR
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Extracted text
        """
        try:
            if not PADDLEOCR_AVAILABLE:
                return self.extract_text_tesseract(image_path)
            
            # Extract text using PaddleOCR
            result = self.paddle_ocr.ocr(image_path, cls=True)
            
            # Combine all detected text
            text_parts = []
            for line in result:
                for word_info in line:
                    text_parts.append(word_info[1][0])  # Extract text from result
            
            text = " ".join(text_parts)
            
            # Clean up text
            text = self._clean_ocr_text(text)
            
            logging.info(f"PaddleOCR completed: {text[:100]}...")
            
            return text
            
        except Exception as e:
            logging.error(f"Error in PaddleOCR: {str(e)}")
            return self.extract_text_tesseract(image_path)  # Fallback to Tesseract
    
    def get_file_size_mb(self, image_path: str) -> float:
        """Get file size in MB"""
        try:
            size_bytes = os.path.getsize(image_path)
            size_mb = size_bytes / (1024 * 1024)
            return size_mb
        except Exception:
            return 0

    def choose_best_ocr_engine(self, image_path: str) -> str:
        """
        Choose the best OCR engine based on file size and availability

        Args:
            image_path: Path to the image file

        Returns:
            Best OCR engine to use
        """
        file_size_mb = self.get_file_size_mb(image_path)

        if self.engine == "hybrid":
            if file_size_mb <= self.max_file_size_mb:
                # Use OCR.space for small files
                logging.info(f"File size: {file_size_mb:.2f}MB - Using OCR.space")
                return "ocr_space"
            else:
                # Use Azure Vision for large files
                logging.info(f"File size: {file_size_mb:.2f}MB - Using Azure Computer Vision")
                return "azure_vision"
        else:
            return self.engine

    def extract_text(self, image_path: str, language: str = "eng+hin") -> str:
        """
        Extract text from image using the best available OCR engine

        Args:
            image_path: Path to the image file
            language: Language codes (for Tesseract)

        Returns:
            Extracted text
        """
        # Choose the best engine for this image
        chosen_engine = self.choose_best_ocr_engine(image_path)

        if chosen_engine == "azure_vision":
            return self.extract_text_azure_vision(image_path)
        elif chosen_engine == "ocr_space":
            return self.extract_text_ocr_space(image_path)
        elif chosen_engine == "easyocr":
            return self.extract_text_easyocr(image_path)
        elif chosen_engine == "paddleocr":
            return self.extract_text_paddleocr(image_path)
        else:
            return self.extract_text_tesseract(image_path, language)
    
    def extract_business_data(self, image_path: str, language: str = "eng+hin") -> Dict[str, any]:
        """
        Extract business-specific data from receipt/bill image
        
        Args:
            image_path: Path to the image file
            language: Language codes
            
        Returns:
            Dictionary with extracted business data
        """
        try:
            # Extract raw text
            raw_text = self.extract_text(image_path, language)
            
            if not raw_text:
                return {"error": "No text extracted from image"}
            
            # Extract business information
            business_data = {
                "raw_text": raw_text,
                "total_amount": self._extract_amount(raw_text),
                "items": self._extract_items(raw_text),
                "date": self._extract_date(raw_text),
                "vendor": self._extract_vendor(raw_text)
            }
            
            return business_data
            
        except Exception as e:
            logging.error(f"Error extracting business data: {str(e)}")
            return {"error": f"Failed to extract business data: {str(e)}"}
    
    def _clean_ocr_text(self, text: str) -> str:
        """
        Clean and normalize OCR extracted text
        """
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep important ones
        text = re.sub(r'[^\w\s₹.,\-()]', '', text)
        
        # Normalize currency symbols
        text = text.replace('Rs.', '₹').replace('rs.', '₹')
        
        return text.strip()
    
    def _extract_amount(self, text: str) -> Optional[float]:
        """
        Extract total amount from text
        """
        # Look for currency patterns
        amount_patterns = [
            r'₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)',
            r'Total[:\s]*₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)',
            r'Amount[:\s]*₹\s*(\d+(?:,\d+)*(?:\.\d{2})?)',
            r'(\d+(?:,\d+)*(?:\.\d{2})?)\s*₹'
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    return float(amount_str)
                except ValueError:
                    continue
        
        return None
    
    def _extract_items(self, text: str) -> List[Dict[str, any]]:
        """
        Extract individual items from text
        """
        items = []
        
        # Split text into lines
        lines = text.split('\n')
        
        for line in lines:
            # Look for item patterns
            item_pattern = r'(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?)\s*(\w*)\s*₹\s*(\d+(?:\.\d+)?)'
            match = re.search(item_pattern, line)
            
            if match:
                item = {
                    "product_name": match.group(1).strip(),
                    "quantity": float(match.group(2)),
                    "unit": match.group(3).strip() if match.group(3) else "pieces",
                    "price": float(match.group(4))
                }
                items.append(item)
        
        return items
    
    def _extract_date(self, text: str) -> Optional[str]:
        """
        Extract date from text
        """
        # Look for date patterns
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{1,2}\s+\w+\s+\d{4})',
            r'Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    
    def _extract_vendor(self, text: str) -> Optional[str]:
        """
        Extract vendor/shop name from text
        """
        # Look for vendor patterns
        vendor_patterns = [
            r'^(.*?)\s*BILL',
            r'^(.*?)\s*RECEIPT',
            r'Shop[:\s]*(.*?)(?:\n|$)',
            r'Store[:\s]*(.*?)(?:\n|$)'
        ]
        
        for pattern in vendor_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                vendor = match.group(1).strip()
                if vendor and len(vendor) > 2:
                    return vendor
        
        return None 