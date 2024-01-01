package com.tistory.web.api.user;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tistory.config.auth.PrincipalDetails;
import com.tistory.domain.user.User;
import com.tistory.dto.ResponseDto;
import com.tistory.dto.join.JoinReqDto;
import com.tistory.dto.join.JoinRespDto;
import com.tistory.dto.user.UserReqDto;
import com.tistory.dto.user.UserRespDto.UserInfoRespDto;
import com.tistory.dto.user.UserRespDto.UserProfileRespDto;
import com.tistory.dto.user.UserRespDto.UserUpdateRespDto;
import com.tistory.service.user.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserApiController {
	
	private final  UserService userService;
	
	@PostMapping("/join")
	public ResponseEntity<?> join(@RequestBody @Valid JoinReqDto joinReqDto, BindingResult bindingResult) {
			
		JoinRespDto joinRespDto = userService.join(joinReqDto);
		
		return new ResponseEntity<>(new ResponseDto<>(1, "회원가입 성공", joinRespDto), HttpStatus.CREATED);
	}
	
	@GetMapping("/s/info")
	public ResponseEntity<?> userInfo(@AuthenticationPrincipal PrincipalDetails principalDetails) {
		
		User loginUser = principalDetails.getUser();
		
		UserInfoRespDto userInfoRespDto = userService.userInfo(loginUser);
		
		return new ResponseEntity<>(new ResponseDto<>(1, "로그인 유저 정보 조회 성공", userInfoRespDto), HttpStatus.OK);
	}
	
	@PutMapping("/s/update/profileImage")
	public ResponseEntity<?> profileImageUpdate(@AuthenticationPrincipal PrincipalDetails principalDetails, MultipartFile profileImageFile) { // 1-1. html input file의 name 값과 매핑해줘야 한다.(중요)
		
		User loginUser = principalDetails.getUser();
		
		UserProfileRespDto userProfileRespDto = userService.userProfilePictureUpdate(loginUser.getId(), profileImageFile);
		
		return new ResponseEntity<>(new ResponseDto<>(1, "프로필 사진 변경 성공", userProfileRespDto), HttpStatus.OK);
	}
	
	@PutMapping("/s/update/info")
	public ResponseEntity<?> updateUserInfo(@AuthenticationPrincipal PrincipalDetails principalDetails, @RequestBody @Valid final UserReqDto userUpdateDto, BindingResult bindingResult) {
	
		User loginUser = principalDetails.getUser();

		UserUpdateRespDto userUpdateRespDto = userService.userUpdate(loginUser.getId(), userUpdateDto);

		return new ResponseEntity<>(new ResponseDto<>(1, "회원 정보 수정 성공", userUpdateRespDto), HttpStatus.ACCEPTED);	
		
	}
	
	

}
