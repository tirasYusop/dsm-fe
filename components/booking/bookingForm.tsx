"use client";

import FriendRow, { Friend } from "@/components/booking/friend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Users, Loader2, Plus, CalendarDays,Clock } from "lucide-react";
import type {Slot} from "@/types/kitchen"

type Props = {
  bookingSlot: Slot | null;
  bookingMode: "alone" | "friends";
  friends: Friend[];
  loading: boolean;
  onModeChange: (mode: "alone" | "friends") => void;
  onFriendChange: (index: number, field: keyof Friend, value: string) => void;
  onAddFriend: () => void;
  onRemoveFriend: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function BookingForm({
  bookingSlot,
  bookingMode,
  friends,
  loading,
  onModeChange,
  onFriendChange,
  onAddFriend,
  onRemoveFriend,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <Dialog
      open={bookingSlot !== null}
      onOpenChange={(open) => {
        if (!open && !loading) onCancel();
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        {bookingSlot && (
          <>
            <DialogHeader>
              <DialogTitle className="flex gap-1 text-sm sm:text-md">
                <CalendarDays className="h-4 w-4 text-gray-400" />Date : {bookingSlot.date} 
              </DialogTitle>
              <DialogTitle className="flex gap-1 text-sm sm:text-md">
                <Clock className="h-4 w-4 text-gray-400" />Time : {bookingSlot.start_time} – {bookingSlot.end_time}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Are you booking alone or with friends?
                </label>

                <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
                  {(
                    [
                      { key: "alone" as const, label: "Alone", icon: User },
                      { key: "friends" as const, label: "With friends", icon: Users },
                    ]
                  ).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onModeChange(key)}
                      className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition ${
                        bookingMode === key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {bookingMode === "friends" && (
                <div className="space-y-3">
                  {friends.map((friend, index) => (
                    <FriendRow
                      key={index}
                      friend={friend}
                      index={index}
                      onChange={onFriendChange}
                      onRemove={onRemoveFriend}
                    />
                  ))}

                  <Button variant="outline" className="w-full" onClick={onAddFriend}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add another friend
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row">
              <Button className="w-full sm:flex-1" onClick={onSubmit} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking...
                  </span>
                ) : (
                  "Confirm booking"
                )}
              </Button>

              <Button variant="outline" className="w-full sm:w-auto" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}