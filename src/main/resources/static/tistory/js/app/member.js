/**
 *  member.js -> 주의 : user.js라고 이름 지으면 다운로드된다(인식 안됨)
 */

var ACCESS_TOKEN = getCookie('access_token');

function getCookie(key) {
	let result = null;
	let cookie = document.cookie.split(';');
	cookie.some(function(item) {
		item = item.replace(' ', '');
			
		let dic = item.split('=');
		if(key === dic[0]) {
			result = dic[1];
			return true;
		}
	});
	return result;
}

console.log(ACCESS_TOKEN);

// 2023-09-22 : 프로필 이미지 업로드 후 처리 완료.
if(ACCESS_TOKEN != null) {
	console.log(ACCESS_TOKEN);
			
	var header = ACCESS_TOKEN.split('.')[0];
	var payload = ACCESS_TOKEN.split('.')[1];
	var signature = ACCESS_TOKEN.split('.')[2];
			
	console.log(header);
	console.log(payload);
	console.log(signature);
			
	console.log("복호화 : " + Base64.decode(payload));
			
	// 2023-02-12 -> 토큰에 있는 payload에 실어논 정보를 Base64로 디코드해서 가져와 세팅(base64.min.js 필요)
	var data = JSON.parse(Base64.decode(payload));

	console.log(data.username);
	
	$.ajax({
		type : "GET",
		url : "/api/users/s/info",
		contentType : "application/json; charset=UTF-8",
		headers: {
			"Authorization" : "Bearer " + ACCESS_TOKEN
		},
		success : function(res) {
			console.log(res);	
			
			/**
			 * 2-1. 회원 정보 조회 
			 */
			var userUpdateForm = $("#userUpdateForm").val();
			
			if(userUpdateForm != null) {
				$("#userId").val(res.data.id);
				$("#username").val(res.data.username);
				$("#email").val(res.data.email);
			}
			
			if(res.data.profileImageUrl != null) {
				var imageUrl = `/upload/${res.data.profileImageUrl}`;
			
				$('#dropdown_userImage').attr("src", imageUrl);
			
			} else {
				var imageUrl = `/tistory/images/dog.jpg`;
				
				$('#dropdown_userImage').attr("src", imageUrl);
			}
			
			$('#userProfileImage').attr("src", imageUrl);
			
			let my_post_list = $(".my_post_list").val();
			
			if(my_post_list != null) {
				$("#userId").val(res.data.id);
			}
	
		},
		error : function(res) {
			console.log(res);

			// 2023-10-20 -> ajax error 처리(access_token 만료)는 deleteCookie를 하려는 곳은 유저 정보를 불러올때만 동작하게 처리(한번만)
			// 2023-10-11 : 쿠키는 항상 도메인 주소가 루트("/")로 설정되어 있어야 모든 요청에서 사용 가능 -> 자바스크립트 단에서도 path룰 /로 재설정 해줘야함 
			deleteCookie('access_token');	
					
			alert(res.responseJSON.message);
			
			location.href = "/login";
			return;
		}
	});	
	
}

$(document).ready(function(){
		
	/* 2-2. 비밀번호 체크  */
	$("#convertPassword_chk").focusout(() => {
    	passwordSameCheck();
	});
	
	function passwordSameCheck() {
		let password = $("#password").val();
    	let convertPassword = $("#convertPassword").val();
    	let convertPassword_chk = $("#convertPassword_chk").val();

    	if(convertPassword !== convertPassword_chk) {
    		alert("비밀번호가 일치하지 않습니다.");
    		$("#convertPassword").val("");
    		$("#convertPassword_chk").val("");
    	
    		$("#convertPassword").focus();
        	return false;
    	} else if(password === convertPassword) {
    		alert("변경할 비밀번호가 현재 비밀번호와 같습니다.");
    		$("#password").val("");
    		$("#convertPassword").val("");
    		$("#convertPassword_chk").val("");
    		
    		$("#password").focus();
    		
    		return false;
    	}
	}
	
	/**
	 *  2-3. 회원 정보 수정 : 2023-10-01 : api 연결까지 완료
	 */
	$("#updateUserBtn").on("click", function(){

		var convertPassword = $("#convertPassword").val();
		var convertPassword_chk = $("#convertPassword_chk").val();
		
		if(convertPassword == convertPassword_chk) {
			let formData = {
				username : $("#username").val(),
				password : $("#password").val(),
				convertPassword : $("#convertPassword").val(),
				email : $("#email").val()
			}
			
			console.log(formData);
			
			if(ACCESS_TOKEN != null) {
				$.ajax({
					type : "PUT",
					url : "/api/users/s/update/info",
					contentType : "application/json; charset=UTF-8",
					data: JSON.stringify(formData),
					headers: {
						"Authorization" : "Bearer " + ACCESS_TOKEN
					},
					success : function(res) {
						console.log(res);	
						
						location.href = "/user/myInfo";
					},
					error : function(res) {
						console.log(res);
						
						if(res.responseJSON.data == null) {
							alert(res.responseJSON.message);
						} else {
							/* 2023-10-03 : 일단 이렇게 해놓으면 예외처리는 작동하나 수정 요망 */
							alert(JSON.stringify(res.responseJSON.data));	
							
						}
					}
					
				});	
				
			} else {
				alert("로그인을 해주세요.");
				
				deleteCookie('access_token');
				
				location.href = "/login";
				return;
			}
		} else {
			alert("변경할 비밀번호를 한번 더 입력해주세요.");
			return;
		}
		
	});
	
});

/* 3-1. 이미지 업로드 함수 -> 주의 : 뷰에서 직접 사용할 함수면 $(document).ready(){} 밖에 선언되어야 한다. => 2023-09-21 */
function profileImageUpload() {
	
	console.log("프로필이미지 : " + ACCESS_TOKEN);

	// 3-2. 이미지 업로드 창 띄우기
	$("#profile-img-input").click();
	
	// 3-3. 업로드창에 이벤트가 있을 시 실행
	$("#profile-img-input").on("change", (e) => {
		let f = e.target.files[0];
	
		console.log(f);
		
		// 3-4. 이미지가 아닌 파일은 다시 등록하라고 알러트
		if(!f.type.match("image.*")) {
			alert("이미지를 등록해야 합니다.");
			return;
		}
		
		// 3-5. form 태그 전체 가져오기.
		let profileImageForm = $("#userProfileImageForm")[0];
		
		// 3-6. 3-5로 formData 생성
		let formData = new FormData(profileImageForm);
		
		console.log(formData);
		
		$.ajax({
			type: "put",
			url: "/api/users/s/update/profileImage",
			headers: {
				"Authorization" : "Bearer " + ACCESS_TOKEN
			},
			data: formData,
			contentType: false, // 필수 : x-www-form-urlencoded로 파싱되는 것을 방지
			processData: false, // 필수 : contentType을 false로 줬을 때 QueryString 자동 설정되는 거 해제.
			enctype: "multipart/form-data",
			dataType: "json",
			success: function(res) { 
				
				console.log(res);
				
				let reader = new FileReader();
				reader.onload = (e) => {
					$("#userProfileImage").attr("src", e.target.result);
				}
				reader.readAsDataURL(f);	
				
				location.reload();
				
				
			},
			error: function(error) {  
				console.log(error);

			}
		});
		
	});
}

// 2023-10-10 : 엑세스 토큰 만료시간시 쿠키 삭제해주는 함수 -> 여기서 key 값은 'access_token'
function deleteCookie(key) {
	document.cookie = key + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;path=/;';
}