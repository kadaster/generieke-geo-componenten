const regex = /^(?:ANSI\s)?(\d+)$/m;

export function createDecoder(
  encoding?: string,
  second?: boolean
): (data: Uint8Array) => string {
  if (!encoding) {
    return browserDecoder;
  }

  try {
    new TextDecoder(encoding.trim());
  } catch (e) {
    const match = regex.exec(encoding);
    if (match && !second) {
      return createDecoder(`windows-${match[1]}`, true);
    } else {
      encoding = undefined;
      return browserDecoder;
    }
  }

  return browserDecoder;

  function browserDecoder(data: Uint8Array): string {
    const decoder = new TextDecoder(encoding?.trim());
    const out = decoder.decode(data, { stream: true }) + decoder.decode();
    return out.replaceAll(/\0/g, "").trim();
  }
}
