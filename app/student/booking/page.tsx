"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api1";
import KitchenSelector from "@/components/booking/KitchenSelector";
import DateNavigator from "@/components/booking/date";
import SlotList from "@/components/booking/slotList";
import BookingForm from "@/components/booking/bookingForm";
import { Friend } from "@/components/booking/friend";
import type {Slot,Kitchen} from "@/types/kitchen"

const emptyFriend = (): Friend => ({ name: "", student_id: "", faculty: "" });

export default function BookingPage() {
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [selectedKitchen, setSelectedKitchen] = useState<number | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlot, setBookingSlot] = useState<Slot | null>(null);
  const [bookingMode, setBookingMode] = useState<"alone" | "friends">("alone");
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    fetchKitchens();
  }, []);

  useEffect(() => {
    if (selectedKitchen !== null) {
      fetchSlots(selectedKitchen);
    }
  }, [selectedKitchen]);

  const fetchKitchens = async () => {
    try {
      const res = await API.get("/kitchens/");
      const active = res.data.filter((k: Kitchen) => k.is_active);
      setKitchens(active);
      if (active.length > 0) {
        setSelectedKitchen(active[0].id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSlots = async (kitchenId: number) => {
    setLoadingSlots(true);
    try {
      const res = await API.get(`/kitchen-slots/available/?kitchen=${kitchenId}`);
      setSlots(res.data);
      setSelectedDate(res.data.length > 0 ? res.data[0].date : "");
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const openBookingForm = (id: number) => {
    const slot = slots.find((s) => s.id === id);
    if (!slot) return;

    setBookingSlot(slot);
    setBookingMode("alone");
    setFriends([]);
  };

  const closeBookingForm = () => {
    setBookingSlot(null);
    setBookingMode("alone");
    setFriends([]);
  };

  const handleModeChange = (mode: "alone" | "friends") => {
    setBookingMode(mode);
    if (mode === "alone") {
      setFriends([]);
    } else if (friends.length === 0) {
      setFriends([emptyFriend()]);
    }
  };

  const addFriendRow = () => setFriends((prev) => [...prev, emptyFriend()]);
  const removeFriendRow = (index: number) =>
    setFriends((prev) => prev.filter((_, i) => i !== index));

  const updateFriendField = (index: number, field: keyof Friend, value: string) => {
    setFriends((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const submitBooking = async () => {
    if (!bookingSlot) return;

    if (bookingMode === "friends") {
      if (friends.length === 0) {
        alert('Add at least one friend, or switch to "Booking alone".');
        return;
      }

      for (const f of friends) {
        if (!f.name.trim() || !f.student_id.trim() || !f.faculty.trim()) {
          alert("Please fill in name, student ID, and faculty for every friend.");
          return;
        }
      }

      const ids = friends.map((f) => f.student_id.trim());
      if (new Set(ids).size !== ids.length) {
        alert("Duplicate student ID among friends.");
        return;
      }
    }

    const participants = bookingMode === "friends" ? friends : [];
    const slotLabel = `${bookingSlot.date}, ${bookingSlot.start_time} - ${bookingSlot.end_time}`;
    const confirmed = window.confirm(
      participants.length > 0
        ? `Tempah ${slotLabel} untuk anda dan  ${participants.length} rakan(s)`
        : `Adakah anda pasti mahu menempah  ${slotLabel}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await API.post("/kitchen-bookings/", {
        slot: bookingSlot.id,
        purpose: "Cooking activity",
        participants,
      });
      alert("Booking successful");
      closeBookingForm();
      if (selectedKitchen !== null) {
        fetchSlots(selectedKitchen);
      }
    } catch (err: any) {
      console.log(err);
      alert(err?.response?.data?.error ?? "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const dates = [...new Set(slots.map((item) => item.date))];
  const currentIndex = dates.indexOf(selectedDate);

  const goNext = () => {
    if (currentIndex < dates.length - 1) {
      setSelectedDate(dates[currentIndex + 1]);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setSelectedDate(dates[currentIndex - 1]);
    }
  };

  const todaySlots = slots.filter((item) => item.date === selectedDate);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-3 sm:space-y-5 sm:p-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Buku Dapur Siswa</h1>
        <p className="text-sm text-gray-500">Pilih dapur, tarikh, dan slot masa untuk membuat tempahan.</p>
      </div>

      <KitchenSelector kitchens={kitchens} selectedKitchen={selectedKitchen} onSelect={setSelectedKitchen} />

      <DateNavigator
        dates={dates}
        selectedDate={selectedDate}
        currentIndex={currentIndex}
        onNext={goNext}
        onPrevious={goPrevious}
        onDateChange={setSelectedDate}
      />

      <SlotList slots={todaySlots} loading={loadingSlots} onBook={openBookingForm} />

      <BookingForm
        bookingSlot={bookingSlot}
        bookingMode={bookingMode}
        friends={friends}
        loading={loading}
        onModeChange={handleModeChange}
        onFriendChange={updateFriendField}
        onAddFriend={addFriendRow}
        onRemoveFriend={removeFriendRow}
        onSubmit={submitBooking}
        onCancel={closeBookingForm}
      />
    </div>
  );
}