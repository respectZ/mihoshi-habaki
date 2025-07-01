import { $, component$, Signal, useVisibleTask$ } from "@builder.io/qwik";
import { Input } from "flowbite-qwik";
import { useDebouncer } from "~/core/utils";

type SearchProps = {
  bind: Signal<string>;
  debouncedValue: Signal<string>;
  debounceTime?: number;
};
export const Search = component$<SearchProps & Parameters<typeof Input>[0]>((props) => {
  const { bind, debouncedValue, debounceTime = 300 } = props;
  const debounce = useDebouncer(
    $((value: string) => {
      debouncedValue.value = value;
    }),
    debounceTime,
  );

  useVisibleTask$(({ track }) => {
    track(() => bind.value);
    const value = bind.value;
    debounce(value);
  });

  return (
    <>
      <Input bind:value={bind} {...props} />
    </>
  );
});
