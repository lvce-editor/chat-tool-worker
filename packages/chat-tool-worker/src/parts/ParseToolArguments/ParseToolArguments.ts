export const parseToolArguments = (rawArguments: unknown): Record<string, unknown> => {
  if (typeof rawArguments !== 'string' && (!rawArguments || typeof rawArguments !== 'object')) {
    return {}
  }

  if (typeof rawArguments !== 'string') {
    return rawArguments as any
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
