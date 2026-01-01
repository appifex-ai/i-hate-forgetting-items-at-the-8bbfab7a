from datetime import datetime, date
from pydantic import BaseModel, ConfigDict
from typing import Optional


class BaseSchema(BaseModel):
    """Base schema with common Pydantic configuration"""

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class TimestampMixin(BaseModel):
    """Mixin for entities with created_at/updated_at fields"""

    created_at: datetime
    updated_at: datetime


# Store Schemas
class StoreBase(BaseSchema):
    name: str
    color: Optional[str] = "#6366f1"
    icon: Optional[str] = "🏪"


class StoreCreate(StoreBase):
    pass


class StoreUpdate(BaseSchema):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class Store(StoreBase, TimestampMixin):
    id: int


# Shopping Item Schemas
class ShoppingItemBase(BaseSchema):
    name: str
    quantity: str = "1"
    store_id: int
    need_by_date: Optional[date] = None


class ShoppingItemCreate(ShoppingItemBase):
    pass


class ShoppingItemUpdate(BaseSchema):
    name: Optional[str] = None
    quantity: Optional[str] = None
    store_id: Optional[int] = None
    need_by_date: Optional[date] = None
    is_checked: Optional[bool] = None


class ShoppingItem(ShoppingItemBase, TimestampMixin):
    id: int
    is_checked: bool
    store: Store  # Include full store info in response
