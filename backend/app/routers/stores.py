from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models import Store
from app.schemas import StoreCreate, StoreUpdate, Store as StoreSchema
from typing import List

router = APIRouter(prefix="/stores", tags=["stores"])


@router.get("", response_model=List[StoreSchema])
def get_stores(db: Session = Depends(get_db)):
    """Get all stores"""
    return db.query(Store).order_by(Store.name).all()


@router.post("", response_model=StoreSchema)
def create_store(store: StoreCreate, db: Session = Depends(get_db)):
    """Create a new store"""
    db_store = Store(**store.model_dump())
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store


@router.patch("/{store_id}", response_model=StoreSchema)
def update_store(store_id: int, store: StoreUpdate, db: Session = Depends(get_db)):
    """Update a store"""
    db_store = db.query(Store).filter(Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    update_data = store.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_store, key, value)
    
    db.commit()
    db.refresh(db_store)
    return db_store


@router.delete("/{store_id}")
def delete_store(store_id: int, db: Session = Depends(get_db)):
    """Delete a store"""
    db_store = db.query(Store).filter(Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    db.delete(db_store)
    db.commit()
    return {"message": "Store deleted successfully"}
