package com.tistory.service.user;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import com.tistory.domain.user.User;
import com.tistory.domain.user.UserRepository;
import com.tistory.domain.visit.Visit;
import com.tistory.domain.visit.VisitRepository;
import com.tistory.dto.join.JoinReqDto;
import com.tistory.dto.join.JoinRespDto;
import com.tistory.dto.user.UserReqDto;
import com.tistory.dto.user.UserRespDto.UserInfoRespDto;
import com.tistory.dto.user.UserRespDto.UserProfileRespDto;
import com.tistory.dto.user.UserRespDto.UserUpdateRespDto;
import com.tistory.handler.exception.CustomApiException;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(rollbackFor = Exception.class)  // RuntimeException 말고도 모든 예외가 터졌을시 롤백시킨다.
@RequiredArgsConstructor
public class UserService {

	private final Logger log = LoggerFactory.getLogger(getClass());

	private final UserRepository userRepository;
	private final VisitRepository visitRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	
	// 3-5. 실제 파일이 저장될 경로
	@Value("${file.path}")
	private String uploadFolder;
	
	public JoinRespDto join(JoinReqDto joinReqDto) {
		log.info("회원가입");
		// 1-1. 동일 회원 아이디가 있는지 확인
		Optional<User> userOp = userRepository.findByUsername(joinReqDto.getUsername());
		
		if(userOp.isPresent()) {
			
			throw new CustomApiException("중복된 아이디입니다.");
		}
		
		// 1-2. 패스워드 인코딩 + 회원가입
		User userPS = userRepository.save(joinReqDto.toEntity(passwordEncoder));
		
		// 1-3. Visit 엔티티 생성
		Visit visit = new Visit(0L, userPS);
		
		visitRepository.save(visit);
		
		// 1-3. dto 응답
		return new JoinRespDto(userPS);
	}
	
	
	@Transactional(readOnly = true)
	public UserInfoRespDto userInfo(User loginUser) {
		log.info("로그인 유저 정보 DB에서 가져오기");
		// 2-1. 전달 받은 User entity 정보가 있는지 확인
		Optional<User> userOp = userRepository.findByUsername(loginUser.getUsername());
				
		if(userOp.isPresent()) {
			User findUser = userOp.get();
					
			return new UserInfoRespDto(findUser);
					
		} else {
			throw new CustomApiException("해당 유저가 존재하지 않습니다.");
		}
	}

	public UserProfileRespDto userProfilePictureUpdate(Long principalId, MultipartFile profileImageFile) {
		// 3-1. 파일명 + 확장자 가져오기
		String originalFileName = profileImageFile.getOriginalFilename();
				
		// 3-2. 확장자 추출
		String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
				
		// 3-3. UUID[Universally Unique IDentifier] : 네트워크 상에서 고유성이 보장되는 id를 만들기 위한 표준 규약. 범용고유식별자.
		UUID uuid = UUID.randomUUID();
				
		// 3-4. UUID + 확장자 명으로 저장
		String imageFileName = uuid.toString() + extension;
		
		// 3-5. 3-4에서 가져온 실제 파일이  저장될 경로에 3-3에서 만든 UUID 파일명을 더해서 Path를 만든다.
		Path imageFilePath = Paths.get(uploadFolder + imageFileName);
		
		System.out.println(imageFilePath);
		
		// 3-6. 파일을 실제 저장 경로에 저장하는 로직 -> 통신 or I/O -> 예외가 발생할 수 있다(try-catch로 묶어서 처리)
		try {
			
			Files.write(imageFilePath, profileImageFile.getBytes());
			
		} catch (Exception e) {
			throw new MaxUploadSizeExceededException(1000);
		}
		
		// 3-7. 로그인 유저 정보를 가져온다.
		User userEntity = userRepository.findById(principalId).orElseThrow(() -> {
			throw new CustomApiException("해당 유저를 찾을 수 없습니다.");
		});		
			
		// 3-8. 변경감지를 이용해 set을 호출하면 업데이트
		userEntity.setProfileImageUrl(imageFileName);
		
		return new UserProfileRespDto(userEntity);
				
	}
	
	public UserUpdateRespDto userUpdate(Long principalId, UserReqDto userUpdateDto) {
		// 4-1. 로그인 유저 정보를 가져온다.
		User userEntity = userRepository.findById(principalId).orElseThrow(() -> {
			throw new CustomApiException("해당 유저를 찾을 수 없습니다.");
		});
		
		// 4-2. 회원 정보 변경 화면에서 가져온 계정의 비밀번호를 가져온다.
		String rawPassword = userUpdateDto.getPassword();
		
		// 4-3. 회원 정보 변경 화면에서 가져온 계정의 변경할 비밀번호를 가져온다.
		String changedPassword = userUpdateDto.getConvertPassword();
		
		// 4-4. passwordEncoder의 matches 메소드는 인코딩된 비밀번호가 매개변수로 들어온 문자열과 일치하는지 내부적으로 확인해주고 맞으면 true, 아니면 false를 반환. 
		if(passwordEncoder.matches(rawPassword, userEntity.getPassword())) {
			// 4-5. 4-4를 통과했다면 계정의 원래 비밀번호를 정상적으로 맞게 입력했다는 의미이므로 변경할 비밀번호를 인코딩해서 encodedPassword에 저장한다.
			String encodedPassword = passwordEncoder.encode(changedPassword);
			
			// 4-6. 전달 받은 이메일로 변경(영속화) -> 변경 감지.
			userEntity.setEmail(userUpdateDto.getEmail());
			
			// 4-7. 비밀번호 변경(영속화) -> 변경 감지.
			userEntity.setPassword(encodedPassword);
						
		} else {
			throw new CustomApiException("현재 비밀번호가 일치하지 않습니다.");
		}
		
		return new UserUpdateRespDto(userEntity);
	}
	
}
