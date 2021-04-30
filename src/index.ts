import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { IEditorTracker } from '@jupyterlab/fileeditor';
import { IDocumentManager } from '@jupyterlab/docmanager';

import { FocusSaveTracker } from './tracker';

const PLUGIN_ID = 'jupyterlab_autosave_on_focus_change:plugin';

/**
 * Initialization data for the jupyterlab_autosave_on_focus_change extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [
    INotebookTracker,
    IEditorTracker,
    IDocumentManager,
    ISettingRegistry,
  ],
  activate: (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    editorTracker: IEditorTracker,
    docManager: IDocumentManager,
    settingRegistry: ISettingRegistry,
  ) => {
    console.log(
      'JupyterLab extension jupyterlab_autosave_on_focus_change is activated!',
    );
    const { shell } = app;

    const focusSaveTracker = new FocusSaveTracker({
      shell,
      docManager,
      notebookTracker,
      editorTracker,
      debug: true,
    });

    focusSaveTracker.setActiveState(true);
  },
};

export default extension;
