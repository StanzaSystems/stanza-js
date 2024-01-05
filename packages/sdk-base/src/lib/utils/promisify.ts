export type Promisify<T> = T extends PromiseLike<unknown> ? T : Promise<T>;
