import { View } from "./src/view";

export class MComponent {
  constructor() {
    this._viewRef = new View(this.template, this);
  }
  initView() {
    this._viewRef.parse();
  }

  init() {
    this._viewRef.init();
    this.mcOnInit();
  }

  mcOnInit() {}
}
