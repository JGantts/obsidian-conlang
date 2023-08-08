import { conlangPlugin } from 'ConlangPluginValue';
import { App, Editor, MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

function checkNode(element: Element, context: MarkdownPostProcessorContext) {
  if (
    element.classList
    && element.classList.contains("jgantts_err")
  ) {
    console.log("err-vevesc: element")
    console.log(element)
    return
  }
  //@ts-expect-error
  let innerT = element.innerText ?? element.textContent
  //console.log(innerT)
  //console.log(element.innerHTML)
  if (
    !element.innerHTML
    || innerT == element.innerHTML
  ) {
    const text = innerT
    if (text) {
      let first = text.indexOf("⟨");
      let second = text.indexOf("⟩", first);
      let pairs: {start: number, end: number}[] = []
      while ((first!=-1 || second!=-1) && first < text.length) {
        let start =
          (first!=-1)
            ? first
            : 0
        let end =
          (second!=-1)
            ? second
            : text.length - 1
        pairs.push({start, end})
        first = text.indexOf("⟨", first+1);
        second = 
          first!=-1
            ? text.indexOf("⟩", first+1)
            : -1
      }
      if (pairs.length > 0) {
        let htmlElement = element as HTMLElement
        if (htmlElement) {
          //console.log("jfsdhlk")
          //console.log(htmlElement)
          if (htmlElement.nodeType == 3) {
            let parent = htmlElement.parentElement
            if (parent) {
              context.addChild(new Replacement(parent, pairs, htmlElement))
            } else {
              console.log("err-dsagf: element")
              console.log(element)
            }
          } else {
            context.addChild(new Replacement(htmlElement, pairs, htmlElement))
          }
        } else {
          console.log("err-tewrt: element")
          console.log(element)
        }
      }
    }
  } else {
    const divs = element.childNodes;
    /*console.log("querySelectorAll")
    divs.forEach((div) => {
      console.log(div)
    })
    console.log("childNodes")
    element.childNodes.forEach((div) => {
      console.log(div)
    })
    console.log("children")
    for (let index = 0; index < element.children.length; index++) {
      const curr = element.children.item(index);
      console.log(curr)
    }*/
    for (let index = 0; index < divs.length; index++) {
      const curr = divs.item(index) as Element;
      if (curr) {
        //console.log(curr)
        checkNode(curr, context)
      }
    }
  }
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

    this.registerMarkdownPostProcessor((element: HTMLElement, context: MarkdownPostProcessorContext) => {
      checkNode(element, context)
    });
    this.registerEditorExtension(conlangPlugin)


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('conlang v0.1.0');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				//console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			//('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		//this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

function addPostMarkdownStuff() {

}

class Replacement extends MarkdownRenderChild {
  pairs: { start: number; end: number; }[];
  replacementEl: Element;

  constructor(containerEl: HTMLElement, pairs: {start: number, end: number}[], replacementEl: Element) {
    super(containerEl);
    this.pairs = pairs;
    this.replacementEl = replacementEl
  }

  onload() {
    //console.log(this.containerEl)
    //console.log(this.containerEl.nodeType)
    let containerDiv = this.containerEl.createSpan()
    function addNewDiv(inner: string, theClass: string|null = null) {
      let newSpan = containerDiv.createSpan({
        text: inner,
      })
      if (theClass) {
        newSpan.classList.add(theClass)
      }
      newSpan.classList.add("jgantts_err")
      containerDiv.appendChild(newSpan)
    }
    let text = this.replacementEl.textContent ?? ""
    let lastIndex = 0
    let index = 0
    while (index <= this.pairs.length-1 && lastIndex < text.length-1) {
      let currentPair = this.pairs[index]
      if (currentPair.start > lastIndex) {
        addNewDiv(text.substring(lastIndex, currentPair.start))
      }
      addNewDiv(text.substring(currentPair.start, currentPair.end+1), "myconlang")
      lastIndex = currentPair.end+1
      index++
    }
    if (lastIndex < text.length) {
      addNewDiv(text.substring(lastIndex, text.length))
    }
    if (this.containerEl == this.replacementEl) {
      this.containerEl.replaceChildren(containerDiv)
    } else {
      this.containerEl.replaceChild(containerDiv, this.replacementEl)
    }
  }
}
