interface FanStatus {
  speed: number
  // rpm?: number
}
interface TempStatus {
  temperature: number
  target: number
  power: number
}

interface McuStatus {
  build_versions: string
  version: string
  mcu: string
  stats: {
    retransmit_seq: number
    receive_seq: number
    send_seq: number
    bytes_invalid: number
    rto: number
    srtt: number
    stalled_bytes: number
    bytes_write: number
    freq: number
    mcu_awake: number
    mcu_task_avg: number
    rttvar: number
    mcu_task_stddev: number
    bytes_read: number
    bytes_retransmit: number
    ready_bytes: number
  }
}
export interface PrinterStatus {
  fans: Record<string, FanStatus>
  temps: Record<string, TempStatus>
  mcus: Record<string, McuStatus>
}

export function newFanStatus(): FanStatus {
  return {
    speed: -1,
  }
}

export function newTempStatus(): TempStatus {
  return {
    temperature: -1,
    target: -1,
    power: -1,
  }
}

export function newMcuStatus(): McuStatus {
  return {
    build_versions: '?',
    version: '?',
    mcu: '?',
    stats: {
      retransmit_seq: 0,
      receive_seq: 0,
      send_seq: 0,
      bytes_invalid: 0,
      rto: 0,
      srtt: 0,
      stalled_bytes: 0,
      bytes_write: 0,
      freq: 0,
      mcu_awake: 0,
      mcu_task_avg: 0,
      rttvar: 0,
      mcu_task_stddev: 0,
      bytes_read: 0,
      bytes_retransmit: 0,
      ready_bytes: 0,
    },
  }
}

export function setif<
  T,
  SK extends keyof S,
  S extends { [key in SK]?: T },
  DK extends keyof D,
  D extends { [key in DK]?: T }
>(src: S, key: SK, dst: D, dst_key: DK) {
  if (src[key] !== undefined) {
    dst[dst_key] = src[key] as any as D[DK]
  }
}
//
