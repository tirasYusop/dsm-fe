"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  loading?: boolean;
  currentCount?: number;
  totalCount?: number;
  pageSize?: number;
  itemLabel?: string;
}

export default function PaginationControls({
  page,
  totalPages,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  loading,
  currentCount,
  totalCount,
  pageSize,
  itemLabel,
}: PaginationControlsProps) {
  const showingRange =
    totalCount != null && totalCount > 0
      ? `${currentCount ?? totalCount} daripada ${totalCount}${itemLabel ? ` ${itemLabel}` : ""}`
      : null;

  return (
    <div className="flex flex-col items-center justify-center gap-3 border-t pt-4 sm:flex-row">
      {/*{showingRange ? <div className="text-sm text-gray-500">{showingRange}</div> : <div />}*/}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!hasPrevious || loading} onClick={onPrevious}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <span className="min-w-[100px] text-center text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={!hasNext || loading} onClick={onNext}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}