import { type NextPage } from 'next'
import React, { useEffect, useState } from 'react'

let intervalHandle: ReturnType<typeof setInterval> | undefined
const DemoPage: NextPage = () => {
  const [rps, setRps] = useState(10)
  const [running, setRunning] = useState(false)
  const [requests, setRequests] = useState(Array<{
    promise: Promise<unknown>
    data: any
    status: string
    statusCode?: number
  }>())

  const [dataEndpoint, setDataEndpoint] = useState('http://localhost:3002/aService/simple-data')

  useEffect(() => {
    clearInterval(intervalHandle)

    if (running) {
      intervalHandle = setInterval(() => {
        const newReqPromise = fetch(dataEndpoint)

        setRequests(requests => [{
          promise: newReqPromise,
          data: undefined,
          status: 'started'
        }, ...requests])
        void newReqPromise.then(async (res) => {
          if (res.status === 200) {
            const data = await res.json()
            return {
              data,
              status: 'ok',
              statusCode: res.status
            }
          }
          return {
            data: await res.text(),
            status: 'failed',
            statusCode: res.status
          }
        }).then(result => {
          setRequests(requests => requests.map((v) => v.promise !== newReqPromise
            ? v
            : {
                ...v,
                ...result
              }))
        })
      }, 1000 / rps)
    }
  }, [running, rps, dataEndpoint])

  // const router = useRouter()
  return (
    <>
      <h1>Node SDK Demo</h1>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyItems: 'center',
        alignItems: 'center',
        margin: '8px',
        columnGap: '4px'
      }}>
        <label id="demo-enpoint-select">Requests per second</label>
        <input
          style={{
            flexGrow: 1,
            margin: 0
          }}
          type="number"
          placeholder="Request per second"
          value={rps}
          onChange={evt => {
            setRps(evt.target.value as any)
          }}/>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyItems: 'center',
        alignItems: 'center',
        margin: '8px',
        columnGap: '4px'
      }}>
        <label id="demo-enpoint-select">Endpoint</label>
        <select
          style={{
            flexGrow: 1
          }}
          id="demo-enpoint-select"
          value={dataEndpoint}
          onChange={evt => {
            setDataEndpoint(evt.target.value)
          }}>
          <option value="http://localhost:3002/aService/simple-data">Simple data</option>
          <option value="http://localhost:3002/aService/data">Chained data</option>
          <option value="http://localhost:3002/aService/shared-data">Shared data 1</option>
          <option value="http://localhost:3002/yetAnotherService/shared-data">Shared data 2</option>
        </select>
      </div>
      <button className="IconButton checkout-style-background badge-container"
              aria-label="Update dimensions"
              onClick={() => {
                setRunning(!running)
              }}
      >
        {running ? 'Stop' : 'Start'}
      </button>
      <button className="IconButton checkout-style-background badge-container"
              aria-label="Update dimensions"
              onClick={() => {
                setRequests([])
              }}
      >
        Clear
      </button>

      <div>
        {requests.map(r => (
          <div style={{
            padding: 4,
            margin: 4,
            border: '2px solid black',
            borderColor: r.statusCode === undefined
              ? undefined
              : r.statusCode === 200
                ? 'lightgreen'
                : 'red'
          }}>{JSON.stringify({ ...r, promise: undefined })}</div>
        ))}
      </div>
    </>
  )
}

export default DemoPage
