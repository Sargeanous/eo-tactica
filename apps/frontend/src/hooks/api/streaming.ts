import { useCallback, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";

interface StreamingState {
  text: string;
  isStreaming: boolean;
  error: string | null;
}

/**
 * useStreamingAsk
 *
 * Posts to /api/agents/ask/stream and consumes a text/event-stream response.
 * The agents service emits NDJSON-encoded events on `data:` lines:
 *   { type: "text_delta", text: "..." }
 *   { type: "tool_use", name: "...", input: {...} }
 *   { type: "error", code, message }
 *   { type: "done", result }
 */
export function useStreamingAsk() {
  const [state, setState] = useState<StreamingState>({
    text: "",
    isStreaming: false,
    error: null,
  });
  const controllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setState({ text: "", isStreaming: false, error: null });
  }, []);

  const send = useCallback(async (prompt: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ text: "", isStreaming: true, error: null });

    const token = useAppStore.getState().token;
    const headers = new Headers({
      "content-type": "application/json",
      accept: "text/event-stream",
    });
    if (token) headers.set("authorization", `Bearer ${token}`);

    let response: Response;
    try {
      response = await fetch("/api/agents/ask/stream", {
        method: "POST",
        body: JSON.stringify({ prompt }),
        headers,
        signal: controller.signal,
      });
    } catch (err) {
      setState({
        text: "",
        isStreaming: false,
        error: (err as Error).message,
      });
      return;
    }

    if (!response.ok || !response.body) {
      setState({
        text: "",
        isStreaming: false,
        error: `HTTP ${response.status}`,
      });
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n\n")) !== -1) {
          const chunk = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 2);
          const dataLine = chunk
            .split("\n")
            .find((l) => l.startsWith("data:"));
          if (!dataLine) continue;
          const payload = dataLine.slice(5).trim();
          if (!payload) continue;
          try {
            const event = JSON.parse(payload) as {
              type: string;
              text?: string;
              code?: string;
              message?: string;
            };
            if (event.type === "text_delta" && event.text) {
              setState((s) => ({ ...s, text: s.text + event.text }));
            } else if (event.type === "error") {
              setState((s) => ({
                ...s,
                error: event.message ?? event.code ?? "error",
              }));
            }
          } catch {
            /* ignore malformed line */
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setState((s) => ({ ...s, error: (err as Error).message }));
      }
    } finally {
      setState((s) => ({ ...s, isStreaming: false }));
    }
  }, []);

  return { ...state, send, reset };
}
