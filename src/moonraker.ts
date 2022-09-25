import { PrinterStatus, setif } from './internal_status_data_api'
import { ClientType } from './moonraker_setup'
import { emitStats, Metrics } from './prom'

import { updateFan, updateTemp, updateMcu, updateWebhooks } from './stats'
import { UpdateHelper } from './UpdateHelper'

async function determineSubscriptionRequestedObjects(client: ClientType) {
  const objects = (await client.request('printer.objects.list', {})).objects

  // null value = all sub-keys

  const requestedObjects: any = {
    webhooks: null,
    extruder: ['temperature', 'target', 'power'],
    heater_bed: ['temperature', 'target', 'power'],
    mcu: null,
  }

  for (const object of objects) {
    if (object.match(/^temperature_sensor /)) {
      requestedObjects[object] = ['temperature']
    }
    if (object.match(/^(?:fan$|fan_generic |heater_fan )/)) {
      requestedObjects[object] = ['speed']
    }
    if (object.match(/^temperature_fan /)) {
      requestedObjects[object] = ['speed', 'temperature', 'target']
    }
    if (object.match(/^mcu /)) {
      requestedObjects[object] = null
    }
  }
  return requestedObjects
}

export async function doSubscribe(
  client: ClientType,
  status: PrinterStatus,
  metrics: Metrics,
  eventTarget: EventTarget
) {
  const requestedObjects = await determineSubscriptionRequestedObjects(client)

  const config = (
    await client.request('printer.objects.query', {
      objects: {
        configfile: null,
      },
    })
  ).status.configfile

  const initialStatus = (
    await client.request('printer.objects.subscribe', {
      objects: requestedObjects,
    })
  ).status

  normalizeAndMergeStatus(status, initialStatus, eventTarget)

  mergeConfigToStatus(status, config, eventTarget)

  emitStats(status, metrics).catch(e => {
    console.error('Emit Error:', e)
  })
  console.info('Subscription ready')
}

function mergeConfigToStatus(into: PrinterStatus, config: any, eventTarget: EventTarget) {
  // copy in shutdown speed for all fans
  const config_sections = ['temperature_fan', 'fan', 'heater_fan']
  if (config && (config as any).settings) {
    const settings = (config as any).settings
    for (const key of Object.keys(settings)) {
      for (const section of config_sections) {
        const match = key.match(new RegExp(`^${section}(?: (?<name>.+)|$)`))
        if (match) {
          const name = match.groups?.['name'] ?? key
          setif(settings[key], 'shutdown_speed', into.fans[name], 'shutdown_speed')
        }
      }
    }
  }
}

export function normalizeAndMergeStatus(into: PrinterStatus, status: any, eventTarget: EventTarget) {
  const updateHelper = new UpdateHelper()

  updateHelper.on(['fan', /^(?:temperature_fan|fan_generic|heater_fan) (?<name>.+)$/], (data, name) => {
    updateFan(into, data as any, name, eventTarget)
  })

  updateHelper.on(['extruder', 'heater_bed', /^(?:temperature_sensor|temperature_fan) (?<name>.+)$/], (data, name) => {
    updateTemp(into, data as any, name, eventTarget)
  })

  updateHelper.on(['mcu', /^(?:mcu) (?<name>.+)$/], (data, name) => {
    updateMcu(into, data as any, name, eventTarget)
  })

  updateHelper.on(['webhooks'], (data, name) => {
    updateWebhooks(into, data as any, name, eventTarget)
  })

  updateHelper.onElse((data, key) => {
    console.info('unmatched update:', `key: ${key}`, 'data:', data)
  })

  for (const key of Object.keys(status)) {
    updateHelper.handle(key, status)
  }
}
