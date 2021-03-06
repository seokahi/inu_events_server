import {serializeError} from 'serialize-error';

export function stringifyError(error: any, includeStackTrace: boolean = true): string {
  const {name, message, stack} = serializeError(error);

  const stringified = includeStackTrace ? {name, message, stack} : {name, message};

  return JSON.stringify(stringified);
}

export function printError(error: any, includeStackTrace: boolean = true) {
  console.error(stringifyError(error, includeStackTrace));
}
