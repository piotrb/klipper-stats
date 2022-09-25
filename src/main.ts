import { register } from 'prom-client'

import express from 'express'

import { doSubscribe, normalizeAndMergeStatus } from './moonraker'
import { initMetrics, emitStats } from './prom'
import { PrinterStatus } from './internal_status_data_api'
import { setupClient } from './moonraker_setup'

async function main() {
  const [client, extraHandler] = await setupClient()
  const metrics = initMetrics()

  const server = express()

  const status: PrinterStatus = {
    webhooks: {
      state: 'unknown',
      state_message: '',
    },
    fans: {},
    temps: {},
    mcus: {},
  }

  extraHandler.addEventListener('notify_status_update', (e: any) => {
    const detail = e.detail[0] as any
    normalizeAndMergeStatus(status, detail, extraHandler)
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
    doSubscribe(client, status, metrics, extraHandler)
  })

  extraHandler.addEventListener('webhooks_shutdown', (e: any) => {
    console.info('Printer Shutdown!')

    console.info('Resetting all fans to their shutdown speed')
    for (const fanName of Object.keys(status.fans)) {
      status.fans[fanName].speed = status.fans[fanName].shutdown_speed
    }

    console.info('Resetting all temps to zero power')
    for (const tempName of Object.keys(status.temps)) {
      if (status.temps[tempName].power > 0) {
        status.temps[tempName].power = 0
      }
    }
  })

  doSubscribe(client, status, metrics, extraHandler)

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
