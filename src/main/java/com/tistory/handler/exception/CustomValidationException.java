package com.tistory.handler.exception;

import java.util.Map;

import lombok.Getter;

@Getter
public class CustomValidationException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private Map<String, String> errorMap;

	public CustomValidationException(String message, Map<String, String> errorMap) {
		super(message);
		this.errorMap = errorMap;
	}
	
	
}
