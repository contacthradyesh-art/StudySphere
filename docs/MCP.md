# StudySphere MCP Server

StudySphere exposes a Model Context Protocol (MCP) endpoint at:

`https://YOUR-STUDYSPHERE-DOMAIN/api/mcp`

The endpoint uses JSON-RPC over HTTP POST and is designed for authenticated MCP clients.

## Authentication

Every tool request must include a valid Firebase **ID token**:

```http
Authorization: Bearer FIREBASE_ID_TOKEN
Content-Type: application/json
Accept: application/json, text/event-stream
```

The endpoint verifies the token with Firebase Admin and scopes every Firestore query to the verified user's UID. Do not use Firebase service-account credentials as the client token. Never publish or share ID tokens.

An already-authenticated same-origin StudySphere browser session can also use the HttpOnly `ss_session` cookie.

## Available tools

| Tool | Description |
| --- | --- |
| `get_study_tasks` | Read the signed-in student's latest tasks (up to 50). |
| `get_study_stats` | Read the signed-in student's study-stat documents (up to 30). |
| `get_study_goals` | Read the signed-in student's goals (up to 50). |
| `create_study_task` | Create a task for the signed-in student. |

## Example MCP initialization

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-03-26",
    "capabilities": {},
    "clientInfo": { "name": "my-ai-client", "version": "1.0.0" }
  }
}
```

Then send `tools/list` and `tools/call` requests to the same endpoint with the same Authorization header.

## Deployment checklist

1. Deploy the branch containing `src/app/api/mcp/route.ts` to the StudySphere hosting environment.
2. Confirm `FIREBASE_SERVICE_ACCOUNT` is configured for the server runtime.
3. Open `/api/mcp` to check the endpoint health response.
4. Obtain a Firebase ID token through the normal StudySphere sign-in flow and configure the MCP client to send it as a Bearer token.
5. Test reading tasks and creating a test task before using it with personal study data.

## Security notes

- The endpoint never accepts a UID from tool arguments; it derives the UID from the verified token/session.
- Tool queries are scoped to `users/{verifiedUid}`.
- Task creation validates and limits user-provided fields.
- Only the tools listed above are exposed; notes, journal entries, and private conversations are not exposed.
- Treat the MCP URL as public but keep authentication tokens secret.
