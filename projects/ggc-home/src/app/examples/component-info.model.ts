import { Components } from "./components.enum";
import { Tags } from "./tags.enum";
import { Themes } from "./themes.enum";

export interface ComponentInfo {
  route: string;
  title: string;
  introduction: string;
  components: Components[];
  theme: Themes[];
  tags: Tags[];
  imageLocation?: string;
}
