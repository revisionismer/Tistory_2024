package com.tistory.dto.join;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.tistory.constant.user.UserEnum;
import com.tistory.domain.user.User;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class JoinReqDto {
	@Pattern(regexp = "^[a-zA-Z0-9]{2,20}$", message = "영문과 숫자를 조합해서 2~20자 이내로 작성해주세요.") // 2-1. 영문, 숫자는 되고, 길이는 최소 2~20자 이내
	@NotEmpty  // 1-1. null이거나 공백일 수 없다.
	private String username;  
	
	@Size(min = 4, max = 20)
	@NotEmpty
	private String password;  // 길이 4~20
	
	@Pattern(regexp = "^[a-zA-Z0-9]{2,10}@[a-zA-Z0-9]{2,6}\\.[a-zA-Z]{2,3}$", message = "이메일 형식으로 작성해 주세요.")
	@NotEmpty
	private String email;  // 이메일 형식
	
	public User toEntity(BCryptPasswordEncoder passwordEncoder) {
		return User.builder()
				.username(username)
				.password(passwordEncoder.encode(password))
				.email(email)
				.role(UserEnum.USER)
				.createdAt(LocalDateTime.now())
				.updateAt(null)
				.build();
	}
}
