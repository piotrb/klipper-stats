interface FanStatus {
  speed?: number
  rpm?: number
}
interface TempStatus {
  temperature?: number
  target?: number
  power?: number
}
export interface PrinterStatus {
  fans: Record<string, FanStatus>
  temps: Record<string, TempStatus>
}
export function updateTemp(into: PrinterStatus, status: any, key: string, name: string) {
  if (into.temps[name] === undefined) {
    into.temps[name] = {}
  }
  if (status[key].temperature !== undefined) {
    into.temps[name].temperature = status[key].temperature
  }
  if (status[key].target !== undefined) {
    into.temps[name].target = status[key].target
  }
  if (status[key].power !== undefined) {
    into.temps[name].power = status[key].power
  }
}

export function updateFan(into: PrinterStatus, status: any, key: string, name: string) {
  if (into.fans[name] === undefined) {
    into.fans[name] = {}
  }
  if (status[key].speed !== undefined) {
    into.fans[name].speed = status[key].speed
  }
  if (status[key].rpm !== undefined) {
    into.fans[name].rpm = status[key].rpm
  }
}
