package com.cognizant.hams.exception;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@NoArgsConstructor
@Getter
public class APIException extends RuntimeException{
    private static final long  serialVersionUId = 1L;

    private HttpStatus status;
    private String message;

    public APIException(String message){
        super(message);
    }

    public APIException(HttpStatus status, String message) {
        super(message); // Pass the message to the parent RuntimeException class
        this.status = status;
        this.message = message;
    }
}

