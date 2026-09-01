import { Buffer } from "buffer";
import JSZip from "jszip";

const unzip = async (
  buffer: ArrayBuffer
): Promise<Record<string, string | Buffer>> => {
  const zip = new JSZip();
  const MAX_FILES = 100;
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 MB
  const MAX_DEPTH = 5;
  const MAX_RATIO = 10; // Uitgepakte grootte mag max 10x groter zijn dan gecomprimeerde

  await zip.loadAsync(buffer);
  const files = Object.keys(zip.files);

  if (files.length > MAX_FILES) {
    throw new Error("Too many files in archive");
  }

  let totalSize = 0;
  const out: Record<string, string | Buffer> = {};

  await Promise.all(
    files.map(async (filename) => {
      const file = zip.file(filename);
      if (!file) return;

      const depth = filename.split("/").length;
      if (depth > MAX_DEPTH) {
        throw new Error(`File ${filename} is too deeply nested`);
      }

      const content = await file.async("uint8array");
      if (content.length > MAX_FILE_SIZE) {
        throw new Error(`File ${filename} exceeds max allowed size`);
      }

      totalSize += content.length;
      if (totalSize > MAX_TOTAL_SIZE) {
        throw new Error("Total uncompressed size exceeds limit");
      }

      let result: string | Buffer;
      if (
        filename.toLowerCase().endsWith(".shp") ||
        filename.toLowerCase().endsWith(".dbf")
      ) {
        result = Buffer.from(content);
      } else {
        result = new TextDecoder().decode(content);
      }

      out[filename] = result;
    })
  );

  // Threshold ratio check
  const compressedSize = buffer.byteLength;
  const ratio = totalSize / compressedSize;
  if (ratio > MAX_RATIO) {
    throw new Error(
      `Uncompressed size ratio (${ratio.toFixed(2)}) exceeds threshold`
    );
  }

  return out;
};

export default unzip;
