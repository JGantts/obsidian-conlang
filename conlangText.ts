import { EditorView, WidgetType } from "@codemirror/view";

export class ConlangText extends WidgetType {
  toDOM(view: EditorView): HTMLElement {
    const div = document.createElement("span");

    div.innerText = "⟨⟩";

    return div;
  }
}