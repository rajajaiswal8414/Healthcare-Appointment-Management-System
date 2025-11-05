package com.cognizant.hams.service;

import com.cognizant.hams.dto.request.AdminUserRequestDTO;
import com.cognizant.hams.dto.request.AuthRequest;
import com.cognizant.hams.entity.Doctor;
import com.cognizant.hams.entity.Patient;
import jakarta.transaction.Transactional;

public interface AuthService {
    String createAuthenticationToken(String username, String password);

    Patient registerNewUser(AuthRequest requestedUser);

    @Transactional
    Doctor createPrivilegedUser(AdminUserRequestDTO doctorDTO);
}
