package com.cognizant.hams.service.impl;

import com.cognizant.hams.dto.request.PatientDTO;
import com.cognizant.hams.dto.response.DoctorResponseDTO;
import com.cognizant.hams.dto.response.PatientResponseDTO;
import com.cognizant.hams.entity.Patient;
import com.cognizant.hams.exception.APIException;
import com.cognizant.hams.exception.ResourceNotFoundException;
import com.cognizant.hams.repository.PatientRepository;
import com.cognizant.hams.service.DoctorService;
import com.cognizant.hams.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final ModelMapper modelMapper;
    private final DoctorService doctorService;

    @Override
    public PatientResponseDTO getPatient() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        Patient patient = (Patient) patientRepository.findByUser_Username(currentUsername)
                .orElseThrow(() -> new APIException("Logged-in user is not a patient."));

        return modelMapper.map(patient, PatientResponseDTO.class);
    }

    @Override
    public PatientResponseDTO updatePatient(PatientDTO patientDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        Patient existingPatient = (Patient) patientRepository.findByUser_Username(currentUsername)
                .orElseThrow(() -> new APIException("Logged-in user is not a patient."));

        modelMapper.map(patientDTO, existingPatient);

        Patient updatedPatient = patientRepository.save(existingPatient);

        return modelMapper.map(updatedPatient, PatientResponseDTO.class);
    }

    @Override
    public PatientResponseDTO deletePatient(Long patientId){
        Patient deletePatient = patientRepository.findById(patientId)
                .orElseThrow(()-> new ResourceNotFoundException("Patient", "patientID", patientId));
        patientRepository.delete(deletePatient);
        return modelMapper.map(deletePatient, PatientResponseDTO.class);
    }

    @Override
    public List<DoctorResponseDTO> getAllDoctors(){
        return doctorService.getAllDoctor();
    }

    @Override
    public List<DoctorResponseDTO> searchDoctorByName(String name) {
        return doctorService.searchDoctorsByName(name);
    }

    @Override
    public List<DoctorResponseDTO> searchDoctorBySpecialization(String specialization) {
        return doctorService.searchDoctorsBySpecialization(specialization);
    }

    @Override
    public long getTotalPatientCount() {
        // 🔑 Use the inherited count() method from JpaRepository
        return patientRepository.count();
    }
}




