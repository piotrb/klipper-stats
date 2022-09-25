import * as WebSocket from 'websocket'
import { JSONRPCClient, JSONRPCID, JSONRPCError } from 'json-rpc-2.0'
import { MoonrakerEvent } from './MoonrakerEvent'

interface JsonRpcPayload {
  jsonrpc: '2.0'
  method: string
  params: unknown[]
  id: JSONRPCID
  error: JSONRPCError
}

function setupWS(onConnect: (connection: WebSocket.connection) => void) {
  const klipper_host = process.env.KLIPPER_HOST
  const ws = new WebSocket.client()
  ws.on('connectFailed', error => {
    console.log('Connect Error: ' + error.toString())
  })
  ws.on('connect', connection => {
    console.log('WebSocket Client Connected')
    connection.on('error', function (error) {
      console.log('Connection Error: ' + error.toString())
    })
    connection.on('close', function (...args: any[]) {
      console.log('WS Connection Closed', ...args)
    })
    onConnect(connection)
  })
  ws.connect(`ws://${klipper_host}:7125/websocket`)
}

export function setupClient(): Promise<[JSONRPCClient, EventTarget]> {
  return new Promise((resolve, reject) => {
    setupWS(connection => {
      const extraHandler = new EventTarget()

      const client = new JSONRPCClient(async payload => {
        connection.send(JSON.stringify(payload))
      })

      connection.on('message', function (message) {
        if (message.type === 'utf8') {
          const payload = JSON.parse(message.utf8Data) as JsonRpcPayload
          client.receive(payload)
          // if (payload.method !== 'notify_proc_stat_update') {
          //   console.info(payload)
          // }
          extraHandler.dispatchEvent(new MoonrakerEvent(payload.method, { detail: payload.params }))
        }
      })

      resolve([client, extraHandler])
    })
  })
}

export type ClientType = Awaited<ReturnType<typeof setupClient>>[0]
