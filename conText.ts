import { MarkdownRenderChild } from "obsidian";

export class ConText extends MarkdownRenderChild {

  text: string;

  constructor(containerEl: HTMLElement, text: string) {
    super(containerEl);

    this.text = text;
  }

  onload() {
    const conTextEl = this.containerEl.createSpan({
    	text: `⟨${this.text}⟩`,
    });
    this.containerEl.replaceWith(conTextEl);
  }
}