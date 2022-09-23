interface FanStatus {
  speed?: number
  // rpm?: number
}
interface TempStatus {
  temperature?: number
  target?: number
  power?: number
}

interface McuStatus {
  build_versions: string
  version: string
  stats: {
    retransmit_seq:	number
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

interface McuStatusData {
  mcu_build_versions?: string
  mcu_version?: string
  last_stats: {
    retransmit_seq?: number,
    receive_seq?: number,
    send_seq?: number,
    bytes_invalid?: number,
    rto?: number,
    srtt?: number,
    stalled_bytes?: number,
    bytes_write?: number,
    freq?: number,
    mcu_awake?: number,
    mcu_task_avg?: number,
    rttvar?: number,
    mcu_task_stddev?: number,
    bytes_read?: number,
    bytes_retransmit?: number,
    ready_bytes?: number,
  }
}
interface StatusData<T> {
  [key: string]: T
}

interface TemperatureStatusData {
  temperature?: number,
  target?: number,
  power?: number,
}

interface FanStatusData {
  speed?: number
}

export function updateTemp(into: PrinterStatus, status: StatusData<TemperatureStatusData>, key: keyof typeof status, name: string) {
  if (into.temps[name] === undefined) {
    into.temps[name] = {}
  }
  setif(status[key], "temperature", into.temps[name], "temperature")
  setif(status[key], "target", into.temps[name], "target")
  setif(status[key], "power", into.temps[name], "power")
}

export function updateFan(into: PrinterStatus, status: StatusData<FanStatusData>, key: keyof typeof status, name: string) {
  if (into.fans[name] === undefined) {
    into.fans[name] = {}
  }
  setif(status[key], "speed", into.fans[name], "speed")
}

function setif<T, SK extends keyof S, S extends {[key in SK]?: T}, DK extends keyof D, D extends {[key in DK]?: T}>(src: S, key: SK, dst: D, dst_key: DK ) {
  if (src[key] !== undefined) {
    dst[dst_key] = src[key] as any as D[DK]
  }
}

export function updateMcu(into: PrinterStatus, status: StatusData<McuStatusData>, key: keyof typeof status, name: string) {
  if (into.mcus[name] === undefined) {
    into.mcus[name] = {
      build_versions: "?",
      version: "?",
      stats: {
        retransmit_seq:	0,
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
      }
    }
  }
  setif(status[key], "mcu_build_versions", into.mcus[name], "build_versions")
  setif(status[key], "mcu_version", into.mcus[name], "version")
  if(status[key].last_stats !== undefined) {
    const keys = [
      "retransmit_seq", "receive_seq", "send_seq", "bytes_invalid", "rto", "srtt", "stalled_bytes", "bytes_write", "freq",
      "mcu_awake", "mcu_task_avg", "rttvar", "mcu_task_stddev", "bytes_read", "bytes_retransmit", "ready_bytes"
    ] as const
    for(const fk of keys) {
      setif(status[key].last_stats, fk, into.mcus[name].stats, fk as any)
    }
  }
}
