import { JupyterFrontEnd } from '@jupyterlab/application';
import { IDocumentManager } from '@jupyterlab/docmanager';

import { INotebookTracker } from '@jupyterlab/notebook';
import { IEditorTracker } from '@jupyterlab/fileeditor';

import { FocusTracker, Widget } from '@lumino/widgets';
import { toArray } from '@lumino/algorithm';

import { Minimatch, IMinimatch } from 'minimatch';

import { debug_printer, create_debug_printer } from './utils';

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
  private _shell: JupyterFrontEnd.IShell;
  private _docManager: IDocumentManager;
  private _notebookTracker: INotebookTracker;
  private _editorTracker: IEditorTracker;
  private _focusTracker: FocusTracker<Widget>;
  // objects created
  private _excludeMatcher: IMinimatch;
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
    this._focusTracker = new FocusTracker();
    this._debug_printer = create_debug_printer(args.debug);

    this._focusTracker.currentChanged.connect(this.saveOldWidget, this);
  }

  /**
   * Get all or only untracked document widgets
   *
   * @param skipTracked Whether to skip already tracked widgets or not.
   * @returns Array of document widgets
   */
  documentWidgets(skipTracked = true): Array<Widget> {
    const documentWidgets: Widget[] = [];
    for (const widget of toArray(this._shell.widgets('main'))) {
      if (
        widget.node.classList.contains('saves-on-lose-focus') &&
        skipTracked
      ) {
        continue;
      }
      documentWidgets.push(widget);
    }
    return documentWidgets;
  }

  /**
   * Add all untracked widgets to the FocusTracker.
   */
  trackWidgets(): void {
    for (const widget of this.documentWidgets()) {
      widget.node.classList.add('saves-on-lose-focus');
      this._focusTracker.add(widget);
    }
    this._debug_printer(
      'trackWidgets with documentWidgets:',
      this._focusTracker.widgets,
    );
  }

  /**
   * Remove all document widgets from the FocusTracker.
   */
  unTrackWidgets(): void {
    for (const widget of this.documentWidgets(false)) {
      widget.node.classList.remove('saves-on-lose-focus');
      this._focusTracker.remove(widget);
    }
    this._debug_printer(
      'trackWidgets with documentWidgets:',
      this._focusTracker.widgets,
    );
  }

  /**
   * Saves all document widgets
   */
  saveAllDocumentWidgets(): void {
    for (const widget of this.documentWidgets(false)) {
      this.saveOldWidget(this._focusTracker, {
        oldValue: widget,
        newValue: null,
      });
    }
  }

  /**
   * Handler for currentChanged signals on the FocusTracker.
   * This handler calls save on the widget that lost focus.
   *
   * @param _emitter FocusTracker that emitted the change
   * @param changedArgs Changed values with old and new widget.
   */
  saveOldWidget(
    _emitter: FocusTracker<Widget>,
    changedArgs: FocusTracker.IChangedArgs<Widget>,
  ): void {
    const oldWidget = changedArgs.oldValue;
    if (oldWidget !== null) {
      const context = this._docManager.contextForWidget(oldWidget);
      if (
        context !== undefined &&
        this._excludeMatcher.match(context.path) === false
      ) {
        context.save();
        this._debug_printer('Saving: ', context.path);
      }
    }
  }

  /**
   * Activate or deactivate the tracking.
   *
   * @param active Setting if the Extension is active or not.
   */
  updateSettings(active: boolean, exclude: string[]): void {
    this._excludeMatcher = new Minimatch(`{${exclude.join(',')},}`);
    this._debug_printer('_excludeMatcher: ', this._excludeMatcher);
    debug_printer(true, 'Setting active state to: ', active);
    this.saveAllDocumentWidgets();

    if (active === true) {
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
