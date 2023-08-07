import { EditorView, WidgetType } from "@codemirror/view";

export class ConlangText extends WidgetType {
  innerText: String

  constructor(innerText: String) {
    super()
    this.innerText = innerText
  }

  toDOM(view: EditorView): HTMLElement {
    const div = document.createElement("span");
    div.classList.add("myconlang")
    div.innerText = `⟨${this.innerText}⟩`;
    return div;
  }
}