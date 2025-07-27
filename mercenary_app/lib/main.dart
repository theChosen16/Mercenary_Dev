import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';
import 'core/network/http_service.dart';
import 'core/bloc/app_bloc.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/auth/data/services/auth_service.dart';
import 'features/auth/presentation/pages/splash_screen.dart';
import 'features/auth/presentation/pages/login_screen.dart';
import 'features/auth/presentation/pages/register_screen.dart';
import 'features/announcements/presentation/pages/home_screen.dart';
import 'features/profile/presentation/pages/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inicializar servicios
  HttpService().initialize();
  
  runApp(const MercenaryApp());
}

class MercenaryApp extends StatelessWidget {
  const MercenaryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => AppBloc()..add(AppStarted()),
        ),
        BlocProvider(
          create: (context) => AuthBloc(authService: AuthService())
            ..add(AuthCheckRequested()),
        ),
      ],
      child: BlocBuilder<AppBloc, AppState>(
        builder: (context, appState) {
          if (appState is! AppReady) {
            return MaterialApp(
              home: Scaffold(
                body: Center(
                  child: CircularProgressIndicator(
                    color: AppTheme.primaryColor,
                  ),
                ),
              ),
            );
          }

          return BlocBuilder<AuthBloc, AuthState>(
            builder: (context, authState) {
              return MaterialApp.router(
                title: AppConstants.appName,
                theme: AppTheme.lightTheme,
                darkTheme: AppTheme.darkTheme,
                themeMode: _getThemeMode(appState.themeMode),
                routerConfig: _createRouter(authState),
                debugShowCheckedModeBanner: false,
              );
            },
          );
        },
      ),
    );
  }

  ThemeMode _getThemeMode(String mode) {
    switch (mode) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      default:
        return ThemeMode.system;
    }
  }

  GoRouter _createRouter(AuthState authState) {
    return GoRouter(
      initialLocation: _getInitialLocation(authState),
      redirect: (context, state) {
        final isAuthenticated = authState is AuthAuthenticated;
        final isOnAuthPage = state.uri.path == '/login' || 
                            state.uri.path == '/register' ||
                            state.uri.path == '/';

        // Si está autenticado y en página de auth, redirigir a home
        if (isAuthenticated && isOnAuthPage) {
          return '/home';
        }

        // Si no está autenticado y no está en página de auth, redirigir a login
        if (!isAuthenticated && !isOnAuthPage) {
          return '/login';
        }

        return null; // No redirigir
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const SplashScreen(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/register',
          builder: (context, state) => const RegisterScreen(),
        ),
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    );
  }

  String _getInitialLocation(AuthState authState) {
    if (authState is AuthAuthenticated) {
      return '/home';
    } else if (authState is AuthUnauthenticated) {
      return '/login';
    }
    return '/'; // Splash screen por defecto
  }
}
