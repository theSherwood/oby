
/* IMPORT */

import {SYMBOL_OBSERVABLE_FROZEN} from '~/constants';
import target from '~/methods/target';
import type {ListenerFunction, Observable, ObservableReadonly} from '~/types';

/* MAIN */

const on = <T> ( observable: Observable<T> | ObservableReadonly<T>, listener: ListenerFunction<T> ): void => {

  if ( SYMBOL_OBSERVABLE_FROZEN in observable ) return;

  target ( observable ).registerListener ( listener );

};

/* EXPORT */

export default on;
