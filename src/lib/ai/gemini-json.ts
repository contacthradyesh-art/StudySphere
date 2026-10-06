const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;
const QUOTA_MESSAGE = 'AI ki limit abhi khatam hai, thodi der baad try karein.';

export class GeminiJsonError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'GeminiJsonError';
  }
}

type GenerateJsonOptions = {
  systemInstruction: string;
  contents: Array<{ role: 'user'; parts: Array<Record<string, unknown>> }>;
  maxOutputTokens: number;
};

function stripJsonFences(value: string): string {
  return value.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
}

function getGeminiErrorMessage(data: unknown): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const error = (data as { error?: { message?: unknown } }).error;
    if (typeof error?.message === 'string' && error.message) return error.message;
  }
  return 'Gemini request failed.';
}

function isQuotaError(status: number, message: string): boolean {
  return status === 429 || /quota|rate.?limit|resource.?exhausted/i.test(message);
}

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('English Lab Gemini configuration error: GEMINI_API_KEY is missing.');
    throw new GeminiJsonError('AI service is not configured.', 500);
  }
  return apiKey;
}

async function requestModel(model: string, apiKey: string, options: GenerateJsonOptions): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: options.systemInstruction }] },
        contents: options.contents,
        generationConfig: {
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: options.maxOutputTokens,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  const data: unknown = await response.json();
  if (!response.ok) {
    const message = getGeminiErrorMessage(data);
    console.error(`English Lab Gemini request failed: model=${model}, status=${response.status}, message=${message}`);
    if (isQuotaError(response.status, message)) throw new GeminiJsonError(QUOTA_MESSAGE, 429);
    throw new GeminiJsonError('AI service is temporarily unavailable.', 502);
  }

  const raw = data && typeof data === 'object'
    ? (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }).candidates?.[0]?.content?.parts?.[0]?.text
    : undefined;
  if (!raw || typeof raw !== 'string') throw new GeminiJsonError('AI did not return content.', 502);
  return raw;
}

export async function generateGeminiJson<T>(options: GenerateJsonOptions): Promise<T> {
  const apiKey = getApiKey();
  let lastError: unknown;

  for (const model of GEMINI_MODELS) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const raw = await requestModel(model, apiKey, options);
        try {
          return JSON.parse(stripJsonFences(raw)) as T;
        } catch (error) {
          lastError = error;
          if (attempt === 0) {
            console.error(`English Lab Gemini JSON parse failed: model=${model}; retrying once.`);
            continue;
          }
          console.error(`English Lab Gemini JSON parse failed after retry: model=${model}.`);
        }
      } catch (error) {
        lastError = error;
        if (error instanceof GeminiJsonError && error.status === 429) throw error;
        break;
      }
    }
  }

  if (lastError instanceof GeminiJsonError) throw lastError;
  console.error('English Lab Gemini JSON generation failed after all model attempts.');
  throw new GeminiJsonError('Could not generate a valid AI response. Please try again.', 502);
}
