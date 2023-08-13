export default {
  check(
    text: string,
    langSettings: { open: string; close: string; class: string; },
    linebreak: string,
    foundFunctionIn: (
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
      foundFunctionIn(foundStart, foundEnd)
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
    let initial_orNull = getNextXAfter_orNull(text, langSettings.open, -1)
    let final_orNull = getNextXAfter_orNull(text, langSettings.close, initial_orNull)
    let final_orEnd = getNextXAfter_orEnd(text, langSettings.close, initial_orNull)
    //console.log(`${initial_orNull} ${final_orNull}`)
    //maybeFoundFunction(initial_orNull, final_orNull)
    while (initial_orNull != null) {
      const nextInitial_orNull = getNextXAfter_orNull(text, langSettings.open, initial_orNull!)
      const nextInitial_orEnd = getNextXAfter_orEnd(text, langSettings.open, initial_orNull!)
      const nextInitialFound = nextInitial_orNull!=null
      const nextLinebreak_orNull = getNextXAfter_orNull(text, linebreak, initial_orNull!)
      const nextLinebreak_orEnd = getNextXAfter_orEnd(text, linebreak, initial_orNull!)
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
        final_orNull = getNextXAfter_orNull(text, langSettings.close, initial_orNull)
        final_orEnd = getNextXAfter_orEnd(text, langSettings.close, initial_orNull)
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
        && existsXInBewtween(text, linebreak, initial_orNull!, final_orNull!)
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
        foundFunction(initial_orNull!, final_orNull)
      } else if (isBroken) {
        errorFunction(initial_orNull, initial_orNull)
      } else {
        maybeFoundFunction(initial_orNull, final_orNull)
      }

      if (langSettings.open == langSettings.close) {
        initial_orNull = getNextXAfter_orNull(text, langSettings.open, final_orNull!)
      } else {
        initial_orNull = getNextXAfter_orNull(text, langSettings.open, initial_orNull!)
      }
      final_orNull = getNextXAfter_orNull(text, langSettings.close, initial_orNull)
      final_orEnd = getNextXAfter_orEnd(text, langSettings.close, initial_orNull)
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
    foundStart: number,
    foundEnd: number
  ) => void,
  errorFunction: (
    foundStart: number,
    foundEnd: number
  ) => void
) {
  const nextLinebreak_orEnd = getNextXAfter_orEnd(text, linebreak, initial)
  let isCompleteClosedEnded: boolean
  let potentialFinal = getNextXAfter_orNull(text, langSettings.close, initial)
  if (potentialFinal!=null) {
    const potentialFinalIsEnd = potentialFinal==text.length-langSettings.close.length
    if (!potentialFinalIsEnd) {
      let potentialSubsequentLineBreak =
        getNextXAfter_orNull(text, linebreak, potentialFinal!)
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
      currentNewline = getNextXAfter_orEnd(text, linebreak, lastNewlineInChainPrev)
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
            thisLineExclOpen_start,
            thisLine_end
          )

        if (!atFinal) {
          //dirty if any char close
          isDirty = isDirty
            || existsXInBewtween(
              text,
              langSettings.close,
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
    foundFunction(initial, nextLinebreak_orEnd)
  } else {
    errorFunction(initial, initial)
  }
}

function getNextXAfter_orNull(
  text: string,
  x_string: string,
  after: number|null
) {
  if (after == null) {
    return null
  }
  let nextAfter = 
    text.indexOf(x_string, after+1);
  return (
    nextAfter == -1
      ? null
      : nextAfter
  );
}

function getNextXAfter_orEnd(
  text: string,
  x_string: string,
  after: number|null
) {
  let nextAfter = text.indexOf(x_string, (after??-1) + 1);
  let toReturn =
    nextAfter == -1
      ? text.length-1
      : nextAfter ?? 0
  return toReturn
}

function existsXInBewtween(
  text: string,
  x_string: string,
  initial: number,
  final: number,
) {
  return text.substring(initial!, final!).contains(x_string); 
}
