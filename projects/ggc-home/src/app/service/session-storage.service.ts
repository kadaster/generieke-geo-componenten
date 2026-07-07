import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class SessionStorageService {
  private readonly selected2D3DKey = "selected2D3D";
  private readonly selectedComponentsKey = "selectedComponents";
  private readonly selectedTagsKey = "selectedTags";
  private readonly selectedThemesKey = "selectedThemes";
  private readonly searchTermKey = "searchTerm";

  getSelected2D3D() {
    return sessionStorage.getItem(this.selected2D3DKey);
  }

  getSelectedComponents() {
    return sessionStorage.getItem(this.selectedComponentsKey);
  }

  getSelectedTags() {
    return sessionStorage.getItem(this.selectedTagsKey);
  }

  getSelectedThemes() {
    return sessionStorage.getItem(this.selectedThemesKey);
  }

  getSearchTerm() {
    return sessionStorage.getItem(this.searchTermKey);
  }

  setSelected2D3D(selected2D3D: string[]) {
    sessionStorage.setItem(this.selected2D3DKey, JSON.stringify(selected2D3D));
  }

  setSelectedComponents(selectedComponents: string[]) {
    sessionStorage.setItem(
      this.selectedComponentsKey,
      JSON.stringify(selectedComponents)
    );
  }

  setSelectedTags(selectedTags: string[]) {
    sessionStorage.setItem(this.selectedTagsKey, JSON.stringify(selectedTags));
  }

  setSelectedThemes(selectedThemes: string[]) {
    sessionStorage.setItem(
      this.selectedThemesKey,
      JSON.stringify(selectedThemes)
    );
  }

  setSearchTerm(searchTerm: string) {
    sessionStorage.setItem(this.searchTermKey, searchTerm);
  }

  removeSelected2D3D() {
    sessionStorage.removeItem(this.selected2D3DKey);
  }

  removeSelectedComponents() {
    sessionStorage.removeItem(this.selectedComponentsKey);
  }

  removeSelectedTags() {
    sessionStorage.removeItem(this.selectedTagsKey);
  }

  removeSelectedThemes() {
    sessionStorage.removeItem(this.selectedThemesKey);
  }

  removeSearchTerm() {
    sessionStorage.removeItem(this.searchTermKey);
  }

  removeSessionStorage() {
    this.removeSelected2D3D();
    this.removeSelectedComponents();
    this.removeSelectedTags();
    this.removeSelectedThemes();
    this.removeSearchTerm();
  }
}
