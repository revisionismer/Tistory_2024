package com.tistory.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.tistory.domain.user.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
@ToString
public class UserReqDto {

	@Pattern(regexp = "[a-zA-Z0-9]{3,20}", message = "유저네임은 한글이 들어갈 수 없습니다.")
    @Size(min = 3, max = 20)
    @NotBlank
    private String username;

    @Size(min = 4, max = 20, message = "패스워드는 최소 4자 ~ 최대 20자까지입니다.")
    @NotBlank
    private String password;
    
    @Size(min = 4, max = 20, message = "변경하실 패스워드는 최소 4자 ~ 최대 20자까지입니다.")
    @NotBlank
    private String convertPassword;

    @Size(min = 8, max = 60)
    @NotBlank // @NotNull, @NotEmpty 두개의 조합
    @Email
    private String email;

	public User toEntity() {
		return User.builder()
				.username(username)
				.password(convertPassword)
				.email(email)
				.build();
	}
}
