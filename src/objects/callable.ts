
/* IMPORT */

import {SYMBOL_OBSERVABLE, SYMBOL_OBSERVABLE_FROZEN, SYMBOL_OBSERVABLE_READABLE, SYMBOL_OBSERVABLE_WRITABLE} from '~/symbols';
import {isFunction} from '~/utils';
import type {IObservable, UpdateFunction, Frozen, Readable, Writable} from '~/types';

/* MAIN */

//TODO: streamline this, maybe use one symbol? maybe attach the instance to the symbol instead?

function frozenFunction <T> ( this: T ): T {
  if ( arguments.length ) {
    throw new Error ( 'A readonly Observable can not be updated' );
  } else {
    return this;
  }
}

function readableFunction <T> ( this: IObservable<T>, symbol: symbol ): IObservable<T>;
function readableFunction <T> ( this: IObservable<T>, symbol?: symbol ): T | IObservable<T> {
  if ( arguments.length ) {
    if ( symbol === SYMBOL_OBSERVABLE ) return this;
    throw new Error ( 'A readonly Observable can not be updated' );
  } else {
    return this.get ();
  }
}

function writableFunction <T> ( this: IObservable<T>, symbol: symbol ): IObservable<T>;
function writableFunction <T> ( this: IObservable<T>, fn?: UpdateFunction<T> | T | symbol ): T | IObservable<T> {
  if ( arguments.length ) {
    if ( fn === SYMBOL_OBSERVABLE ) return this;
    if ( isFunction ( fn ) ) return this.update ( fn as UpdateFunction<T> ); //TSC
    return this.set ( fn as T ); //TSC
  } else {
    return this.get ();
  }
}

const frozen = (<T> ( value: T ) => {
  const fn = frozenFunction.bind ( value );
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_FROZEN] = true;
  return fn;
}) as Frozen; //TSC

const readable = (<T> ( value: IObservable<T> ) => {
  //TODO: Make a frozen one instead if disposed
  const fn = readableFunction.bind ( value as any ); //TSC
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_READABLE] = true;
  return fn;
}) as Readable; //TSC

const writable = (<T> ( value: IObservable<T> ) => {
  const fn = writableFunction.bind ( value as any ); //TSC
  fn[SYMBOL_OBSERVABLE] = true;
  fn[SYMBOL_OBSERVABLE_WRITABLE] = true;
  return fn;
}) as Writable; //TSC

/* EXPORT */

export {frozen, readable, writable};

//TODO: REVIEW
