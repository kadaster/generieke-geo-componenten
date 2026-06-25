import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class SessionStorageService {
  private readonly selectedComponentsKey = "selectedComponents";
  private readonly selectedTagsKey = "selectedTags";
  private readonly selectedThemesKey = "selectedThemes";
  private readonly searchTermKey = "searchTerm";

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

  setSelectedComponents(selectedComponents: string[]) {
    sessionStorage.setItem(this.selectedComponentsKey, JSON.stringify(selectedComponents));
  }

  setSelectedTags(selectedTags: string[]) {
    sessionStorage.setItem(this.selectedTagsKey, JSON.stringify(selectedTags));
  }

  setSelectedThemes(selectedThemes: string[]) {
    sessionStorage.setItem(this.selectedThemesKey, JSON.stringify(selectedThemes));
  }

  setSearchTerm(searchTerm: string) {
    sessionStorage.setItem(this.searchTermKey, searchTerm);
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
    this.removeSelectedComponents();
    this.removeSelectedTags();
    this.removeSelectedThemes();
    this.removeSearchTerm();
  }

}
