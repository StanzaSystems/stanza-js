self.onmessage = (ev: Event): void => {
  console.log(ev)
  poll('local')
}

function poll (url: string, time?: number): void {
  if (url === 'local') {
    console.log('stanza is running in local mode for features')
    return
  }
  setTimeout(() => {
    void getFeatures(url)
  }, time ?? 30)
}

async function getFeatures (url: string): Promise<void> {
  const features = await fetch(url)
  self.postMessage(features)
}

export {}
