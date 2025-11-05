import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DoctorAppointments } from './doctor-appointments';

describe('DoctorAppointments', () => {
  let component: DoctorAppointments;
  let fixture: ComponentFixture<DoctorAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAppointments, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorAppointments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
