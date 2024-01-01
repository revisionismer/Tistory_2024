/**
 * login.js
 */

$(document).ready(function(){
	
	
	var ACCESS_TOKEN = "";
	
	/**
	 *  2-1. 로그인
	 */
	$("#loginBtn").on("click", function(){
		
		var loginObject = {
			username : $("#username").val(),
			password : $("#password").val()
					
		};
		
		console.log(JSON.stringify(loginObject));
		
		if(!$("#username").val()) {
			alert("아이디를 입력해주세요.");
			$("#username").focus();
			return;
		} else if(!$("#password").val()){
			alert("패스워드를 입력해주세요.");
			$("#password").focus();
			return;
		} 
		
		$.ajax({
			type : "POST",
			url : "/login",
			data : JSON.stringify(loginObject),
			contentType : "application/json; charset=UTF-8",
			success : function(data, textStatus, request) {
				
				console.log(data);
				
				if(data.code == 1) {
					var responseHeader = request.getResponseHeader('Authorization');
					
					ACCESS_TOKEN = responseHeader.substr(7);
					
					console.log("엑세스 토큰 : " + ACCESS_TOKEN);
					
					location.href = "/index";
				} 

			},
			error : function(res) {
				console.log(res);
				alert(res.responseJSON.message);	
			}
		});	
		
	});
	
	/**
	 *  2-2. 뒤로가기
	 */
	$("#cancelHomeBtn").on("click", function(){
		location.href = "/";
	});

});
