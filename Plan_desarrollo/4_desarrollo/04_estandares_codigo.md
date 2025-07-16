# Estándares de Código

## Tabla de Contenidos
1. [Python](#python)
2. [Dart/Flutter](#dartflutter)
3. [Git](#git)
4. [Buenas Prácticas](#buenas-prácticas)
5. [Convenciones de Nombrado](#convenciones-de-nombrado)
6. [Documentación](#documentación)

## Python

### Formato
- Usa **Black** para formatear el código automáticamente
- Línea máxima de 88 caracteres
- Usa comillas dobles (`"`) para strings
- Usa 4 espacios para la indentación (no tabs)

### Estructura de Imports
```python
# Standard library imports
import os
import sys
from typing import List, Dict

# Third-party imports
from fastapi import FastAPI
from pydantic import BaseModel

# Local application imports
from app.core.config import settings
from .utils import helper_function
```

### Type Hints
- Siempre usa type hints en funciones y métodos
- Usa `Optional[T]` en lugar de `T | None` para compatibilidad con versiones anteriores
- Documenta tipos complejos con `TypedDict` o `dataclasses`

### Ejemplo de Función
```python
def calculate_total(
    items: List[Dict[str, float]], 
    tax_rate: float = 0.19
) -> float:
    """
    Calculate the total price including tax.

    Args:
        items: List of items with 'price' key
        tax_rate: Tax rate as decimal (default: 0.19 for 19%)

    Returns:
        Total price including tax
    """
    subtotal = sum(item['price'] for item in items)
    return subtotal * (1 + tax_rate)
```

## Dart/Flutter

### Estructura de Archivos
```
lib/
  models/
  providers/
  screens/
    home/
      home_screen.dart
      home_viewmodel.dart
  services/
  utils/
  widgets/
    custom_button.dart
    text_field.dart
  app.dart
  main.dart
```

### Widgets
- Separa la lógica de la UI usando el patrón ViewModel
- Usa `const` constructors cuando sea posible
- Extrae widgets reutilizables
- Usa `keys` para widgets con estado

### Ejemplo de Widget
```dart
class CustomButton extends StatelessWidget {
  const CustomButton({
    Key? key,
    required this.onPressed,
    required this.label,
    this.isLoading = false,
  }) : super(key: key);

  final VoidCallback onPressed;
  final String label;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      child: isLoading 
          ? const CircularProgressIndicator()
          : Text(label),
    );
  }
}
```

## Git

### Mensajes de Commit
Usa el formato Conventional Commits:
```
type(scope): descripción breve

Descripción detallada si es necesario

Cierra #issue-number
```

### Tipos de Commits
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en la documentación
- `style`: Cambios de formato (puntos y comas, indentación, etc.)
- `refactor`: Cambios en el código que no corrigen bugs ni agregan características
- `test`: Agregar o modificar tests
- `chore`: Cambios en el proceso de build o herramientas auxiliares

## Buenas Prácticas

### General
- Mantén las funciones cortas y con una sola responsabilidad
- Comenta el porqué, no el qué
- Escribe tests para nueva funcionalidad
- Revisa tu propio código antes de solicitar revisión

### Seguridad
- Nunca expongas credenciales en el código
- Valida todas las entradas del usuario
- Usa consultas parametrizadas para evitar inyección SQL
- Implementa rate limiting en endpoints públicos

## Convenciones de Nombrado

### Python
- Clases: `PascalCase`
- Funciones y variables: `snake_case`
- Constantes: `UPPER_SNAKE_CASE`
- Módulos: `snake_case`

### Dart
- Clases: `PascalCase`
- Variables y funciones: `camelCase`
- Constantes: `lowerCamelCase` o `UPPER_SNAKE_CASE`
- Archivos: `snake_case`

## Documentación

### Python
- Usa docstrings siguiendo Google Style
- Documenta tipos, parámetros, valores de retorno y excepciones

### Dart
- Usa `///` para documentación de la API
- Documenta parámetros con `@param` y valores de retorno con `@return`
- Usa `@deprecated` para código obsoleto

## Herramientas Recomendadas

### Python
- `black`: Formateador de código
- `isort`: Ordena imports
- `mypy`: Verificación de tipos
- `pylint`: Análisis estático

### Flutter
- `flutter format`: Formateador de código
- `flutter analyze`: Análisis estático
- `flutter_test`: Framework de pruebas
