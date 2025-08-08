// Basic widget test for Mercenary App

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mercenary_app/main.dart';

void main() {
  testWidgets('App should build without errors', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MercenaryApp());
    
    // Wait for the app to settle
    await tester.pumpAndSettle();

    // Verify that the app builds successfully
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
