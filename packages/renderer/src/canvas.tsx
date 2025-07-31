import { useState, useRef, useCallback, useMemo } from "react";
import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type CollisionDetection,
  rectIntersection, // Added for more robust collision
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { Button } from "@workspace/ui/components/button";

import type { ComponentNode } from "./types.js";

/**
 * Recursively traverses a component tree and collects all node IDs
 * @param node - The root component node to start traversal from
 * @returns Array of all unique IDs found in the tree
 */
function getAllNodeIds(node: ComponentNode): string[] {
  const ids: string[] = [];
  ids.push(node.id); // Add current node's ID

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => {
      ids.push(...getAllNodeIds(child));
    });
  }

  return ids;
}

/**
 * Searches for a specific node by ID within the component tree
 * @param root - The root node to search from
 * @param targetId - The ID of the node to find
 * @returns The found node or null if not found
 */
function findNodeById(
  root: ComponentNode,
  targetId: string | number,
): ComponentNode | null {
  if (root.id === String(targetId)) return root;

  if (Array.isArray(root.children)) {
    for (const child of root.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Finds the parent node of a target node by searching the tree
 * @param root - The root node to search from
 * @param targetId - The ID of the child node whose parent we want to find
 * @returns The parent node or null if not found or if target is root
 */
function findParentOfNode(
  root: ComponentNode,
  targetId: string | number,
): ComponentNode | null {
  if (Array.isArray(root.children)) {
    for (const child of root.children) {
      if (child.id === String(targetId)) return root;
      const found = findParentOfNode(child, targetId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Checks if a node is an ancestor (parent, grandparent, etc.) of another node
 * Used to prevent dropping a node into its own descendants (which would create infinite loops)
 * @param node - The potential ancestor node
 * @param id - The ID of the potential descendant
 * @returns True if node is an ancestor of the given ID
 */
function isAncestor(node: ComponentNode, id: string | number): boolean {
  if (!node.children || !Array.isArray(node.children)) {
    return false;
  }
  for (const child of node.children) {
    if (child.id === String(id)) {
      return true;
    }
    if (isAncestor(child, id)) {
      return true;
    }
  }
  return false;
}

/**
 * Immutably updates a specific node in the tree using an updater function
 * Creates a new tree with the updated node while preserving all other nodes
 * @param root - The root of the tree to update
 * @param targetId - The ID of the node to update
 * @param updater - Function that takes the current node and returns the updated node
 * @returns New tree with the updated node
 */
function updateNodeInTree(
  root: ComponentNode,
  targetId: string | number,
  updater: (node: ComponentNode) => ComponentNode,
): ComponentNode {
  if (root.id === String(targetId)) {
    return updater(root);
  }

  if (Array.isArray(root.children)) {
    return {
      ...root,
      children: root.children.map((child) =>
        updateNodeInTree(child, targetId, updater),
      ),
    };
  }

  return root;
}

// Type definition for different drop positions during drag operations
type DropPosition = "top" | "bottom" | "left" | "right" | "inside" | null;

/**
 * Moves a node from one position to another in the tree structure
 * Handles the complex logic of removing a node and inserting it at the correct position
 * @param root - The root of the tree
 * @param activeId - ID of the node being moved
 * @param overId - ID of the node being dropped onto
 * @param dropPosition - Where relative to the target the node should be dropped
 * @returns New tree with the node moved to its new position
 */
function moveNodeInTree(
  root: ComponentNode,
  activeId: string | number,
  overId: string | number,
  dropPosition: DropPosition,
): ComponentNode {
  // Ensure IDs are strings for consistent comparison
  const activeIdStr = String(activeId);
  const overIdStr = String(overId);

  // Find the parent of the node being moved
  const activeParent = findParentOfNode(root, activeIdStr);
  if (!activeParent) {
    console.warn(`Could not find active parent for ${activeIdStr}`);
    return root;
  }

  // Find and clone the node being moved
  const activeNode = findNodeById(root, activeIdStr);
  if (!activeNode) {
    console.warn(`Could not find active node ${activeIdStr}`);
    return root;
  }

  // Deep clone to ensure immutability and no reference issues during move
  const clonedActiveNode = JSON.parse(JSON.stringify(activeNode));

  // Step 1: Remove the node from its original position
  // Filter out the active node from its original parent's children
  const rootWithoutActiveNode = updateNodeInTree(
    root,
    activeParent.id,
    (node) => {
      if (Array.isArray(node.children)) {
        return {
          ...node,
          children: node.children.filter((c) => c.id !== activeIdStr),
        };
      }
      return node; // Should not happen if activeParent has children
    },
  );

  // Step 2: Insert the node at its new position
  if (dropPosition === "inside") {
    // Drop inside another container element
    const overNode = findNodeById(rootWithoutActiveNode, overIdStr);
    // Ensure overNode exists and can accept children (i.e., its children are an array)
    if (!overNode || typeof overNode.children === "string") {
      console.warn(
        `Cannot drop inside ${overIdStr}: not a valid container or text node.`,
      );
      return root; // Cannot drop inside a text node or non-existent node
    }

    // Ensure children array exists before spreading
    const currentChildren = Array.isArray(overNode.children)
      ? overNode.children
      : [];

    return updateNodeInTree(rootWithoutActiveNode, overIdStr, (node) => ({
      ...node,
      children: [...currentChildren, clonedActiveNode],
    }));
  } else {
    // Drop as a sibling (top, bottom, left, right)
    const overParent = findParentOfNode(rootWithoutActiveNode, overIdStr);
    // Ensure overParent exists and its children are an array
    if (!overParent || typeof overParent.children === "string") {
      console.warn(
        `Cannot drop as sibling of ${overIdStr}: no valid parent or parent has text children.`,
      );
      return root;
    }

    // Find the index of the overId in its parent's children
    const overParentChildren = overParent.children as ComponentNode[];
    let newIndex = overParentChildren.findIndex((c) => c.id === overIdStr);

    if (newIndex === -1) {
      console.warn(`Could not find over node ${overIdStr} in its parent.`);
      return root;
    }

    // Adjust insertion index based on drop position
    // For "right" or "bottom", insert *after* the overId
    if (dropPosition === "right" || dropPosition === "bottom") {
      newIndex += 1;
    }

    return updateNodeInTree(rootWithoutActiveNode, overParent.id, (node) => {
      const newChildren = [...(node.children as ComponentNode[])];
      newChildren.splice(newIndex, 0, clonedActiveNode);
      return { ...node, children: newChildren };
    });
  }
}

/**
 * Visual indicator component that shows where a dragged item will be dropped
 * Displays different visual cues based on the drop position (line for edges, overlay for inside)
 * @param isVisible - Whether the indicator should be shown
 * @param position - The position type (top, bottom, left, right, inside)
 */
function DropIndicator({
  isVisible,
  position,
}: {
  isVisible: boolean;
  position: DropPosition;
}) {
  if (!isVisible || !position) return null;

  // Use a higher z-index to ensure it's always on top
  const baseClasses = "absolute bg-blue-600 rounded pointer-events-none z-50";
  let positionClasses = "";

  // The -1/2 translates make the line perfectly straddle the edge.
  switch (position) {
    case "top":
      positionClasses = "top-0 left-0 right-0 h-1 -translate-y-1/2";
      break;
    case "bottom":
      positionClasses = "bottom-0 left-0 right-0 h-1 translate-y-1/2";
      break;
    case "left":
      positionClasses = "left-0 top-0 bottom-0 w-1 -translate-x-1/2";
      break;
    case "right":
      positionClasses = "right-0 top-0 bottom-0 w-1 translate-x-1/2";
      break;
    case "inside":
      positionClasses =
        "inset-0 border-2 border-dashed border-blue-600 bg-blue-100 bg-opacity-25";
      break;
  }

  return <div className={`${baseClasses} ${positionClasses}`} />;
}

/**
 * Main renderer component that converts ComponentNode objects into actual React elements
 * Handles selection, drag-and-drop, inline editing, and visual feedback
 * Uses React.memo for performance optimization to prevent unnecessary re-renders
 */
const EditableRenderer = React.memo(
  ({
    component,
    selectedId,
    setSelectedId,
    onUpdateText,
    allNodeIds,
    dragOverId,
    dragActiveId,
    dropPosition,
  }: {
    component: ComponentNode;
    selectedId: string | null; // Currently selected component ID
    setSelectedId: (id: string) => void; // Function to update selection
    onUpdateText: (id: string, text: string) => void; // Function to update text content
    allNodeIds: string[]; // All draggable node IDs
    dragOverId: string | null; // ID of component being hovered over during drag
    dragActiveId: string | null; // ID of component being dragged
    dropPosition: DropPosition; // Where the drop will occur
  }) => {
    const { type, props = {}, children, actionId, id } = component;
    const isSelected = selectedId === id;
    const [isEditing, setIsEditing] = useState(false);
    const contentRef = useRef<HTMLElement>(null);

    // Determine if this component can be dragged
    // The root node itself should typically not be draggable or sortable
    const shouldBeSortable = id !== "root" && allNodeIds.includes(id);
    const isDropTarget = dragOverId === id && id !== dragActiveId;

    // Hook for drag-and-drop functionality
    const { attributes, listeners, setNodeRef, isDragging } = useSortable({
      id: id,
      disabled: !shouldBeSortable || isEditing, // Disable dragging when editing text or if not sortable
    });

    // Style to hide original element while dragging
    const style = {
      opacity: isDragging ? 0 : 1,
      // Add a transition for smoother opacity changes
      transition: "opacity 200ms ease",
    };

    /**
     * Handles double-click to enter edit mode for text elements
     */
    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        // Only allow editing if children is a string
        if (typeof children === "string" && id) {
          setIsEditing(true);
          // Focus the element after state update to allow immediate editing
          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.focus();
              // Select all text when entering edit mode
              const range = document.createRange();
              range.selectNodeContents(contentRef.current);
              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          }, 0);
        }
      },
      [children, id],
    );

    /**
     * Handles exiting edit mode and saving changes
     */
    const handleBlur = useCallback(() => {
      if (!isEditing) return; // Prevent blur from firing multiple times
      setIsEditing(false);
      if (contentRef.current && id) {
        const text = contentRef.current.innerText;
        // Trim whitespace and remove extra newlines, common with contentEditable
        const cleanedText = text.replace(/[\n\r]+/g, " ").trim(); // Use global regex for all newlines
        onUpdateText(id, cleanedText);
      }
    }, [id, onUpdateText, isEditing]);

    /**
     * Handles keyboard shortcuts in edit mode (Enter to save)
     */
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent new line on Enter
          handleBlur();
          // Remove focus immediately after saving
          (e.target as HTMLElement).blur();
        } else if (e.key === "Escape") {
          // Allow Escape to cancel editing without saving
          setIsEditing(false);
          if (contentRef.current) {
            contentRef.current.innerText =
              typeof children === "string" ? children : ""; // Revert to original text
          }
          (e.target as HTMLElement).blur();
        }
      },
      [handleBlur, children],
    );

    /**
     * Handles clicking on components (selection and actions)
     */
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (id) setSelectedId(id);
        // Do not trigger actionId if currently editing
        if (actionId && !isEditing) alert(`Action: ${actionId}`);
      },
      [id, actionId, setSelectedId, isEditing],
    );

    /**
     * Recursively renders child components or returns text content
     */
    const resolvedChildren = useMemo(() => {
      if (typeof children === "string") {
        return children;
      }
      if (Array.isArray(children)) {
        return children.map((child, idx) => (
          <EditableRenderer
            key={child.id || `child-${idx}`} // Ensure unique key
            component={child}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onUpdateText={onUpdateText}
            allNodeIds={allNodeIds}
            dragOverId={dragOverId}
            dragActiveId={dragActiveId}
            dropPosition={dropPosition}
          />
        ));
      }
      return null;
    }, [
      children,
      selectedId,
      setSelectedId,
      onUpdateText,
      allNodeIds,
      dragOverId,
      dragActiveId,
      dropPosition,
    ]);

    /**
     * Builds CSS classes including hover and selection states
     */
    const classNames = useMemo(() => {
      const hoverClass =
        shouldBeSortable && !isDragging && !isEditing && !isSelected
          ? "hover:ring-1 hover:ring-blue-300 hover:ring-opacity-50"
          : "";

      const selectedClass =
        isSelected && !isDragging ? "ring-2 ring-blue-500" : "";

      // Add a visual cue for droppable containers when nothing is inside them
      const isEmptyContainer = Array.isArray(children) && children.length === 0;
      // Also check if the component type is typically a container
      const isContainerType = ["div", "section", "header", "footer"].includes(
        type,
      );

      const emptyContainerHint =
        isEmptyContainer && isContainerType
          ? "border border-dashed border-gray-400 min-h-[4rem] flex items-center justify-center text-gray-400 text-sm"
          : "";

      return `${
        props.className || ""
      } ${hoverClass} ${selectedClass} ${emptyContainerHint} relative`.trim();
    }, [
      props.className,
      shouldBeSortable,
      isDragging,
      isEditing,
      isSelected,
      children,
      type,
    ]);

    /**
     * Common props shared between edit and normal mode
     */
    const commonProps = useMemo(
      () => ({
        ...props,
        ref: setNodeRef, // DND-kit ref for sorting
        ...(shouldBeSortable && !isEditing ? attributes : {}), // DND attributes
        ...(shouldBeSortable && !isEditing ? listeners : {}), // DND listeners
        onClick: handleClick,
        onDoubleClick: handleDoubleClick,
        // Merge inline styles from props, DND, and local component
        style: { ...props.style, ...style },
        className: classNames,
      }),
      [
        props,
        setNodeRef,
        shouldBeSortable,
        isEditing,
        attributes,
        listeners,
        handleClick,
        handleDoubleClick,
        style,
        classNames,
      ],
    );

    // Render in edit mode (contentEditable)
    if (isEditing && typeof children === "string") {
      const editProps = {
        ...commonProps,
        // Override children prop to set ref for contentEditable
        children: undefined,
        contentEditable: true,
        suppressContentEditableWarning: true,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        ref: (el: HTMLElement | null) => {
          setNodeRef(el);
          (contentRef as React.MutableRefObject<HTMLElement | null>).current =
            el;
        },
        dangerouslySetInnerHTML: { __html: children }, // Use dangerouslySetInnerHTML for contentEditable initial value
      };

      if (type === "Button") {
        // Render button specifically, as it's a custom component
        return <Button {...editProps} />;
      } else {
        // Render native HTML elements
        const Tag = type as any;
        return <Tag {...editProps} />;
      }
    }

    // Render in normal mode - create the appropriate HTML element
    let renderedComponent;
    switch (type) {
      case "div":
        renderedComponent = <div {...commonProps}>{resolvedChildren}</div>;
        break;
      case "h1":
        renderedComponent = <h1 {...commonProps}>{resolvedChildren}</h1>;
        break;
      case "h2":
        renderedComponent = <h2 {...commonProps}>{resolvedChildren}</h2>;
        break;
      case "p":
        renderedComponent = <p {...commonProps}>{resolvedChildren}</p>;
        break;
      case "Button":
        renderedComponent = (
          <Button {...commonProps}>{resolvedChildren}</Button>
        );
        break;
      default:
        // Fallback for any other HTML tags
        const Tag = type as any;
        renderedComponent = <Tag {...commonProps}>{resolvedChildren}</Tag>;
    }

    return (
      <div className="relative">
        {renderedComponent}
        {/* Only show indicator if this is the active drop target */}
        <DropIndicator isVisible={isDropTarget} position={dropPosition} />
      </div>
    );
  },
);

/**
 * Simplified component renderer for the drag overlay
 * Shows a visual representation of the component being dragged without full functionality
 * @param component - The component being dragged (or null if nothing is being dragged)
 */
function DragOverlayComponent({
  component,
}: {
  component: ComponentNode | null;
}) {
  if (!component) return null;

  const { type, props = {}, children } = component;

  /**
   * Simplified children rendering for overlay - just shows component structure
   * rather than rendering the full interactive tree
   */
  const renderChildren = (kids: ComponentNode[] | string) => {
    if (typeof kids === "string") return kids;
    if (Array.isArray(kids)) {
      // For drag overlay, just show a placeholder to simplify render
      return (
        <span className="text-gray-400 italic text-sm">
          ({kids.length} children)
        </span>
      );
    }
    return null;
  };

  // Style the overlay with visual cues that it's being dragged
  const overlayProps = {
    ...props,
    className: `${
      props.className || ""
    } opacity-90 shadow-lg transform rotate-1 scale-105 transition-transform duration-100 ease-out`.trim(),
    style: {
      ...props.style,
      cursor: "grabbing",
      // Ensure overlay components have a background so they're visible
      backgroundColor: props.style?.backgroundColor || "white",
      minHeight: "20px", // Give some minimum size
      minWidth: "50px",
    },
  };

  // Render the appropriate element type for the overlay
  switch (type) {
    case "div":
      return <div {...overlayProps}>{renderChildren(children!)}</div>;
    case "h1":
      return <h1 {...overlayProps}>{renderChildren(children!)}</h1>;
    case "h2":
      return <h2 {...overlayProps}>{renderChildren(children!)}</h2>;
    case "p":
      return <p {...overlayProps}>{renderChildren(children!)}</p>;
    case "Button":
      return <Button {...overlayProps}>{renderChildren(children!)}</Button>;
    default:
      const Tag = type as any;
      return <Tag {...overlayProps}>{renderChildren(children!)}</Tag>;
  }
}

/**
 * Main builder component that manages the drag-and-drop page builder
 * Coordinates all the drag/drop logic, selection state, and tree mutations
 * @param component - The initial component tree to render and edit
 */
export function Builder({ component }: { component: ComponentNode }) {
  // State for the component tree (gets updated as user makes changes)
  const [root, setRoot] = useState<ComponentNode>(component);

  // State for UI interactions
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);

  // Ref to track mouse position during drag operations (relative to viewport)
  const pointerCoordinatesRef = useRef<{ x: number; y: number } | null>(null);

  // Configure drag sensors (how dragging is activated)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Must drag 8px before drag starts (prevents accidental drags)
      },
    }),
  );

  /**
   * Custom collision detection strategy.
   * This is crucial. `closestCenter` might not be ideal for hierarchical layouts.
   * Let's start with `rectIntersection` and filter for valid drop targets.
   * Then, `handleDragOver` will determine the precise `dropPosition` within the `over` element.
   */
  const customCollisionDetection: CollisionDetection = useCallback(
    (args) => {
      // Update pointer coordinates for `handleDragOver` to use
      pointerCoordinatesRef.current = args.pointerCoordinates;

      // Use a combination of strategies:
      // 1. Prioritize direct rect intersections. This means the pointer is *over* the element.
      const intersections = rectIntersection(args);

      // Filter out elements that are ancestors of the active node
      const activeNode = findNodeById(root, args.active.id);
      if (!activeNode) return [];

      const validIntersections = intersections.filter((collision) => {
        // Do not allow dropping on the active node itself, or any of its descendants
        return (
          collision.id !== args.active.id &&
          !isAncestor(activeNode, collision.id)
        );
      });

      // If there are valid intersections, sort them by distance to active's center
      // This will pick the closest *valid* element that the pointer is intersecting.
      if (validIntersections.length > 0) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter((container) =>
            validIntersections.some((i) => i.id === container.id),
          ),
        });
      }

      // Fallback to closestCenter if no direct intersection (e.g., dragging over empty space)
      // This can help find a parent container to drop into.
      const fallbackCollisions = closestCenter(args);
      return fallbackCollisions.filter((collision) => {
        const overNode = findNodeById(root, collision.id);
        return (
          collision.id !== args.active.id &&
          !isAncestor(activeNode, collision.id) &&
          overNode?.id !== "root"
        ); // Optionally prevent dropping directly into root if it's too broad
      });
    },
    [root],
  );

  // Get all draggable node IDs (memoized for performance)
  const allNodeIds = useMemo(() => getAllNodeIds(root), [root]);

  /**
   * Handler for when drag operation starts
   * Records which element is being dragged
   */
  const handleDragStart = useCallback((event: any) => {
    setDragActiveId(String(event.active.id));
    setSelectedId(null); // Deselect on drag start
  }, []);

  /**
   * Helper function to determine if a node can accept children
   */
  const canAcceptChildren = useCallback(
    (node: ComponentNode | null): boolean => {
      if (!node) return false;
      // For simplicity, assume only 'div', 'section', 'header', 'footer' can accept children.
      // Extend this logic for other container types or custom components based on your design system.
      return ["div", "section", "header", "footer"].includes(node.type);
    },
    [],
  );

  /**
   * Handler for drag over events (while dragging)
   * Calculates where the item would be dropped based on mouse position
   * Implements smart drop zone detection with different positions
   */
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      const overId = over?.id ? String(over.id) : null;
      setDragOverId(overId);

      // If no valid "over" target, or dragging onto self, or no pointer coords, reset and return
      if (!overId || active.id === overId || !pointerCoordinatesRef.current) {
        setDropPosition(null);
        return;
      }

      const activeNode = findNodeById(root, active.id);
      const overNode = findNodeById(root, overId);

      // Prevent dropping an element into its own descendant (safety check)
      if (activeNode && overNode && isAncestor(activeNode, overNode.id)) {
        setDropPosition(null);
        return;
      }

      const overRect = over!.rect;
      const pointer = pointerCoordinatesRef.current;

      // Calculate relative position of mouse pointer within the over element's bounding box
      const relativeX = pointer.x - overRect.left;
      const relativeY = pointer.y - overRect.top;

      const width = overRect.width;
      const height = overRect.height;

      // Define zones as percentages of width/height
      const ZONE_PERCENTAGE_SIDE = 0.25; // How much from edge is considered 'side' zone

      // Calculate pixel thresholds for zones
      const topZonePx = height * ZONE_PERCENTAGE_SIDE;
      const bottomZonePx = height * (1 - ZONE_PERCENTAGE_SIDE);
      const leftZonePx = width * ZONE_PERCENTAGE_SIDE;
      const rightZonePx = width * (1 - ZONE_PERCENTAGE_SIDE);

      let newDropPosition: DropPosition = null;

      // 1. Prioritize "inside" drop if the element is a container and the pointer is in the middle
      const canDropInside = canAcceptChildren(overNode);
      const isEmptyContainer =
        canDropInside &&
        Array.isArray(overNode?.children) &&
        overNode.children.length === 0;

      if (canDropInside) {
        // If it's an empty container, or the pointer is well within the middle
        if (
          isEmptyContainer ||
          (relativeX > leftZonePx &&
            relativeX < rightZonePx &&
            relativeY > topZonePx &&
            relativeY < bottomZonePx)
        ) {
          newDropPosition = "inside";
        }
      }

      // 2. If not "inside", then determine sibling drop position (top/bottom/left/right)
      if (newDropPosition === null) {
        // Check if the current over element is likely a horizontal layout container.
        // This is a heuristic based on common Tailwind classes. For production, define this more formally.

        // Determine if mouse is in a vertical edge zone
        const isTopEdge = relativeY <= topZonePx;
        const isBottomEdge = relativeY >= bottomZonePx;

        // Determine if mouse is in a horizontal edge zone
        const isLeftEdge = relativeX <= leftZonePx;
        const isRightEdge = relativeX >= rightZonePx;

        // Logic for sibling drops:
        // Prioritize top/bottom if height is significantly larger than width (vertical layout)
        // Or if the pointer is clearly in the top/bottom 25% zone.
        if (isTopEdge) {
          newDropPosition = "top";
        } else if (isBottomEdge) {
          newDropPosition = "bottom";
        }
        // Then, consider left/right if pointer is clearly in the left/right 25% zone
        // This makes it less likely for a horizontal drop to override a clear vertical one
        else if (isLeftEdge) {
          newDropPosition = "left";
        } else if (isRightEdge) {
          newDropPosition = "right";
        }
        // Fallback for cases where it's not "inside" and not clearly on an edge
        // This can happen for elements that can't accept children but the pointer is in the middle.
        // Default to "bottom" as a safe fallback for most block layouts.
        else {
          newDropPosition = "bottom";
        }
      }

      setDropPosition(newDropPosition);
    },
    [root, canAcceptChildren],
  );

  /**
   * Handler for when drag operation completes
   * Performs the actual tree mutation to move the dragged element
   */
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeId = String(active.id);
      const overId = over?.id ? String(over.id) : null;

      if (overId && activeId !== overId && dropPosition) {
        const activeNode = findNodeById(root, activeId);
        // Double-check to prevent dropping a node into its own descendants
        if (activeNode && !isAncestor(activeNode, overId)) {
          setRoot((prevRoot) =>
            moveNodeInTree(prevRoot, activeId, overId, dropPosition),
          );
        } else {
          console.warn(
            `Attempted to drop ${activeId} into its own descendant ${overId} or invalid position.`,
          );
        }
      } else {
        console.log("Drag ended without a valid drop target or position.");
      }

      // Reset drag state regardless of successful drop
      setDragActiveId(null);
      setDragOverId(null);
      setDropPosition(null);
      pointerCoordinatesRef.current = null;
    },
    [root, dropPosition],
  );

  /**
   * Handler for when drag operation is cancelled (ESC key, etc.)
   */
  const handleDragCancel = useCallback(() => {
    setDragActiveId(null);
    setDragOverId(null);
    setDropPosition(null);
    pointerCoordinatesRef.current = null;
  }, []);

  /**
   * Updates text content of a specific node in the tree
   * Called when user finishes editing text inline
   */
  const updateText = useCallback((id: string, newText: string) => {
    setRoot((prevRoot) =>
      updateNodeInTree(prevRoot, id, (node) => ({
        ...node,
        children: newText,
      })),
    );
  }, []);

  /**
   * Clears selection when clicking on empty space
   */
  const handleRootClick = useCallback((e: React.MouseEvent) => {
    // If the click target is the root div itself, clear selection
    if (e.target === e.currentTarget) {
      setSelectedId(null);
    }
  }, []);

  /**
   * Gets the component data for the element currently being dragged
   * Used to render the drag overlay
   */
  const draggedComponent = useMemo(
    () => (dragActiveId ? findNodeById(root, dragActiveId) : null),
    [dragActiveId, root],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* SortableContext needs all IDs that could be dragged */}
      <SortableContext items={allNodeIds} strategy={rectSortingStrategy}>
        <div onClick={handleRootClick} className="min-h-screen">
          {" "}
          {/* Ensure root has a min-height for click detection */}
          <EditableRenderer
            component={root}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            onUpdateText={updateText}
            allNodeIds={allNodeIds}
            dragOverId={dragOverId}
            dragActiveId={dragActiveId}
            dropPosition={dropPosition}
          />
        </div>
        {/* Overlay that follows the mouse cursor during drag operations */}
        <DragOverlay>
          <DragOverlayComponent component={draggedComponent} />
        </DragOverlay>
      </SortableContext>
    </DndContext>
  );
}
