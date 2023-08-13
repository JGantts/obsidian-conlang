import { conlangPlugin } from 'ConlangPluginValue';
import { App, Editor, MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import checker from "checker"

// Remember to rename these classes and interfaces!

const VERSION_STRING = "v0.1.5"

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

    this.registerMarkdownPostProcessor((element: HTMLElement, context: MarkdownPostProcessorContext) => {
      checkNode(element, context, {
        open: "⟨",
        close: "⟩",
        class: "myconlang"
      })
    })

    this.registerMarkdownPostProcessor((element: HTMLElement, context: MarkdownPostProcessorContext) => {
      checkNode(element, context, {
        open: "[",
        close: "]",
        class: "myipalang"
      })
    })
    
    this.registerMarkdownPostProcessor((element: HTMLElement, context: MarkdownPostProcessorContext) => {
      checkNode(element, context, {
        open: "/",
        close: "/",
        class: "myipalang"
      })
    })

    this.registerEditorExtension(conlangPlugin({
      open: "⟨",
      close: "⟩",
      class: "myconlang"
    }))

    this.registerEditorExtension(conlangPlugin({
      open: "[",
      close: "]",
      class: "myipalang"
    }))
    this.registerEditorExtension(conlangPlugin({
      open: "/",
      close: "/",
      class: "myipalang"
    }))


		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice(`conlang ${VERSION_STRING}`);
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText(`conlang ${VERSION_STRING}`);

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
			.setDesc(`conlang ${VERSION_STRING}`)
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
    

	}
}

function checkNode(
  element: Element,
  context: MarkdownPostProcessorContext,
  langSettings: {
    open: string,
    close: string,
    class: string,
  }
) {
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
  if (
    !element.innerHTML
    || innerT == element.innerHTML
  ) {
    const text = innerT
    let cssClasses: {pair: {start: number, end: number}, cssClass: string}[] = []
    if (text) {
      //console.log("MarkdownPostProcessor A")
      checker.check(
        text,
        langSettings,
        "\n",
        (
          start: number,
          end: number
        ) => {
          cssClasses.push({pair: {start, end}, cssClass: langSettings.class})
        },
        (
          start: number,
          end: number
        ) => {
          cssClasses.push({pair: {start, end}, cssClass: langSettings.class+" parse_err"})
        }
      )
      if (cssClasses.length > 0) {
        console.log(text)
        console.log(cssClasses)
        let htmlElement = element as HTMLElement
        if (htmlElement) {
          if (htmlElement.nodeType == 3) {
            // we're text
            let parent = htmlElement.parentElement
            if (parent) {
              context.addChild(new Replacement(parent, cssClasses, htmlElement))
            } else {
              console.log("err-dsagf: element")
              console.log(element)
            }
          } else {
            context.addChild(new Replacement(htmlElement, cssClasses, htmlElement))
          }
        } else {
          console.log("err-tewrt: element")
          console.log(element)
        }
      }
    }
  } else {
    const divs = element.childNodes;
    for (let index = 0; index < divs.length; index++) {
      const curr = divs.item(index) as Element;
      if (curr) {
        checkNode(curr, context, langSettings)
      }
    }
  }
}

class Replacement extends MarkdownRenderChild {
  cssClasses: {pair: {start: number, end: number}, cssClass: string}[];
  replacementEl: Element;

  constructor(
    containerEl: HTMLElement,
    cssClasses: {pair: {start: number, end: number}, cssClass: string}[],
    replacementEl: Element,
  ) {
    super(containerEl);
    this.cssClasses = cssClasses;
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
        let split = theClass.split(' ')
        for(let i=0; i<split.length; i++) {
          newSpan.classList.add(split[i])
        }
      }
      //newSpan.classList.add("jgantts_err")
      containerDiv.appendChild(newSpan)
    }
    let text = this.replacementEl.textContent ?? ""
    let lastIndex = 0
    let index = 0
    while (index <= this.cssClasses.length-1 && lastIndex < text.length-1) {
      let currentPair = this.cssClasses[index].pair
      if (currentPair.start > lastIndex) {
        addNewDiv(text.substring(lastIndex, currentPair.start))
      }
      addNewDiv(text.substring(currentPair.start, currentPair.end+1), this.cssClasses[index].cssClass)
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
    ;
  }
}
