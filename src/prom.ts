import { Gauge } from 'prom-client'
import { PrinterStatus } from './internal_status_data_api'

const mcu_stat_gauges = {
  retransmit_seq: 'retransmit_seq',
  receive_seq: 'receive_seq',
  send_seq: 'send_seq',
  bytes_invalid: 'bytes_invalid',
  rto: 'rto',
  srtt: 'srtt',
  stalled_bytes: 'stalled_bytes',
  bytes_write: 'bytes_write',
  freq: 'freq',
  mcu_awake: 'mcu_awake',
  mcu_task_avg: 'mcu_task_avg',
  rttvar: 'rttvar',
  mcu_task_stddev: 'mcu_task_stddev',
  bytes_read: 'bytes_read',
  bytes_retransmit: 'bytes_retransmit',
  ready_bytes: 'ready_bytes',
} as const

const mcu_keys = Object.keys(mcu_stat_gauges) as (keyof typeof mcu_stat_gauges)[]

export function initMetrics() {
  const mcu_gauges = mcu_keys.reduce((obj, item) => {
    obj[item] = new Gauge({
      name: `moonraker_mcu_stats_${item}`,
      help: mcu_stat_gauges[item],
      labelNames: ['name'],
    })
    return obj
  }, {} as Record<string, Gauge<any>>)
  return {
    fan_speed: new Gauge({
      name: 'moonraker_fan_speed',
      help: 'fan speed',
      labelNames: ['name'],
    }),
    temp_temperature: new Gauge({
      name: 'moonraker_temp_temperature',
      help: 'temperature value',
      labelNames: ['name'],
    }),
    temp_target: new Gauge({
      name: 'moonraker_temp_target',
      help: 'temperature target',
      labelNames: ['name'],
    }),
    temp_power: new Gauge({
      name: 'moonraker_temp_power',
      help: 'temperature (heater) power',
      labelNames: ['name'],
    }),
    mcu_info: new Gauge({
      name: 'moonraker_mcu_info',
      help: 'non numeric data, value is always 1',
      labelNames: ['name', 'mcu', 'build_versions', 'version'],
    }),
    mcu_stats: {
      ...mcu_gauges,
    },
  } as const
}

export type Metrics = ReturnType<typeof initMetrics>

export async function emitStats(status: PrinterStatus, metrics: Metrics) {
  function _s<KT extends string, T extends any, VK extends keyof T, MT extends Gauge<never>>(
    o: { [key in KT]: T },
    k: KT,
    vk: VK,
    m: MT
  ) {
    if (o[k][vk] !== undefined) {
      m.set({ name: k }, o[k][vk] as any as number)
    }
  }
  // console.info(status)
  for (const fanName of Object.keys(status.fans)) {
    _s(status.fans, fanName, 'speed', metrics.fan_speed)
  }
  for (const tempName of Object.keys(status.temps)) {
    _s(status.temps, tempName, 'temperature', metrics.temp_temperature)
    _s(status.temps, tempName, 'power', metrics.temp_power)
    _s(status.temps, tempName, 'target', metrics.temp_target)
  }
  for (const mcuName of Object.keys(status.mcus)) {
    metrics.mcu_info.set(
      {
        name: mcuName,
        build_versions: status.mcus[mcuName].build_versions,
        version: status.mcus[mcuName].version,
        mcu: status.mcus[mcuName].mcu,
      },
      1
    )
    for (const mcuKey of mcu_keys) {
      if (status.mcus[mcuName].stats[mcuKey] !== undefined) {
        metrics.mcu_stats[mcuKey].set({ name: mcuName }, status.mcus[mcuName].stats[mcuKey] as any as number)
      }
    }
  }
}
