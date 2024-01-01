/**
 *  index.js
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

// 2023-09-22 : 프로필 이미지 업로드 후 처리 완료.
if(ACCESS_TOKEN != null) {

	var header = ACCESS_TOKEN.split('.')[0];
	var payload = ACCESS_TOKEN.split('.')[1];
	var signature = ACCESS_TOKEN.split('.')[2];
			
	var data = JSON.parse(Base64.decode(payload));

	console.log(data.role);
	
	var dropdown_menu = $(".header .dropdown-menu");
	
	dropdown_menu.append(`<a class="dropdown-item menu1" href="/post/list">내 블로그</a>`);
	dropdown_menu.append(`<a class="dropdown-item menu2" href="/user/myInfo">계정관리</a>`);
	dropdown_menu.append(`<a class="dropdown-item menu3" href="/user/board/list">게시판</a>`);
	
	if(data.role === 'ADMIN') { 
		dropdown_menu.append(`<a class="dropdown-item menu4" href="/category/write">카테고리관리</a>`);
	}
	
	dropdown_menu.append(`<a class="dropdown-item menu5" href="/logout">로그아웃</a>`);
	
}