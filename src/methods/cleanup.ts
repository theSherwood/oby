
/* IMPORT */

import {OWNER} from '~/constants';
import type {CleanupFunction, Callable} from '~/types';

/* MAIN */

const cleanup = ( fn: Callable<CleanupFunction> ): void => {

  OWNER.current.registerCleanup ( fn );

};

/* EXPORT */

export default cleanup;
