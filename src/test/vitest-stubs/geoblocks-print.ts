export class MVTEncoder {
  encodeMVTLayer() {
    return Promise.resolve([
      {
        baseURL: "data:image/png;base64,iVBORw0KGgoAAAAN",
        extent: [1, 2, 3, 4]
      }
    ]);
  }
}
