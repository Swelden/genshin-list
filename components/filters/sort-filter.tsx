"use client";

import * as React from "react";

import { sortOptions, useSortOption } from "@/hooks/use-characters";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";

interface SortDropdownProps {
  className?: string;
}

export function SortDropdown({ className }: SortDropdownProps) {
  const [sortOption, setSortOption] = useSortOption();
  return (
    <Select
      items={sortOptions}
      selectedItem={sortOption}
      setSelectedItem={setSortOption}
      className={className}
    >
      <SelectTrigger>Sort by {sortOption.label}</SelectTrigger>
      <SelectContent />
    </Select>
  );
}
