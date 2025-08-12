from sqlalchemy.orm import Session
from database import Income, Expense, Inventory, ChatHistory
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, date

class BusinessLogic:
    def __init__(self, db: Session):
        self.db = db
    
    def add_income(self, amount: float, description: str, category: str, source: str = "text", user_id: str = "default_user", language: str = "hi") -> Dict[str, Any]:
        """
        Add income entry to database
        """
        try:
            # Provide default description if None
            if description is None:
                description = f"{category} - ₹{amount}"

            income = Income(
                amount=amount,
                description=description,
                category=category,
                source=source,
                user_id=user_id
            )
            
            self.db.add(income)
            self.db.commit()
            self.db.refresh(income)
            
            logging.info(f"Income added: ₹{amount} - {description}")
            
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

            return {
                "success": True,
                "message": message,
                "data": {
                    "id": income.id,
                    "amount": income.amount,
                    "description": income.description,
                    "category": income.category,
                    "date": income.date.isoformat()
                }
            }
            
        except Exception as e:
            self.db.rollback()
            logging.error(f"Error adding income: {str(e)}")
            return {
                "success": False,
                "message": "आय जोड़ने में त्रुटि हुई",
                "error": str(e)
            }
    
    def add_expense(self, amount: float, description: str, category: str, source: str = "text", user_id: str = "default_user") -> Dict[str, Any]:
        """
        Add expense entry to database
        """
        try:
            # Provide default description if None
            if description is None:
                description = f"{category} - ₹{amount}"

            expense = Expense(
                amount=amount,
                description=description,
                category=category,
                source=source,
                user_id=user_id
            )
            
            self.db.add(expense)
            self.db.commit()
            self.db.refresh(expense)
            
            logging.info(f"Expense added: ₹{amount} - {description}")
            
            return {
                "success": True,
                "message": f"✅ ₹{amount} का खर्च जोड़ा गया: {description}",
                "data": {
                    "id": expense.id,
                    "amount": expense.amount,
                    "description": expense.description,
                    "category": expense.category,
                    "date": expense.date.isoformat()
                }
            }
            
        except Exception as e:
            self.db.rollback()
            logging.error(f"Error adding expense: {str(e)}")
            return {
                "success": False,
                "message": "खर्च जोड़ने में त्रुटि हुई",
                "error": str(e)
            }
    
    def add_inventory_item(self, product_name: str, quantity: float, unit: str = "pieces",
                          cost_per_unit: float = 0.0, user_id: str = "default_user") -> Dict[str, Any]:
        """
        Add or update inventory item
        """
        try:
            logging.info(f"add_inventory_item called with: product_name={product_name}, quantity={quantity}, cost_per_unit={cost_per_unit}, user_id={user_id}")
            # Check if item already exists
            existing_item = self.db.query(Inventory).filter(
                Inventory.product_name == product_name,
                Inventory.user_id == user_id
            ).first()
            
            if existing_item:
                # Update existing item
                existing_item.quantity += quantity
                existing_item.cost_per_unit = cost_per_unit if cost_per_unit > 0 else existing_item.cost_per_unit
                existing_item.total_value = existing_item.quantity * existing_item.cost_per_unit
                existing_item.last_updated = datetime.now()
                
                # Check low stock
                existing_item.is_low_stock = existing_item.quantity <= existing_item.low_stock_threshold
                
                self.db.commit()
                self.db.refresh(existing_item)
                
                logging.info(f"Inventory updated: {product_name} - {existing_item.quantity} {unit}")
                
                return {
                    "success": True,
                    "message": f"✅ {product_name} का स्टॉक अपडेट किया गया: {existing_item.quantity} {unit}",
                    "data": {
                        "id": existing_item.id,
                        "product_name": existing_item.product_name,
                        "quantity": existing_item.quantity,
                        "unit": existing_item.unit,
                        "total_value": existing_item.total_value,
                        "is_low_stock": existing_item.is_low_stock
                    }
                }
            else:
                # Add new item
                total_value = quantity * cost_per_unit
                is_low_stock = quantity <= 5.0  # Default threshold

                # If cost_per_unit is 0 but we have total_value, calculate it
                if cost_per_unit == 0.0 and total_value > 0:
                    cost_per_unit = total_value / quantity if quantity > 0 else 0.0
                    logging.info(f"Calculated cost_per_unit from total_value: {cost_per_unit}")

                inventory_item = Inventory(
                    product_name=product_name,
                    quantity=quantity,
                    unit=unit,
                    cost_per_unit=cost_per_unit,
                    total_value=total_value,
                    is_low_stock=is_low_stock,
                    user_id=user_id
                )
                
                self.db.add(inventory_item)
                self.db.commit()
                self.db.refresh(inventory_item)
                
                logging.info(f"Inventory added: {product_name} - {quantity} {unit}")
                
                return {
                    "success": True,
                    "message": f"✅ {product_name} स्टॉक में जोड़ा गया: {quantity} {unit}",
                    "data": {
                        "id": inventory_item.id,
                        "product_name": inventory_item.product_name,
                        "quantity": inventory_item.quantity,
                        "unit": inventory_item.unit,
                        "total_value": inventory_item.total_value,
                        "is_low_stock": inventory_item.is_low_stock
                    }
                }
                
        except Exception as e:
            self.db.rollback()
            logging.error(f"Error managing inventory: {str(e)}")
            return {
                "success": False,
                "message": "स्टॉक प्रबंधन में त्रुटि हुई",
                "error": str(e)
            }
    
    def get_income_summary(self, user_id: str = "default_user") -> Dict[str, Any]:
        """
        Get income summary
        """
        try:
            total_income = self.db.query(Income).filter(Income.user_id == user_id).all()
            
            total_amount = sum(income.amount for income in total_income)
            recent_income = self.db.query(Income).filter(
                Income.user_id == user_id
            ).order_by(Income.date.desc()).limit(5).all()
            
            return {
                "success": True,
                "total_income": total_amount,
                "total_transactions": len(total_income),
                "recent_transactions": [
                    {
                        "id": income.id,
                        "amount": income.amount,
                        "description": income.description,
                        "category": income.category,
                        "date": income.date.isoformat()
                    } for income in recent_income
                ]
            }
            
        except Exception as e:
            logging.error(f"Error getting income summary: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_expense_summary(self, user_id: str = "default_user") -> Dict[str, Any]:
        """
        Get expense summary
        """
        try:
            total_expenses = self.db.query(Expense).filter(Expense.user_id == user_id).all()
            
            total_amount = sum(expense.amount for expense in total_expenses)
            recent_expenses = self.db.query(Expense).filter(
                Expense.user_id == user_id
            ).order_by(Expense.date.desc()).limit(5).all()
            
            return {
                "success": True,
                "total_expenses": total_amount,
                "total_transactions": len(total_expenses),
                "recent_transactions": [
                    {
                        "id": expense.id,
                        "amount": expense.amount,
                        "description": expense.description,
                        "category": expense.category,
                        "date": expense.date.isoformat()
                    } for expense in recent_expenses
                ]
            }
            
        except Exception as e:
            logging.error(f"Error getting expense summary: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

    def clear_expenses(self, user_id: str = "default_user") -> Dict[str, Any]:
        """
        Clear all expenses for a user
        """
        try:
            # Get count before deletion
            expense_count = self.db.query(Expense).filter(Expense.user_id == user_id).count()

            # Delete all expenses for the user
            self.db.query(Expense).filter(Expense.user_id == user_id).delete()
            self.db.commit()

            logging.info(f"Cleared {expense_count} expenses for user {user_id}")

            return {
                "success": True,
                "message": f"✅ Successfully cleared {expense_count} expenses"
            }
        except Exception as e:
            self.db.rollback()
            logging.error(f"Error clearing expenses: {str(e)}")
            return {"success": False, "message": f"Error clearing expenses: {str(e)}"}

    def clear_income(self, user_id: str = "default_user") -> Dict[str, Any]:
        """
        Clear all income for a user
        """
        try:
            # Get count before deletion
            income_count = self.db.query(Income).filter(Income.user_id == user_id).count()

            # Delete all income for the user
            self.db.query(Income).filter(Income.user_id == user_id).delete()
            self.db.commit()

            logging.info(f"Cleared {income_count} income records for user {user_id}")

            return {
                "success": True,
                "message": f"✅ Successfully cleared {income_count} income records"
            }
        except Exception as e:
            self.db.rollback()
            logging.error(f"Error clearing income: {str(e)}")
            return {"success": False, "message": f"Error clearing income: {str(e)}"}

    def clear_chat_history(self, user_id: str = "default_user") -> Dict[str, Any]:
        """
        Clear all chat history for a user
        """
        try:
            # Get count before deletion
            chat_count = self.db.query(ChatHistory).filter(ChatHistory.user_id == user_id).count()

            # Delete all chat history for the user
            self.db.query(ChatHistory).filter(ChatHistory.user_id == user_id).delete()
            self.db.commit()

            logging.info(f"Cleared {chat_count} chat messages for user {user_id}")

            return {
                "success": True,
                "message": f"✅ Successfully cleared {chat_count} chat messages"
            }
        except Exception as e:
            self.db.rollback()
            logging.error(f"Error clearing chat history: {str(e)}")
            return {"success": False, "message": f"Error clearing chat history: {str(e)}"}

    def clear_all_data(self, user_id: str = "default_user") -> Dict[str, Any]:
        """
        Clear all data for a user (expenses, income, inventory, chat)
        """
        try:
            # Get counts before deletion
            expense_count = self.db.query(Expense).filter(Expense.user_id == user_id).count()
            income_count = self.db.query(Income).filter(Income.user_id == user_id).count()
            inventory_count = self.db.query(Inventory).filter(Inventory.user_id == user_id).count()
            chat_count = self.db.query(ChatHistory).filter(ChatHistory.user_id == user_id).count()

            # Delete all data for the user
            self.db.query(Expense).filter(Expense.user_id == user_id).delete()
            self.db.query(Income).filter(Income.user_id == user_id).delete()
            self.db.query(Inventory).filter(Inventory.user_id == user_id).delete()
            self.db.query(ChatHistory).filter(ChatHistory.user_id == user_id).delete()
            self.db.commit()

            total_cleared = expense_count + income_count + inventory_count + chat_count

            logging.info(f"Cleared all data for user {user_id}: {expense_count} expenses, {income_count} income, {inventory_count} inventory, {chat_count} chat")

            return {
                "success": True,
                "message": f"✅ Successfully cleared all data: {expense_count} expenses, {income_count} income, {inventory_count} inventory, {chat_count} chat messages"
            }
        except Exception as e:
            self.db.rollback()
            logging.error(f"Error clearing all data: {str(e)}")
            return {"success": False, "message": f"Error clearing all data: {str(e)}"}

    def get_inventory_summary(self, user_id: str = "default_user") -> Dict[str, Any]:
        """
        Get inventory summary
        """
        try:
            all_items = self.db.query(Inventory).filter(Inventory.user_id == user_id).all()
            
            total_items = len(all_items)
            total_value = sum(item.total_value for item in all_items)
            low_stock_items = [item for item in all_items if item.is_low_stock]
            
            return {
                "success": True,
                "total_items": total_items,
                "total_value": total_value,
                "low_stock_count": len(low_stock_items),
                "low_stock_items": [
                    {
                        "id": item.id,
                        "product_name": item.product_name,
                        "quantity": item.quantity,
                        "unit": item.unit,
                        "threshold": item.low_stock_threshold
                    } for item in low_stock_items
                ],
                "all_items": [
                    {
                        "id": item.id,
                        "product_name": item.product_name,
                        "quantity": item.quantity,
                        "unit": item.unit,
                        "cost_per_unit": item.cost_per_unit,
                        "total_value": item.total_value,
                        "is_low_stock": item.is_low_stock,
                        "user_id": item.user_id
                    } for item in all_items
                ]
            }
            
        except Exception as e:
            logging.error(f"Error getting inventory summary: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def save_chat_history(self, user_id: str, message: str, response: str,
                         message_type: str = "text", intent: str = "general") -> bool:
        """
        Save chat history to database
        """
        try:
            logging.info(f"Attempting to save chat history: user_id={user_id}, message_type={message_type}, intent={intent}")

            chat_entry = ChatHistory(
                user_id=user_id,
                message=message,
                response=response,
                message_type=message_type,
                intent=intent
            )

            self.db.add(chat_entry)
            self.db.commit()

            logging.info(f"Successfully saved chat history entry with ID: {chat_entry.id}")
            return True

        except Exception as e:
            self.db.rollback()
            logging.error(f"Error saving chat history: {str(e)}")
            logging.error(f"Chat data: user_id={user_id}, message_len={len(message)}, response_len={len(response)}")
            return False

    def get_chat_history(self, user_id: str = "default_user", limit: int = 50) -> Dict[str, Any]:
        """
        Get chat history for a user
        """
        try:
            chat_entries = self.db.query(ChatHistory).filter(
                ChatHistory.user_id == user_id
            ).order_by(ChatHistory.timestamp.desc()).limit(limit).all()

            # Reverse to get chronological order (oldest first)
            chat_entries.reverse()

            messages = []
            for entry in chat_entries:
                # Add user message
                messages.append({
                    "id": f"user_{entry.id}",
                    "text": entry.message,
                    "sender": "user",
                    "isUser": True,
                    "timestamp": entry.timestamp.isoformat(),
                    "message_type": entry.message_type,
                    "intent": entry.intent
                })

                # Add AI response
                messages.append({
                    "id": f"ai_{entry.id}",
                    "text": entry.response,
                    "sender": "ai",
                    "isUser": False,
                    "timestamp": entry.timestamp.isoformat(),
                    "message_type": entry.message_type,
                    "intent": entry.intent
                })

            return {
                "success": True,
                "messages": messages,
                "total_count": len(chat_entries)
            }

        except Exception as e:
            logging.error(f"Error getting chat history: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "messages": []
            }

    def get_today_expenses(self, user_id: str = "default_user") -> Dict[str, Any]:
        """
        Get today's expenses for a user
        """
        try:
            today = date.today()
            today_expenses = self.db.query(Expense).filter(
                Expense.user_id == user_id,
                Expense.date >= today,
                Expense.date < today.replace(day=today.day + 1) if today.day < 31 else today.replace(month=today.month + 1, day=1)
            ).all()

            total_amount = sum(expense.amount for expense in today_expenses)

            return {
                "success": True,
                "total_expenses": total_amount,
                "count": len(today_expenses),
                "expenses": [
                    {
                        "id": expense.id,
                        "amount": expense.amount,
                        "description": expense.description,
                        "category": expense.category,
                        "date": expense.date.isoformat()
                    } for expense in today_expenses
                ]
            }

        except Exception as e:
            logging.error(f"Error getting today's expenses: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "total_expenses": 0,
                "count": 0,
                "expenses": []
            }