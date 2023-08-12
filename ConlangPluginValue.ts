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
import checker from "checker"

export const conlangPlugin = 
  (
    langSettings: { open: string; close: string; class: string; }
  ) => {
    return ViewPlugin.fromClass(class implements PluginValue {
      decorations: DecorationSet;
      dec: Decoration = Decoration.mark({class: langSettings.class});
    
      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }
      
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }
      
      buildDecorations(view: EditorView): DecorationSet {
        const decorations: Range<Decoration>[] = [];
        // For every valid parser ⟨ ⟩ pair (starting at 'start' and stopping at 'end', adda  decoration)
    
        for (let { from, to } of view.visibleRanges) {
          //console.log(view)
          //console.log(view.state)
          syntaxTree(view.state).iterate({
            from, to,
            enter: (node) => {
              let current = view.state.doc.sliceString(node.from, node.to)
              //console.log("EditorExtension A")
              checker.check(
                current,
                langSettings,
                view.state.lineBreak,
                (
                  foundStart: number,
                  foundEnd: number
                ) => {
                  //console.log("EditorExtension B")
                  let rangeFrom = node.from + foundStart;
                  let rangeTo = node.from + foundEnd + 1;
                  //console.log(`${rangeFrom} ${rangeTo}`)
                  decorations.push(
                    this.dec.range(rangeFrom, rangeTo)
                  );
                }
              )
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
