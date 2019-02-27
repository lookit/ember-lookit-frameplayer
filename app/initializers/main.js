import { registerDeprecationHandler } from '@ember/debug';

// Ignore all except imminent deprecation warnings. See
// https://guides.emberjs.com/release/configuring-ember/handling-deprecations/
export function initialize() {
  registerDeprecationHandler((message, options, next) => {
    if (options && options.until && options.until !== '3.5.0') {
      return;
    } else {
      next(message, options);
    }
  });
}

export default { initialize };
