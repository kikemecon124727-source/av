from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
import uuid
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# LLM Key for color detection
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
if not EMERGENT_LLM_KEY:
    logger.error("EMERGENT_LLM_KEY not found in environment variables")
    raise ValueError("EMERGENT_LLM_KEY environment variable is required")

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class ColorDetectionRequest(BaseModel):
    text: str

class ColorDetectionResponse(BaseModel):
    color_name: str
    hex_code: str
    confidence: str


# Routes
@api_router.get("/")
async def root():
    return {"message": "Backend API - Jessica Ale Suarez Catálogo"}


@api_router.get("/health")
async def health_check():
    """
    Endpoint simple para keep-alive y health checks.
    UptimeRobot, cron-job.org o GitHub Actions pueden hacer ping aquí.
    """
    return {
        "status": "ok",
        "message": "Backend is alive",
        "service": "Jessica Ale Suarez Catálogo"
    }


@api_router.post("/detect-color", response_model=ColorDetectionResponse)
async def detect_color(request: ColorDetectionRequest):
    """
    Detecta el color basado en texto usando IA.
    Ejemplos: "madera" -> café/beige, "pasto" -> verde, "cielo" -> azul
    """
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"color-detect-{uuid.uuid4()}",
            system_message="""Eres un experto en colores. Tu trabajo es detectar qué color representa una palabra o frase.
            
Responde SOLO en formato JSON con estas claves exactas:
- color_name: nombre del color en español (ej: "café", "verde pasto", "azul cielo")
- hex_code: código hexadecimal del color (ej: "#8B4513", "#228B22", "#87CEEB")
- confidence: "high", "medium" o "low"

Si es un color directo (rojo, azul, verde) usa el color estándar.
Si es algo como "madera", "pasto", "cielo", "mar", "fuego", etc., interpreta el color asociado.
Si incluye especificadores como "claro", "oscuro", "brillante", "pastel", "neón", ajusta el hex acordemente.

Colores neón deben ser muy brillantes y saturados:
- Neón rosa: #FF1493
- Neón verde: #39FF14
- Neón azul: #00FFFF
- Neón naranja: #FF6600
- Neón amarillo: #FFFF00
- Neón morado: #BF00FF

SOLO devuelve JSON válido, nada más."""
        ).with_model("openai", "gpt-4o-mini")

        user_message = UserMessage(text=f'¿Qué color representa "{request.text}"? Responde solo JSON.')
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        # Clean response - remove markdown code blocks if present
        clean_response = response.strip()
        if clean_response.startswith("```"):
            clean_response = clean_response.split("```")[1]
            if clean_response.startswith("json"):
                clean_response = clean_response[4:]
        clean_response = clean_response.strip()
        
        data = json.loads(clean_response)
        
        return ColorDetectionResponse(
            color_name=data.get("color_name", request.text),
            hex_code=data.get("hex_code", "#808080"),
            confidence=data.get("confidence", "medium")
        )
    except Exception as e:
        logger.error(f"Error detecting color: {e}")
        # Fallback to basic color mapping
        basic_colors = {
            "rojo": "#FF0000", "azul": "#0000FF", "verde": "#008000",
            "amarillo": "#FFFF00", "naranja": "#FFA500", "morado": "#800080",
            "rosa": "#FFC0CB", "negro": "#000000", "blanco": "#FFFFFF",
            "gris": "#808080", "café": "#8B4513", "marrón": "#8B4513",
            "beige": "#F5F5DC", "dorado": "#FFD700", "plateado": "#C0C0C0"
        }
        text_lower = request.text.lower()
        for color, hex_code in basic_colors.items():
            if color in text_lower:
                return ColorDetectionResponse(
                    color_name=color,
                    hex_code=hex_code,
                    confidence="low"
                )
        return ColorDetectionResponse(
            color_name=request.text,
            hex_code="#808080",
            confidence="low"
        )


# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_methods=["*"],
    allow_headers=["*"],
)
