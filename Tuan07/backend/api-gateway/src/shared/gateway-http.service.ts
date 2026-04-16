import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class GatewayHttpService {
  async request<T>(
    baseUrl: string,
    method: string,
    path: string,
    options?: {
      query?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
    }
  ): Promise<T> {
    const url = new URL(path, baseUrl);

    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const response = await fetch(url, {
      method,
      headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const payload = text ? this.parseBody(text) : null;

    if (!response.ok) {
      const message = this.extractMessage(payload) || response.statusText || 'Upstream service error';
      throw new HttpException(message, response.status);
    }

    return payload as T;
  }

  private parseBody(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private extractMessage(payload: unknown): string | undefined {
    if (!payload) {
      return undefined;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (typeof payload === 'object' && payload !== null) {
      const candidate = payload as { message?: unknown; error?: unknown };
      if (typeof candidate.message === 'string') {
        return candidate.message;
      }
      if (typeof candidate.error === 'string') {
        return candidate.error;
      }
    }

    return undefined;
  }
}
