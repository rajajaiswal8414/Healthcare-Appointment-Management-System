import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Assume these imports point to your correct files
import { AvailabilitySlot } from '../../../models/availabilityslot-interface.js';
import {
  DoctorAvailabilityPayload,
  DoctorAvailabilityService,
} from 'src/app/core/services/doctor-availability-service.js';
import { toast } from 'ngx-sonner';
import { DoctorAuthService } from 'src/app/core/services/doctor-auth-service.js';

interface LocalAvailabilitySlot extends AvailabilitySlot {}

@Component({
  selector: 'app-doctor-availability',
  templateUrl: './doctor-availability.html', // Ensure this points to the HTML below
  styleUrls: ['./doctor-availability.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
})
export class DoctorAvailability implements OnInit {
  private availabilityService = inject(DoctorAvailabilityService);
  private doctorAuthService = inject(DoctorAuthService);

  currentTab: 'slots' | 'add' = 'slots';
  scheduledSlots: AvailabilitySlot[] = [];

  // The newSlot model must be able to hold the 'id' when editing
  newSlot: Partial<AvailabilitySlot> = {
    // availabilityId: undefined, // Must be explicitly set to undefined/null for new slots
    startTime: '09:00',
    endTime: '17:00',
    availableDate: this.getCurrentDateString(),
  };

  isEditMode: boolean = false;
  timeOptions: string[] = [];

  ngOnInit(): void {
    this.timeOptions = this.generateTimeOptions();
    this.fetchScheduledSlots();
  }

  private getCurrentDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  public trackByAvailabilityId(index: number, slot: AvailabilitySlot): number {
    // If this returns duplicate values, the data from the backend is faulty or IDs are missing
    return slot.availabilityId;
  }

  private generateTimeOptions(): string[] {
    const slots: string[] = [];
    const BREAK_START = '12:30';
    const BREAK_END = '13:30';
    const END_OF_DAY = 23;

    for (let h = 0; h <= END_OF_DAY; h++) {
      for (const m of ['00', '30']) {
        const time = `${h.toString().padStart(2, '0')}:${m}`;
        if (time >= BREAK_START && time < BREAK_END) {
          continue;
        }
        slots.push(time);
      }
    }
    return slots;
  }

  isTimeValid(): boolean {
    if (!this.newSlot.startTime || !this.newSlot.endTime) return false;

    const start = this.newSlot.startTime.split(':').map(Number);
    const end = this.newSlot.endTime.split(':').map(Number);

    const startTimeMinutes = start[0] * 60 + start[1];
    const endTimeMinutes = end[0] * 60 + end[1];

    return endTimeMinutes - startTimeMinutes >= 30;
  }

  fetchScheduledSlots(): void {
    this.availabilityService.getScheduledSlots().subscribe({
      next: (slots) => {
        this.scheduledSlots = slots;
      },
      error: (err) => {
        console.error('Failed to fetch availability slots:', err);

        const errorMessage = err.error?.message || 'Could not connect to the server.';

        toast.error('Load Error ❌', {
          description: `Failed to fetch scheduled slots. ${errorMessage} Please try again.`,
          duration: 5000, // Display for 5 seconds
        });
      },
    });
  }

  switchTab(tab: 'slots' | 'add'): void {
    this.currentTab = tab;
    // If switching to add and not in edit mode, ensure form is reset
    if (tab === 'add' && !this.isEditMode) {
      this.resetForm();
    }
  }

  saveNewSlot(): void {
    if (!this.newSlot.startTime || !this.newSlot.endTime || !this.newSlot.availableDate) {
      // --- TOAST IMPLEMENTATION ---
      toast.warning('Missing Information', {
        description: 'Please fill in the date, start time, and end time for the new slot.',
        duration: 3000, // Display for 3 seconds
      });

      return;
    }

    // ... rest of the logic to save the slot

    const apiPayload: DoctorAvailabilityPayload = {
      id: this.newSlot.availabilityId,
      availableDate: this.newSlot.availableDate,
      startTime: this.newSlot.startTime,
      endTime: this.newSlot.endTime,
    };

    // 🔑 FIX: Correct logic to distinguish between UPDATE and CREATE
    if (this.isEditMode && typeof apiPayload.id === 'number' && apiPayload.id > 0) {
      // --- UPDATE LOGIC (PUT) ---
      this.availabilityService.updateSlot(apiPayload).subscribe({
        next: () => {
          // --- SUCCESS TOAST for Update ---
          toast.success('Slot Updated 🎉', {
            description: 'The availability slot has been modified successfully.',
          });
          // alert('Slot updated successfully!'); // Removed
          this.fetchScheduledSlots();
          this.resetForm();
          this.switchTab('slots');
        },
        error: (err) => {
          console.error('Update Failed:', err);
          // --- ERROR TOAST for Update Failure ---
          const errorMessage = err.error?.message || 'Check network connection or server logs.';
          toast.error('Update Failed ❌', {
            description: `Could not update the slot: ${errorMessage}`,
          });
        },
      });
    } else {
      // --- CREATE LOGIC (POST) ---
      this.availabilityService.saveNewSlot(apiPayload).subscribe({
        next: () => {
          // --- SUCCESS TOAST for Create ---
          toast.success('Slot Created ✅', {
            description: 'A new availability slot has been added.',
          });
          // alert('Availability slot added successfully!'); // Removed
          this.fetchScheduledSlots();
          this.resetForm();
          this.switchTab('slots');
        },
        error: (err) => {
          console.error('Save Failed:', err);
          // --- ERROR TOAST for Create Failure ---
          const errorMessage = err.error?.message || 'Check network connection or server logs.';
          toast.error('Save Failed ❌', {
            description: `Could not save the new slot: ${errorMessage}`,
          });
        },
      });
    }
  }

  resetForm(): void {
    this.newSlot = {
      startTime: '09:00',
      endTime: '17:00',
      availableDate: this.getCurrentDateString(),
      availabilityId: undefined, // 🔑 Crucial: Clear ID when resetting for a new slot
    };
    this.isEditMode = false;
  }

  editSlot(slot: AvailabilitySlot): void {
    // Validate that slot is an object and has a numeric availabilityId
    if (!slot || typeof slot !== 'object') {
      alert('Cannot edit: Selected slot is invalid.');
      return;
    }

    // Ensure the slot has a valid numeric availabilityId before editing
    if (typeof (slot as any).availabilityId !== 'number' || (slot as any).availabilityId <= 0) {
      alert('Cannot edit: Selected slot is missing a valid ID.');
      return;
    }

    // Copy the slot object (now TypeScript knows it's an object) and retain the ID
    this.newSlot = { ...(slot as AvailabilitySlot) };
    this.isEditMode = true;
    this.switchTab('add');
  }

  deleteSlot(availabilityId: number | undefined): void {
    // 🔑 FIX: Strict validation to prevent calling the API with an undefined or invalid ID
    if (!availabilityId || typeof availabilityId !== 'number' || availabilityId <= 0) {
      console.error('Attempted to delete slot with invalid ID:', availabilityId);

      // --- TOAST for Invalid ID ---
      toast.error('Deletion Blocked', {
        description: 'Cannot delete: The Slot ID is missing or invalid.',
      });
      // alert('Cannot delete: Slot ID is missing or invalid.'); // Removed
      return;
    }

    if (
      confirm(
        'Are you sure you want to delete this availability slot? This action cannot be undone.'
      )
    ) {
      this.availabilityService.deleteSlot(availabilityId).subscribe({
        next: () => {
          // --- SUCCESS TOAST ---
          toast.success('Slot Deleted', {
            description: 'The availability slot has been removed successfully.',
          });
          // alert('Slot deleted successfully!'); // Removed

          // --- FIX: CORRECT FILTER LOGIC ---
          // You were comparing availabilityId !== availabilityId, which is always false.
          // You need to filter the scheduledSlots array to remove the deleted slot.
          this.scheduledSlots = this.scheduledSlots.filter(
            (slot) => slot.availabilityId !== availabilityId
          );
          // Note: Assuming your slot object has an 'id' property.
          // If your slot object uses 'availabilityId' as the property name, use:
          // (slot) => slot.availabilityId !== availabilityId
        },
        error: (err) => {
          console.error('Delete Failed:', err);

          // --- ERROR TOAST ---
          const errorMessage = err.error?.message || 'Server error occurred.';
          toast.error('Deletion Failed ❌', {
            description: `Failed to delete slot: ${errorMessage}. Please check the server logs.`,
          });
          // alert(...) // Removed
        },
      });
    }
  }

  logout(): void {
    this.doctorAuthService.logout();
  }
}
