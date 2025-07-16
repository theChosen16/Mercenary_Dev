import os
from .base import BaseConfig
from .production import ProductionConfig

# Determinar el entorno actual
ENV = os.getenv("FLASK_ENV", "development")

# Configuración según el entorno
if ENV == "production":
    config = ProductionConfig()
else:
    config = BaseConfig()
    config.DEBUG = True
