import { JupyterFrontEnd } from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';

import { INotebookTracker } from '@jupyterlab/notebook';
import { IEditorTracker } from '@jupyterlab/fileeditor';

import { Widget } from '@lumino/widgets';
import { toArray } from '@lumino/algorithm';

import { Minimatch, IMinimatch } from 'minimatch';

import { debug_printer, create_debug_printer } from './utils';
import { IFocusChangeAutoSaveSettings } from './settings';

/**
 * Arguments to initialize FocusSaveTracker.
 */
export interface IFocusSaveTrackerArgs {
  /** Instance of IShell (app.shell) passed to the extension.  */
  shell: JupyterFrontEnd.IShell;
  /** Instance of IDocumentManager passed to the extension.  */
  docManager: IDocumentManager;
  /** Instance of INotebookTracker passed to the extension.  */
  notebookTracker: INotebookTracker;
  /** Instance of IEditorTracker passed to the extension.  */
  editorTracker: IEditorTracker;
  /** Whether to use the debug printer or not.  */
  debug?: boolean;
}

/**
 * Tracker to react to focus changes of all document widgets.
 */
export class FocusChangeAutoSaveTracker {
  // object passed at Initialization

  /** Instance of IShell (app.shell) passed to the extension.  */
  private _shell: JupyterFrontEnd.IShell;
  /** Instance of IDocumentManager passed to the extension.  */
  private _docManager: IDocumentManager;
  /** Instance of INotebookTracker passed to the extension.  */
  private _notebookTracker: INotebookTracker;
  /** Instance of IEditorTracker passed to the extension.  */
  private _editorTracker: IEditorTracker;
  // objects created

  /** Mapping of widget nodes to widget objects to be used with event handlers */
  private _nodes = new Map<HTMLElement, Widget>();
  /** Glob pattern matcher to check if a document is excluded. */
  private _excludeMatcher: IMinimatch;
  /** Save cells of focus change auto save tracker */
  private _saveOnCellFocusChange: boolean;
  private _debug_printer: (...args: any[]) => void;

  /**
   * Initialization of FocusChangeAutoSaveTracker.
   *
   * @param initArgs Arguments to instantiate FocusChangeAutoSaveTracker.
   */
  constructor(initArgs: IFocusSaveTrackerArgs) {
    const args: IFocusSaveTrackerArgs = { debug: false, ...initArgs };
    this._shell = args.shell;
    this._docManager = args.docManager;
    this._notebookTracker = args.notebookTracker;
    this._editorTracker = args.editorTracker;
    this._debug_printer = create_debug_printer(args.debug);
  }

  /**
   * Get all or only untracked document widgets
   *
   * @param skipTracked Whether to skip already tracked widgets or not.
   * @returns Array of document widgets
   */
  documentWidgets(skipTracked = true): Array<Widget> {
    const widgetArray: Widget[] = [];
    for (const widget of toArray(this._shell.widgets('main'))) {
      if (
        widget.node.classList.contains('saves-on-lose-focus') &&
        skipTracked
      ) {
        continue;
      }
      if (this.isDocumentWidget(widget)) {
        widgetArray.push(widget);
      }
    }
    return widgetArray;
  }

  /**
   * Determine if a widget is a document widget.
   *
   * @param widget Widget to check if it is a document Widget
   * @returns True if the widget is a document widget, else false.
   */
  isDocumentWidget(widget: Widget): boolean {
    const context = this._docManager.contextForWidget(widget);
    return context !== undefined;
  }

  /**
   * Add all untracked widgets to the FocusTracker.
   */
  trackWidgets(): void {
    for (const widget of this.documentWidgets()) {
      this._nodes.set(widget.node, widget);
      widget.node.classList.add('saves-on-lose-focus');
      widget.node.addEventListener('focusout', this);
    }
  }

  /**
   * Remove all document widgets from the FocusTracker.
   */
  unTrackWidgets(): void {
    for (const widget of this.documentWidgets(false)) {
      widget.node.classList.remove('saves-on-lose-focus');
      widget.node.removeEventListener('focusout', this);
    }
    this._nodes.clear();
  }

  /**
   * Handle the DOM events for focusout.
   *
   * @param event - The DOM event triggered on the tracked node.
   *
   * #### Notes
   * See: https://stackoverflow.com/a/58149336/3990615
   */
  handleEvent(event: Event): void {
    let widget: Widget | undefined;
    switch (event.type) {
      case 'focusout':
        widget = this.getWidgetFromEvent(event as FocusEvent);
        this._debug_printer('FocusEvent: ', event);
        if (widget !== undefined) {
          this.saveDocumentWidget(widget);
        }
        break;
    }
  }

  /**
   * Get Widget depending what triggered the event.
   * This allows filtering of bubbled up focusout events from changing
   * the focussed cell.
   *
   * @param event Focus event triggered by an editor or child widget
   * @returns Document Widget or undefined
   */
  getWidgetFromEvent(event: FocusEvent): Widget | undefined {
    const currentTarget = event.currentTarget as HTMLElement;
    if (this._saveOnCellFocusChange === false) {
      const relatedTarget = event.relatedTarget as HTMLElement;
      if (
        relatedTarget !== null &&
        currentTarget.contains(relatedTarget) // new focused widget inside old document widget
      ) {
        return undefined;
      }
    }
    return this._nodes.get(currentTarget);
  }

  /**
   * Save Widget if it is a document Widget.
   *
   * @param widget Widget which will be saved if it is a document widget
   */
  saveDocumentWidget(widget: Widget): void {
    const context = this._docManager.contextForWidget(widget);
    if (
      this._excludeMatcher.match(context.path) === false &&
      context.isDisposed === false
    ) {
      context
        .save()
        .then(() => {
          this._debug_printer('Saving: ', context.path);
        })
        .catch(reason => {
          this._debug_printer(`Error saving: ${context.path}`, reason);
        });
    }
  }

  /**
   * Save all document widgets.
   */
  saveAllDocumentWidgets(): void {
    for (const widget of this.documentWidgets(false)) {
      this.saveDocumentWidget(widget);
    }
  }

  /**
   * Activate or deactivate the tracking, with new settings.
   *
   * @param active Setting if the Extension is active or not.
   */
  // updateSettings(active: boolean, exclude: string[]): void {
  updateSettings(trackerSetting: IFocusChangeAutoSaveSettings): void {
    this._excludeMatcher = new Minimatch(
      `{${trackerSetting.exclude.join(',')},}`,
      {
        nocomment: true,
      },
    );
    this._saveOnCellFocusChange = trackerSetting.saveOnCellFocusChange;
    this._debug_printer('_excludeMatcher: ', this._excludeMatcher);
    debug_printer(true, 'Setting active state to: ', trackerSetting.active);
    this.saveAllDocumentWidgets();

    if (trackerSetting.active === true) {
      this.trackWidgets();
      this._notebookTracker.widgetAdded.connect(this.trackWidgets, this);
      this._editorTracker.widgetAdded.connect(this.trackWidgets, this);
    } else {
      this.unTrackWidgets();
      this._notebookTracker.widgetAdded.disconnect(this.trackWidgets, this);
      this._editorTracker.widgetAdded.disconnect(this.trackWidgets, this);
    }
  }
}
