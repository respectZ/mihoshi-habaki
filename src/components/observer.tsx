import { component$, Signal, useSignal, useVisibleTask$ } from "@builder.io/qwik";

type ObserverProps = {
  bind: Signal<boolean>;
};

export const Observer = component$<ObserverProps>(({ bind }) => {
  const ref = useSignal<Element>();
  useVisibleTask$(({ track, cleanup }) => {
    track(() => ref.value);
    if (ref.value) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          bind.value = entry.isIntersecting;
        });
      });
      observer.observe(ref.value);
      cleanup(() => observer.disconnect());
    }
  });
  return <div ref={ref}></div>;
});
