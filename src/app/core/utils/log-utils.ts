import {Logger} from 'tslog';
import {environment} from '../../../environments/environment';

export function getLogger(name: string): Logger<any> {
  let minLevel = 0; // 0 = silly
  if (environment.production) {
    minLevel = 3; // 4 = warn
  }

  return new Logger({
    name: name,
    type: 'pretty',
    minLevel: minLevel,
    hideLogPositionForProduction: environment.production,
  });
}
