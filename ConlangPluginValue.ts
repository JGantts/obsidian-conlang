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
    const decorations: Range<Decoration>[] = [];
    decorations.push(Decoration.mark({class: "myconlang"}).range(0, 8))
    return Decoration.set(decorations, true);

    //const builder = new RangeSetBuilder<Decoration>();
    //builder.add(0, 7, Decoration.mark({class: "myconlang"}))
    //return builder.finish();
  }
  /*

    // For every valid parser ⟨ ⟩ pair (starting at 'start' and stopping at 'end', adda  decoration)

    for (let {from, to} of view.visibleRanges) {
      syntaxTree(view.state).iterate({
        from, to,
        enter: (node) => {
          let current = view.state.doc.sliceString(node.from, node.to)
          let first = current.indexOf("⟨");
          let second = current.indexOf("⟩");
          console.log(`from: ${node.from} to: ${node.to} current: ${current} one: ${first} two: ${second} contents: ${current.substring(first, second+1)}`)
          if (first>=0 && second>=0) {
            decorations.push(Decoration.mark({class: "myconlang"}).range(node.from + first, node.from + second))
          }
        }
      })
    }

    console.log(decorations)
    return Decoration.set(decorations, true);
  }*/
}

const conlangPluginSpec: PluginSpec<ConlangPlugin> = {
  decorations: (value: ConlangPlugin) => value.decorations,
};

export const conlangPlugin = ViewPlugin.fromClass(ConlangPlugin, conlangPluginSpec);