import { FanStatusData, McuStatusData, TemperatureStatusData, WebhooksData } from './moonraker_api'
import { newFanStatus, newMcuStatus, newTempStatus, PrinterStatus, setif } from './internal_status_data_api'
import { MoonrakerEvent } from './MoonrakerEvent'

export function updateWebhooks(into: PrinterStatus, data: WebhooksData, name: string, eventTarget: EventTarget) {
  setif(data, 'state', into.webhooks, 'state')
  setif(data, 'state_message', into.webhooks, 'state_message')

  if (data.state === 'shutdown') {
    eventTarget.dispatchEvent(new MoonrakerEvent('webhooks_shutdown', { detail: data }))
  }
}

export function updateTemp(into: PrinterStatus, data: TemperatureStatusData, name: string, eventTarget: EventTarget) {
  if (into.temps[name] === undefined) into.temps[name] = newTempStatus()

  setif(data, 'temperature', into.temps[name], 'temperature')
  setif(data, 'target', into.temps[name], 'target')
  setif(data, 'power', into.temps[name], 'power')

  if (into.webhooks.state === 'shutdown') {
    if (into.temps[name].power > 0) into.temps[name].power = 0
    if (into.temps[name].target > 0) into.temps[name].target = 0
  }
}

export function updateFan(into: PrinterStatus, data: FanStatusData, name: string, eventTarget: EventTarget) {
  if (into.fans[name] === undefined) into.fans[name] = newFanStatus()

  setif(data, 'speed', into.fans[name], 'speed')

  if (into.webhooks.state === 'shutdown') {
    into.fans[name].speed = into.fans[name].shutdown_speed
  }
}

export function updateMcu(into: PrinterStatus, data: McuStatusData, name: string, eventTarget: EventTarget) {
  if (into.mcus[name] === undefined) into.mcus[name] = newMcuStatus()
  setif(data, 'mcu_build_versions', into.mcus[name], 'build_versions')
  setif(data, 'mcu_version', into.mcus[name], 'version')
  if (data.mcu_constants !== undefined) {
    setif(data.mcu_constants!, 'MCU', into.mcus[name], 'mcu')
  }
  if (data.last_stats !== undefined) {
    const keys = [
      'retransmit_seq',
      'receive_seq',
      'send_seq',
      'bytes_invalid',
      'rto',
      'srtt',
      'stalled_bytes',
      'bytes_write',
      'freq',
      'mcu_awake',
      'mcu_task_avg',
      'rttvar',
      'mcu_task_stddev',
      'bytes_read',
      'bytes_retransmit',
      'ready_bytes',
    ] as const
    for (const fk of keys) {
      setif(data.last_stats!, fk, into.mcus[name].stats, fk as any)
    }
  }
}
