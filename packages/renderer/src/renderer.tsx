import { Button } from "@workspace/ui/components/button";

import type { ComponentNode } from "./types.js";

const actions: Record<string, () => void> = {
  sayHello: () => alert("Hello from JSON!"),
};

export function Renderer({ component }: { component: ComponentNode }) {
  const { type, props = {}, children, actionId } = component;

  const onClick = actionId ? actions[actionId] : undefined;

  const resolvedChildren =
    typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children.map((child, idx) => <Renderer key={idx} component={child} />)
        : null;

  switch (type) {
    case "div":
      return <div {...props}>{resolvedChildren}</div>;
    case "h1":
      return <h1 {...props}>{resolvedChildren}</h1>;
    case "p":
      return <p {...props}>{resolvedChildren}</p>;
    case "Button":
      return (
        <Button {...props} onClick={onClick}>
          {resolvedChildren}
        </Button>
      );
    default:
      return null;
  }
}
