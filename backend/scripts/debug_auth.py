"""Script para depurar problemas de autenticación."""
import json
import logging
import sys
import traceback
from http.client import HTTPConnection

import requests

# Configurar logging detallado para requests
HTTPConnection.debuglevel = 1

# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('debug_auth.log')
    ]
)

# Habilitar logging para urllib3
logging.getLogger('urllib3').setLevel(logging.DEBUG)
requests_log = logging.getLogger("urllib3")
requests_log.setLevel(logging.DEBUG)
requests_log.propagate = True

logger = logging.getLogger(__name__)

def print_request_details(request):
    """Imprimir detalles de la solicitud HTTP."""
    logger.debug("=== Detalles de la solicitud ===")
    logger.debug(f"URL: {request.url}")
    logger.debug(f"Método: {request.method}")
    logger.debug("Headers:")
    for k, v in request.headers.items():
        logger.debug(f"  {k}: {v}")
    if hasattr(request, 'body') and request.body:
        try:
            logger.debug(f"Body: {request.body.decode('utf-8')}")
        except (UnicodeDecodeError, AttributeError) as decode_err:
            logger.debug("Body (raw): %s", request.body)
            logger.debug("Decode error: %s", str(decode_err))

def print_response_details(response):
    """Imprimir detalles de la respuesta HTTP."""
    logger.debug("=== Detalles de la respuesta ===")
    logger.debug(f"Status Code: {response.status_code}")
    logger.debug("Headers:")
    for k, v in response.headers.items():
        logger.debug(f"  {k}: {v}")
    logger.debug(f"Contenido: {response.text}")

def test_register():
    """
    Probar el endpoint de registro con logging detallado.
    
    Returns:
        requests.Response: La respuesta del servidor.
    """
    url = 'http://localhost:8000/api/v1/auth/register'
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    }
    data = {
        'email': 'testuser@example.com',
        'password': 'testpassword123',
        'full_name': 'Test User',
        'username': 'testuser'
    }

    def log_request(req, **kwargs):
        """Registrar detalles de la solicitud HTTP."""
        logger.debug("\n=== Solicitud HTTP ===")
        logger.debug("%s %s", req.method, req.url)
        logger.debug("Headers:")
        for k, v in req.headers.items():
            logger.debug("  %s: %s", k, v)
        if req.body:
            try:
                logger.debug("Body: %s", req.body.decode('utf-8'))
            except (UnicodeDecodeError, AttributeError) as decode_err:
                logger.debug("Body (raw): %s", req.body)
                logger.debug("Error decoding body: %s", str(decode_err))
        return None

    try:
        logger.info("=== Iniciando prueba de registro de usuario ===")
        logger.info("URL: %s", url)
        logger.info(
            "Datos de la solicitud: %s",
            json.dumps(data, indent=2)
        )

        # Crear una sesión para capturar la solicitud
        with requests.Session() as session:
            # Configurar el hook
            session.hooks['response'] = [
                lambda r, *a, **kw: log_request(r.request)
            ]
            
            # Realizar la solicitud
            response = session.post(
                url,
                headers=headers,
                json=data,
                timeout=10
            )
            
            # Registrar detalles de la respuesta
            logger.info("\n=== Respuesta del servidor ===")
            logger.info("Status Code: %d", response.status_code)
            logger.info("Headers:")
            for k, v in response.headers.items():
                logger.info("  %s: %s", k, v)
            logger.info("Contenido: %s", response.text)
            
            # Si hay un error, intentar obtener más información
            if response.status_code >= 400:
                try:
                    error_details = response.json()
                    logger.error("Detalles del error:")
                    logger.error(
                        json.dumps(
                            error_details,
                            indent=2,
                            ensure_ascii=False
                        )
                    )
                except json.JSONDecodeError:
                    logger.error(
                        "No se pudo obtener detalles adicionales del error."
                    )
            
            return response

    except requests.exceptions.RequestException as e:
        logger.error("Error de conexión: %s", str(e))
        if hasattr(e, 'response') and e.response is not None:
            logger.error(
                "Respuesta del servidor: %d - %s",
                e.response.status_code,
                e.response.text
            )
        logger.error(traceback.format_exc())
        raise
    except Exception as e:
        logger.error("Error inesperado: %s", str(e))
        logger.error(traceback.format_exc())
        raise

if __name__ == "__main__":
    print("=== Iniciando prueba de registro de usuario ===")
    response = test_register()
    print("\n=== Resultado de la prueba ===")
    print(f"Código de estado: {response.status_code}")
    print(f"Respuesta: {response.text}")
