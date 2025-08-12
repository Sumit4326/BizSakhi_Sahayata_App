from supabase_service import SupabaseService
from typing import Dict, Any, Optional
import logging
from datetime import datetime, date

class SupabaseBusinessLogic:
    """
    Business logic layer that uses Supabase for data persistence
    """
    
    def __init__(self):
        self.supabase = SupabaseService()
    
    def get_user_id_from_token(self, auth_token: str) -> Optional[str]:
        """Extract user ID from JWT token"""
        return self.supabase.get_user_id_from_token(auth_token)
    
    def add_income(self, user_id: str, amount: float, description: str, category: str, 
                   source: str = "text", language: str = "hi") -> Dict[str, Any]:
        """Add income entry"""
        try:
            # Provide default description if None
            if description is None:
                description = f"{category} - ₹{amount}"

            result = self.supabase.add_income(user_id, amount, description, category)
            
            if result["success"]:
                # Create language-appropriate message
                if language == "en":
                    message = f"✅ Income of ₹{amount} added: {description}"
                elif language == "hi":
                    message = f"✅ ₹{amount} की आय जोड़ी गई: {description}"
                elif language == "ta":
                    message = f"✅ ₹{amount} வருமானம் சேர்க்கப்பட்டது: {description}"
                elif language == "ml":
                    message = f"✅ ₹{amount} വരുമാനം ചേർത്തു: {description}"
                elif language == "te":
                    message = f"✅ ₹{amount} ఆదాయం జోడించబడింది: {description}"
                elif language == "kn":
                    message = f"✅ ₹{amount} ಆದಾಯ ಸೇರಿಸಲಾಗಿದೆ: {description}"
                else:
                    # Default to Hindi for other Indian languages
                    message = f"✅ ₹{amount} की आय जोड़ी गई: {description}"

                result["message"] = message
                
            return result
            
        except Exception as e:
            logging.error(f"Error adding income: {str(e)}")
            return {
                "success": False,
                "message": "आय जोड़ने में त्रुटि हुई",
                "error": str(e)
            }
    
    def add_expense(self, user_id: str, amount: float, description: str, category: str, 
                    source: str = "text") -> Dict[str, Any]:
        """Add expense entry"""
        try:
            # Provide default description if None
            if description is None:
                description = f"{category} - ₹{amount}"

            result = self.supabase.add_expense(user_id, amount, description, category)
            return result
            
        except Exception as e:
            logging.error(f"Error adding expense: {str(e)}")
            return {
                "success": False,
                "message": "खर्च जोड़ने में त्रुटि हुई",
                "error": str(e)
            }
    
    def add_inventory_item(self, user_id: str, product_name: str, quantity: float, 
                          unit: str = "pieces", cost_per_unit: float = 0.0) -> Dict[str, Any]:
        """Add inventory item"""
        try:
            result = self.supabase.add_inventory_item(user_id, product_name, quantity, unit, cost_per_unit)
            return result
            
        except Exception as e:
            logging.error(f"Error adding inventory item: {str(e)}")
            return {
                "success": False,
                "message": "इन्वेंटरी आइटम जोड़ने में त्रुटि हुई",
                "error": str(e)
            }
    
    def update_inventory_item(self, item_id: str, user_id: str, product_name: str, quantity: float, 
                             unit: str = "pieces", cost_per_unit: float = 0.0) -> Dict[str, Any]:
        """Update inventory item"""
        try:
            result = self.supabase.update_inventory_item(item_id, user_id, product_name, quantity, unit, cost_per_unit)
            return result
            
        except Exception as e:
            logging.error(f"Error updating inventory item: {str(e)}")
            return {
                "success": False,
                "message": "इन्वेंटरी आइटम अपडेट करने में त्रुटि हुई",
                "error": str(e)
            }
    
    def delete_inventory_item(self, item_id: str, user_id: str) -> Dict[str, Any]:
        """Delete inventory item"""
        try:
            result = self.supabase.delete_inventory_item(item_id, user_id)
            return result
            
        except Exception as e:
            logging.error(f"Error deleting inventory item: {str(e)}")
            return {
                "success": False,
                "message": "इन्वेंटरी आइटम हटाने में त्रुटि हुई",
                "error": str(e)
            }

    def update_income_item(self, income_id: str, user_id: str, amount: float, 
                          description: str, category: str = "general") -> Dict[str, Any]:
        """Update income item"""
        try:
            result = self.supabase.update_income_item(income_id, user_id, amount, description, category)
            return result
            
        except Exception as e:
            logging.error(f"Error updating income item: {str(e)}")
            return {
                "success": False,
                "message": "आय आइटम अपडेट करने में त्रुटि हुई",
                "error": str(e)
            }

    def delete_income_item(self, income_id: str, user_id: str) -> Dict[str, Any]:
        """Delete income item"""
        try:
            result = self.supabase.delete_income_item(income_id, user_id)
            return result
            
        except Exception as e:
            logging.error(f"Error deleting income item: {str(e)}")
            return {
                "success": False,
                "message": "आय आइटम हटाने में त्रुटि हुई",
                "error": str(e)
            }

    def update_expense_item(self, expense_id: str, user_id: str, amount: float, 
                           description: str, category: str = "general") -> Dict[str, Any]:
        """Update expense item"""
        try:
            result = self.supabase.update_expense_item(expense_id, user_id, amount, description, category)
            return result
            
        except Exception as e:
            logging.error(f"Error updating expense item: {str(e)}")
            return {
                "success": False,
                "message": "खर्च आइटम अपडेट करने में त्रुटि हुई",
                "error": str(e)
            }

    def delete_expense_item(self, expense_id: str, user_id: str) -> Dict[str, Any]:
        """Delete expense item"""
        try:
            result = self.supabase.delete_expense_item(expense_id, user_id)
            return result
            
        except Exception as e:
            logging.error(f"Error deleting expense item: {str(e)}")
            return {
                "success": False,
                "message": "खर्च आइटम हटाने में त्रुटि हुई",
                "error": str(e)
            }
    
    def get_income_summary(self, user_id: str) -> Dict[str, Any]:
        """Get income summary"""
        return self.supabase.get_income_summary(user_id)
    
    def get_expense_summary(self, user_id: str) -> Dict[str, Any]:
        """Get expense summary"""
        return self.supabase.get_expense_summary(user_id)
    
    def get_profit_loss_summary(self, user_id: str) -> Dict[str, Any]:
        """Get profit and loss summary"""
        return self.supabase.get_profit_loss_summary(user_id)
    
    def get_inventory_summary(self, user_id: str) -> Dict[str, Any]:
        """Get inventory summary"""
        return self.supabase.get_inventory_summary(user_id)
    
    def get_today_expenses(self, user_id: str) -> Dict[str, Any]:
        """Get today's expenses"""
        return self.supabase.get_today_expenses(user_id)
    
    def save_chat_history(self, user_id: str, message: str, response: str, 
                         message_type: str = "text", intent: str = "general") -> Dict[str, Any]:
        """Save chat history"""
        return self.supabase.save_chat_history(user_id, message, response, message_type, intent)
    
    def get_chat_history(self, user_id: str, limit: int = 50) -> Dict[str, Any]:
        """Get chat history"""
        return self.supabase.get_chat_history(user_id, limit)
    
    def clear_expenses(self, user_id: str) -> Dict[str, Any]:
        """Clear all expenses"""
        return self.supabase.clear_expenses(user_id)
    
    def clear_income(self, user_id: str) -> Dict[str, Any]:
        """Clear all income"""
        return self.supabase.clear_income(user_id)
    
    def clear_chat_history(self, user_id: str) -> Dict[str, Any]:
        """Clear chat history"""
        return self.supabase.clear_chat_history(user_id)
    
    def clear_all_data(self, user_id: str) -> Dict[str, Any]:
        """Clear all user data"""
        return self.supabase.clear_all_data(user_id)

    # USER PROFILE OPERATIONS
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile"""
        return self.supabase.get_user_profile(user_id)

    def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        return self.supabase.update_user_profile(user_id, profile_data)

    def save_user_settings(self, user_id: str, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Save user settings"""
        return self.supabase.save_user_settings(user_id, settings)
