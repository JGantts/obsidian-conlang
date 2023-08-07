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

  buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    //const decorations: Range<Decoration>[] = [];

    console.log("hflisl;l")

    // For every valid parser ⟨ ⟩ pair (starting at 'start' and stopping at 'end', adda  decoration)

    for (let {from, to} of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from, to,
        enter: (node) => {
          //////////////////////////////////////////////
          //This currently only finds the first result//
          //////////////////////////////////////////////
          let current = view.state.doc.sliceString(node.from, node.to)
          let first = current.indexOf("⟨");
          let second = current.indexOf("⟩");
          console.log(`from: ${node.from} to: ${node.to} current: ${current} one: ${first} two: ${second} contents: ${current.substring(first, second+1)}`)
          if (first>=0 && second>=0) {
            console.log(`range: ${node.from + first} thru ${node.from + second}`)
            //builder.add(node.from + first, node.from + second, Decoration.mark({class: "myconlang"}))
            builder.add(node.from + first, node.from + second, Decoration.mark({class: "myconlang"}))
          }
          console.log("uriopweu")
        }
      })
    }
  
    return builder.finish();
  }
}

export const conlangPlugin = ViewPlugin.fromClass(ConlangPlugin);