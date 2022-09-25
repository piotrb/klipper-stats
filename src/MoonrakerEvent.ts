export class MoonrakerEvent extends Event {
  public detail: any
  constructor(type: string, eventInitDict?: (EventInit & { detail?: any }) | undefined) {
    super(type, eventInitDict)
    this.detail = eventInitDict?.detail
  }
}
