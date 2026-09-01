import { ClientInfo } from "./client-info";

export interface Attribute {
  name: string;
  type: string;
  default?: string;
  clientParams?: object;
  clientInfo?: ClientInfo;
}
