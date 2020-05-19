export type CancellablePromise<T> = Promise<T> & {
  cancel(): void;
};

export type GetResponseType<
  Q extends CancellablePromise<any>
> = Q extends CancellablePromise<infer R> ? R : any;

export function enumLVToOptions(enumObj: { [key: string]: string }) {
  return Object.keys(enumObj).map(key => ({
    label: key,
    value: enumObj[key],
  }));
}

export function enumVLToOptions(enumObj: { [key: string]: string }) {
  return Object.keys(enumObj).map(key => ({
    label: enumObj[key],
    value: key,
  }));
}
