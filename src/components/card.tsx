import { component$, Slot } from "@builder.io/qwik";
import { Card as CardFlowbite } from "flowbite-qwik";

type CardProps = Parameters<typeof CardFlowbite>[0];
export const Card = component$<CardProps>((props) => {
  return (
    <CardFlowbite {...props} class={`transition-transform hover:scale-110 ease-out duration-150 ${props.class ?? ""}`}>
      <Slot />
    </CardFlowbite>
  );
});
