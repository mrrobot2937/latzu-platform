// API client for Latzu Platform

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8001";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, token } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text) as T;
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }
}

// API instances
export const api = new ApiClient(API_URL);
export const aiApi = new ApiClient(AI_URL);

// ============= Auth API =============
export const authApi = {
  syncUser: (data: {
    google_id: string;
    email: string;
    name: string;
    picture?: string;
    access_token?: string;
    refresh_token?: string;
  }) => api.post<{ profile_type?: string; tenant_id: string; role: string }>("/api/auth/sync", data),

  getMe: (token: string) =>
    api.get<{ key: string; email: string; name: string; picture?: string; role: string }>(
      "/auth/me",
      { token }
    ),

  logout: () => api.post("/auth/logout"),
};

// ============= Chat API =============
export const chatApi = {
  createSession: (data: { tenant_id: string; user_id?: string; metadata?: Record<string, unknown> }) =>
    aiApi.post<{ session_id: string; tenant_id: string; created_at: string }>(
      "/ai/chat/sessions",
      data
    ),

  getSession: (sessionId: string) =>
    aiApi.get<{
      session_id: string;
      tenant_id: string;
      user_id?: string;
      message_count: number;
      messages: Array<{ role: string; content: string; timestamp: string }>;
      has_active_flow: boolean;
      created_at: string;
      updated_at: string;
    }>(`/ai/chat/sessions/${sessionId}`),

  sendMessage: (data: {
    session_id: string;
    tenant_id: string;
    message: string;
    user_id?: string;
    metadata?: Record<string, unknown>;
  }) =>
    aiApi.post<{
      message: string;
      session_id: string;
      requires_input: boolean;
      suggestions: string[];
      metadata?: Record<string, unknown>;
      timestamp: string;
    }>("/ai/chat/messages", data),

  startFlow: (data: { session_id: string; flow_id: string; steps: unknown[] }) =>
    aiApi.post("/ai/chat/flows/start", data),
};

// ============= Knowledge Graph API =============
export const knowledgeApi = {
  extractFromText: (data: {
    tenant_id: string;
    title: string;
    text: string;
    config?: { chunk_size?: number; enable_standardization?: boolean; enable_inference?: boolean };
  }) =>
    aiApi.post<{
      graph_id: string;
      title: string;
      num_nodes: number;
      num_edges: number;
      num_inferred: number;
      created_at: string;
    }>("/ai/knowledge-graph/extract/text", data),

  getGraph: (graphId: string) => aiApi.get(`/ai/knowledge-graph/graph/${graphId}`),

  queryGraph: (graphId: string, query: string, tenantId: string = "demo") =>
    aiApi.post<{ query: string; answer: string; sources: unknown[] }>(
      `/ai/knowledge-graph/query/${graphId}`,
      null,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ),
};

// ============= Personalized Learning API =============
export const learningApi = {
  getPersonalizedSummary: (data: {
    graph_id: string;
    user_id?: string;
    level?: string;
    focus_contexts?: string[];
    goals?: string[];
  }) =>
    aiApi.post<{
      summary: string;
      key_takeaways: string[];
      learning_path: unknown[];
      estimated_time_minutes: number;
    }>("/ai/personalized-learning/personalized-summary", data),

  getRecommendations: (userId: string, graphId: string) =>
    aiApi.get<{ user_id: string; graph_id: string; recommendations: unknown[] }>(
      `/ai/personalized-learning/recommend/${userId}/${graphId}`
    ),
};

// ============= Cypher QA API =============
export const cypherQaApi = {
  query: (data: { question: string; graph_id?: string; tenant_id: string }) =>
    aiApi.post<{
      answer: string;
      generated_cypher?: string;
      success: boolean;
    }>("/ai/cypher-qa/query", data),

  getExamples: () => aiApi.get<string[]>("/ai/cypher-qa/examples"),
};

// ============= MCP Tools API =============
export const mcpApi = {
  listTools: () =>
    aiApi.get<
      Array<{
        tool_id: string;
        name: string;
        description: string;
        tool_type: string;
        enabled: boolean;
      }>
    >("/ai/mcp/tools"),

  executeTool: (data: {
    tool_id: string;
    parameters: Record<string, unknown>;
    context: { tenant_id: string; user_id: string };
  }) => aiApi.post<{ status: string; result: unknown }>("/ai/mcp/execute", data),
};

// ============= Metrics API =============
export const metricsApi = {
  getInteractionsSummary: (days: number = 7) =>
    api.get<{
      total: number;
      by_type: Record<string, number>;
      unique_users: number;
      period_days: number;
    }>(`/metrics/interactions/summary?days=${days}`),

  getGraphQuality: (graphId: string, days: number = 7) =>
    api.get<{
      graph_id: string;
      period_days: number;
      metrics: Record<string, unknown>;
      quality_score: number;
    }>(`/metrics/graph-quality/${graphId}?days=${days}`),
};

// ============= Dynamic Entities API =============
export const entitiesApi = {
  create: (tenantId: string, entityType: string, data: Record<string, unknown>) =>
    api.post(`/api/dynamic/${tenantId}/${entityType}`, { data }),

  get: (tenantId: string, entityType: string, entityId: string) =>
    api.get(`/api/dynamic/${tenantId}/${entityType}/${entityId}`),

  list: (tenantId: string, entityType: string) =>
    api.get<unknown[]>(`/api/dynamic/${tenantId}/${entityType}`),

  update: (tenantId: string, entityType: string, entityId: string, data: Record<string, unknown>) =>
    api.put(`/api/dynamic/${tenantId}/${entityType}/${entityId}`, { data }),

  delete: (tenantId: string, entityType: string, entityId: string) =>
    api.delete(`/api/dynamic/${tenantId}/${entityType}/${entityId}`),

  query: (
    tenantId: string,
    entityType: string,
    filters: Record<string, unknown>,
    limit: number = 10
  ) => api.post(`/api/dynamic/${tenantId}/${entityType}/query`, { filters, limit }),
};

export default api;
