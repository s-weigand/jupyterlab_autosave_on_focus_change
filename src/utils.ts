/**
 * Console.log output only in development mode and if debug is true.
 *
 * @param debug Whether to console.lo or not
 * @param args Values to console log
 */
export const debug_printer = (debug: boolean, ...args: any[]): void => {
  if (process.env.NODE_ENV === 'development' && debug === true) {
    console.log(...args);
  }
};

/**
 * Creates an enclosed debug_printer with persisting value of debug.
 * That way debug doesn't need be passed each time.
 *
 * @param debug Whether to console.lo or not
 * @returns Debug printer only the args to print need to be passed to
 */
export const create_debug_printer = (
  debug: boolean,
): ((...args: any[]) => void) => {
  const debug_state = debug;
  const printer = (...args: any[]) => {
    debug_printer(debug_state, ...args);
  };
  return printer;
};
