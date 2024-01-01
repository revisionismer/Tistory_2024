/**
 * join.js
 */

$(document).ready(function() {
	
	/**
	 * 1-1. 회원 가입
	 */
	
	$("#joinBtn").on("click", function(){

		var joinObject = {
			username : $("#username").val(),
			password : $("#password").val(),
			email : $("#email").val()
		};
		
		console.log(JSON.stringify(joinObject));
		
		if(!$("#username").val()) {
			alert("아이디를 입력해주세요.");
			$("#username").focus();
			return;
		} else if(!$("#password").val()){
			alert("비밀번호를 입력해주세요.");
			$("#password").focus();
			return;
		} else if(!$("#same-password").val()){
			alert("비밀번호 확인을 입력 해주세요.");
			$("#password").focus();
			return;
		
		} else if(!$("#email").val()){
			alert("email을 입력해주세요.");
			$("#email").focus();
			return;
		} 
		
		$.ajax({
			type : "POST",
			url : "/api/users/join",
			data : JSON.stringify(joinObject),
			contentType : "application/json; charset=UTF-8",
			success : function(data, textStatus, request) {
				
				console.log(data);
				
				if(data.code == 1) {
					alert(data.message);
					location.href = "/login";
				} 

			},
			error : function(res) {
				console.log(res);
				
				if(res.responseJSON.message) {
					alert(res.responseJSON.message);
				} else if(res.responseJSON.data.username) {
					alert(res.responseJSON.data.username);
					$("#username").focus();
				} else if(res.responseJSON.data.password) {
					alert(res.responseJSON.data.password)
					$("#password").focus();
				} else if(res.responseJSON.data.email) {
					alert(res.responseJSON.data.email);
					$("#email").focus();
				} 
			
			}
		});	
		
	});
	
	$("#same-password").focusout(() => {
    	passwordSameCheck();
	});
	
	function passwordSameCheck() {
    	let password = $("#password").val();
    	let samePassword = $("#same-password").val();

    	if(password !== samePassword) {
    		alert("비밀번호가 일치하지 않습니다.");
    		$("#password").val("");
    		$("#same-password").val("");
    	
    		$("#password").focus();
        	return false;
    	}
	}
	
});