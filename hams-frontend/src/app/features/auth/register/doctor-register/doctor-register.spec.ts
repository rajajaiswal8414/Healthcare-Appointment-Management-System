import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';

import { DoctorRegister } from './doctor-register';

describe('DoctorRegister', () => {
  let component: DoctorRegister;
  let fixture: ComponentFixture<DoctorRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorRegister, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorRegister);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('specializations', ['Cardiology', 'Dermatology']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
