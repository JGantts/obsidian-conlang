export default {
  check(
    text: string,
    langSettings: { open: string; close: string; class: string; },
    linebreak: string,
    foundFunctionIn: (
      foundStart: number,
      foundEnd: number
    ) => void,
    foundNowrapFunctionIn: (
      foundStart: number,
      foundEnd: number
    ) => void,
    errorFunctionIn: (
      foundStart: number,
      foundEnd: number
    ) => void
  ) {
    let foundFunction = (
      foundStart: number,
      foundEnd: number
    ) => {
      /*console.log(
        `foundFunction: ${foundStart} `
        +`${text.substring(foundStart-2, foundStart)}`
        +`_${text.substring(foundStart, foundEnd+1)}_`
        +`${text.substring(foundEnd+1, foundEnd+3)}`
        +` ${foundEnd}`)*/
      if (text.substring(foundStart, foundEnd).match(/\s+/)) {
        let nowrapOneStart = foundStart + langSettings.open.length
        let nowrapTwoEnd = foundEnd - langSettings.close.length
        foundNowrapFunctionIn(
          foundStart,
          nowrapOneStart + (text.codePointAt(nowrapOneStart)?.toString().length ?? 1)
        )
        foundFunctionIn(
          nowrapOneStart + (text.codePointAt(nowrapOneStart)?.toString().length ?? 1),
          nowrapTwoEnd - (text.codePointAt(nowrapTwoEnd)?.toString().length ?? 1)
        )
        foundNowrapFunctionIn(
          nowrapTwoEnd - (text.codePointAt(nowrapTwoEnd)?.toString().length ?? 1),
          foundEnd
        )
        console.log(text.substring(foundStart, foundEnd))
        console.log(text.substring(foundStart, nowrapOneStart + (text.codePointAt(nowrapOneStart)?.toString().length ?? 1)))
        console.log(text.substring(nowrapTwoEnd - (text.codePointAt(nowrapTwoEnd)?.toString().length ?? 1), foundEnd))
        console.log('---')
      } else {
        foundNowrapFunctionIn(
          foundStart,
          foundEnd
        )
        /*foundFunctionIn(
          foundStart,
          foundEnd
        )
        nowrapFunctionIn(
          foundStart,
          foundEnd
        )*/
      }
    }
    let errorFunction = (
      foundStart: number,
      foundEnd: number
    ) => {
      /*console.log(
        `foundFunction: ${foundStart} `
        +`${text.substring(foundStart-2, foundStart)}`
        +`_${text.substring(foundStart, foundEnd+1)}_`
        +`${text.substring(foundEnd+1, foundEnd+3)}`
        +` ${foundEnd}`)*/
        errorFunctionIn(foundStart, foundEnd)
    }
    let maybeFoundFunction = (
      maybeFoundStart: number|null,
      maybeFoundEnd: number|null
    ) => {
      if (maybeFoundStart!=null && maybeFoundEnd!=null) {
        return
      } else if (maybeFoundStart!=null) {
        if (maybeFoundStart==1) {
          console.log(text)
          console.log(new Error().stack)
        }
        errorFunction(maybeFoundStart!, maybeFoundStart!)
      } else if (maybeFoundEnd!=null) {
        errorFunction(maybeFoundEnd!, maybeFoundEnd!)
      }
    }
    let initial_orNull = getNextXAfter_orNull(text, langSettings.open, true, -1)
    let final_orNull = getNextXAfter_orNull(text, langSettings.close, false, initial_orNull)
    let final_orEnd = getNextXAfter_orEnd(text, langSettings.close, false, initial_orNull)
    //console.log(`${initial_orNull} ${final_orNull}`)
    //maybeFoundFunction(initial_orNull, final_orNull)
    while (initial_orNull != null) {
      const nextInitial_orNull = getNextXAfter_orNull(text, langSettings.open, true, initial_orNull!)
      const nextInitial_orEnd = getNextXAfter_orEnd(text, langSettings.open, true, initial_orNull!)
      const nextInitialFound = nextInitial_orNull!=null
      const nextLinebreak_orNull = getNextXAfter_orNull(text, linebreak, null, initial_orNull!)
      const nextLinebreak_orEnd = getNextXAfter_orEnd(text, linebreak, null, initial_orNull!)
      const nextLinebreakFound = nextLinebreak_orNull!=null
      const finalFound = () => final_orNull!=null
      const doubleInitial = 
        langSettings.open != langSettings.close
        && nextInitialFound
        && nextInitial_orNull! < nextLinebreak_orEnd
        && 
        (
          !finalFound()
          || nextInitial_orNull! < final_orNull!
        )
      if (doubleInitial) {
        errorFunction(initial_orNull!, initial_orNull!)
        initial_orNull = nextInitial_orNull!
        final_orNull = getNextXAfter_orNull(text, langSettings.close, false, initial_orNull)
        final_orEnd = getNextXAfter_orEnd(text, langSettings.close, false, initial_orNull)
      }
      const initialAtStart = 
        initial_orNull! == 0
        || text.substring(
            initial_orNull!-linebreak.length,
            initial_orNull!
          ) == linebreak;
      final_orNull =
        initialAtStart
          ? final_orEnd
          : final_orNull;
      let aFinalFound = final_orNull!=null
      const isBroken =
        aFinalFound
        && existsXInBewtween(text, linebreak, null, initial_orNull!, final_orNull!)
      const isOpenEnded = initialAtStart && (isBroken || !aFinalFound)
      if (isOpenEnded) {
        openEnded(
          text,
          langSettings,
          linebreak,
          initial_orNull!,
          foundFunction,
          errorFunction
        )
      } else if (initial_orNull!=null && final_orNull!=null && !isBroken) {
        foundFunction(
          initial_orNull!,
          final_orNull
        )
      } else if (isBroken) {
        errorFunction(initial_orNull, initial_orNull)
      } else {
        maybeFoundFunction(initial_orNull, final_orNull)
      }

      if (langSettings.open == langSettings.close) {
        initial_orNull = getNextXAfter_orNull(text, langSettings.open, true, final_orNull!)
      } else {
        initial_orNull = getNextXAfter_orNull(text, langSettings.open, true, initial_orNull!)
      }
      final_orNull = getNextXAfter_orNull(text, langSettings.close, false, initial_orNull)
      final_orEnd = getNextXAfter_orEnd(text, langSettings.close, false, initial_orNull)
    }
    maybeFoundFunction(initial_orNull, final_orNull)
  }
}

function openEnded(
  text: string,
  langSettings: { open: string; close: string; class: string; },
  linebreak: string,
  initial: number,
  foundFunction: (
    openFirstChar: number,
    closeLastChar: number
  ) => void,
  errorFunction: (
    foundStart: number,
    foundEnd: number
  ) => void
) {
  const nextLinebreak_orEnd = getNextXAfter_orEnd(text, linebreak, null, initial)
  let isCompleteClosedEnded: boolean
  let potentialFinal = getNextXAfter_orNull(text, langSettings.close, false, initial)
  if (potentialFinal!=null) {
    const potentialFinalIsEnd = potentialFinal==text.length-langSettings.close.length
    if (!potentialFinalIsEnd) {
      let potentialSubsequentLineBreak =
        getNextXAfter_orNull(text, linebreak, null, potentialFinal!)
      const potentialFinalIsAtEndOfParagraph = 
        ((potentialFinal!)+langSettings.close.length)
        == potentialSubsequentLineBreak
      if (!potentialFinalIsAtEndOfParagraph) {
        potentialFinal = null
      }
    }
  }
  if (potentialFinal==null) {
    isCompleteClosedEnded = false
  } else {
    let currentNewline: number|null = initial
    let isDirty = false
    while (currentNewline!=null && !isDirty) {
      let lastNewlineInChainPrev: number = currentNewline
      let done = false
      while (!done) {
        if (
          text.substring(
            lastNewlineInChainPrev,
            lastNewlineInChainPrev+linebreak.length
          )==linebreak
        ) {
          lastNewlineInChainPrev += linebreak.length
        } else {
          done = true
        }
      }
      lastNewlineInChainPrev -= linebreak.length
      currentNewline = getNextXAfter_orEnd(text, linebreak, null, lastNewlineInChainPrev)
      let insideFinal = (currentNewline??0) <= potentialFinal+linebreak.length
      let atFinal = (currentNewline??0) == potentialFinal+linebreak.length
      if (!insideFinal) {
        currentNewline = null
      }
      if (
        currentNewline != null 
        && !isDirty
      ) {
        const thisOpen_start = lastNewlineInChainPrev + linebreak.length
        const thisOpen_end = thisOpen_start + langSettings.open.length
        const thisClose_end = currentNewline!
        const thisClose_start = thisClose_end - langSettings.close.length

        const thisLine_start = thisOpen_start
        const thisLineExclOpen_start = thisOpen_end
        const thisLine_end = thisClose_end
        const thisLineExclClose_end = thisClose_start

        //dirty if first char is not open
        isDirty = isDirty
          || text.substring(
            thisOpen_start,
            thisOpen_end
          ) != langSettings.open

        //dirty if any char except first is open
        isDirty = isDirty
          || existsXInBewtween(
            text,
            langSettings.open,
            true,
            thisLineExclOpen_start,
            thisLine_end
          )

        if (!atFinal) {
          //dirty if any char close
          isDirty = isDirty
            || existsXInBewtween(
              text,
              langSettings.close,
              false,
              thisLine_start,
              thisLine_end
            )
        } else {
          //dirty if last char not close
          isDirty = isDirty
          || text.substring(
            thisClose_start,
            thisClose_end
          ) != langSettings.close
        }
      }
    }
    if (isDirty) {
      //console.log("wut "+text.substring(lastNewlineInChainPrev+linebreak.length+1, currentNewline))
      isCompleteClosedEnded = false
    } else {
      isCompleteClosedEnded = true
    }
  }
  if (isCompleteClosedEnded) {
    foundFunction(
      initial,
      nextLinebreak_orEnd
    )
  } else {
    errorFunction(initial, initial)
  }
}

function getNextXAfter_orNull(
  text: string,
  x_string: string,
  xIsOpen: boolean|null,
  after: number|null
) {
  if (after == null) {
    return null
  }
  const re = buildRegEx(x_string, xIsOpen)
  let searchStart = after+1
  let substring = 
    text.substring(searchStart)
  let nextAfter = substring.search(re)
  let toReturn = (
    nextAfter == -1
      ? null
      : nextAfter + searchStart
  );
  return toReturn
}

function getNextXAfter_orEnd(
  text: string,
  x_string: string,
  xIsOpen: boolean|null,
  after: number|null
): number {
  if (after == null) {
    return text.length-1
  }
  const re = buildRegEx(x_string, xIsOpen)
  let searchStart = after+1
  let nextAfter = 
    text.substring(searchStart).search(re)
  return (
    nextAfter == -1
      ? text.length-1
      : nextAfter + searchStart
  );
}

function existsXInBewtween(
  text: string,
  x_string: string,
  xIsOpen: boolean|null,
  initial: number,
  final: number,
): boolean {
  const re = buildRegEx(x_string, xIsOpen)
  return text.substring(initial!, final!).search(re) != -1; 
}

function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function buildRegEx(x_string: string, xIsOpen: boolean|null) {
  let escaped = escapeRegExp(x_string)
  let re: RegExp
  let whiteSpaceOrStart = "\\s|^"
  let whiteSpaceOrEnd = "\\s|$"
  let nonWhitespace = `\\S`
  let sentenceBounaryChars = `\\.|,`
  let hyphensDahses = `-|~`
  if (xIsOpen==true) {
    re = new RegExp(`(?<=${whiteSpaceOrStart}|${hyphensDahses})${escaped}(?=${nonWhitespace})`);
  } else if (xIsOpen==false) {
    re = new RegExp(`(?<=${nonWhitespace}|${sentenceBounaryChars})${escaped}(?=${whiteSpaceOrEnd}|${sentenceBounaryChars}|${hyphensDahses})`);
  } else {
    re = new RegExp(`${escaped}`);
  }
  return re
}
