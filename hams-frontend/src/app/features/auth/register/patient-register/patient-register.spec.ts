import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PatientRegister } from './patient-register';

describe('PatientRegister', () => {
  let component: PatientRegister;
  let fixture: ComponentFixture<PatientRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientRegister, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
