package com.cognizant.hams.service;

import com.cognizant.hams.dto.response.DoctorResponseDTO;

import java.util.List;

public interface AdminService {
    List<DoctorResponseDTO> getRecentDoctors();
}
