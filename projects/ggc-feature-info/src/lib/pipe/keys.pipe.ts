import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "featureinfokeys" })
export class FeatureKeysPipe implements PipeTransform {
  private keysNotReturn = "geometry";

  transform(keyArray: string[]): string[] {
    return keyArray.filter((key) => key !== this.keysNotReturn);
  }
}
