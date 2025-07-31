import * as React from "react";

export type ComponentNode = {
  id?: string;
  type: string;
  props?: Record<string, any> & {
    style?: React.CSSProperties;
  };
  children?: ComponentNode[] | string;
  actionId?: string;
  autoLayout?: boolean;
};

export type DraggableComponentNode = ComponentNode & {
  id: string; // Required for drag and drop
};
