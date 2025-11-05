import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { FindDoctorComponent } from './find-doctor';
import { PatientService } from '../../../core/services/patient-service';
import { AppointmentService } from '../../../core/services/patient-appointment-service';
import { DoctorResponseDTO } from '../../../models/doctor-interface';
import { AppointmentDTO } from '../../../models/appointment-interface';

describe('FindDoctorComponent', () => {
  let component: FindDoctorComponent;
  let fixture: ComponentFixture<FindDoctorComponent>;
  let patientService: jasmine.SpyObj<PatientService>;
  let appointmentService: jasmine.SpyObj<AppointmentService>;

  const mockDoctors: DoctorResponseDTO[] = [
    {
      doctorId: 1,
      doctorName: 'Dr. John Smith',
      specialization: 'Cardiology',
      qualification: 'MD',
      yearOfExperience: 10,
      clinicAddress: '123 Main St',
      contactNumber: '123-456-7890',
      email: 'john@example.com'
    },
    {
      doctorId: 2,
      doctorName: 'Dr. Jane Doe',
      specialization: 'Dermatology',
      qualification: 'MD',
      yearOfExperience: 8,
      clinicAddress: '456 Oak Ave',
      contactNumber: '987-654-3210',
      email: 'jane@example.com'
    }
  ];

  beforeEach(async () => {
    const patientServiceSpy = jasmine.createSpyObj('PatientService', [
      'getPatient',
      'getAllDoctors',
      'searchDoctorByName',
      'searchDoctorBySpecialization'
    ]);
    const appointmentServiceSpy = jasmine.createSpyObj('AppointmentService', [
      'bookAppointment'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        FindDoctorComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: AppointmentService, useValue: appointmentServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FindDoctorComponent);
    component = fixture.componentInstance;
    patientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    appointmentService = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load patient data and all doctors on init', () => {
      const mockPatient: any = {
        patientId: 1,
        name: 'John Doe',
        email: 'john@example.com',
        contactNumber: '123-456-7890',
        address: '123 Main St',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        bloodGroup: 'O+'
      };
      patientService.getPatient.and.returnValue(of(mockPatient));
      patientService.getAllDoctors.and.returnValue(of(mockDoctors));

      component.ngOnInit();

      expect(patientService.getPatient).toHaveBeenCalled();
      expect(patientService.getAllDoctors).toHaveBeenCalled();
      expect(component.patient).toEqual(mockPatient);
      expect(component.doctors).toEqual(mockDoctors);
      expect(component.filteredDoctors).toEqual(mockDoctors);
    });

    it('should handle patient data loading error', () => {
      spyOn(console, 'error');
      patientService.getPatient.and.returnValue(throwError(() => new Error('Load error')));
      patientService.getAllDoctors.and.returnValue(of(mockDoctors));

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Error loading patient data:', jasmine.any(Error));
    });

    it('should handle doctors loading error', () => {
      spyOn(console, 'error');
      const mockPatient: any = {
        patientId: 1,
        name: 'John Doe',
        email: 'john@example.com',
        contactNumber: '123-456-7890',
        address: '123 Main St',
        gender: 'Male',
        dateOfBirth: '1990-01-01',
        bloodGroup: 'O+'
      };
      patientService.getPatient.and.returnValue(of(mockPatient));
      patientService.getAllDoctors.and.returnValue(throwError(() => new Error('Load error')));

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('Error loading doctors:', jasmine.any(Error));
    });
  });

  describe('searchDoctors', () => {
    beforeEach(() => {
      component.doctors = mockDoctors;
    });

    it('should show all doctors when search term is empty', () => {
      component.searchTerm = '';
      component.searchType = 'name';

      component.searchDoctors();

      expect(component.filteredDoctors).toEqual(mockDoctors);
    });

    it('should search doctors by name', () => {
      const searchResult = [mockDoctors[0]];
      patientService.searchDoctorByName.and.returnValue(of(searchResult));
      component.searchTerm = 'John';
      component.searchType = 'name';

      component.searchDoctors();

      expect(patientService.searchDoctorByName).toHaveBeenCalledWith('John');
      expect(component.filteredDoctors).toEqual(searchResult);
    });

    it('should search doctors by specialization', () => {
      const searchResult = [mockDoctors[0]];
      patientService.searchDoctorBySpecialization.and.returnValue(of(searchResult));
      component.searchTerm = 'Cardiology';
      component.searchType = 'specialization';

      component.searchDoctors();

      expect(patientService.searchDoctorBySpecialization).toHaveBeenCalledWith('Cardiology');
      expect(component.filteredDoctors).toEqual(searchResult);
    });

    it('should handle search error', () => {
      spyOn(console, 'error');
      patientService.searchDoctorByName.and.returnValue(throwError(() => new Error('Search error')));
      component.searchTerm = 'John';
      component.searchType = 'name';

      component.searchDoctors();

      expect(console.error).toHaveBeenCalledWith('Error searching doctors by name:', jasmine.any(Error));
    });
  });

  describe('openBookingModal', () => {
    it('should open booking modal and set selected doctor', () => {
      const doctor = mockDoctors[0];

      component.openBookingModal(doctor);

      expect(component.showBookingModal).toBeTrue();
      expect(component.selectedDoctor).toEqual(doctor);
      expect(component.appointmentData.doctorId).toEqual(doctor.doctorId);
    });
  });

  describe('closeBookingModal', () => {
    it('should close booking modal and reset data', () => {
      component.selectedDoctor = mockDoctors[0];
      component.showBookingModal = true;
      component.appointmentData = {
        doctorId: 1,
        appointmentDate: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        reason: 'Checkup'
      };

      component.closeBookingModal();

      expect(component.showBookingModal).toBeFalse();
      expect(component.selectedDoctor).toBeNull();
      expect(component.appointmentData.doctorId).toBe(0);
      expect(component.appointmentData.appointmentDate).toBe('');
    });
  });

  describe('bookAppointment', () => {
    beforeEach(() => {
      spyOn(component['router'], 'navigate');
      spyOn(console, 'log');
    });

    it('should book appointment successfully', () => {
      const mockAppointment: any = {
        appointmentId: 1,
        appointmentDate: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        reason: 'Checkup',
        status: 'PENDING',
        doctor: mockDoctors[0],
        patient: { patientId: 1, name: 'John Doe' }
      };
      appointmentService.bookAppointment.and.returnValue(of(mockAppointment));
      component.appointmentData = {
        doctorId: 1,
        appointmentDate: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        reason: 'Checkup'
      };

      component.bookAppointment();

      expect(appointmentService.bookAppointment).toHaveBeenCalledWith({
        doctorId: 1,
        appointmentDate: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        reason: 'Checkup'
      });
      expect(console.log).toHaveBeenCalledWith('Appointment booked successfully:', mockAppointment);
      expect(component['router'].navigate).toHaveBeenCalledWith(['/patient/my-appointments']);
    });

    it('should handle booking error', () => {
      spyOn(console, 'error');
      appointmentService.bookAppointment.and.returnValue(throwError(() => new Error('Booking error')));
      component.appointmentData = {
        doctorId: 1,
        appointmentDate: '2024-01-01',
        startTime: '10:00',
        endTime: '11:00',
        reason: 'Checkup'
      };

      component.bookAppointment();

      expect(console.error).toHaveBeenCalledWith('Error booking appointment:', jasmine.any(Error));
    });

    it('should not book appointment if required fields are missing', () => {
      component.appointmentData = {
        doctorId: 0,
        appointmentDate: '',
        startTime: '',
        endTime: '',
        reason: ''
      };

      component.bookAppointment();

      expect(appointmentService.bookAppointment).not.toHaveBeenCalled();
    });


  });

  describe('getDoctorInitials', () => {
    it('should return correct initials for doctor name', () => {
      expect(component.getDoctorInitials('Dr. John Smith')).toBe('DJS');
      expect(component.getDoctorInitials('Jane Doe')).toBe('JD');
      expect(component.getDoctorInitials('Single')).toBe('S');
    });
  });
});
