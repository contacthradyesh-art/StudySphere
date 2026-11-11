import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROTOCOL_VERSION = "2025-03-26";
const SESSION_COOKIE = "ss_session";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

function rpc(id: JsonRpcRequest["id"], result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result }, {
    headers: { "MCP-Protocol-Version": PROTOCOL_VERSION },
  });
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, {
    status: 200,
    headers: { "MCP-Protocol-Version": PROTOCOL_VERSION },
  });
}

async function authenticatedUid(request: Request): Promise<string | null> {
  if (!adminAuth) return null;
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  try {
    if (bearer) return (await adminAuth.verifyIdToken(bearer, true)).uid;
    const store = await cookies();
    const session = store.get(SESSION_COOKIE)?.value;
    if (session) return (await adminAuth.verifySessionCookie(session, true)).uid;
  } catch {
    return null;
  }
  return null;
}

function toolResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

const tools = [
  {
    name: "get_study_tasks",
    description: "Get the authenticated student's latest StudySphere tasks.",
    inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 50, default: 20 } }, additionalProperties: false },
  },
  {
    name: "get_study_stats",
    description: "Get the authenticated student's StudySphere study-stat documents.",
    inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 30, default: 10 } }, additionalProperties: false },
  },
  {
    name: "get_study_goals",
    description: "Get the authenticated student's life and study goals.",
    inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 50, default: 20 } }, additionalProperties: false },
  },
  {
    name: "create_study_task",
    description: "Create a task in the authenticated student's StudySphere task list.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 1, maxLength: 160 },
        subject: { type: "string", maxLength: 80 },
        dueDate: { type: "string", description: "Optional ISO date or date-time." },
        priority: { type: "string", enum: ["low", "medium", "high"] },
      },
      required: ["title"],
      additionalProperties: false,
    },
  },
];

async function callTool(uid: string, name: string, args: Record<string, unknown>) {
  if (!adminDb) throw new Error("StudySphere database is not configured.");
  const userRef = adminDb.collection("users").doc(uid);

  if (name === "get_study_tasks") {
    const n = Math.min(50, Math.max(1, Number(args.limit) || 20));
    const snap = await userRef.collection("tasks").limit(n).get();
    return toolResult(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }
  if (name === "get_study_stats") {
    const n = Math.min(30, Math.max(1, Number(args.limit) || 10));
    const snap = await userRef.collection("studyStats").limit(n).get();
    return toolResult(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }
  if (name === "get_study_goals") {
    const n = Math.min(50, Math.max(1, Number(args.limit) || 20));
    const snap = await userRef.collection("lifeGoals").limit(n).get();
    return toolResult(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }
  if (name === "create_study_task") {
    const title = String(args.title ?? "").trim();
    if (!title || title.length > 160) throw new Error("Task title must be between 1 and 160 characters.");
    const subject = typeof args.subject === "string" ? args.subject.trim().slice(0, 80) : "";
    const priority = ["low", "medium", "high"].includes(String(args.priority)) ? args.priority : "medium";
    const dueDate = typeof args.dueDate === "string" ? args.dueDate.trim().slice(0, 40) : "";
    const ref = await userRef.collection("tasks").add({
      title,
      ...(subject ? { subject } : {}),
      ...(dueDate ? { dueDate } : {}),
      priority,
      completed: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      source: "mcp",
    });
    return toolResult({ success: true, taskId: ref.id, title, message: "Task created in StudySphere." });
  }
  throw new Error(`Unknown tool: ${name}`);
}

export async function POST(request: Request) {
  let body: JsonRpcRequest;
  try {
    body = await request.json() as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Parse error");
  }
  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") {
    return rpcError(body.id, -32600, "Invalid JSON-RPC request");
  }

  if (body.method === "initialize") {
    return rpc(body.id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "studysphere-mcp", version: "1.0.0" },
      instructions: "StudySphere MCP provides access only to the authenticated user's own study tasks, goals, and study statistics. All data access is scoped to the verified Firebase user.",
    });
  }
  if (body.method === "notifications/initialized" || body.method === "notifications/cancelled") {
    return new NextResponse(null, { status: 202 });
  }
  if (body.method === "ping") return rpc(body.id, {});

  const uid = await authenticatedUid(request);
  if (!uid) return rpcError(body.id, -32001, "Unauthorized. Send a valid Firebase ID token as a Bearer token or use an authenticated StudySphere session.");

  if (body.method === "tools/list") return rpc(body.id, { tools });

  if (body.method === "tools/call") {
    const params = (body.params ?? {}) as { name?: string; arguments?: Record<string, unknown> };
    if (!params.name || !tools.some((tool) => tool.name === params.name)) {
      return rpcError(body.id, -32602, "Unknown tool name");
    }
    try {
      const result = await callTool(uid, params.name, params.arguments ?? {});
      return rpc(body.id, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tool execution failed";
      return rpc(body.id, { ...toolResult({ error: message }), isError: true });
    }
  }

  return rpcError(body.id, -32601, "Method not found");
}

export async function GET() {
  return NextResponse.json(
    { name: "StudySphere MCP", protocol: PROTOCOL_VERSION, message: "MCP endpoint is online. Connect using an authenticated MCP client over Streamable HTTP POST." },
    { status: 200 },
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.MCP_ALLOWED_ORIGIN ?? "null",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, MCP-Protocol-Version, Accept",
      "Access-Control-Max-Age": "86400",
    },
  });
}
