import { Method } from 'axios';

export const contextKeyRegExp = /(\$\{[\w.[\]]+\})/g;
export const isSpreadRegExp = /^\$\{\.\.\.[\w.[\]]+\}$/;

export const fixTempPosition = `"$temp-position": ""`;
export const fixTempPositionRegExp = /"\$temp-position": ""\s*[\s,]/g;

export function fixSpreadValue(value: string) {
  return value.replace(fixTempPositionRegExp, '');
}

export const method = [
  'get',
  'delete',
  'head',
  'options',
  'post',
  'put',
  'patch',
  'link',
  'unlink',
];

export const methodOptions = method.map(item => ({
  label: item,
  value: item,
}));

export function hasBody(value?: Method) {
  switch (value) {
    case 'GET':
    case 'get':
    case 'DELETE':
    case 'delete':
    case 'HEAD':
    case 'head':
    case 'LINK':
    case 'link':
    case 'UNLINK':
    case 'unlink':
    case 'OPTIONS':
    case 'options':
      return false;

    case 'PATCH':
    case 'patch':
    case 'POST':
    case 'post':
    case 'PUT':
    case 'put':
      return true;
    default:
      return false;
  }
}

export function safeParse(
  str: any,
  callback?: (err: any) => void,
): { [key: string]: any } | undefined {
  try {
    if (!str) {
      return undefined;
    }
    return JSON.parse(str);
  } catch (error) {
    if (callback) callback(error);
    console.error(error, str);
  }
  return undefined;
}
