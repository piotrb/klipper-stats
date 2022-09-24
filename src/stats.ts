import { FanStatusData, McuStatusData, StatusData, TemperatureStatusData } from './ moonraker_api'
import { newFanStatus, newMcuStatus, newTempStatus, PrinterStatus, setif } from './internal_status_data_api'

export function updateTemp(
  into: PrinterStatus,
  status: StatusData<TemperatureStatusData>,
  key: keyof typeof status,
  name: string
) {
  if (into.temps[name] === undefined) into.temps[name] = newTempStatus()

  setif(status[key], 'temperature', into.temps[name], 'temperature')
  setif(status[key], 'target', into.temps[name], 'target')
  setif(status[key], 'power', into.temps[name], 'power')
}

export function updateFan(
  into: PrinterStatus,
  status: StatusData<FanStatusData>,
  key: keyof typeof status,
  name: string
) {
  if (into.fans[name] === undefined) into.fans[name] = newFanStatus()

  setif(status[key], 'speed', into.fans[name], 'speed')
}

export function updateMcu(
  into: PrinterStatus,
  status: StatusData<McuStatusData>,
  key: keyof typeof status,
  name: string
) {
  if (into.mcus[name] === undefined) into.mcus[name] = newMcuStatus()
  setif(status[key], 'mcu_build_versions', into.mcus[name], 'build_versions')
  setif(status[key], 'mcu_version', into.mcus[name], 'version')
  if (status[key].mcu_constants !== undefined) {
    setif(status[key].mcu_constants!, 'MCU', into.mcus[name], 'mcu')
  }
  if (status[key].last_stats !== undefined) {
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
      setif(status[key].last_stats!, fk, into.mcus[name].stats, fk as any)
    }
  }
}
