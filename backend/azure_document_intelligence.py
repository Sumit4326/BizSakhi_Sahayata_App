import os
import logging
import requests
import json
import time
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class AzureDocumentIntelligence:
    """
    Azure Document Intelligence for Receipt Processing
    Uses pre-built receipt model for accurate extraction
    """
    
    def __init__(self):
        # Azure Document Intelligence credentials
        self.endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT", "")
        self.key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY", "")
        
        # Fallback to Computer Vision if Document Intelligence not available
        if not self.endpoint or not self.key or "your-" in self.key:
            self.endpoint = os.getenv("AZURE_VISION_ENDPOINT", "")
            self.key = os.getenv("AZURE_VISION_KEY", "")
            self.service_type = "computer_vision"
        else:
            self.service_type = "document_intelligence"
        
        self.available = bool(self.endpoint and self.key and "your-" not in self.key)
        
        if self.available:
            logging.info(f"✅ Azure Document Intelligence initialized using {self.service_type}")
        else:
            logging.warning("❌ Azure Document Intelligence not available - check credentials")
    
    def process_receipt(self, image_path: str) -> Dict[str, Any]:
        """
        Process receipt using Azure Document Intelligence pre-built model
        """
        try:
            if not self.available:
                return {"error": "Azure Document Intelligence not available", "success": False}
            
            logging.info(f"🧾 Processing receipt with Azure Document Intelligence: {image_path}")
            
            # Read image file
            with open(image_path, 'rb') as image_file:
                image_data = image_file.read()
            
            if self.service_type == "document_intelligence":
                return self._process_with_document_intelligence(image_data)
            else:
                return self._process_with_computer_vision_fallback(image_data)
                
        except Exception as e:
            logging.error(f"❌ Receipt processing error: {str(e)}")
            return {"error": str(e), "success": False}
    
    def _process_with_document_intelligence(self, image_data: bytes) -> Dict[str, Any]:
        """
        Use Azure Document Intelligence pre-built receipt model
        """
        try:
            # Step 1: Submit document for analysis
            analyze_url = f"{self.endpoint.rstrip('/')}/formrecognizer/documentModels/prebuilt-receipt:analyze"
            
            headers = {
                'Ocp-Apim-Subscription-Key': self.key,
                'Content-Type': 'application/octet-stream'
            }
            
            params = {
                'api-version': '2023-07-31'
            }
            
            response = requests.post(analyze_url, headers=headers, params=params, data=image_data, timeout=30)
            
            if response.status_code != 202:
                logging.error(f"Document Intelligence submit failed: {response.status_code} - {response.text}")
                return {"error": f"Submit failed: {response.status_code}", "success": False}
            
            # Get operation location
            operation_location = response.headers.get('Operation-Location')
            if not operation_location:
                return {"error": "No operation location", "success": False}
            
            # Step 2: Poll for results
            max_attempts = 20
            for attempt in range(max_attempts):
                time.sleep(2)  # Wait before polling
                
                result_response = requests.get(operation_location, headers={
                    'Ocp-Apim-Subscription-Key': self.key
                }, timeout=30)
                
                if result_response.status_code == 200:
                    result_data = result_response.json()
                    status = result_data.get('status', '')
                    
                    if status == 'succeeded':
                        return self._parse_document_intelligence_result(result_data)
                    elif status == 'failed':
                        error_msg = result_data.get('error', {}).get('message', 'Analysis failed')
                        return {"error": error_msg, "success": False}
                    
                    # Still running
                    logging.info(f"Document Intelligence status: {status}, attempt {attempt + 1}")
                else:
                    logging.error(f"Polling failed: {result_response.status_code}")
                    return {"error": f"Polling failed: {result_response.status_code}", "success": False}
            
            return {"error": "Polling timeout", "success": False}
            
        except Exception as e:
            logging.error(f"Document Intelligence error: {str(e)}")
            return {"error": str(e), "success": False}
    
    def _parse_document_intelligence_result(self, result_data: Dict) -> Dict[str, Any]:
        """
        Parse Azure Document Intelligence receipt results
        """
        try:
            analyze_result = result_data.get('analyzeResult', {})
            documents = analyze_result.get('documents', [])
            
            if not documents:
                return {"error": "No receipt data found", "success": False}
            
            receipt_doc = documents[0]
            fields = receipt_doc.get('fields', {})
            
            # Extract merchant information
            merchant_info = {}
            if 'MerchantName' in fields:
                merchant_info['name'] = fields['MerchantName'].get('valueString', '')
            if 'MerchantAddress' in fields:
                merchant_info['address'] = fields['MerchantAddress'].get('valueString', '')
            if 'MerchantPhoneNumber' in fields:
                merchant_info['phone'] = fields['MerchantPhoneNumber'].get('valueString', '')
            
            # Extract transaction info
            transaction_info = {}
            if 'TransactionDate' in fields:
                transaction_info['date'] = fields['TransactionDate'].get('valueString', '')
            if 'TransactionTime' in fields:
                transaction_info['time'] = fields['TransactionTime'].get('valueString', '')
            
            # Extract totals
            totals = {}
            if 'Subtotal' in fields:
                totals['subtotal'] = fields['Subtotal'].get('valueCurrency', {}).get('amount', 0)
            if 'TotalTax' in fields:
                totals['tax'] = fields['TotalTax'].get('valueCurrency', {}).get('amount', 0)
            if 'Total' in fields:
                totals['total'] = fields['Total'].get('valueCurrency', {}).get('amount', 0)
            
            # Extract items
            items = []
            if 'Items' in fields:
                items_array = fields['Items'].get('valueArray', [])
                
                for item_field in items_array:
                    item_obj = item_field.get('valueObject', {})
                    
                    item = {
                        "name": "",
                        "quantity": 1,
                        "unit_price": 0,
                        "total_price": 0,
                        "unit": "pieces"
                    }
                    
                    # Extract item details
                    if 'Description' in item_obj:
                        item['name'] = item_obj['Description'].get('valueString', '')
                    elif 'Name' in item_obj:
                        item['name'] = item_obj['Name'].get('valueString', '')
                    
                    if 'Quantity' in item_obj:
                        item['quantity'] = item_obj['Quantity'].get('valueNumber', 1)
                    
                    if 'Price' in item_obj:
                        item['unit_price'] = item_obj['Price'].get('valueCurrency', {}).get('amount', 0)
                    
                    if 'TotalPrice' in item_obj:
                        item['total_price'] = item_obj['TotalPrice'].get('valueCurrency', {}).get('amount', 0)
                    elif item['unit_price'] > 0:
                        item['total_price'] = item['unit_price'] * item['quantity']
                    
                    # Only add valid items
                    if item['name'] and (item['total_price'] > 0 or item['unit_price'] > 0):
                        items.append(item)
            
            result = {
                "success": True,
                "merchant": merchant_info,
                "transaction": transaction_info,
                "items": items,
                "totals": totals,
                "item_count": len(items),
                "total_amount": totals.get('total', 0),
                "confidence": receipt_doc.get('confidence', 0),
                "service_used": "azure_document_intelligence"
            }
            
            logging.info(f"✅ Document Intelligence success: {len(items)} items, total: {totals.get('total', 0)}")
            return result
            
        except Exception as e:
            logging.error(f"Parse error: {str(e)}")
            return {"error": f"Parse error: {str(e)}", "success": False}
    
    def _process_with_computer_vision_fallback(self, image_data: bytes) -> Dict[str, Any]:
        """
        Fallback to Computer Vision Read API if Document Intelligence not available
        """
        try:
            logging.info("Using Computer Vision as fallback for receipt processing")
            
            # Use Read API for text extraction
            read_url = f"{self.endpoint.rstrip('/')}/vision/v3.2/read/analyze"
            
            headers = {
                'Ocp-Apim-Subscription-Key': self.key,
                'Content-Type': 'application/octet-stream'
            }
            
            response = requests.post(read_url, headers=headers, data=image_data, timeout=30)
            
            if response.status_code != 202:
                return {"error": f"Read API failed: {response.status_code}", "success": False}
            
            operation_location = response.headers.get('Operation-Location')
            if not operation_location:
                return {"error": "No operation location", "success": False}
            
            # Poll for results
            for attempt in range(10):
                time.sleep(1)
                
                result_response = requests.get(operation_location, headers={
                    'Ocp-Apim-Subscription-Key': self.key
                }, timeout=30)
                
                if result_response.status_code == 200:
                    result_data = result_response.json()
                    status = result_data.get('status', '')
                    
                    if status == 'succeeded':
                        # Extract text and parse manually
                        text_lines = []
                        analyze_result = result_data.get('analyzeResult', {})
                        read_results = analyze_result.get('readResults', [])
                        
                        for page in read_results:
                            lines = page.get('lines', [])
                            for line in lines:
                                text_lines.append(line.get('text', ''))
                        
                        full_text = '\n'.join(text_lines)
                        
                        # Basic parsing for fallback
                        return {
                            "success": True,
                            "raw_text": full_text,
                            "merchant": {"name": "Unknown Store"},
                            "items": self._parse_text_for_items(full_text),
                            "totals": {"total": 0},
                            "item_count": 0,
                            "total_amount": 0,
                            "service_used": "computer_vision_fallback"
                        }
                    elif status == 'failed':
                        return {"error": "Text extraction failed", "success": False}
            
            return {"error": "Fallback timeout", "success": False}
            
        except Exception as e:
            return {"error": f"Fallback error: {str(e)}", "success": False}
    
    def _parse_text_for_items(self, text: str) -> List[Dict]:
        """
        Basic text parsing for fallback mode
        """
        import re
        
        lines = text.split('\n')
        items = []
        
        for line in lines:
            # Look for price patterns
            price_match = re.search(r'Rs?\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)', line, re.IGNORECASE)
            if price_match:
                price = float(price_match.group(1).replace(',', ''))
                name = line[:price_match.start()].strip()
                
                if name and len(name) > 2 and price > 0:
                    items.append({
                        "name": name,
                        "quantity": 1,
                        "unit_price": price,
                        "total_price": price,
                        "unit": "pieces"
                    })
        
        return items[:10]  # Limit to 10 items
