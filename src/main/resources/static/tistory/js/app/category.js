/**
 *  category.js
 */

$(document).ready(function(){
	
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
			
	}

	/**
	 *  3-1. 카테고리 등록 : 2023-10-06 : 카테고리 등록 API까지
	 **/
	var categoryForm = $("#categoryForm").val();
	
	if(categoryForm != null) {
		
		$("#createCategoryBtn").on("click", function(e){
			e.preventDefault();
			
			if(!$("#title").val()) {
				alert("카테고리명을 입력해주세요.");
				$("#category").focus();
				return;
			}
			
			let formData = {
				title : $("#title").val()	
			}
			
			console.log(formData);
			
			if(ACCESS_TOKEN != null) {
				$.ajax({
					type : "POST",
					url : "/api/categories/write",
					contentType : "application/json; charset=UTF-8",
					data: JSON.stringify(formData),
					headers: {
						"Authorization" : "Bearer " + ACCESS_TOKEN
					},
					success : function(res) {
						console.log(res);	
						
						if(res.code == 1) {
							location.href = "/";
						}

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
				alert("관리자로 로그인을 해주세요.");
				location.href = "/login";
				return;
			}
		});
	}
});