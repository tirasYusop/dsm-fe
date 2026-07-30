"use client";

import { X } from "lucide-react";

export type Friend = {
  name: string;
  student_id: string;
  faculty: string;
};

type Props = {
  friend: Friend;
  index: number;
  onChange: (index: number, field: keyof Friend, value: string) => void;
  onRemove: (index: number) => void;
};

export default function FriendRow({ friend, index, onChange, onRemove }: Props) {
  return (
    <div className="relative space-y-2 rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">Friend {index + 1}</p>
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label={`Remove friend ${index + 1}`}
          className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Name"
        value={friend.name}
        onChange={(e) => onChange(index, "name", e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
      />

      <input
        type="text"
        placeholder="Student ID"
        value={friend.student_id}
        onChange={(e) => onChange(index, "student_id", e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
      />

      <input
        type="text"
        placeholder="Faculty"
        value={friend.faculty}
        onChange={(e) => onChange(index, "faculty", e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
      />
    </div>
  );
}