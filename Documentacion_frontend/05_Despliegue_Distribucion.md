# **🚀 Despliegue y Distribución - Mercenary App**

## **📋 Información General**

Este documento describe el proceso de despliegue, distribución en stores, configuración de CI/CD y estrategias de versionado para la aplicación móvil Mercenary.

---

## **📱 Configuración de Builds**

### **Android Build Configuration**
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34
    ndkVersion flutter.ndkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    defaultConfig {
        applicationId "com.mercenary.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        
        // Configuración de red para desarrollo
        usesCleartextTraffic true
    }

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }

    flavorDimensions "environment"
    productFlavors {
        development {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
            resValue "string", "app_name", "Mercenary Dev"
        }
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            resValue "string", "app_name", "Mercenary Staging"
        }
        production {
            dimension "environment"
            resValue "string", "app_name", "Mercenary"
        }
    }
}
```

### **iOS Build Configuration**
```xml
<!-- ios/Runner/Info.plist -->
<dict>
    <key>CFBundleName</key>
    <string>Mercenary</string>
    <key>CFBundleIdentifier</key>
    <string>com.mercenary.app</string>
    <key>CFBundleVersion</key>
    <string>$(FLUTTER_BUILD_NUMBER)</string>
    <key>CFBundleShortVersionString</key>
    <string>$(FLUTTER_BUILD_NAME)</string>
    
    <!-- Configuración de red -->
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
    
    <!-- Permisos -->
    <key>NSCameraUsageDescription</key>
    <string>Esta app necesita acceso a la cámara para tomar fotos de perfil</string>
    <key>NSPhotoLibraryUsageDescription</key>
    <string>Esta app necesita acceso a la galería para seleccionar fotos</string>
</dict>
```

---

## **🏗️ Entornos de Desarrollo**

### **Configuración por Entornos**
```dart
// lib/core/config/environment.dart
enum Environment {
  development,
  staging,
  production,
}

class EnvironmentConfig {
  static Environment _environment = Environment.development;
  
  static Environment get environment => _environment;
  
  static void setEnvironment(Environment env) {
    _environment = env;
  }
  
  static String get baseUrl {
    switch (_environment) {
      case Environment.development:
        return 'http://localhost:8000';
      case Environment.staging:
        return 'https://staging-api.mercenary.com';
      case Environment.production:
        return 'https://api.mercenary.com';
    }
  }
  
  static bool get isDebug => _environment != Environment.production;
  
  static String get appName {
    switch (_environment) {
      case Environment.development:
        return 'Mercenary Dev';
      case Environment.staging:
        return 'Mercenary Staging';
      case Environment.production:
        return 'Mercenary';
    }
  }
}
```

### **Main Files por Entorno**
```dart
// lib/main_development.dart
import 'package:flutter/material.dart';
import 'core/config/environment.dart';
import 'main.dart' as app;

void main() {
  EnvironmentConfig.setEnvironment(Environment.development);
  app.main();
}

// lib/main_staging.dart
import 'package:flutter/material.dart';
import 'core/config/environment.dart';
import 'main.dart' as app;

void main() {
  EnvironmentConfig.setEnvironment(Environment.staging);
  app.main();
}

// lib/main_production.dart
import 'package:flutter/material.dart';
import 'core/config/environment.dart';
import 'main.dart' as app;

void main() {
  EnvironmentConfig.setEnvironment(Environment.production);
  app.main();
}
```

---

## **🔐 Configuración de Signing**

### **Android Keystore**
```properties
# android/key.properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=mercenary_key
storeFile=../keystore/mercenary-keystore.jks
```

### **Comandos de Build Android**
```bash
# Debug build
flutter build apk --debug --flavor development

# Release build para desarrollo
flutter build apk --release --flavor development

# Release build para staging
flutter build apk --release --flavor staging

# Release build para producción
flutter build apk --release --flavor production

# App Bundle para Play Store
flutter build appbundle --release --flavor production
```

### **iOS Signing**
```bash
# Debug build
flutter build ios --debug --flavor development

# Release build
flutter build ios --release --flavor production

# Archive para App Store
flutter build ipa --release --flavor production
```

---

## **🏪 Distribución en Stores**

### **Google Play Store**

#### **Configuración del App Bundle**
```yaml
# pubspec.yaml - Configuración para Play Store
flutter:
  assets:
    - assets/images/
    - assets/icons/
  
  # Configuración de iconos adaptativos
  adaptive_icon:
    android: true
    ios: false
    image_path: "assets/icons/app_icon.png"
    background_color: "#2E7D32"
    foreground_image_path: "assets/icons/app_icon_foreground.png"
```

#### **Metadata para Play Store**
```
Título: Mercenary - Plataforma de Servicios
Descripción Corta: Conecta oferentes con mercenarios especializados

Descripción Completa:
Mercenary es la plataforma líder que conecta oferentes con mercenarios especializados en diversas áreas. Encuentra el talento perfecto para tu proyecto o descubre oportunidades de trabajo que se adapten a tus habilidades.

Características principales:
• Búsqueda avanzada de trabajos y talentos
• Sistema de calificaciones y reseñas
• Chat integrado para comunicación directa
• Gestión segura de pagos y contratos
• Notificaciones en tiempo real
• Interfaz intuitiva y fácil de usar

Categorías: Productividad, Negocios
Clasificación de contenido: Para todas las edades
```

### **Apple App Store**

#### **App Store Connect Configuration**
```
Bundle ID: com.mercenary.app
App Name: Mercenary
Subtitle: Plataforma de Servicios
Keywords: trabajo, freelance, servicios, mercenario, oferente
Category: Business
Age Rating: 4+

App Description:
Mercenary conecta oferentes con mercenarios especializados. Encuentra el talento perfecto para tu proyecto o descubre oportunidades que se adapten a tus habilidades.

What's New:
• Lanzamiento inicial de la aplicación
• Sistema completo de autenticación
• Dashboard intuitivo con navegación por tabs
• Gestión de perfil de usuario
• Interfaz moderna con Material Design 3
```

---

## **⚙️ CI/CD Pipeline**

### **GitHub Actions Workflow**
```yaml
# .github/workflows/flutter_ci_cd.yml
name: Flutter CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  release:
    types: [ published ]

env:
  FLUTTER_VERSION: '3.32.8'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: ${{ env.FLUTTER_VERSION }}
        
    - name: Install dependencies
      run: flutter pub get
      
    - name: Run analyzer
      run: flutter analyze
      
    - name: Run tests
      run: flutter test --coverage
      
    - name: Upload coverage
      uses: codecov/codecov-action@v4
      with:
        file: coverage/lcov.info

  build_android:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'release'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: ${{ env.FLUTTER_VERSION }}
        
    - name: Install dependencies
      run: flutter pub get
      
    - name: Setup Android signing
      run: |
        echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 --decode > android/keystore/mercenary-keystore.jks
        echo "storePassword=${{ secrets.KEYSTORE_PASSWORD }}" >> android/key.properties
        echo "keyPassword=${{ secrets.KEY_PASSWORD }}" >> android/key.properties
        echo "keyAlias=${{ secrets.KEY_ALIAS }}" >> android/key.properties
        echo "storeFile=../keystore/mercenary-keystore.jks" >> android/key.properties
        
    - name: Build Android App Bundle
      run: flutter build appbundle --release --flavor production
      
    - name: Upload to Play Store
      uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
        packageName: com.mercenary.app
        releaseFiles: build/app/outputs/bundle/productionRelease/app-production-release.aab
        track: internal

  build_ios:
    needs: test
    runs-on: macos-latest
    if: github.event_name == 'release'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: ${{ env.FLUTTER_VERSION }}
        
    - name: Install dependencies
      run: flutter pub get
      
    - name: Setup iOS signing
      run: |
        echo "${{ secrets.IOS_CERTIFICATE }}" | base64 --decode > ios_certificate.p12
        echo "${{ secrets.IOS_PROVISIONING_PROFILE }}" | base64 --decode > ios_profile.mobileprovision
        
    - name: Build iOS IPA
      run: flutter build ipa --release --flavor production
      
    - name: Upload to TestFlight
      run: |
        xcrun altool --upload-app --type ios --file build/ios/ipa/mercenary_app.ipa \
          --username "${{ secrets.APPLE_ID }}" --password "${{ secrets.APPLE_APP_PASSWORD }}"
```

---

## **📊 Versionado y Releases**

### **Semantic Versioning**
```
MAJOR.MINOR.PATCH+BUILD

Ejemplos:
1.0.0+1    - Lanzamiento inicial
1.0.1+2    - Bug fixes
1.1.0+3    - Nuevas características
2.0.0+4    - Breaking changes
```

### **Automatización de Versiones**
```bash
#!/bin/bash
# scripts/bump_version.sh

VERSION_TYPE=$1 # major, minor, patch

if [ -z "$VERSION_TYPE" ]; then
  echo "Usage: ./bump_version.sh [major|minor|patch]"
  exit 1
fi

# Leer versión actual
CURRENT_VERSION=$(grep "version:" pubspec.yaml | sed 's/version: //' | sed 's/+.*//')
CURRENT_BUILD=$(grep "version:" pubspec.yaml | sed 's/.*+//')

# Calcular nueva versión
case $VERSION_TYPE in
  "major")
    NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print ($1+1)".0.0"}')
    ;;
  "minor")
    NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1".".($2+1)".0"}')
    ;;
  "patch")
    NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."$2".".($3+1)}')
    ;;
esac

NEW_BUILD=$((CURRENT_BUILD + 1))
FULL_VERSION="$NEW_VERSION+$NEW_BUILD"

# Actualizar pubspec.yaml
sed -i "s/version: .*/version: $FULL_VERSION/" pubspec.yaml

echo "Version updated to: $FULL_VERSION"

# Crear tag de git
git add pubspec.yaml
git commit -m "Bump version to $FULL_VERSION"
git tag "v$NEW_VERSION"

echo "Git tag created: v$NEW_VERSION"
```

---

## **📈 Monitoreo en Producción**

### **Crashlytics Integration**
```dart
// lib/core/services/crashlytics_service.dart
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/foundation.dart';

class CrashlyticsService {
  static Future<void> initialize() async {
    if (kDebugMode) return;
    
    // Configurar Crashlytics
    FlutterError.onError = (errorDetails) {
      FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
    };
    
    // Errores fuera del framework Flutter
    PlatformDispatcher.instance.onError = (error, stack) {
      FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
      return true;
    };
  }
  
  static void logError(
    dynamic exception,
    StackTrace? stackTrace, {
    String? reason,
    bool fatal = false,
  }) {
    if (kDebugMode) return;
    
    FirebaseCrashlytics.instance.recordError(
      exception,
      stackTrace,
      reason: reason,
      fatal: fatal,
    );
  }
  
  static void setUserIdentifier(String userId) {
    if (kDebugMode) return;
    FirebaseCrashlytics.instance.setUserIdentifier(userId);
  }
}
```

### **Analytics Integration**
```dart
// lib/core/services/analytics_service.dart
import 'package:firebase_analytics/firebase_analytics.dart';

class AnalyticsService {
  static final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;
  
  static Future<void> logEvent(
    String name, {
    Map<String, Object?>? parameters,
  }) async {
    await _analytics.logEvent(
      name: name,
      parameters: parameters,
    );
  }
  
  static Future<void> setUserProperty(
    String name,
    String value,
  ) async {
    await _analytics.setUserProperty(
      name: name,
      value: value,
    );
  }
  
  // Eventos específicos de la app
  static Future<void> logLogin(String method) async {
    await logEvent('login', parameters: {'method': method});
  }
  
  static Future<void> logSignUp(String method) async {
    await logEvent('sign_up', parameters: {'method': method});
  }
  
  static Future<void> logAnnouncementView(int announcementId) async {
    await logEvent('view_announcement', parameters: {
      'announcement_id': announcementId,
    });
  }
}
```

---

## **🔧 Scripts de Automatización**

### **Build Scripts**
```bash
#!/bin/bash
# scripts/build_all.sh

echo "🏗️ Building Mercenary App for all platforms..."

# Clean previous builds
flutter clean
flutter pub get

# Android builds
echo "📱 Building Android..."
flutter build apk --release --flavor development
flutter build apk --release --flavor staging
flutter build appbundle --release --flavor production

# iOS builds (solo en macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "🍎 Building iOS..."
  flutter build ios --release --flavor development
  flutter build ipa --release --flavor production
fi

echo "✅ All builds completed!"
```

### **Deployment Scripts**
```bash
#!/bin/bash
# scripts/deploy.sh

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy.sh [development|staging|production]"
  exit 1
fi

case $ENVIRONMENT in
  "development")
    echo "🚀 Deploying to development..."
    flutter build apk --release --flavor development
    # Upload to Firebase App Distribution
    ;;
  "staging")
    echo "🚀 Deploying to staging..."
    flutter build apk --release --flavor staging
    # Upload to internal testing
    ;;
  "production")
    echo "🚀 Deploying to production..."
    flutter build appbundle --release --flavor production
    # Upload to Play Store
    ;;
esac
```

---

## **📋 Checklist de Release**

### **Pre-release**
- [ ] Todos los tests pasan
- [ ] Análisis estático sin errores
- [ ] Versión actualizada en pubspec.yaml
- [ ] Changelog actualizado
- [ ] Screenshots actualizados
- [ ] Metadata de stores actualizada

### **Release**
- [ ] Build de producción exitoso
- [ ] Signing certificates válidos
- [ ] Upload a stores completado
- [ ] Release notes publicadas
- [ ] Monitoreo activado

### **Post-release**
- [ ] Verificar instalación en dispositivos
- [ ] Monitorear crashes y errores
- [ ] Revisar métricas de adopción
- [ ] Responder reviews de usuarios

---

## **🎯 Roadmap de Distribución**

### **Fase Actual (Desarrollo)**
- ✅ **Configuración de builds** completada
- ✅ **Entornos separados** configurados
- ⏳ **CI/CD pipeline** en implementación
- ⏳ **Signing certificates** pendientes

### **Fase 2 (Beta Testing)**
- **Firebase App Distribution** para testing interno
- **TestFlight** para beta testers iOS
- **Play Store Internal Testing** para Android
- **Feedback collection** automatizado

### **Fase 3 (Producción)**
- **Google Play Store** release
- **Apple App Store** release
- **Monitoring y analytics** completo
- **Update mechanism** implementado

---

*Documentación actualizada el 26 de Julio, 2025*  
*Estado de Despliegue: Configuración Base - CI/CD Pendiente*
