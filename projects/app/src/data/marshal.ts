//
//
// Public API, these don't expose the compressed shape in their types so the
// implementation shouldn't leak into the rest of the code.
//

//
// SrsState
//

// export const setPinyinInitialAssociation = rizzle.mutator(
//   `spia`,
//   {
//     initial: rizzle.string().alias(`i`),
//     name: rizzle.string().alias(`n`),
//   },
//   async (tx, { initial, name }) => {
//     const quantity = options?.quantity ?? 1;
//     const counter = await pinyinInitialAssociation.set(
//       tx,
//       { initial },
//       { name },
//     );
//   },
// );
