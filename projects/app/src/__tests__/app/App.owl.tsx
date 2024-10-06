import { describe, expect, it, jest } from "@jest/globals";
import { reload, takeScreenshot, toExist } from "react-native-owl";

declare module "@jest/expect" {
  export interface Matchers<R extends void | Promise<void>> {
    /** Compares the image passed to the baseline one */
    toMatchBaseline: ({ threshold }?: { threshold?: number }) => R;
  }
}

jest.setTimeout(10000);

describe(`App.tsx`, () => {
  describe(`Basic navigation`, () => {
    it(`takes a screenshot of the initial screen`, async () => {
      await reload();
      await toExist(`index-page`);
      const screen = await takeScreenshot(`initial`);

      expect(screen).toMatchBaseline();
    });

    // it(`longPress a Pressable, then takes a screenshot`, async () => {
    //   await longPress(`Pressable`);

    //   const screen = await takeScreenshot(`long-press`);

    //   expect(screen).toMatchBaseline();
    // });

    // it(`press a Pressable, waits for an element then takes a screenshot`, async () => {
    //   await press(`Pressable`);

    //   await toExist(`TextInput`);

    //   const screen = await takeScreenshot(`test-input`);

    //   expect(screen).toMatchBaseline();
    // });

    // it(`enters some text and takes a screenshot`, async () => {
    //   await changeText(`TextInput`, `Entered text`);

    //   const screen = await takeScreenshot(`entered-text`);

    //   expect(screen).toMatchBaseline();
    // });

    // it(`scrolls a bit and takes a screenshot`, async () => {
    //   await scrollTo(`ScrollView`, { y: 50 });

    //   const screen = await takeScreenshot(`scroll-to`);

    //   expect(screen).toMatchBaseline();
    // });

    // it(`scrolls to end and takes a screenshot`, async () => {
    //   await scrollToEnd(`ScrollView`);

    //   const screen = await takeScreenshot(`scroll-to-end`);

    //   expect(screen).toMatchBaseline();
    // });

    // it(`takes a screenshot with a custom threshold`, async () => {
    //   const screen = await takeScreenshot(`custom-threshold`);

    //   expect(screen).toMatchBaseline({ threshold: 0.25 });
    // });
  });

  // describe(`Reload example`, () => {
  //   beforeAll(async () => {
  //     await reload();
  //   });

  //   it(`takes a screenshot of the welcome screen`, async () => {
  //     const screen = await takeScreenshot(`after-reload`);

  //     expect(screen).toMatchBaseline();
  //   });
  // });
});
