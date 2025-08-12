from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bizsakhi.db")

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Database Models
class Income(Base):
    __tablename__ = "income"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    date = Column(DateTime, default=func.now())
    source = Column(String(100))  # e.g., "voice", "text", "ocr"
    user_id = Column(String(100), default="default_user")

class Expense(Base):
    __tablename__ = "expense"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    date = Column(DateTime, default=func.now())
    source = Column(String(100))  # e.g., "voice", "text", "ocr"
    user_id = Column(String(100), default="default_user")

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="pieces")  # kg, pieces, etc.
    cost_per_unit = Column(Float, default=0.0)
    total_value = Column(Float, default=0.0)
    low_stock_threshold = Column(Float, default=5.0)
    is_low_stock = Column(Boolean, default=False)
    date_added = Column(DateTime, default=func.now())
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    user_id = Column(String(100), default="default_user")

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), default="default_user")
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    message_type = Column(String(50))  # "text", "voice", "image"
    intent = Column(String(100))  # "income", "expense", "inventory", "general"
    timestamp = Column(DateTime, default=func.now())

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 