package com.tistory.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class ResponseDto<T> {  // 1-1. 공통 json 응답 dto

	private final Integer code;  // 1-2. 1, -1
	private final String message;  // 1-3.
	private final T data;  // 1-4.
}
