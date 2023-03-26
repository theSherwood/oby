
/* IMPORT */

import {OBSERVABLE_FALSE, OBSERVABLE_TRUE} from '~/constants';
import cleanup from '~/methods/cleanup';
import isObservableFrozen from '~/methods/is_observable_frozen';
import effect from '~/methods/effect';
import memo from '~/methods/memo';
import untrack from '~/methods/untrack';
import {readable} from '~/objects/callable';
import Observable from '~/objects/observable';
import {is} from '~/utils';
import type {SelectorFunction, ObservableReadonly} from '~/types';

/* HELPERS */

class DisposableMap<K, V> extends Map<K, V> { // This allows us to skip emptying the map in some cases, while still being able to signal that it was disposed
  disposed: boolean = false;
}

class SelectedObservable extends Observable<boolean> { // This saves some memory compared to making a dedicated standalone object for metadata + a cleanup function
  count: number = 1;
  selecteds!: DisposableMap<unknown, SelectedObservable>; //TSC
  source?: any;
  /* API */
  call (): void { // Cleanup function
    if ( this.selecteds.disposed ) return;
    this.count -= 1;
    if ( this.count ) return;
    this.selecteds.delete ( this.source );
  }
}

/* MAIN */

const selector = <T> ( source: () => T ): SelectorFunction<T> => {

  /* NORMALIZING SOURCE */

  source = memo ( source );

  /* FROZEN SOURCE */

  if ( isObservableFrozen ( source ) ) {

    const sourceValue = source ();

    return ( value: T ): ObservableReadonly<boolean> => {

      return ( value === sourceValue ) ? OBSERVABLE_TRUE : OBSERVABLE_FALSE;

    };

  }

  /* SELECTEDS */

  let selecteds = new DisposableMap<unknown, SelectedObservable> ();
  let selectedValue: T | undefined = untrack ( source );

  effect ( () => { //TODO: Maybe this should be synchronous really

    const valuePrev = selectedValue;
    const valueNext = source ();

    if ( is ( valuePrev, valueNext ) ) return;

    selectedValue = valueNext;

    selecteds.get ( valuePrev )?.write ( false );
    selecteds.get ( valueNext )?.write ( true );

  }, { suspense: false } );

  /* CLEANUP ALL */

  const cleanupAll = (): void => {

    selecteds.disposed = true;

  };

  cleanup ( cleanupAll );

  /* SELECTOR */

  return ( value: T ): ObservableReadonly<boolean> => {

    /* INIT */

    let selected = selecteds.get ( value );

    if ( selected ) {

      selected.count += 1;

    } else {

      selected = new SelectedObservable ( value === selectedValue );
      selected.selecteds = selecteds;
      selected.source = value;

      selecteds.set ( value, selected );

    }

    /* CLEANUP */

    cleanup ( selected );

    /* RETURN */

    return readable ( selected );

  };

};

/* EXPORT */

export default selector;
