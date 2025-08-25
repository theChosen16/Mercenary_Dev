"""
API endpoints for handling payments with Mercado Pago.
"""
import mercadopago
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.core.config import settings
from app.api import deps
from app.models.user import User

router = APIRouter()

class Preference(BaseModel):
    title: str
    quantity: int
    unit_price: float

class SubscriptionPlan(BaseModel):
    reason: str
    price: float

@router.post("/create-preference")
async def create_preference(preference: Preference):
    """
    Create a Mercado Pago payment preference.
    """
    if not settings.MERCADO_PAGO_ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="Mercado Pago access token is not configured.")

    sdk = mercadopago.SDK(settings.MERCADO_PAGO_ACCESS_TOKEN)

    preference_data = {
        "items": [
            {
                "title": preference.title,
                "quantity": preference.quantity,
                "unit_price": preference.unit_price,
                "currency_id": "CLP"  # Chilean Peso
            }
        ],
        "back_urls": {
            "success": f"{settings.BACKEND_CORS_ORIGINS[0]}/payment-success",
            "failure": f"{settings.BACKEND_CORS_ORIGINS[0]}/payment-failure",
            "pending": f"{settings.BACKEND_CORS_ORIGINS[0]}/payment-pending"
        },
        "auto_return": "approved",
    }

    try:
        preference_response = sdk.preference().create(preference_data)
        if preference_response["status"] == 201:
            return {"preference_id": preference_response["response"]["id"]}
        else:
            raise HTTPException(status_code=preference_response["status"], detail=preference_response["response"])
    except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-subscription")
async def create_subscription(plan: SubscriptionPlan, current_user: User = Depends(deps.get_current_active_user)):
    """
    Create a Mercado Pago subscription (preapproval).
    """
    if not settings.MERCADO_PAGO_ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="Mercado Pago access token is not configured.")

    sdk = mercadopago.SDK(settings.MERCADO_PAGO_ACCESS_TOKEN)

    preapproval_data = {
        "reason": plan.reason,
        "auto_recurring": {
            "frequency": 1,
            "frequency_type": "months",
            "transaction_amount": plan.price,
            "currency_id": "CLP"
        },
        "back_urls": {
            "success": f"{settings.BACKEND_CORS_ORIGINS[0]}/subscription-success",
            "failure": f"{settings.BACKEND_CORS_ORIGINS[0]}/subscription-failure",
            "pending": f"{settings.BACKEND_CORS_ORIGINS[0]}/subscription-pending"
        },
        "payer_email": current_user.email,
        "auto_return": "approved",
    }

    try:
        preapproval_response = sdk.preapproval().create(preapproval_data)
        if preapproval_response["status"] == 201:
            return {"init_point": preapproval_response["response"]["init_point"]}
        else:
            raise HTTPException(status_code=preapproval_response["status"], detail=preapproval_response["response"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
