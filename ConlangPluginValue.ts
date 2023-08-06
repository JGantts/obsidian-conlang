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
  }

  update(update: ViewUpdate) {
    //if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    //}
  }

  buildDecorations(view: EditorView): DecorationSet {
    const decorations: Range<Decoration>[] = [];

    console.log("hflisl;l")

    // For every valid parser ⟨ ⟩ pair (starting at 'start' and stopping at 'end', adda  decoration)

    for (let {from, to} of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from, to,
        enter: (node) => {
          //////////////////////////////////////////////
          //This currently only finds the first result//
          //////////////////////////////////////////////
          let first = view.state.doc.sliceString(node.from, node.to).indexOf("⟨");
          let second = view.state.doc.sliceString(node.from, node.to).indexOf("⟩");
          console.log(`one: ${first} two: ${second}`)
          if (first>=0 && second>=0) {
            decorations.push(Decoration.mark({class: "myconlang"}).range(first, second))
            console.log(decorations)
          }
          console.log("uriopweu")
        }
      })
    }

    return Decoration.set(decorations, true);
  }
}

export const conlangPlugin = ViewPlugin.fromClass(ConlangPlugin);