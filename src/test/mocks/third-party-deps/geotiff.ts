export async function fromUrl() {
  return {
    getImage: async () => ({
      readRasters: async () => [[1, 2, 3]],
      getWidth: () => 256,
      getHeight: () => 256
    })
  };
}
