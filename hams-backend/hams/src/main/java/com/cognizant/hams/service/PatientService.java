package com.cognizant.hams.service;

import com.cognizant.hams.dto.request.PatientDTO;
import com.cognizant.hams.dto.response.DoctorResponseDTO;
import com.cognizant.hams.dto.response.PatientResponseDTO;

import java.util.List;

public interface PatientService {

    PatientResponseDTO getPatient();

    PatientResponseDTO updatePatient(PatientDTO patientUpdateDTO);

    PatientResponseDTO deletePatient(Long patientId);

    List<DoctorResponseDTO> getAllDoctors();


    List<DoctorResponseDTO> searchDoctorByName(String name);

    List<DoctorResponseDTO> searchDoctorBySpecialization(String specialization);

    long getTotalPatientCount();
}
//    AppointmentResponseDTO bookAppointment(Long patientId, AppointmentDTO appointmentDTO);
//    AppointmentResponseDTO cancelAppointment(Long appointmentId);

//  --- Appointments ---
//    AppointmentResponseDTO getAppointmentById(Long appointmentId);
//    AppointmentResponseDTO bookAppointment(Long patientId, AppointmentCreateDTO appointmentCreateDTO);
//    AppointmentResponseDTO updateAppointment(Long appointmentId, AppointmentUpdateDTO appointmentUpdateDTO);
//    AppointmentResponseDTO cancelAppointment(Long appointmentId);

