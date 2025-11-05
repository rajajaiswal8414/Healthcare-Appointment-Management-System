import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DoctorAvailability } from './doctor-availability';

describe('DoctorAvailability', () => {
  let component: DoctorAvailability;
  let fixture: ComponentFixture<DoctorAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAvailability, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorAvailability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
