export default {
  check(
    text: string,
    langSettings: { open: string; close: string; class: string; },
    linebreak: string,
    foundFunctionIn: (
      foundStart: number,
      foundEnd: number
    ) => void
  ) {
    let foundFunction = (
      foundStart: number,
      foundEnd: number
    ) => {
      console.log(`foundFunction: ${foundStart} "${text.substring(foundStart, foundEnd+1)}" ${foundEnd}`)
      console.log('AAA')
      console.log(`langSettings.class: ${langSettings.class}`)
      foundFunctionIn(foundStart, foundEnd)
      console.log('BBB')
    }
    let maybeFoundFunction = (
      maybeFoundStart: number|null,
      maybeFoundEnd: number|null
    ) => {
      if (maybeFoundStart!=null || maybeFoundEnd!=null) {
        return
      } else if (initial_orNull!=null) {
        foundFunction(initial_orNull, initial_orNull)
      } else if (final_orNull!=null) {
        foundFunction(final_orNull, final_orNull)
      }
    }
    console.log(langSettings)
    console.log(text)
    let initial_orNull = getNextXAfter_orNull(text, langSettings.open, -1)
    let final_orNull = getNextXAfter_orNull(text, langSettings.close, initial_orNull)
    let final_orEnd = getNextXAfter_orEnd(text, langSettings.close, initial_orNull)
    console.log(
      `initial_orNull: ${initial_orNull}\n`
      +`final_orNull: ${final_orNull}\n`
      +`final_orEnd: ${final_orEnd}\n`
    )
    maybeFoundFunction(initial_orNull, final_orNull)
    while (initial_orNull != null) {
      console.log(`basic initial-nextLinebreak_orEnd: ${initial_orNull} ${text.substring(initial_orNull, (final_orNull??0)+1)} ${final_orNull}`)
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
        foundFunction(initial_orNull!, initial_orNull!)
        initial_orNull = nextInitial_orNull!
        final_orNull = getNextXAfter_orNull(text, langSettings.close, initial_orNull)
        final_orEnd = getNextXAfter_orEnd(text, langSettings.close, initial_orNull)
      }
      console.log(`nextInitialFound: ${nextInitialFound}`)
      console.log(`nextLinebreak_orNull: ${nextLinebreak_orNull}`)
      console.log(`nextInitial_orNull: ${nextInitial_orNull}`)
      console.log(`doubleInitial: ${doubleInitial}`)
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
        && text.substring(initial_orNull!, final_orNull!).contains(linebreak);      
      if (initialAtStart && (isBroken || !aFinalFound)) {
        foundFunction(initial_orNull!, nextLinebreak_orEnd)
      } else if (initial_orNull!=null && final_orNull!=null && !isBroken) {
        foundFunction(initial_orNull!, final_orNull)
      } else if (isBroken) {
        foundFunction(initial_orNull, initial_orNull)
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
