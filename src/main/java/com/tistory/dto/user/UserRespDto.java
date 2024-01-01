package com.tistory.dto.user;

import com.tistory.domain.user.User;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

public class UserRespDto {

	@Getter @Setter
	@ToString
	public static class UserInfoRespDto {

		private Long id;
		private String username;
		private String email;
		private String profileImageUrl;
		private String role;
		
		public UserInfoRespDto(User userEntity) {
			this.id = userEntity.getId();
			this.username = userEntity.getUsername();
			this.email = userEntity.getEmail();
			this.profileImageUrl = userEntity.getProfileImageUrl();
			this.role = userEntity.getRole().getValue();
		}
	}
	
	@Getter @Setter
	@ToString
	public static class UserProfileRespDto {
		private Long id;
		private String username;
		private String email;
		private String role;
		private String profileImageUrl;
		
		public UserProfileRespDto(User userEntity) {
			this.id = userEntity.getId();
			this.username = userEntity.getUsername();
			this.email = userEntity.getEmail();
			this.role = userEntity.getRole().getValue();
			this.profileImageUrl = userEntity.getProfileImageUrl();
		}
	}
	
	@Getter @Setter
	@ToString
	public static class UserUpdateRespDto {
		private Long id;
		private String username;
		private String email;
		private String role;
		private String profileImageUrl;
		
		public UserUpdateRespDto(User userEntity) {
			this.id = userEntity.getId();
			this.username = userEntity.getUsername();
			this.email = userEntity.getEmail();
			this.role = userEntity.getRole().getValue();
			this.profileImageUrl = userEntity.getProfileImageUrl();
		}
	}
	
}
