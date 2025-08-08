import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../core/storage/secure_storage_service.dart';

// Events
abstract class AppEvent extends Equatable {
  const AppEvent();

  @override
  List<Object?> get props => [];
}

class AppStarted extends AppEvent {}

class AppThemeChanged extends AppEvent {
  final String themeMode;

  const AppThemeChanged(this.themeMode);

  @override
  List<Object> get props => [themeMode];
}

class AppLanguageChanged extends AppEvent {
  final String language;

  const AppLanguageChanged(this.language);

  @override
  List<Object> get props => [language];
}

class AppNotificationsToggled extends AppEvent {
  final bool enabled;

  const AppNotificationsToggled(this.enabled);

  @override
  List<Object> get props => [enabled];
}

// States
abstract class AppState extends Equatable {
  const AppState();

  @override
  List<Object?> get props => [];
}

class AppInitial extends AppState {}

class AppLoading extends AppState {}

class AppReady extends AppState {
  final String themeMode;
  final String language;
  final bool notificationsEnabled;
  final bool isFirstLaunch;

  const AppReady({
    required this.themeMode,
    required this.language,
    required this.notificationsEnabled,
    required this.isFirstLaunch,
  });

  @override
  List<Object> get props => [themeMode, language, notificationsEnabled, isFirstLaunch];

  AppReady copyWith({
    String? themeMode,
    String? language,
    bool? notificationsEnabled,
    bool? isFirstLaunch,
  }) {
    return AppReady(
      themeMode: themeMode ?? this.themeMode,
      language: language ?? this.language,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      isFirstLaunch: isFirstLaunch ?? this.isFirstLaunch,
    );
  }
}

// BLoC
class AppBloc extends Bloc<AppEvent, AppState> {
  AppBloc() : super(AppInitial()) {
    on<AppStarted>(_onAppStarted);
    on<AppThemeChanged>(_onAppThemeChanged);
    on<AppLanguageChanged>(_onAppLanguageChanged);
    on<AppNotificationsToggled>(_onAppNotificationsToggled);
  }

  Future<void> _onAppStarted(
    AppStarted event,
    Emitter<AppState> emit,
  ) async {
    try {
      emit(AppLoading());

      // Inicializar servicios
      await PreferencesService.initialize();

      // Cargar configuraciones
      final themeMode = PreferencesService.getThemeMode();
      final language = PreferencesService.getLanguage();
      final notificationsEnabled = PreferencesService.areNotificationsEnabled();
      final isFirstLaunch = PreferencesService.isFirstLaunch();

      emit(AppReady(
        themeMode: themeMode,
        language: language,
        notificationsEnabled: notificationsEnabled,
        isFirstLaunch: isFirstLaunch,
      ));

      // Marcar como no es el primer lanzamiento
      if (isFirstLaunch) {
        await PreferencesService.setFirstLaunch(false);
      }
    } catch (e) {
      // En caso de error, usar valores por defecto
      emit(const AppReady(
        themeMode: 'system',
        language: 'es',
        notificationsEnabled: true,
        isFirstLaunch: false,
      ));
    }
  }

  Future<void> _onAppThemeChanged(
    AppThemeChanged event,
    Emitter<AppState> emit,
  ) async {
    if (state is AppReady) {
      final currentState = state as AppReady;
      await PreferencesService.setThemeMode(event.themeMode);
      emit(currentState.copyWith(themeMode: event.themeMode));
    }
  }

  Future<void> _onAppLanguageChanged(
    AppLanguageChanged event,
    Emitter<AppState> emit,
  ) async {
    if (state is AppReady) {
      final currentState = state as AppReady;
      await PreferencesService.setLanguage(event.language);
      emit(currentState.copyWith(language: event.language));
    }
  }

  Future<void> _onAppNotificationsToggled(
    AppNotificationsToggled event,
    Emitter<AppState> emit,
  ) async {
    if (state is AppReady) {
      final currentState = state as AppReady;
      await PreferencesService.setNotificationsEnabled(event.enabled);
      emit(currentState.copyWith(notificationsEnabled: event.enabled));
    }
  }
}
