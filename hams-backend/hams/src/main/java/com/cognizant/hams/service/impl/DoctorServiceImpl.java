package com.cognizant.hams.service.impl;

import com.cognizant.hams.dto.request.DoctorDTO;
import com.cognizant.hams.dto.response.DoctorResponseDTO;
import com.cognizant.hams.entity.Doctor;
import com.cognizant.hams.exception.APIException;
import com.cognizant.hams.exception.ResourceNotFoundException;
import com.cognizant.hams.repository.AppointmentRepository;
import com.cognizant.hams.repository.DoctorRepository;
import com.cognizant.hams.service.DoctorService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final ModelMapper modelMapper;
    private final AppointmentRepository appointmentRepository;

    // Get Doctor By I'd:
    @Override
    public DoctorResponseDTO getDoctor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        Doctor doctor = (Doctor) doctorRepository.findByUser_Username(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "username", currentUsername));

        return modelMapper.map(doctor, DoctorResponseDTO.class);
    }

    // Get All Doctor

    @Override
    public List<DoctorResponseDTO> getAllDoctor(){
        List<Doctor> doctors = doctorRepository.findAll();
        if(doctors.isEmpty()){
            throw new APIException("No Doctor Available");
        }
        return doctors.stream()
                .map(doctor -> modelMapper.map(doctor,DoctorResponseDTO.class))
                .collect(Collectors.toList());
    }

    // Update Doctor

    @Override
    @Transactional
    public DoctorResponseDTO updateDoctor(Long doctorId, DoctorDTO doctorDTO) {
        Doctor existingDoctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "doctorId", doctorId));
        modelMapper.map(doctorDTO, existingDoctor);
        doctorRepository.save(existingDoctor);
        return modelMapper.map(existingDoctor, DoctorResponseDTO.class);
    }

    // Delete Doctor
    @Override
    @Transactional
    public DoctorResponseDTO deleteDoctor(Long doctorId){
        Doctor existingDoctor = doctorRepository.findByDoctorId(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor","doctorId", doctorId));
        doctorRepository.deleteById(doctorId);
        return modelMapper.map(existingDoctor,DoctorResponseDTO.class);
    }

    // Search Doctors By Specialization

    @Override
    public List<DoctorResponseDTO> searchDoctorsBySpecialization(String specialization) {
        List<Doctor> doctorSpecialization = doctorRepository.findBySpecializationContainingIgnoreCase(specialization);
        if(doctorSpecialization.isEmpty()){
            throw new ResourceNotFoundException("Doctor","Specialization",specialization);
        }

        return doctorSpecialization.stream()
                .map(doctor -> modelMapper.map(doctor,DoctorResponseDTO.class))
                .collect(Collectors.toList());
    }

    // Search Doctors By Name

    @Override
    public List<DoctorResponseDTO> searchDoctorsByName(String name) {
        List<Doctor> doctorName = doctorRepository.findByDoctorNameContainingIgnoreCase(name);
        if(doctorName.isEmpty()){
            throw new ResourceNotFoundException("Doctor","Name",name);
        }

        return doctorName.stream()
                .map(doctor -> modelMapper.map(doctor,DoctorResponseDTO.class))
                .collect(Collectors.toList());
    }
}
