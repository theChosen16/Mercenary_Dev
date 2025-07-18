"""Script para probar la funcionalidad de autenticación."""
import json
import os
import sys
import uuid
from pathlib import Path
from pprint import pprint

import requests

# Añadir el directorio raíz al path para importaciones
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Configurar la variable de entorno para el entorno de Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# Configuración de la API
BASE_URL = "http://localhost:8000/api/v1"


def test_register_user():
    """Prueba el registro de un nuevo usuario."""
    print("\n[TEST] Probando registro de usuario...")
    url = f"{BASE_URL}/auth/register"

    # Usar un correo único para cada prueba
    unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    username = f"testuser_{uuid.uuid4().hex[:6]}"  # Nombre de usuario único

    user_data = {
        "username": username,
        "email": unique_email,
        "password": "testpassword123",
        "full_name": "Usuario de Prueba",
        "bio": "Usuario de prueba para tests automatizados"
    }

    try:
        response = requests.post(url, json=user_data, timeout=10)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 201:
            print("[SUCCESS] Usuario registrado exitosamente!")
            pprint(response.json())
            return response.json()

        print("[ERROR] Error al registrar usuario:")
        try:
            pprint(response.json())
        except json.JSONDecodeError as json_err:
            print(f"Error parsing JSON: {json_err}")
            print(response.text)
        return None

    except requests.exceptions.RequestException as req_err:
        print(f"[ERROR] Error en la solicitud: {req_err}")
        return None


def test_login():
    """Prueba el inicio de sesión."""
    print("\n[TEST] Probando inicio de sesión...")
    url = f"{BASE_URL}/auth/login/access-token"

    # Usar form-data en lugar de JSON para el login
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }

    try:
        # Usar data= en lugar de json= para enviar como form-data
        response = requests.post(url, data=login_data, timeout=10)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            print("[SUCCESS] Inicio de sesión exitoso!")
            tokens = response.json()
            pprint(tokens)
            return tokens.get("access_token")

        print("[ERROR] Error en el inicio de sesión:")
        try:
            pprint(response.json())
        except json.JSONDecodeError as json_err:
            print(f"Error parsing JSON: {json_err}")
            print(response.text)
        return None

    except requests.exceptions.RequestException as req_err:
        print(f"[ERROR] Error en la solicitud: {req_err}")
        return None


def test_protected_endpoint(access_token):
    """Prueba un endpoint protegido que requiere autenticación."""
    if not access_token:
        print("\n[SKIP] No se puede probar el endpoint protegido sin token")
        return False

    print("\n[TEST] Probando endpoint protegido...")
    url = f"{BASE_URL}/users/me"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            print("[SUCCESS] Acceso al endpoint protegido exitoso!")
            pprint(response.json())
            return True
        
        print("[ERROR] Error al acceder al endpoint protegido:")
        try:
            pprint(response.json())
        except ValueError as e:
            print(f"Error parsing JSON: {e}")
            print(response.text)
        return False

    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Error en la solicitud: {e}")
        return False


def main():
    """Ejecuta todas las pruebas de autenticación."""
    print("Iniciando pruebas de autenticación...")

    # Ejecutar pruebas
    user = test_register_user()
    if not user:
        print("\n[WARNING] No se pudo registrar el usuario")
        return
    
    access_token = test_login()
    if not access_token:
        print("\n[WARNING] No se pudo obtener el token de acceso")
        return
    
    if not test_protected_endpoint(access_token):
        print("\n[WARNING] Falló la prueba del endpoint protegido")
        return
    
    print("\n[SUCCESS] Todas las pruebas se completaron exitosamente!")


if __name__ == "__main__":
    main()
