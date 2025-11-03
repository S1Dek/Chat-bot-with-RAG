import 'package:flutter/material.dart';
import 'pages/chat_page.dart';
import 'models/chat_models.dart'; // import modelu konwersacji

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  MyApp({super.key});

  // prosta pusta konwersacja startowa
  final Conversation initialConversation = Conversation(
    id: 'start',
    title: 'Nowa rozmowa',
    messages: [],
  );

  // funkcja, która zapisuje konwersację (np. do pamięci lokalnej)
  void _saveConversation(Conversation conversation) {
    // na razie tylko debug print, można później dodać zapisywanie do SharedPreferences
    debugPrint("Zapisano konwersację: ${conversation.id}");
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'AI Chatbot',
      theme: ThemeData.dark(useMaterial3: true).copyWith(
        colorScheme: const ColorScheme.dark(
          primary: Colors.tealAccent,
          secondary: Colors.cyan,
        ),
      ),
      home: ChatPage(
        conversation: initialConversation,
        onSave: _saveConversation,
      ),
    );
  }
}
