import 'dart:convert';
import 'package:http/http.dart' as http;


class APIService {
// Set this to your backend URL (no trailing slash)
static const String baseUrl = 'http://localhost:8000';


// Chat endpoint - expects the backend contract from README.md
static Future<Map<String, dynamic>> chat(String? conversationId, String message) async {
final url = Uri.parse('\$baseUrl/api/chat');
final resp = await http.post(
url,
headers: {'Content-Type': 'application/json'},
body: jsonEncode({'conversation_id': conversationId, 'message': message}),
);


if (resp.statusCode == 200) {
return jsonDecode(resp.body) as Map<String, dynamic>;
} else {
throw Exception('Server error: \${resp.statusCode} - \${resp.body}');
}
}
}