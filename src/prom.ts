import { Gauge } from 'prom-client'
import { PrinterStatus } from './stats'

export function initMetrics() {
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
  for (const fanName of Object.keys(status.fans)) {
    _s(status.fans, fanName, 'speed', metrics.fan_speed)
  }
  for (const tempName of Object.keys(status.temps)) {
    _s(status.temps, tempName, 'temperature', metrics.temp_temperature)
    _s(status.temps, tempName, 'power', metrics.temp_power)
    _s(status.temps, tempName, 'target', metrics.temp_target)
  }
}
