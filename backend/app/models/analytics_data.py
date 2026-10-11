from datetime import date
from sqlalchemy import String, Integer, Float, Date
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class SalesOrder(Base):
    """Business table: sales_orders (Analytics Demo Dataset)."""
    __tablename__ = "sales_orders"

    order_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    order_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    customer_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    product_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    region_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    region_name: Mapped[str] = mapped_column(String(100), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    discount_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    net_amount: Mapped[float] = mapped_column(Float, nullable=False)
    cost_amount: Mapped[float] = mapped_column(Float, nullable=False)
    profit_amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_status: Mapped[str] = mapped_column(String(50), default="Paid", nullable=False)
    channel: Mapped[str] = mapped_column(String(50), default="Direct", nullable=False)


class Customer(Base):
    """Business table: customers (Analytics Demo Dataset)."""
    __tablename__ = "customers"

    customer_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    segment: Mapped[str] = mapped_column(String(50), nullable=False)  # Enterprise, Mid-Market, SMB
    industry: Mapped[str] = mapped_column(String(100), nullable=False)
    region_name: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    churn_risk: Mapped[str] = mapped_column(String(50), default="Low", nullable=False)  # Low, Medium, High
    total_spend: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    signup_date: Mapped[date] = mapped_column(Date, nullable=False)


class Product(Base):
    """Business table: products (Analytics Demo Dataset)."""
    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    cost: Mapped[float] = mapped_column(Float, nullable=False)
    margin_pct: Mapped[float] = mapped_column(Float, nullable=False)
    is_active: Mapped[int] = mapped_column(Integer, default=1, nullable=False)


class Region(Base):
    """Business table: regions (Analytics Demo Dataset)."""
    __tablename__ = "regions"

    region_id: Mapped[str] = mapped_column(String(50), primary_key=True)
    region_name: Mapped[str] = mapped_column(String(100), nullable=False)
    target_revenue: Mapped[float] = mapped_column(Float, nullable=False)
    actual_revenue: Mapped[float] = mapped_column(Float, nullable=False)
    regional_lead: Mapped[str] = mapped_column(String(100), nullable=False)
