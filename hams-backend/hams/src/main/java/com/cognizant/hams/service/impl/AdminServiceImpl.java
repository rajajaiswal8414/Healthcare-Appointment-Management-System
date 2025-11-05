package com.cognizant.hams.service.impl;

import com.cognizant.hams.dto.response.DoctorResponseDTO;
import com.cognizant.hams.entity.Doctor;
import com.cognizant.hams.repository.DoctorRepository;
import com.cognizant.hams.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final DoctorRepository doctorRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<DoctorResponseDTO> getRecentDoctors(){
        LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
        List<Doctor> recentDoctors = doctorRepository.findRecentDoctors(oneWeekAgo);
        return recentDoctors.stream()
                .map(doctor -> modelMapper.map(doctor, DoctorResponseDTO.class))
                .collect(Collectors.toList());
    }
}
