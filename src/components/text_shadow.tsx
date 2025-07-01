import { component$, Slot } from "@builder.io/qwik";

export const TextShadow = component$(() => {
  return (
    <div
      class="text-white"
      style={{
        textShadow:
          "2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000, 0 2px 0 #000, 2px 0 0 #000, 0 -2px 0 #000, -2px 0 0 #000",
      }}
    >
      <Slot />
    </div>
  );
});
