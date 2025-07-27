import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

import 'package:mercenary_app/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:mercenary_app/features/auth/data/services/auth_service.dart';
import 'package:mercenary_app/shared/models/user_model.dart';

// Mock classes will be generated
class MockAuthService extends Mock implements AuthService {}

@GenerateMocks([AuthService])
void main() {
  group('AuthBloc', () {
    late AuthBloc authBloc;
    late MockAuthService mockAuthService;

    setUp(() {
      mockAuthService = MockAuthService();
      authBloc = AuthBloc(authService: mockAuthService);
    });

    tearDown(() {
      authBloc.close();
    });

    test('initial state is AuthInitial', () {
      expect(authBloc.state, AuthInitial());
    });

    group('AuthCheckRequested', () {
      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthAuthenticated] when user is authenticated',
        build: () {
          when(mockAuthService.isAuthenticated())
              .thenAnswer((_) async => true);
          when(mockAuthService.getCurrentUser())
              .thenAnswer((_) async => _mockUser);
          return authBloc;
        },
        act: (bloc) => bloc.add(AuthCheckRequested()),
        expect: () => [
          AuthLoading(),
          AuthAuthenticated(_mockUser),
        ],
      );

      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthUnauthenticated] when user is not authenticated',
        build: () {
          when(mockAuthService.isAuthenticated())
              .thenAnswer((_) async => false);
          return authBloc;
        },
        act: (bloc) => bloc.add(AuthCheckRequested()),
        expect: () => [
          AuthLoading(),
          AuthUnauthenticated(),
        ],
      );
    });

    group('AuthLoginRequested', () {
      const email = 'test@example.com';
      const password = 'password123';

      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthAuthenticated] when login succeeds',
        build: () {
          when(mockAuthService.login(
            email: email,
            password: password,
          )).thenAnswer((_) async => AuthResponse(
            accessToken: 'token',
            tokenType: 'bearer',
            user: _mockUser,
          ));
          return authBloc;
        },
        act: (bloc) => bloc.add(const AuthLoginRequested(
          email: email,
          password: password,
        )),
        expect: () => [
          AuthLoading(),
          AuthAuthenticated(_mockUser),
        ],
      );

      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthError] when login fails',
        build: () {
          when(mockAuthService.login(
            email: email,
            password: password,
          )).thenThrow(AuthException('Invalid credentials'));
          return authBloc;
        },
        act: (bloc) => bloc.add(const AuthLoginRequested(
          email: email,
          password: password,
        )),
        expect: () => [
          AuthLoading(),
          const AuthError('AuthException: Invalid credentials'),
        ],
      );
    });

    group('AuthRegisterRequested', () {
      const email = 'test@example.com';
      const password = 'password123';
      const firstName = 'John';
      const lastName = 'Doe';
      const userType = 'mercenary';

      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthAuthenticated] when registration succeeds',
        build: () {
          when(mockAuthService.register(
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            userType: userType,
          )).thenAnswer((_) async => AuthResponse(
            accessToken: 'token',
            tokenType: 'bearer',
            user: _mockUser,
          ));
          return authBloc;
        },
        act: (bloc) => bloc.add(const AuthRegisterRequested(
          email: email,
          password: password,
          firstName: firstName,
          lastName: lastName,
          userType: userType,
        )),
        expect: () => [
          AuthLoading(),
          AuthAuthenticated(_mockUser),
        ],
      );
    });

    group('AuthLogoutRequested', () {
      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthUnauthenticated] when logout succeeds',
        build: () {
          when(mockAuthService.logout()).thenAnswer((_) async {});
          return authBloc;
        },
        act: (bloc) => bloc.add(AuthLogoutRequested()),
        expect: () => [
          AuthLoading(),
          AuthUnauthenticated(),
        ],
      );

      blocTest<AuthBloc, AuthState>(
        'emits [AuthLoading, AuthUnauthenticated] even when logout fails',
        build: () {
          when(mockAuthService.logout()).thenThrow(Exception('Network error'));
          return authBloc;
        },
        act: (bloc) => bloc.add(AuthLogoutRequested()),
        expect: () => [
          AuthLoading(),
          AuthUnauthenticated(),
        ],
      );
    });
  });
}

// Mock user para tests
final _mockUser = UserModel(
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  userType: 'mercenary',
  isActive: true,
  isVerified: true,
  createdAt: DateTime.now(),
);
