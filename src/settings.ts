import { JupyterFrontEnd } from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { FocusChangeAutoSaveTracker } from './tracker';
import { create_debug_printer } from './utils';
import { PLUGIN_ID, TOGGLE_ACTIVE_COMMAND_ID } from './consts';

/**
 * Settings used by FocusChangeAutoSaveTracker.updateSettings
 */
export interface IFocusChangeAutoSaveSettings {
  /** Whether or not the extension is activated. */
  active: boolean;
  /** Glob patterns to exclude files from autosaving. */
  exclude: string[];
  /** Whether or not to save when cell focus changed. */
  saveOnCellFocusChange: boolean;
}

/**
 * Arguments to initialize FocusSaveTracker.
 */
export interface IFocusChangeAutoSaveSettingsArgs {
  /** Instance of JupyterFrontEnd passed to the extension.  */
  app: JupyterFrontEnd;
  /** Instance of ISettingRegistry passed to the extension.  */
  settingRegistry: ISettingRegistry;
  /** Instance of IMainMenu passed to the extension.  */
  mainMenu: IMainMenu;
  /** Focus change tracker to do the saving if the plugin is active. */
  focusSaveTracker: FocusChangeAutoSaveTracker;
  /** Whether to use the debug printer or not.  */
  debug?: boolean;
}

export class FocusChangeAutoSaveSettings {
  private _app: JupyterFrontEnd;
  private _settingRegistry: ISettingRegistry;
  private _saveTracker: FocusChangeAutoSaveTracker;
  private _mainMenu: IMainMenu;

  private _active: boolean;
  private _debug_printer: (...args: any[]) => void;

  /**
   * Initialization of FocusChangeAutoSaveSettings.
   *
   * @param initArgs Arguments to instantiate FocusChangeAutoSaveSettings.
   */
  constructor(initArgs: IFocusChangeAutoSaveSettingsArgs) {
    const args: IFocusChangeAutoSaveSettingsArgs = {
      debug: false,
      ...initArgs,
    };
    this._app = args.app;
    this._settingRegistry = args.settingRegistry;
    this._saveTracker = args.focusSaveTracker;
    this._mainMenu = args.mainMenu;
    this._active = true;
    this._debug_printer = create_debug_printer(args.debug);
  }

  /**
   * Parse setting and extract values.
   *
   * @param setting Read settings
   * @returns Parsed settings to be used with FocusChangeAutoSaveTracker.updateSettings
   */
  parseSetting(
    setting: ISettingRegistry.ISettings,
  ): IFocusChangeAutoSaveSettings {
    // Read the settings and convert to the correct type
    this._active = setting.get('active').composite as boolean;
    const exclude = setting.get('exclude').composite as string[];
    const saveOnCellFocusChange = setting.get('saveOnCellFocusChange')
      .composite as boolean;
    return { active: this._active, exclude, saveOnCellFocusChange };
  }

  /**
   * Callback for changed settings
   *
   * @param setting loaded setting instance
   */
  loadSetting(setting: ISettingRegistry.ISettings): void {
    const trackerSettings = this.parseSetting(setting);
    this._saveTracker.updateSettings(trackerSettings);

    this._debug_printer(
      'FocusChangeAutoSaveSettings.loadSetting:',
      trackerSettings,
    );
  }

  /**
   * Load settings and bind callback on change of the settings.
   * This method basically starts the whole extension.
   */
  trackSettingChanges(): void {
    Promise.all([this._app.restored, this._settingRegistry.load(PLUGIN_ID)])
      .then(([, setting]) => {
        // Read the settings
        this.loadSetting(setting);

        // Listen for your plugin setting changes using Signal
        setting.changed.connect(this.loadSetting, this);

        this.addToggleCommand(setting);
      })
      .catch(reason => {
        console.error(
          `Something went wrong when reading the settings.\n${reason}`,
        );
      });
  }

  /**
   * Add the "Autosave Documents on Focus Change" command to teh settings menu.
   * This command allows quick toggling of the extension.
   *
   * @param setting
   */
  private addToggleCommand(setting: ISettingRegistry.ISettings) {
    this._app.commands.addCommand(TOGGLE_ACTIVE_COMMAND_ID, {
      label: 'Autosave Documents on Focus Change',
      isToggled: () => this._active,
      execute: () => {
        // Programmatically change a setting
        Promise.all([setting.set('active', !this._active)])
          .then(() => {
            setting.changed.connect(this.loadSetting, this);
            this._debug_printer(
              'FocusChangeAutoSaveSettings.addToggleCommand:',
              { active: setting.get('active').composite as boolean },
            );
          })
          .catch(reason => {
            console.error(
              `Something went wrong when changing the settings.\n${reason}`,
            );
          });
      },
    });

    // Add command to setting menu before "Autosave Documents"
    this._mainMenu.settingsMenu.addGroup(
      [{ command: TOGGLE_ACTIVE_COMMAND_ID }],
      4,
    );
  }
}
