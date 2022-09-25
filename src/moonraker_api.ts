export interface WebhooksData {
  state?: 'startup' | 'ready' | 'shutdown' | 'error'
  state_message?: string
}
export interface TemperatureStatusData {
  temperature?: number
  target?: number
  power?: number
}

export interface FanStatusData {
  speed?: number
}
export interface McuStatusData {
  mcu_build_versions?: string
  mcu_version?: string
  last_stats?: {
    retransmit_seq?: number
    receive_seq?: number
    send_seq?: number
    bytes_invalid?: number
    rto?: number
    srtt?: number
    stalled_bytes?: number
    bytes_write?: number
    freq?: number
    mcu_awake?: number
    mcu_task_avg?: number
    rttvar?: number
    mcu_task_stddev?: number
    bytes_read?: number
    bytes_retransmit?: number
    ready_bytes?: number
  }
  mcu_constants?: {
    MCU?: string
    CLOCK_FREQ?: number
    STATS_SUMSQ_BASE?: number
    CANBUS_FREQUENCY?: number
    RECEIVE_WINDOW?: number
    RESERVE_PINS_CAN?: string
    STEPPER_BOTH_EDGE?: number
    RESERVE_PINS_crystal?: string
    PCA9685_MAX?: number
    ADC_MAX?: number
    PWM_MAX?: number
    INITIAL_PINS?: string
    // BUS_PINS_*: string
  } & Record<string, unknown>
}
// export interface StatusData<T> {
//   [key: string]: T
// }
