import { register } from 'prom-client'

import express from 'express'

import { setupClient, normalizeAndMergeStatus } from './moonraker'
import { PrinterStatus } from './stats'
import { initMetrics, emitStats } from './prom'

async function doSubscribe(
  client: Awaited<ReturnType<typeof setupClient>>[0],
  status: PrinterStatus,
  metrics: ReturnType<typeof initMetrics>
) {
  const objects = (await client.request('printer.objects.list', {})).objects

  const requestedObjects: any = {
    extruder: ['temperature', 'target', 'power'],
    heater_bed: ['temperature', 'target', 'power'],
    fan: [
      'speed',
      // 'rpm'
    ],
    mcu: null,
  }
  for (const object of objects) {
    if (object.match(/^temperature_sensor /)) {
      requestedObjects[object] = ['temperature']
    }
    if (object.match(/^fan_generic /)) {
      requestedObjects[object] = [
        'speed',
        // 'rpm'
      ]
    }
    if (object.match(/^temperature_fan /)) {
      requestedObjects[object] = [
        'speed',
        // 'rpm',
        'temperature',
        'target',
      ]
    }
    if (object.match(/^heater_fan /)) {
      requestedObjects[object] = ['speed', 'rpm']
    }
    if (object.match(/^mcu /)) {
      requestedObjects[object] = null
    }
  }
  const initialStatus = (
    await client.request('printer.objects.subscribe', {
      objects: requestedObjects,
    })
  ).status
  normalizeAndMergeStatus(status, initialStatus)
  emitStats(status, metrics).catch(e => {
    console.error('Emit Error:', e)
  })
}

async function main() {
  const [client, extraHandler] = await setupClient()
  const metrics = initMetrics()

  const server = express()

  const status: PrinterStatus = { fans: {}, temps: {}, mcus: {} }

  extraHandler.addEventListener('notify_status_update', (e: any) => {
    const detail = e.detail[0] as any
    normalizeAndMergeStatus(status, detail)
    emitStats(status, metrics).catch(e => {
      console.error('Emit Error:', e)
    })
  })

  extraHandler.addEventListener('notify_klippy_disconnected', (e: any) => {
    console.warn('Klippy Disconnected ...')
  })

  extraHandler.addEventListener('notify_klippy_ready', (e: any) => {
    console.info('Klippy Ready!')
    console.info('re-subscribing ...')
    doSubscribe(client, status, metrics)
  })

  doSubscribe(client, status, metrics)

  // Setup server to Prometheus scrapes:

  server.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType)
      res.end(await register.metrics())
    } catch (ex) {
      res.status(500).end(ex)
    }
  })

  const port = process.env.PORT || 3000
  console.log(`Server listening to ${port}, metrics exposed on /metrics endpoint`)
  server.listen(port)
}

main().catch(e => {
  console.error(e)
})
