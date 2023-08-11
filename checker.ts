export default {
  check(
    text: string,
    langSettings: { open: string; close: string; class: string; },
    linebreak: string|null,
    foundFunction: (
      foundStart: number,
      foundEnd: number
    ) => void
  ) {
    //console.log(text)
    let first = getNextOpenAfter_orNegOne(text, langSettings, -1)
    let second = getNextCloseAfter_orEnd(text, langSettings, first)
    while (second >= 0) {
      console.log(`first-second: ${first} ${text.substring(first, second+1)} ${second}`)
      let nextFirst = getNextOpenAfter_orNegOne(text, langSettings, first)
      if (nextFirst > -1 && nextFirst < second) {
        //nested
        //we don't support nesting
          console.log(`first-nextFirst: ${first} ${text.substring(first, nextFirst+1)} ${nextFirst}`)
        first = nextFirst
        second = getNextCloseAfter_orEnd(text, langSettings, first)
      } else {
        let start =
          (first!=-1)
            ? first
            : 0
        let end =
          (second!=-1)
            ? second
            : text.length - 1
        let isBroken = 
          linebreak
            ? text.substring(start, end).contains(linebreak)
            : false
        if (!isBroken) {
          foundFunction(start, end)
        } else {
          console.log(`first-second: ${first} ${text.substring(first, second+1)} ${second}`)
          console.log(`is broken`)}
      }
      first = getNextOpenAfter_orNegOne(text, langSettings, second)
      second = getNextCloseAfter_orEnd(text, langSettings, first)
    }
  }
}

function getNextOpenAfter_orNegOne(
  text: string,
  langSettings: { open: string; close: string; class: string; },
  after: number
) {
  let toReturn = text.indexOf(langSettings.open, after+1);
  return toReturn
}

function getNextCloseAfter_orEnd(
  text: string,
  langSettings: { open: string; close: string; class: string; },
  after: number
) {
  let toReturn = 
    after==-1
      ? -1
      : text.indexOf(langSettings.close, after+1)
  return toReturn
}
