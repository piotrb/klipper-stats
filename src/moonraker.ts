import { JSONRPCClient, JSONRPCID, JSONRPCError } from 'json-rpc-2.0'

import * as WebSocket from 'websocket'

import { updateFan, updateTemp, PrinterStatus } from './stats'

interface JsonRpcPayload {
  jsonrpc: '2.0'
  method: string
  params: unknown[]
  id: JSONRPCID
  error: JSONRPCError
}

class CustomEvent extends Event {
  public detail: any
  constructor(type: string, eventInitDict?: (EventInit & { detail?: any }) | undefined) {
    super(type, eventInitDict)
    this.detail = eventInitDict?.detail
  }
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
    connection.on('close', function () {
      console.log('echo-protocol Connection Closed')
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
          extraHandler.dispatchEvent(new CustomEvent(payload.method, { detail: payload.params }))
        }
      })

      resolve([client, extraHandler])
    })
  })
}

export function normalizeAndMergeStatus(into: PrinterStatus, status: any) {
  for (const key of Object.keys(status)) {
    if (key === 'extruder') {
      // extruder
      updateTemp(into, status, key, 'extruder')
    } else if (key === 'fan') {
      // fan
      updateFan(into, status, key, 'cnc')
    } else if (key === 'heater_bed') {
      // heater_bed
      updateTemp(into, status, key, 'bed')
    } else if (key.match(/^temperature_sensor /)) {
      // temperature_sensor
      const name = key.match(/^temperature_sensor (.+)/)![1]
      updateTemp(into, status, key, name)
    } else if (key.match(/^temperature_fan /)) {
      // temperature_fan
      const name = key.match(/^temperature_fan (.+)/)![1]
      updateTemp(into, status, key, name)
      updateFan(into, status, key, name)
    } else if (key.match(/^fan_generic /)) {
      // fan_generic
      const name = key.match(/^fan_generic (.+)/)![1]
      updateFan(into, status, key, name)
    } else if (key.match(/^heater_fan /)) {
      // heater_fan
      const name = key.match(/^heater_fan (.+)/)![1]
      updateFan(into, status, key, name)
    } else {
      console.info(key, status[key])
    }
  }
}
