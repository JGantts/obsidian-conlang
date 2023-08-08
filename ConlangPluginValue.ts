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

export const conlangPlugin = 
  (
    langSettings: { open: string; close: string; class: string; }
  ) => {
    return ViewPlugin.fromClass(class implements PluginValue {
      decorations: DecorationSet;
      dec: Decoration = Decoration.mark({class: langSettings.class});
    
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
        //decorations.push(Decoration.mark({class: "myconlang"}).range(0, 8))
        // For every valid parser ⟨ ⟩ pair (starting at 'start' and stopping at 'end', adda  decoration)
    
        for (let { from, to } of view.visibleRanges) {
          console.log(view)
          console.log(view.state)
          syntaxTree(view.state).iterate({
            from, to,
            enter: (node) => {
              let current = view.state.doc.sliceString(node.from, node.to)
              if (current.indexOf("ŋ") != -1) {
                //console.log(current)
              }
              //console.log(current)
              console.log(langSettings)
              let first = current.indexOf(langSettings.open);
              let second = current.indexOf(langSettings.close, first);
              while (second >= 0) {
                let start =
                  (first!=-1)
                    ? first
                    : 0
                let end =
                  (second!=-1)
                    ? second
                    : current.length - 1
                let rangeFrom = node.from + start;
                let rangeTo = node.from + end + 1;
                //console.log(`${rangeFrom} ${rangeTo}`)
                decorations.push(
                  this.dec.range(rangeFrom, rangeTo)
                );
                first = current.indexOf(langSettings.open, second);
                second = 
                  first!=-1
                    ? current.indexOf(langSettings.close, first)
                    : -1
              }
            },
          });
        }
    
        //console.log(decorations)
        return Decoration.set(decorations, true);
      }
    },
    {
			decorations: (value) => value.decorations
		}
    );
  }  
