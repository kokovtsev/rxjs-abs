import { EMPTY, merge, timer } from "rxjs";
import { createTestScheduler } from "./utils";
import { filter, mapTo, shareReplay, takeUntil } from "rxjs/operators";

describe("dataOrDefault", () => {
  it("should emit the default value if no success within 5 frames", () => {
    const testScheduler = createTestScheduler();
    testScheduler.run(({ expectObservable, cold }) => {
      // prettier-ignore
      const streams = {
        data$:      "p------s-",
        expected$:  "p----D-s-"
      }
      expectObservable(dataOrDefault(testScheduler, cold(streams.data$))).toBe(
        streams.expected$
      );
    });
  });

  it("should NOT emit the default value if success is received soon", () => {
    const testScheduler = createTestScheduler();
    testScheduler.run(({ expectObservable, cold }) => {
      // prettier-ignore
      const streams = {
        data$:      "p--s----",
        expected$:  "p--s----"
      }
      expectObservable(dataOrDefault(testScheduler, cold(streams.data$))).toBe(
        streams.expected$
      );
    });
  });
});

function dataOrDefault(testScheduler, data$) {
  const dataReplay$ = data$.pipe(shareReplay(1, testScheduler));
  const default$ = timer(6, testScheduler).pipe(
    mapTo("D"),
    takeUntil(dataReplay$.pipe(filter((d) => d === "s")))
  );
  return merge(default$, dataReplay$);
}
