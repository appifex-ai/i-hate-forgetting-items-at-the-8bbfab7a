"""
Database Models

Define your SQLAlchemy ORM models here.
Each model represents a table in your database.

Common patterns:
- Use Base as the parent class
- Add __tablename__ for table name
- Include id, created_at, updated_at for most entities
- Use relationships for foreign key connections
"""

from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Store(Base):
    """Store model for organizing shopping items by location"""
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    color = Column(String, default="#6366f1")  # Hex color for UI
    icon = Column(String, default="🏪")  # Emoji icon
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    items = relationship("ShoppingItem", back_populates="store", cascade="all, delete-orphan")


class ShoppingItem(Base):
    """Shopping item model with quantity, store, and need-by date"""
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    quantity = Column(String, default="1")  # String to allow "2 lbs", "1 dozen", etc.
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    need_by_date = Column(Date, nullable=True)  # Optional deadline
    is_checked = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    store = relationship("Store", back_populates="items")
