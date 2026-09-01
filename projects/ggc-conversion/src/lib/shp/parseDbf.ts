import { createDecoder } from "./decoder";

function dbfHeader(data: DataView) {
  const out: any = {};
  out.lastUpdated = new Date(
    data.getUint8(1) + 1900,
    data.getUint8(2),
    data.getUint8(3)
  );
  out.records = data.getUint32(4, true);
  out.headerLen = data.getUint16(8, true);
  out.recLen = data.getUint16(10, true);
  return out;
}

function dbfRowHeader(
  data: DataView,
  headerLen: number,
  decoder: (data: Uint8Array) => string
) {
  const out = [];
  let offset = 32;
  while (offset < headerLen) {
    out.push({
      name: decoder(
        new Uint8Array(
          data.buffer.slice(
            data.byteOffset + offset,
            data.byteOffset + offset + 11
          )
        )
      ),
      dataType: String.fromCodePoint(data.getUint8(offset + 11)),
      len: data.getUint8(offset + 16),
      decimal: data.getUint8(offset + 17)
    });
    if (data.getUint8(offset + 32) === 13) {
      break;
    } else {
      offset += 32;
    }
  }
  return out;
}

function rowFuncs(
  buffer: DataView,
  offset: number,
  len: number,
  type: string,
  decoder: (data: Uint8Array) => string
): any {
  const data = new Uint8Array(
    buffer.buffer.slice(
      buffer.byteOffset + offset,
      buffer.byteOffset + offset + len
    )
  );
  const textData = decoder(data);

  switch (type) {
    case "N":
    case "D":
      return new Date(
        Number.parseInt(textData.slice(0, 4), 10),
        Number.parseInt(textData.slice(4, 6), 10) - 1,
        Number.parseInt(textData.slice(6, 8), 10)
      );
    case "L":
      return textData.toLowerCase() === "y" || textData.toLowerCase() === "t";
    default:
      return textData;
  }
}

function parseRow(
  buffer: DataView,
  offset: number,
  rowHeaders: any[],
  decoder: (data: Uint8Array) => string
): Record<string, any> {
  const out: Record<string, any> = {};
  for (let i = 0; i < rowHeaders.length; i++) {
    const header = rowHeaders[i];
    const field = rowFuncs(
      buffer,
      offset,
      header.len,
      header.dataType,
      decoder
    );
    offset += header.len;
    if (typeof field !== "undefined") {
      out[header.name] = field;
    }
  }
  return out;
}

export default function parseDbf(buffer: DataView, encoding?: string): any[] {
  const decoder = createDecoder(encoding);
  const header = dbfHeader(buffer);
  const rowHeaders = dbfRowHeader(buffer, header.headerLen - 1, decoder);

  let offset = ((rowHeaders.length + 1) << 5) + 2;
  const recLen = header.recLen;
  let records = header.records;
  const out = [];

  while (records) {
    out.push(parseRow(buffer, offset, rowHeaders, decoder));
    offset += recLen;
    records--;
  }

  return out;
}
