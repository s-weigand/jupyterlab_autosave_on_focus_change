import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { IEditorTracker } from '@jupyterlab/fileeditor';
import { IDocumentManager } from '@jupyterlab/docmanager';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { FocusChangeAutoSaveTracker } from './tracker';
import { FocusChangeAutoSaveSettings } from './settings';
import { PLUGIN_ID } from './consts';

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
    IMainMenu,
  ],
  activate: (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    editorTracker: IEditorTracker,
    docManager: IDocumentManager,
    settingRegistry: ISettingRegistry,
    mainMenu: IMainMenu,
  ) => {
    console.log(
      'JupyterLab extension jupyterlab_autosave_on_focus_change is activated!',
    );

    const focusSaveTracker = new FocusChangeAutoSaveTracker({
      shell: app.shell,
      docManager,
      notebookTracker,
      editorTracker,
      // debug: true,
    });

    const settings = new FocusChangeAutoSaveSettings({
      app,
      settingRegistry,
      focusSaveTracker,
      mainMenu,
      // debug: true,
    });

    settings.trackSettingChanges();
  },
};

export default extension;
