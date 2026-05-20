export const parseToolArguments = (rawArguments: unknown): Record<string, unknown> => {
  if (typeof rawArguments !== 'string' && (!rawArguments || typeof rawArguments !== 'object')) {
    return {}
  }

  if (Array.isArray(rawArguments)) {
    return rawArguments as unknown as Record<string, unknown>
  }

  if (typeof rawArguments === 'object') {
    return rawArguments as Record<string, unknown>
  }

  if (typeof rawArguments !== 'string') {
    return {}
  }

  try {
    const parsed = JSON.parse(rawArguments) as unknown
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }
    return parsed as Record<string, unknown>
  } catch {
    return {}
  }
}
