import RiveAnimation from "$lib/RiveAnimation.svelte";
import type { Meta, StoryObj } from "@storybook/svelte";

const meta = {
  title: "Components/RiveAnimation",
  component: RiveAnimation,
} satisfies Meta<RiveAnimation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vehicle: Story = {
  args: {
    animationSrc: "https://cdn.rive.app/animations/vehicles.riv",
  },
};
