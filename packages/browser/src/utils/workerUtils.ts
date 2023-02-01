// from this blog - maybe good maybe bad who even knows:
// https://medium.com/@dee_bloo/make-multithreading-easier-with-inline-web-workers-a58723428a42
// eslint-disable-next-line @typescript-eslint/ban-types
export function createWorker (fn: Function): Worker {
  const blob = new Blob(['self.onmessage = ', fn.toString()], { type: 'text/javascript' })
  const url = URL.createObjectURL(blob)

  return new Worker(url)
}
