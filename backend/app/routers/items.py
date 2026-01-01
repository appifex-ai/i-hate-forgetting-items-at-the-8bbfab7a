from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.dependencies import get_db
from app.models import ShoppingItem
from app.schemas import ShoppingItemCreate, ShoppingItemUpdate, ShoppingItem as ShoppingItemSchema
from typing import List

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=List[ShoppingItemSchema])
def get_items(db: Session = Depends(get_db)):
    """Get all shopping items with store info"""
    return db.query(ShoppingItem).options(joinedload(ShoppingItem.store)).order_by(ShoppingItem.created_at.desc()).all()


@router.post("", response_model=ShoppingItemSchema)
def create_item(item: ShoppingItemCreate, db: Session = Depends(get_db)):
    """Create a new shopping item"""
    db_item = ShoppingItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    # Load store relationship
    db.refresh(db_item, ["store"])
    return db_item


@router.patch("/{item_id}", response_model=ShoppingItemSchema)
def update_item(item_id: int, item: ShoppingItemUpdate, db: Session = Depends(get_db)):
    """Update a shopping item"""
    db_item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    db.commit()
    db.refresh(db_item)
    db.refresh(db_item, ["store"])
    return db_item


@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a shopping item"""
    db_item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted successfully"}
