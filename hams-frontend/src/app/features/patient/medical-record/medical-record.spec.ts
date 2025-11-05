import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { MedicalRecord } from './medical-record';

describe('MedicalRecord', () => {
  let component: MedicalRecord;
  let fixture: ComponentFixture<MedicalRecord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalRecord, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalRecord);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
