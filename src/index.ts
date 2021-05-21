import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the test extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'test:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension test is activated!');
  }
};

export default extension;
