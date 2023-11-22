"use client";

import AttributeFilter from "@/components/filters/attr-filter";
import Search from "@/components/filters/search-filter";
import SortDropdown from "@/components/filters/sort-filter";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type FiltersProps = {
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setSortKey: React.Dispatch<React.SetStateAction<CharacterSortKeys>>;
  setIsReversed: React.Dispatch<React.SetStateAction<boolean>>;
  attrFilter: Attributes;
  setAttrFilter: React.Dispatch<React.SetStateAction<Attributes>>;
  regions: Nation[];
};

// NOTE: might use memo for components to prevent rerender on isOpen change
export default function FilterHub({
  setFilter,
  setSortKey,
  setIsReversed,
  attrFilter,
  setAttrFilter,
  regions,
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 items-center justify-between gap-4 lg:grid-cols-2">
      <Search setFilter={setFilter} />
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 xl:gap-4">
        <SortDropdown
          setSortKey={setSortKey}
          className="col-span-full sm:col-span-2"
        />
        <ReverseBtn
          setIsReversed={setIsReversed}
          className="col-span-2 sm:col-span-1"
        />
        <FilterBtn
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          className="col-span-2 sm:col-span-1"
        />
      </div>
      {isOpen && (
        <AttributeFilter
          attrFilter={attrFilter}
          setAttrFilter={setAttrFilter}
          regions={regions}
        />
      )}
    </div>
  );
}

const ReverseBtn: React.FC<{
  setIsReversed: React.Dispatch<React.SetStateAction<boolean>>;
  className: string;
}> = ({ setIsReversed, className }) => {
  return (
    <Button
      onClick={() => setIsReversed((prev) => !prev)}
      aria-label="Reverse"
      className={className}
    >
      <Icons.reverse className="h-5 w-5" />
    </Button>
  );
};

const FilterBtn: React.FC<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  className: string;
}> = ({ isOpen, setIsOpen, className }) => {
  return (
    <Button
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Filter"
      aria-expanded={isOpen}
      className={className}
    >
      <Icons.filter className="h-4 w-4" />
    </Button>
  );
};
