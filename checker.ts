function unicodeLength(unicodeText: string, index: number) {
  return (String.fromCodePoint(unicodeText.codePointAt(index) ?? 65).length ?? 1)
}

enum CheckFor {
  Open,
  Close,
  Anything,
}

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
      console.log("---")
      console.log(text.substring(foundStart-2, foundEnd+2))
      console.log(text.substring(foundStart, foundEnd))
      if (text.substring(foundStart, foundEnd).match(/\s+/)) {
        let nowrapOneStart = foundStart
        let nowrapOneCharStart = foundStart
        let nowrapOneTextStart = nowrapOneCharStart + unicodeLength(text, nowrapOneCharStart)
        let nowrapOneTextEnd = nowrapOneTextStart + unicodeLength(text, nowrapOneTextStart) - 1
        let nowrapOneEnd = nowrapOneTextEnd

        let nowrapTwoEnd = foundEnd
        let nowrapTwoCharEnd = nowrapTwoEnd
        let nowrapTwoTextEnd = nowrapTwoCharEnd - unicodeLength(text, nowrapTwoCharEnd)
        let nowrapTwoTextStart = nowrapTwoTextEnd - unicodeLength(text, nowrapTwoTextEnd) + 1
        let nowrapTwoStart = nowrapTwoTextStart
        
        foundNowrapFunctionIn(
          nowrapOneStart,
          nowrapOneEnd
        )
        foundFunctionIn(
          nowrapOneEnd + 1,
          nowrapTwoStart - 1
        )
        foundNowrapFunctionIn(
          nowrapTwoStart,
          nowrapTwoEnd
        )
      } else {
        foundNowrapFunctionIn(
          foundStart,
          foundEnd
        )
      }
    }


    /*
    * Beign searching
    */
    let initial_orNull = getNextXAfter_orNull(text, langSettings.open, CheckFor.Open, -1)
    let final_orNull = getNextXAfter_orNull(text, langSettings.close, CheckFor.Close, initial_orNull)
    let final_orEnd = getNextXAfter_orEnd(text, langSettings.close, CheckFor.Close, initial_orNull)
    while (initial_orNull != null) {
      const nextInitial_orNull = getNextXAfter_orNull(text, langSettings.open, CheckFor.Open, initial_orNull!)
      const nextInitialFound = nextInitial_orNull!=null
      const nextLinebreak_orEnd = getNextXAfter_orEnd(text, linebreak, CheckFor.Anything, initial_orNull!)
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
        initial_orNull = nextInitial_orNull!
        final_orNull = getNextXAfter_orNull(text, langSettings.close, CheckFor.Close, initial_orNull)
        final_orEnd = getNextXAfter_orEnd(text, langSettings.close, CheckFor.Close, initial_orNull)
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
        && existsXInBewtween(text, linebreak, CheckFor.Anything, initial_orNull!, final_orNull!)
      const isOpenEnded = initialAtStart && (isBroken || !aFinalFound)
      if (isOpenEnded) {
        openEnded(
          text,
          langSettings,
          linebreak,
          initial_orNull!,
          foundFunction
        )
      } else if (initial_orNull!=null && final_orNull!=null && !isBroken) {
        foundFunction(
          initial_orNull!,
          final_orNull
        )
      }

      if (langSettings.open == langSettings.close) {
        initial_orNull = getNextXAfter_orNull(text, langSettings.open, CheckFor.Open, final_orNull!)
      } else {
        initial_orNull = getNextXAfter_orNull(text, langSettings.open, CheckFor.Open, initial_orNull!)
      }
      final_orNull = getNextXAfter_orNull(text, langSettings.close, CheckFor.Close, initial_orNull)
      final_orEnd = getNextXAfter_orEnd(text, langSettings.close, CheckFor.Close, initial_orNull)
    }
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
  ) => void
) {
  const nextLinebreak_orEnd = getNextXAfter_orEnd(text, linebreak, CheckFor.Anything, initial)
  let isCompleteClosedEnded: boolean
  let potentialFinal = getNextXAfter_orNull(text, langSettings.close, CheckFor.Close, initial)
  if (potentialFinal!=null) {
    const potentialFinalIsEnd = potentialFinal==text.length-langSettings.close.length
    if (!potentialFinalIsEnd) {
      let potentialSubsequentLineBreak =
        getNextXAfter_orNull(text, linebreak, CheckFor.Anything, potentialFinal!)
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
      currentNewline = getNextXAfter_orEnd(text, linebreak, CheckFor.Anything, lastNewlineInChainPrev)
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
            CheckFor.Open,
            thisLineExclOpen_start,
            thisLine_end
          )

        if (!atFinal) {
          //dirty if any char close
          isDirty = isDirty
            || existsXInBewtween(
              text,
              langSettings.close,
              CheckFor.Close,
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
  }
}

function getNextXAfter_orNull(
  text: string,
  x_string: string,
  xIsOpen: CheckFor,
  after: number|null
): number|null {
  return getNextXAfter_orY(
    text,
    x_string,
    null,
    xIsOpen,
    after
  )
}

function getNextXAfter_orEnd(
  text: string,
  x_string: string,
  xIsOpen: CheckFor,
  after: number|null
): number {
  return getNextXAfter_orY(
    text,
    x_string,
    text.length-1,
    xIsOpen,
    after
  ) as number
}

function getNextXAfter_orY(
  text: string,
  x_string: string,
  y_value: number|null,
  xIsOpen: CheckFor,
  after: number|null
): number|null {
  if (after == null) {
    return y_value
  }
  const re = buildRegEx(x_string, xIsOpen)
  let searchStart = after+1

  let nextAfter = 
    text.substring(searchStart).search(re)
  let toReturn = (
    nextAfter == -1
      ? y_value
      : nextAfter + searchStart
  )
  return toReturn
}

function existsXInBewtween(
  text: string,
  x_string: string,
  xIsOpen: CheckFor,
  initial: number,
  final: number,
): boolean {
  const re = buildRegEx(x_string, xIsOpen)
  return text.substring(initial!, final!).search(re) != -1; 
}

function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function buildRegEx(x_string: string, xIsOpen: CheckFor) {
  let escaped = escapeRegExp(x_string)
  let re: RegExp
  let whiteSpaceOrStart = "\\s|^"
  let whiteSpaceOrEnd = "\\s|$"
  let nonWhitespace = `\\S`
  let sentenceBounaryChars = `\\.|,`
  let hyphensDahses = `-|~`
  if (xIsOpen==CheckFor.Open) {
    re = new RegExp(`(?<=${whiteSpaceOrStart}|${hyphensDahses})(?<!\\[)${escaped}(?!\\[)(?=${nonWhitespace})`);
  } else if (xIsOpen==CheckFor.Close) {
    re = new RegExp(`(?<=${nonWhitespace}|${sentenceBounaryChars})(?<!\\])${escaped}(?!\\])(?=${whiteSpaceOrEnd}|${sentenceBounaryChars}|${hyphensDahses})`);
  } else { //xIsOpen==CheckFor.Anything
    re = new RegExp(`${escaped}`);
  }
  return re
}
