import { isRegExp } from 'util/types'

type MatchHandler = (data: unknown, name: string) => void
type ElseHandler = (data: unknown, key: string) => void

function normalizeMatchers(matcher: string | RegExp | (string | RegExp)[]): RegExp[] {
  if (Array.isArray(matcher)) {
    return matcher.map(m => (isRegExp(m) ? m : new RegExp(`^(?<name>${m})\$`)))
  } else {
    return normalizeMatchers([matcher])
  }
}

export class UpdateHelper {
  private matchers: [RegExp[], MatchHandler][] = []
  private elseHandler: ElseHandler = () => {}

  on(matcher: string | RegExp | (string | RegExp)[], handler: MatchHandler) {
    const matchers = normalizeMatchers(matcher)
    this.matchers.push([matchers, handler])
  }

  onElse(handler: ElseHandler) {
    this.elseHandler = handler
  }

  handle(key: string, status: any) {
    var anyMatched = false
    for (const [matchers, handler] of this.matchers) {
      var matched = false
      for (const matcher of matchers) {
        const match = key.match(matcher)
        if (match && !matched) {
          matched = true
          anyMatched = true
          if (match.groups?.['name'] === undefined) {
            throw new Error('must specify <name> match group')
          }
          const name = match.groups?.['name']
          handler(status[key], name)
        }
      }
    }
    if (!anyMatched) {
      this.elseHandler(status[key], key)
    }
  }
}
