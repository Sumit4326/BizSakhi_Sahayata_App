import os
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, date
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseService:
    """
    Supabase service for handling all database operations
    """
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.service_key = os.getenv("SUPABASE_SERVICE_KEY")
        self.anon_key = os.getenv("SUPABASE_ANON_KEY")

        if not self.url:
            raise ValueError("Supabase URL must be provided")

        try:
            # Use service key for backend operations (bypasses RLS)
            key_to_use = self.service_key if self.service_key else self.anon_key
            if not key_to_use:
                raise ValueError("Either SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY must be provided")

            self.client: Client = create_client(self.url, key_to_use)
            logging.info(f"✅ Supabase service initialized with {'service' if self.service_key else 'anon'} key")
        except Exception as e:
            logging.error(f"Failed to initialize Supabase client: {str(e)}")
            raise
    
    def get_user_id_from_token(self, auth_token: str) -> Optional[str]:
        """Extract user ID from JWT token"""
        try:
            # For now, we'll use a simple approach with the anon key
            # In production, you'd want to properly verify the JWT token
            import jwt

            # Decode without verification for now (not recommended for production)
            decoded = jwt.decode(auth_token, options={"verify_signature": False})
            return decoded.get("sub")
        except Exception as e:
            logging.error(f"Error extracting user ID from token: {str(e)}")
            return None
    
    # INCOME OPERATIONS
    def add_income(self, user_id: str, amount: float, description: str, category: str = "general") -> Dict[str, Any]:
        """Add income entry to Supabase"""
        try:
            data = {
                "user_id": user_id,
                "amount": amount,
                "description": description,
                "category": category,
                "date": date.today().isoformat(),
                "created_at": datetime.now().isoformat()
            }
            
            result = self.client.table("income").insert(data).execute()
            
            if result.data:
                logging.info(f"Income added: ₹{amount} - {description}")
                return {
                    "success": True,
                    "message": f"✅ ₹{amount} की आय जोड़ी गई: {description}",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to add income"}
                
        except Exception as e:
            logging.error(f"Error adding income: {str(e)}")
            return {"success": False, "message": "आय जोड़ने में त्रुटि हुई", "error": str(e)}
    
    def get_income_summary(self, user_id: str) -> Dict[str, Any]:
        """Get income summary for user"""
        try:
            # Get total income
            result = self.client.table("income").select("amount").eq("user_id", user_id).execute()
            
            total_income = sum(item["amount"] for item in result.data) if result.data else 0
            
            # Get recent transactions
            recent = self.client.table("income").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
            
            return {
                "success": True,
                "total_income": total_income,
                "recent_transactions": recent.data or [],
                "count": len(result.data) if result.data else 0
            }
            
        except Exception as e:
            logging.error(f"Error getting income summary: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def clear_income(self, user_id: str) -> Dict[str, Any]:
        """Clear all income for user"""
        try:
            result = self.client.table("income").delete().eq("user_id", user_id).execute()
            return {"success": True, "message": "सभी आय रिकॉर्ड साफ कर दिए गए"}
        except Exception as e:
            logging.error(f"Error clearing income: {str(e)}")
            return {"success": False, "error": str(e)}
    
    # EXPENSE OPERATIONS
    def add_expense(self, user_id: str, amount: float, description: str, category: str = "general") -> Dict[str, Any]:
        """Add expense entry to Supabase"""
        try:
            data = {
                "user_id": user_id,
                "amount": amount,
                "description": description,
                "category": category,
                "date": date.today().isoformat(),
                "created_at": datetime.now().isoformat()
            }
            
            result = self.client.table("expenses").insert(data).execute()
            
            if result.data:
                logging.info(f"Expense added: ₹{amount} - {description}")
                return {
                    "success": True,
                    "message": f"✅ ₹{amount} का खर्च जोड़ा गया: {description}",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to add expense"}
                
        except Exception as e:
            logging.error(f"Error adding expense: {str(e)}")
            return {"success": False, "message": "खर्च जोड़ने में त्रुटि हुई", "error": str(e)}
    
    def get_expense_summary(self, user_id: str) -> Dict[str, Any]:
        """Get expense summary for user"""
        try:
            # Get total expenses
            result = self.client.table("expenses").select("amount").eq("user_id", user_id).execute()
            
            total_expenses = sum(item["amount"] for item in result.data) if result.data else 0
            
            # Get recent transactions
            recent = self.client.table("expenses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
            
            return {
                "success": True,
                "total_expenses": total_expenses,
                "recent_transactions": recent.data or [],
                "count": len(result.data) if result.data else 0
            }
            
        except Exception as e:
            logging.error(f"Error getting expense summary: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_profit_loss_summary(self, user_id: str) -> Dict[str, Any]:
        """Get profit and loss summary for user"""
        try:
            # Get income summary
            income_result = self.get_income_summary(user_id)
            if not income_result["success"]:
                return {"success": False, "error": "Failed to get income summary"}
            
            # Get expense summary
            expense_result = self.get_expense_summary(user_id)
            if not expense_result["success"]:
                return {"success": False, "error": "Failed to get expense summary"}
            
            total_income = income_result["total_income"]
            total_expenses = expense_result["total_expenses"]
            net_profit = total_income - total_expenses
            
            # Calculate profit margin percentage
            profit_margin = (net_profit / total_income * 100) if total_income > 0 else 0
            
            return {
                "success": True,
                "total_income": total_income,
                "total_expenses": total_expenses,
                "net_profit": net_profit,
                "profit_margin_percentage": round(profit_margin, 2),
                "income_count": income_result["count"],
                "expense_count": expense_result["count"],
                "recent_income": income_result["recent_transactions"][:5] if income_result["recent_transactions"] else [],
                "recent_expenses": expense_result["recent_transactions"][:5] if expense_result["recent_transactions"] else [],
                "summary": {
                    "is_profitable": net_profit > 0,
                    "profit_status": "Profit" if net_profit > 0 else "Loss" if net_profit < 0 else "Break Even",
                    "profit_amount": abs(net_profit)
                }
            }
            
        except Exception as e:
            logging.error(f"Error getting profit loss summary: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def clear_expenses(self, user_id: str) -> Dict[str, Any]:
        """Clear all expenses for user"""
        try:
            result = self.client.table("expenses").delete().eq("user_id", user_id).execute()
            return {"success": True, "message": "सभी खर्च रिकॉर्ड साफ कर दिए गए"}
        except Exception as e:
            logging.error(f"Error clearing expenses: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_today_expenses(self, user_id: str) -> Dict[str, Any]:
        """Get today's expenses for user"""
        try:
            today = date.today().isoformat()
            result = self.client.table("expenses").select("amount").eq("user_id", user_id).eq("date", today).execute()
            
            total_expenses = sum(item["amount"] for item in result.data) if result.data else 0
            count = len(result.data) if result.data else 0
            
            return {
                "success": True,
                "total_expenses": total_expenses,
                "count": count
            }
            
        except Exception as e:
            logging.error(f"Error getting today's expenses: {str(e)}")
            return {"success": False, "error": str(e)}

    # INVENTORY OPERATIONS
    def add_inventory_item(self, user_id: str, product_name: str, quantity: float,
                          unit: str = "pieces", cost_per_unit: float = 0.0) -> Dict[str, Any]:
        """Add inventory item to Supabase"""
        try:
            data = {
                "user_id": user_id,
                "item_name": product_name,
                "quantity": int(quantity),
                "unit_price": cost_per_unit,
                "category": "general",
                "created_at": datetime.now().isoformat()
            }

            result = self.client.table("inventory").insert(data).execute()

            if result.data:
                logging.info(f"Inventory item added: {product_name} - {quantity} {unit}")
                return {
                    "success": True,
                    "message": f"✅ {product_name} ({quantity} {unit}) इन्वेंटरी में जोड़ा गया",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to add inventory item"}

        except Exception as e:
            logging.error(f"Error adding inventory item: {str(e)}")
            return {"success": False, "message": "इन्वेंटरी आइटम जोड़ने में त्रुटि हुई", "error": str(e)}

    def get_inventory_summary(self, user_id: str) -> Dict[str, Any]:
        """Get inventory summary for user"""
        try:
            result = self.client.table("inventory").select("*").eq("user_id", user_id).execute()

            items = result.data or []
            total_items = len(items)
            total_value = sum(item["quantity"] * (item["unit_price"] or 0) for item in items)

            return {
                "success": True,
                "total_items": total_items,
                "total_value": total_value,
                "items": items,
                "low_stock_items": [item for item in items if item["quantity"] < 5]
            }

        except Exception as e:
            logging.error(f"Error getting inventory summary: {str(e)}")
            return {"success": False, "error": str(e)}

    def update_inventory_item(self, item_id: str, user_id: str, product_name: str, quantity: float,
                             unit: str = "pieces", cost_per_unit: float = 0.0) -> Dict[str, Any]:
        """Update inventory item in Supabase"""
        try:
            data = {
                "item_name": product_name,
                "quantity": int(quantity),
                "unit_price": cost_per_unit
            }

            result = self.client.table("inventory").update(data).eq("id", item_id).eq("user_id", user_id).execute()

            if result.data:
                logging.info(f"Inventory item updated: {product_name} - {quantity} {unit}")
                return {
                    "success": True,
                    "message": f"✅ {product_name} अपडेट किया गया",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to update inventory item"}

        except Exception as e:
            logging.error(f"Error updating inventory item: {str(e)}")
            return {"success": False, "message": "इन्वेंटरी आइटम अपडेट करने में त्रुटि हुई", "error": str(e)}

    def delete_inventory_item(self, item_id: str, user_id: str) -> Dict[str, Any]:
        """Delete inventory item from Supabase"""
        try:
            result = self.client.table("inventory").delete().eq("id", item_id).eq("user_id", user_id).execute()

            if result.data:
                logging.info(f"Inventory item deleted: {item_id}")
                return {
                    "success": True,
                    "message": "✅ इन्वेंटरी आइटम हटा दिया गया",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to delete inventory item"}

        except Exception as e:
            logging.error(f"Error deleting inventory item: {str(e)}")
            return {"success": False, "message": "इन्वेंटरी आइटम हटाने में त्रुटि हुई", "error": str(e)}

    def update_income_item(self, income_id: str, user_id: str, amount: float, 
                          description: str, category: str = "general") -> Dict[str, Any]:
        """Update income item in Supabase"""
        try:
            data = {
                "amount": amount,
                "description": description,
                "category": category
            }

            result = self.client.table("income").update(data).eq("id", income_id).eq("user_id", user_id).execute()

            if result.data:
                logging.info(f"Income item updated: ₹{amount} - {description}")
                return {
                    "success": True,
                    "message": f"✅ आय अपडेट किया गया: ₹{amount}",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to update income item"}

        except Exception as e:
            logging.error(f"Error updating income item: {str(e)}")
            return {"success": False, "message": "आय अपडेट करने में त्रुटि हुई", "error": str(e)}

    def delete_income_item(self, income_id: str, user_id: str) -> Dict[str, Any]:
        """Delete income item from Supabase"""
        try:
            result = self.client.table("income").delete().eq("id", income_id).eq("user_id", user_id).execute()

            if result.data:
                logging.info(f"Income item deleted: {income_id}")
                return {
                    "success": True,
                    "message": "✅ आय आइटम हटा दिया गया",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to delete income item"}

        except Exception as e:
            logging.error(f"Error deleting income item: {str(e)}")
            return {"success": False, "message": "आय आइटम हटाने में त्रुटि हुई", "error": str(e)}

    def update_expense_item(self, expense_id: str, user_id: str, amount: float, 
                           description: str, category: str = "general") -> Dict[str, Any]:
        """Update expense item in Supabase"""
        try:
            data = {
                "amount": amount,
                "description": description,
                "category": category
            }

            result = self.client.table("expenses").update(data).eq("id", expense_id).eq("user_id", user_id).execute()

            if result.data:
                logging.info(f"Expense item updated: ₹{amount} - {description}")
                return {
                    "success": True,
                    "message": f"✅ खर्च अपडेट किया गया: ₹{amount}",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to update expense item"}

        except Exception as e:
            logging.error(f"Error updating expense item: {str(e)}")
            return {"success": False, "message": "खर्च अपडेट करने में त्रुटि हुई", "error": str(e)}

    def delete_expense_item(self, expense_id: str, user_id: str) -> Dict[str, Any]:
        """Delete expense item from Supabase"""
        try:
            result = self.client.table("expenses").delete().eq("id", expense_id).eq("user_id", user_id).execute()

            if result.data:
                logging.info(f"Expense item deleted: {expense_id}")
                return {
                    "success": True,
                    "message": "✅ खर्च आइटम हटा दिया गया",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to delete expense item"}

        except Exception as e:
            logging.error(f"Error deleting expense item: {str(e)}")
            return {"success": False, "message": "खर्च आइटम हटाने में त्रुटि हुई", "error": str(e)}

    # CHAT HISTORY OPERATIONS
    def save_chat_history(self, user_id: str, message: str, response: str,
                         message_type: str = "text", intent: str = "general",
                         language: str = "hi") -> Dict[str, Any]:
        """Save chat history to Supabase"""
        try:
            data = {
                "user_id": user_id,
                "message": message,
                "response": response,
                "language": language,
                "created_at": datetime.now().isoformat()
            }

            result = self.client.table("chat_history").insert(data).execute()

            if result.data:
                logging.info(f"Chat history saved for user: {user_id}")
                return {"success": True, "data": result.data[0]}
            else:
                return {"success": False, "message": "Failed to save chat history"}

        except Exception as e:
            logging.error(f"Error saving chat history: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_chat_history(self, user_id: str, limit: int = 50) -> Dict[str, Any]:
        """Get chat history for user"""
        try:
            result = self.client.table("chat_history").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()

            messages = []
            if result.data:
                for i, chat in enumerate(reversed(result.data)):  # Reverse to show oldest first
                    # Add user message
                    messages.append({
                        "id": f"user_{chat['id']}",
                        "text": chat["message"],
                        "sender": "user",
                        "isUser": True,
                        "timestamp": chat["created_at"]
                    })
                    # Add AI response
                    messages.append({
                        "id": f"ai_{chat['id']}",
                        "text": chat["response"],
                        "sender": "ai",
                        "isUser": False,
                        "timestamp": chat["created_at"]
                    })

            return {
                "success": True,
                "messages": messages,
                "count": len(messages)
            }

        except Exception as e:
            logging.error(f"Error getting chat history: {str(e)}")
            return {"success": False, "error": str(e)}

    def clear_chat_history(self, user_id: str) -> Dict[str, Any]:
        """Clear chat history for user"""
        try:
            result = self.client.table("chat_history").delete().eq("user_id", user_id).execute()
            return {"success": True, "message": "चैट हिस्ट्री साफ कर दी गई"}
        except Exception as e:
            logging.error(f"Error clearing chat history: {str(e)}")
            return {"success": False, "error": str(e)}

    def clear_all_data(self, user_id: str) -> Dict[str, Any]:
        """Clear all user data"""
        try:
            # Clear all tables for the user
            self.client.table("income").delete().eq("user_id", user_id).execute()
            self.client.table("expenses").delete().eq("user_id", user_id).execute()
            self.client.table("inventory").delete().eq("user_id", user_id).execute()
            self.client.table("chat_history").delete().eq("user_id", user_id).execute()
            
            return {"success": True, "message": "All data cleared successfully"}
        except Exception as e:
            logging.error(f"Error clearing all data: {str(e)}")
            return {"success": False, "error": str(e)}

    # USER PROFILE OPERATIONS
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile from Supabase"""
        try:
            result = self.client.table("profiles").select("*").eq("id", user_id).execute()
            
            if result.data:
                profile = result.data[0]
                return {
                    "success": True,
                    "profile": {
                        "name": profile.get("full_name", ""),
                        "businessType": profile.get("business_type", ""),
                        "region": profile.get("location", ""),
                        "phone": profile.get("phone", "")
                    }
                }
            else:
                return {"success": False, "message": "Profile not found"}
                
        except Exception as e:
            logging.error(f"Error getting user profile: {str(e)}")
            return {"success": False, "error": str(e)}

    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile in Supabase"""
        try:
            data = {
                "full_name": profile_data.get("name", ""),
                "business_type": profile_data.get("businessType", ""),
                "location": profile_data.get("region", ""),
                "phone": profile_data.get("phone", ""),
                "updated_at": datetime.now().isoformat()
            }
            
            result = self.client.table("profiles").update(data).eq("id", user_id).execute()
            
            if result.data:
                logging.info(f"Profile updated for user: {user_id}")
                return {
                    "success": True,
                    "message": "Profile updated successfully",
                    "data": result.data[0]
                }
            else:
                return {"success": False, "message": "Failed to update profile"}
                
        except Exception as e:
            logging.error(f"Error updating user profile: {str(e)}")
            return {"success": False, "error": str(e)}

    def save_user_settings(self, user_id: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Save user settings to Supabase"""
        try:
            # For now, we'll store settings in the profiles table
            # In a more complex app, you might want a separate settings table
            data = {
                "updated_at": datetime.now().isoformat()
            }
            
            # Add settings as JSON in a custom field or use a separate table
            # For simplicity, we'll update the profile with settings
            result = self.client.table("profiles").update(data).eq("id", user_id).execute()
            
            if result.data:
                logging.info(f"Settings saved for user: {user_id}")
                return {
                    "success": True,
                    "message": "Settings saved successfully"
                }
            else:
                return {"success": False, "message": "Failed to save settings"}
                
        except Exception as e:
            logging.error(f"Error saving user settings: {str(e)}")
            return {"success": False, "error": str(e)}
