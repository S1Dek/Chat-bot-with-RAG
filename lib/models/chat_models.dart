import 'dart:convert';


class ChatMessage {
final String id;
final String text;
final bool fromUser;
final DateTime createdAt;


ChatMessage({
required this.id,
required this.text,
required this.fromUser,
required this.createdAt,
});


Map<String, dynamic> toJson() => {
'id': id,
'text': text,
'fromUser': fromUser,
'createdAt': createdAt.toIso8601String(),
};


static ChatMessage fromJson(Map<String, dynamic> json) => ChatMessage(
id: json['id'] as String,
text: json['text'] as String,
fromUser: json['fromUser'] as bool,
createdAt: DateTime.parse(json['createdAt'] as String),
);
}


class Conversation {
final String id;
String title;
List<ChatMessage> messages;


Conversation({required this.id, required this.title, required this.messages});


Map<String, dynamic> toJson() => {
'id': id,
'title': title,
'messages': messages.map((m) => m.toJson()).toList(),
};


static Conversation fromJson(Map<String, dynamic> json) => Conversation(
id: json['id'] as String,
title: json['title'] as String,
messages: (json['messages'] as List<dynamic>)
.map((e) => ChatMessage.fromJson(Map<String, dynamic>.from(e)))
.toList(),
);
}