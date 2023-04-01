/* tslint:disable */
/* eslint-disable */
/**
*/
export class Minesweeper {
  free(): void;
/**
* @param {number} edge
* @param {number} bomb_count
*/
  constructor(edge: number, bomb_count: number);
/**
* @param {number} x
* @param {number} y
*/
  open_helper(x: number, y: number): void;
/**
* @param {number} x
* @param {number} y
* @returns {any[]}
*/
  open(x: number, y: number): any[];
/**
* @param {number} x
* @param {number} y
*/
  toggleFlag(x: number, y: number): void;
/**
* @returns {boolean}
*/
  isWon(): boolean;
/**
* @returns {boolean}
*/
  isLost(): boolean;
/**
* @returns {boolean}
*/
  isFinished(): boolean;
/**
* @param {number} x
* @param {number} y
* @returns {string}
*/
  getIcon(x: number, y: number): string;
/**
* @param {number} x
* @param {number} y
* @returns {boolean}
*/
  isBomb(x: number, y: number): boolean;
/**
* @param {number} x
* @param {number} y
*/
  clicked_bomb(x: number, y: number): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_minesweeper_free: (a: number) => void;
  readonly minesweeper_new: (a: number, b: number) => number;
  readonly minesweeper_open_helper: (a: number, b: number, c: number) => void;
  readonly minesweeper_open: (a: number, b: number, c: number, d: number) => void;
  readonly minesweeper_toggleFlag: (a: number, b: number, c: number) => void;
  readonly minesweeper_isWon: (a: number) => number;
  readonly minesweeper_isLost: (a: number) => number;
  readonly minesweeper_isFinished: (a: number) => number;
  readonly minesweeper_getIcon: (a: number, b: number, c: number, d: number) => void;
  readonly minesweeper_isBomb: (a: number, b: number, c: number) => number;
  readonly minesweeper_clicked_bomb: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
