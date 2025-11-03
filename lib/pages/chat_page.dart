import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

import '../models/chat_models.dart';
import '../services/api_service.dart';

class ChatPage extends StatefulWidget {
  final Conversation conversation;
  final void Function(Conversation) onSave;

  ChatPage({required this.conversation, required this.onSave, super.key});

  @override
  _ChatPageState createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isSending = false;
  final uuid = Uuid();

  void _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _isSending = true;
      final msg = ChatMessage(
        id: uuid.v4(),
        text: text,
        fromUser: true,
        createdAt: DateTime.now(),
      );
      widget.conversation.messages.add(msg);
      _controller.clear();
    });

    widget.onSave(widget.conversation);

    try {
      final resp = await APIService.chat(widget.conversation.id, text);
      final replyText = resp['reply'] as String? ?? 'Brak odpowiedzi';
      final convId = resp['conversation_id'] as String? ?? widget.conversation.id;

      setState(() {
        if (convId != widget.conversation.id) {
          widget.conversation.id == convId; // no-op
        }
        widget.conversation.messages.add(ChatMessage(
          id: uuid.v4(),
          text: replyText,
          fromUser: false,
          createdAt: DateTime.now(),
        ));
      });

      widget.onSave(widget.conversation);

      // Scroll to bottom
      await Future.delayed(const Duration(milliseconds: 100));
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 80,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Błąd: $e')),
      );
    } finally {
      setState(() {
        _isSending = false;
      });
    }
  }

  // 🔹 TU DODAJEMY METODĘ build()
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Chatbot RAG - pdf Reader"),
        backgroundColor: Colors.teal,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              itemCount: widget.conversation.messages.length,
              itemBuilder: (context, index) {
                final msg = widget.conversation.messages[index];
                return Container(
                  alignment:
                      msg.fromUser ? Alignment.centerRight : Alignment.centerLeft,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: msg.fromUser ? Colors.teal[200] : Colors.grey[300],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(msg.text),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),
          SafeArea(
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    onSubmitted: (_) => _sendMessage(),
                    decoration: const InputDecoration(
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      hintText: "Napisz wiadomość...",
                    ),
                  ),
                ),
                IconButton(
                  icon: _isSending
                      ? const CircularProgressIndicator()
                      : const Icon(Icons.send),
                  onPressed: _isSending ? null : _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
