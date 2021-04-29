import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { IEditorTracker } from '@jupyterlab/fileeditor';
import { IDocumentManager } from '@jupyterlab/docmanager';

import { toArray } from '@lumino/algorithm';

/**
 * Initialization data for the jupyterlab_autosave_on_focus_change extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_autosave_on_focus_change:plugin',
  autoStart: true,
  requires: [
    INotebookTracker,
    IEditorTracker,
    IDocumentManager,
    ISettingRegistry
  ],
  activate: (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    editorTracker: IEditorTracker,
    docManager: IDocumentManager,
    settingRegistry: ISettingRegistry
  ) => {
    console.log(
      'JupyterLab extension jupyterlab_autosave_on_focus_change is activated!'
    );
    const addFocusEventListeners = () => {
      for (const widget of toArray(app.shell.widgets('main'))) {
        if (widget.node.classList.contains('saves-on-lose-focus')) {
          continue;
        }

        const context = docManager.contextForWidget(widget);
        if (context !== undefined) {
          widget.node.classList.add('saves-on-lose-focus');
          widget.node.addEventListener('focusout', () => {
            context.save();
            console.log('Saving: ', context.path);
          });
        }
      }
    };
    notebookTracker.widgetAdded.connect(addFocusEventListeners, this);
    editorTracker.widgetAdded.connect(addFocusEventListeners, this);
  }
};

export default extension;
