export enum PrintComponentEventTypes {
  EMTYPARAMETER = "emptyParameter"
}

export class PrintComponentEvent {
  constructor(
    public type: PrintComponentEventTypes,
    public message: string,
    public value?: any
  ) {}
}
