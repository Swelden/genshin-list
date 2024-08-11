"use client";

import * as React from "react";
import {
  useSelect,
  type UseSelectGetMenuReturnValue,
  type UseSelectGetToggleButtonReturnValue,
  type UseSelectPropGetters,
} from "downshift";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonSizeClassNames } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";

export interface SelectOption<T> {
  readonly label: React.ReactNode;
  readonly value: T;
}

function Select<Item>({
  items,
  selectedItem,
  setSelectedItem,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectContextProvider<Item>> & {
  className?: string;
}) {
  return (
    <SelectContextProvider
      items={items}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
      {...props}
    >
      <div className={cn("relative", className)}>{children}</div>
    </SelectContextProvider>
  );
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    truncate?: boolean;
  }
>(({ className, truncate = false, children, ...props }, ref) => {
  const { toggleButtonProps, isOpen, size } = useSelectContext();

  return (
    <Button
      ref={ref}
      size={size}
      className={cn(
        "w-full justify-between truncate",
        isOpen && "shadow-inner ring-3",
        className,
      )}
      {...toggleButtonProps}
      {...props}
    >
      <span
        className={cn(
          "w-full items-center text-left",
          truncate
            ? "inline-block truncate"
            : "flex overflow-hidden whitespace-nowrap",
        )}
      >
        {children}
      </span>
      <span aria-hidden="true">
        <Icons.dropdown
          className={cn("size-7", size === "small" && "size-6")}
        />
      </span>
    </Button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

function SelectContent({ scrollable = false }: { scrollable?: boolean }) {
  const { items, isOpen, menuProps } = useSelectContext();

  return (
    <ScrollArea
      {...menuProps}
      className={cn(
        "!absolute z-50 flex w-full flex-col overflow-hidden rounded-3xl bg-secondary text-secondary-foreground focus:outline-none",
        isOpen && "shadow-xl ring-1 ring-black/20",
        isOpen ? "animate-in fade-in-80 zoom-in-95" : "animate-out",
        "translate-y-0 slide-in-from-top-2",
      )}
      viewportClassName={cn(
        isOpen && "p-[0.3125rem]",
        scrollable && "max-h-60 pr-3 sm:max-h-80",
      )}
    >
      <ul>
        {isOpen &&
          items.map((item, index) => (
            <SelectItem key={`${item.value}`} item={item} index={index} />
          ))}
      </ul>
    </ScrollArea>
  );
}

function SelectItem<Item>({
  item,
  index,
}: {
  item: SelectOption<Item>;
  index: number;
}) {
  const { highlightedIndex, size, selectedItem, getItemProps } =
    useSelectContext();
  const isSelected = selectedItem.value == item.value;

  return (
    <li
      {...getItemProps({ item, index, "aria-selected": isSelected })}
      className={cn(
        "flex select-none outline-none",
        buttonSizeClassNames[size ?? "default"],
        "p-0",
      )}
    >
      <div
        className={cn(
          "relative flex size-full items-center justify-between rounded-full px-3 transition-colors duration-75",
          highlightedIndex === index &&
            "bg-secondary-hover active:bg-primary active:text-primary-foreground",
        )}
      >
        <span className="flex items-center">{item.label}</span>
        <span aria-hidden="true">
          <Check
            className={cn(
              "hidden size-6",
              size === "small" && "size-5",
              isSelected && "flex",
            )}
            strokeWidth={4}
          />
        </span>
      </div>
    </li>
  );
}

interface SelectContextType<Item> {
  items: SelectOption<Item>[];
  isOpen: boolean;
  selectedItem: SelectOption<Item>;
  highlightedIndex: number;
  toggleButtonProps: UseSelectGetToggleButtonReturnValue;
  menuProps: UseSelectGetMenuReturnValue;
  getItemProps: UseSelectPropGetters<Item>["getItemProps"];
  size?: keyof typeof buttonSizeClassNames;
}

const SelectContext = createSelectContext();

interface SelectContextProviderProps<Item> {
  items: SelectOption<Item>[];
  selectedItem: SelectOption<Item>;
  setSelectedItem: React.Dispatch<React.SetStateAction<SelectOption<Item>>>;
  size?: keyof typeof buttonSizeClassNames;
  children: React.ReactNode;
}

function SelectContextProvider<Item>({
  children,
  items,
  selectedItem,
  setSelectedItem,
  size,
}: SelectContextProviderProps<Item>) {
  const {
    isOpen,
    highlightedIndex,
    getToggleButtonProps,
    getMenuProps,
    getItemProps,
  } = useSelect({
    items,
    selectedItem,
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) =>
      setSelectedItem(newSelectedItem),
  });

  return (
    <SelectContext.Provider
      value={{
        items,
        isOpen,
        selectedItem,
        highlightedIndex,
        toggleButtonProps: getToggleButtonProps(),
        menuProps: getMenuProps(),
        getItemProps,
        size,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error(
      "useSelectContext must be used within a SelectContextProvider",
    );
  }
  return context;
}

function createSelectContext<Item>() {
  return React.createContext<SelectContextType<Item> | null>(null);
}

export { Select, SelectTrigger, SelectContent };
