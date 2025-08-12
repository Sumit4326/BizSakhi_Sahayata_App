import requests
import time
import logging
from typing import Dict, List, Any
import os
from dotenv import load_dotenv

load_dotenv()

class SimpleReceiptProcessor:
    """
    Simple Azure Document Intelligence receipt processor
    Based on your working code example
    """
    
    def __init__(self):
        self.endpoint = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT", "").rstrip('/')
        self.api_key = os.getenv("AZURE_DOCUMENT_INTELLIGENCE_KEY", "")
        
        self.available = bool(self.endpoint and self.api_key and "your-" not in self.api_key)
        
        if self.available:
            logging.info("✅ Simple Receipt Processor initialized with Azure Document Intelligence")
        else:
            logging.warning("❌ Azure Document Intelligence not available")
    
    def process_receipt(self, image_path: str) -> Dict[str, Any]:
        """
        Process receipt using your exact Azure Document Intelligence code
        """
        try:
            if not self.available:
                return {"success": False, "error": "Azure Document Intelligence not available"}
            
            logging.info(f"🧾 Processing receipt: {image_path}")
            
            # Your exact code implementation
            url = f"{self.endpoint}/formrecognizer/documentModels/prebuilt-receipt:analyze?api-version=2023-07-31"
            headers = {
                "Ocp-Apim-Subscription-Key": self.api_key,
                "Content-Type": "image/jpeg"
            }

            with open(image_path, "rb") as f:
                data = f.read()

            # Step 1: Send image to the model
            response = requests.post(url, headers=headers, data=data)
            if response.status_code != 202:
                logging.error(f"Azure Document Intelligence error: {response.status_code} - {response.text}")
                return {"success": False, "error": f"API error: {response.status_code}"}

            # Step 2: Poll the result
            result_url = response.headers["operation-location"]
            max_attempts = 30
            for attempt in range(max_attempts):
                result_response = requests.get(result_url, headers={"Ocp-Apim-Subscription-Key": self.api_key})
                result = result_response.json()
                
                status = result.get("status")
                if status == "succeeded":
                    break
                elif status == "failed":
                    error_msg = result.get("error", {}).get("message", "Analysis failed")
                    return {"success": False, "error": error_msg}
                
                time.sleep(1)
                logging.info(f"Polling attempt {attempt + 1}, status: {status}")
            else:
                return {"success": False, "error": "Polling timeout"}

            # Step 3: Extract and process data (your exact approach)
            if "analyzeResult" not in result or "documents" not in result["analyzeResult"]:
                return {"success": False, "error": "No documents found in result"}
            
            documents = result["analyzeResult"]["documents"]
            if not documents:
                return {"success": False, "error": "No receipt data found"}
            
            document = documents[0]
            fields = document["fields"]
            
            # Extract merchant info
            merchant_name = fields.get("MerchantName", {}).get("content", "Unknown Store")
            merchant_address = fields.get("MerchantAddress", {}).get("content", "")
            merchant_phone = fields.get("MerchantPhoneNumber", {}).get("content", "")
            
            # Extract totals
            total_amount = 0
            subtotal = 0
            tax = 0
            
            if "Total" in fields:
                total_content = fields["Total"].get("content", "0")
                try:
                    # Remove currency symbols and parse
                    total_str = str(total_content).replace("$", "").replace("Rs", "").replace(".", "").replace(",", "")
                    total_amount = float(total_str) / 100 if total_str.isdigit() else 0
                except:
                    total_amount = 0
            
            if "Subtotal" in fields:
                subtotal_content = fields["Subtotal"].get("content", "0")
                try:
                    subtotal_str = str(subtotal_content).replace("$", "").replace("Rs", "").replace(".", "").replace(",", "")
                    subtotal = float(subtotal_str) / 100 if subtotal_str.isdigit() else 0
                except:
                    subtotal = 0
            
            if "TotalTax" in fields:
                tax_content = fields["TotalTax"].get("content", "0")
                try:
                    tax_str = str(tax_content).replace("$", "").replace("Rs", "").replace(".", "").replace(",", "")
                    tax = float(tax_str) / 100 if tax_str.isdigit() else 0
                except:
                    tax = 0
            
            # Extract items (your exact approach)
            items = []
            if "Items" in fields and "valueArray" in fields["Items"]:
                for item in fields["Items"]["valueArray"]:
                    if "valueObject" in item:
                        item_fields = item["valueObject"]
                        
                        name = item_fields.get("Description", {}).get("content", "Unknown Item")
                        if not name or name == "Unknown Item":
                            name = item_fields.get("Name", {}).get("content", "Unknown Item")
                        
                        qty_content = item_fields.get("Quantity", {}).get("content", "1")
                        try:
                            quantity = int(float(str(qty_content))) if qty_content else 1
                        except:
                            quantity = 1
                        
                        price_content = item_fields.get("Price", {}).get("content", "0")
                        total_price_content = item_fields.get("TotalPrice", {}).get("content", "0")
                        
                        # Parse prices
                        unit_price = 0
                        total_price = 0
                        
                        try:
                            if price_content:
                                price_str = str(price_content).replace("$", "").replace("Rs", "").replace(",", "")
                                unit_price = float(price_str) if price_str.replace(".", "").isdigit() else 0
                        except:
                            unit_price = 0
                        
                        try:
                            if total_price_content:
                                total_str = str(total_price_content).replace("$", "").replace("Rs", "").replace(",", "")
                                total_price = float(total_str) if total_str.replace(".", "").isdigit() else 0
                            elif unit_price > 0:
                                total_price = unit_price * quantity
                        except:
                            total_price = unit_price * quantity if unit_price > 0 else 0
                        
                        # Only add valid items
                        if name and name != "Unknown Item" and (total_price > 0 or unit_price > 0):
                            items.append({
                                "name": name,
                                "quantity": quantity,
                                "unit_price": unit_price,
                                "total_price": total_price,
                                "unit": "pieces"
                            })
            
            # Build result
            result_data = {
                "success": True,
                "merchant": {
                    "name": merchant_name,
                    "address": merchant_address,
                    "phone": merchant_phone
                },
                "items": items,
                "totals": {
                    "subtotal": subtotal,
                    "tax": tax,
                    "total": total_amount
                },
                "item_count": len(items),
                "total_amount": total_amount,
                "confidence": document.get("confidence", 0),
                "service_used": "azure_document_intelligence"
            }
            
            logging.info(f"✅ Receipt processed successfully!")
            logging.info(f"Merchant: {merchant_name}")
            logging.info(f"Items: {len(items)}")
            logging.info(f"Total: {total_amount}")
            
            return result_data
            
        except Exception as e:
            logging.error(f"❌ Receipt processing error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def format_items_for_clarification(self, receipt_data: Dict) -> List[Dict]:
        """
        Convert receipt items to clarification format
        """
        if not receipt_data.get("success") or not receipt_data.get("items"):
            return []
        
        items_for_clarification = []
        merchant_name = receipt_data.get("merchant", {}).get("name", "Unknown store")
        
        for item in receipt_data["items"]:
            items_for_clarification.append({
                "name": item["name"],
                "quantity": item["quantity"],
                "amount": item["total_price"],
                "cost_per_unit": item["unit_price"],
                "unit": item.get("unit", "pieces"),
                "suggested_category": "inventory",  # Default suggestion
                "description": f"From receipt: {merchant_name}"
            })
        
        return items_for_clarification
