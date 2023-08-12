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
      console.log(`foundFunction: ${foundStart} ${text.substring(foundStart, foundEnd+1)} ${foundEnd}`)
      foundFunctionIn(foundStart, foundEnd)
    }
    console.log(text)
    let initial_orNull = getNextXAfter_orNull(text, langSettings.open, -1)
    let final_orNull = getNextXAfter_orNull(text, langSettings.close, initial_orNull)
    let final_orEnd = getNextXAfter_orEnd(text, langSettings.close, initial_orNull)
    if (!initial_orNull && final_orNull) {
      foundFunction(final_orNull, final_orNull)
    }
    while (initial_orNull) {
      console.log(`basic initial-nextLinebreak_orEnd: ${initial_orNull} ${text.substring(initial_orNull, (final_orNull??initial_orNull)+1)} ${final_orNull}`)
      const nextInitial_orNull = getNextXAfter_orNull(text, langSettings.open, initial_orNull!)
      const nextInitial_orEnd = getNextXAfter_orEnd(text, langSettings.open, initial_orNull!)
      const nextInitialFound = nextInitial_orNull!=null
      const nextLinebreak_orNull = getNextXAfter_orNull(text, linebreak, initial_orNull!)
      const nextLinebreak_orEnd = getNextXAfter_orEnd(text, linebreak, initial_orNull!)
      const nextLinebreakFound = nextLinebreak_orNull!=null
      const finalFound = () => final_orNull!=null
      const doubleInitial = 
        nextInitialFound
        && nextInitial_orNull! < nextLinebreak_orEnd
        && 
        (
          !finalFound()
          || nextInitial_orNull! < final_orNull!
        )
      if (doubleInitial) {
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
      }
      if (final_orNull && !isBroken) {
        foundFunction(initial_orNull!, final_orNull)
      }

      initial_orNull = getNextXAfter_orNull(text, langSettings.open, initial_orNull!)
      final_orNull = getNextXAfter_orNull(text, langSettings.close, initial_orNull)
      final_orEnd = getNextXAfter_orEnd(text, langSettings.close, initial_orNull)
    }
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
