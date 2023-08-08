import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder, Range } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  PluginSpec,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { ConlangText } from "conlangText";

class ConlangPlugin implements PluginValue {
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.decorations = this.buildDecorations(view);
    /*this.decorations = Decoration.set([
      Decoration.mark({class: "myconlang"}).range(0, 12)
    ], true)*/
  }

  update(update: ViewUpdate) {
    //if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    //}
  }

  dec = Decoration.mark({class: "myconlang"})

  buildDecorations(view: EditorView): DecorationSet {
    const decorations: Range<Decoration>[] = [];
    //decorations.push(Decoration.mark({class: "myconlang"}).range(0, 8))
    // For every valid parser ⟨ ⟩ pair (starting at 'start' and stopping at 'end', adda  decoration)

    for (let { from, to } of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from, to,
        enter: (node) => {
          let current = view.state.doc.sliceString(node.from, node.to)
          //console.log(current)
          let first = current.indexOf("⟨");
          let second = current.indexOf("⟩", first);
          while (first >= 0 && second >= 0) {
            let rangeFrom = node.from + first;
            let rangeTo = node.from + second + 1;
            //console.log(`${rangeFrom} ${rangeTo}`)
            decorations.push(
              this.dec.range(rangeFrom, rangeTo)
            );
            first = current.indexOf("⟨", second);
            second = current.indexOf("⟩", first);
          }
        },
      });
    }

    //console.log(decorations)
    return Decoration.set(decorations, true);
  }
}

const conlangPluginSpec: PluginSpec<ConlangPlugin> = {
  decorations: (value: ConlangPlugin) => value.decorations,
};

export const conlangPlugin = ViewPlugin.fromClass(ConlangPlugin, conlangPluginSpec);