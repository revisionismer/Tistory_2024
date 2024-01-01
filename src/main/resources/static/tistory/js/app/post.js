/**
 * 	post.js
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
	
	/**
	 *  4-10. 전체 포스팅 보기(main 화면) : 로그인 안해도 보여야하고 로그인한 회원의 posting데이터만 나오는게 아니라 전체  회원 데이터가 다 보여야함(그래서 ACCESS_TOKEN 영역 바깥으로 뺌)
	 	2023-11-01 : 여기까지. 메인 화면에 전체 포스팅 데이터 불러와서 뿌려주는거까지 성공
	 	2023-11-08 : main에 뿌려지는 포스팅 데이터들 중에 a 태그에 href가 기본적으로 #으로 박혀있는 부분들을 전부 제거해줌(페이징 클릭시 #이 붙어서 이동함)
	 */
	let my_main_list = $("#my_main_list").val();
	
	if(my_main_list != null) {
		var search = location.search;
		
		var params = new URLSearchParams(search);
		
		var getType = params.get('categoryId');
		
		var url;
		
		if(getType == null || getType == 0) {
			url = "/api/posts";
		} else {
			url = "/api/posts?categoryId=" + getType;
		}
		
		console.log("ACCESS_TOKEN : " + ACCESS_TOKEN);
		
		var principalId = -1;
		
		if(ACCESS_TOKEN != null) {
			var header = ACCESS_TOKEN.split('.')[0];
			var payload = ACCESS_TOKEN.split('.')[1];
			var signature = ACCESS_TOKEN.split('.')[2];
					
			console.log(header);
			console.log(payload);
			console.log(signature);
					
			console.log("복호화 : " + Base64.decode(payload));
					
			// 2023-02-12 -> 토큰에 있는 payload에 실어논 정보를 Base64로 디코드해서 가져와 세팅(base64.min.js 필요)
			var data = JSON.parse(Base64.decode(payload));

			principalId = Number(data.id);
		}
		
		console.log("principalId : " + principalId);
		
		$.ajax({
			type : "GET",
			url : url,
			contentType : "application/json; charset=UTF-8",
			success : function(res) {
				console.log(res);	
				
				var html = ``;
				
				if(!res.data.posts.content.length) {
					html = '<p id="not_post_data_msg" colspan="53">등록된 포스팅이 없습니다.</p>';
					
					document.getElementById('main').innerHTML = html;
					
					return;
					
				} else {
					for(var i = 0; i < res.data.posts.content.length; i++) {
						html += `
							<div id="my_main_item_${res.data.posts.content[i].id}" class="my_main_item">
								<a onclick="postInfo(${res.data.posts.content[i].user.id}, ${principalId} ,${res.data.posts.content[i].id})" class="my_atag_none">
						
						`;
						if(res.data.posts.content[i].thumnailImgFileName == null) {
							html += `
								<div class="my_main_item_thumnail">
									<img src="/tistory/images/dog.jpg" width="100%" height="100%">
								</div>
							`;
						} else {
							html += `
								<div class="my_main_item_thumnail">
									<img src="/thumnail/${res.data.posts.content[i].thumnailImgFileName}" width="100%" height="100%">
								</div>
							`;
						}
							html += `
									<div class="my_main_content my_p_sm_1">
										<div class="my_main_item_title">
											<h3>제목 : ${res.data.posts.content[i].title}</h3>
										</div>
										<div class="my_main_item_summary my_mb_sm_1 my_text_two_line">
											내용 : ${res.data.posts.content[i].content}
										</div>
										<div class="my_main_item_date my_mb_sm_1">
											날짜 : ${res.data.posts.content[i].createdAt}
										</div>
									</div>
								</a>
								<a href="#" class="my_atag_none">
									<div class="my_main_item_username">
										<span>by </span>
										<b>${res.data.posts.content[i].user.username}</b>
									</div>
								</a>
								
							</div>
						`;
							
					}
					
					html += `
						
					`;
				}
				
				document.getElementById('my_main_list').innerHTML = html;
				
				html = ``;
				
				if(res.data.isFirst) {
					html += `
						<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
							<a class="my_atag_none my_mr_sm_1" id="main_prev">
								<i class="fa-solid fa-angle-left"></i>
							</a>

							<a class="my_atag_none_1">
								<div class="my_paging_number_box my_mr_sm_1_1">
									1
								</div>
							</a>

							<a class="my_atag_none my_ml_sm_1">
								<i class="fa-solid fa-angle-right"></i>
							</a>
						</div>	
					`;
				} else {
					html += `
						<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
					`;
					
					if(res.data.isPrev) {
						html += `
							<a class="my_atag_none my_mr_sm_1" id="main_prev">
								<i class="fa-solid fa-angle-left"></i>
							</a>
						`;
					}
					for(var i = 0; i < res.data.posts.totalPages; i++) {
						html += `
								<a class="my_atag_none_1">
									<div data-set="${i+1}" id="main_page" class="my_paging_number_box my_mr_sm_1_1">
										${i+1}
									</div>
								</a>
							`;
					}
					
					if(res.data.isNext) {
						html += `
					
							<a class="my_atag_none my_ml_sm_1" id="main_next">
								<i class="fa-solid fa-angle-right"></i>
							</a>
						`;
					}
					
					html += `
						</div>	
						
					`;
				}
				
				document.getElementById('pagination').innerHTML = html;
				
					
			},
			error : function(res) {
				console.log(res);

			}
		});
		
		/**
		 * 	4-11. 메인 페이지 페이징(현재 페이지)
		 * 
		 **/
		$(document).on('click', '#main_page', function(e){
			
			e.preventDefault();
			
			var main_page = e.currentTarget.innerText - 1;
			
			var url = "/api/posts?page=" + main_page; 
			
			$.ajax({
				type : "GET",
				url : url,
				contentType : "application/json; charset=UTF-8",
				success : function(res) {
					console.log(res);	
					
					var html = ``;
					
					if(!res.data.posts.content.length) {
						html = '<p id="not_post_data_msg" colspan="53">등록된 포스팅이 없습니다.</p>';
					} else {
						for(var i = 0; i < res.data.posts.content.length; i++) {
							html += `
								<div id="my_main_item_${res.data.posts.content[i].id}" class="my_main_item">
									<a onclick="postInfo(${res.data.posts.content[i].user.id}, ${principalId} ,${res.data.posts.content[i].id})" class="my_atag_none">
							
							`;
							if(res.data.posts.content[i].thumnailImgFileName == null) {
								html += `
									<div class="my_main_item_thumnail">
										<img src="/tistory/images/dog.jpg" width="100%" height="100%">
									</div>
								`;
							} else {
								html += `
									<div class="my_main_item_thumnail">
										<img src="/thumnail/${res.data.posts.content[i].thumnailImgFileName}" width="100%" height="100%">
									</div>
								`;
							}
								html += `
										<div class="my_main_content my_p_sm_1">
											<div class="my_main_item_title">
												<h3>제목 : ${res.data.posts.content[i].title}</h3>
											</div>
											<div class="my_main_item_summary my_mb_sm_1 my_text_two_line">
												내용 : ${res.data.posts.content[i].content}
											</div>
											<div class="my_main_item_date my_mb_sm_1">
												날짜 : ${res.data.posts.content[i].createdAt}
											</div>
										</div>
									</a>
									<a href="#" class="my_atag_none">
										<div class="my_main_item_username">
											<span>by </span>
											<b>${res.data.posts.content[i].user.username}</b>
										</div>
									</a>
									
								</div>
							`;
								
						}
						
						html += `
							
						`;
					}
					
					document.getElementById('my_main_list').innerHTML = html;
					
					html = ``;
					
					if(res.data.isFirst) {
						html += `
							<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
								<a class="my_atag_none my_mr_sm_1" id="main_prev">
									<i class="fa-solid fa-angle-left"></i>
								</a>

								<a class="my_atag_none_1">
									<div class="my_paging_number_box my_mr_sm_1_1">
										1
									</div>
								</a>

								<a class="my_atag_none my_ml_sm_1">
									<i class="fa-solid fa-angle-right"></i>
								</a>
							</div>	
						`;
					} else {
						html += `
							<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
						`;
						
						if(res.data.isPrev) {
							html += `
								<a class="my_atag_none my_mr_sm_1" id="main_prev">
									<i class="fa-solid fa-angle-left"></i>
								</a>
							`;
						}
						for(var i = 0; i < res.data.posts.totalPages; i++) {
							html += `
									<a class="my_atag_none_1">
										<div data-set="${i+1}" id="main_page" class="my_paging_number_box my_mr_sm_1_1">
											${i+1}
										</div>
									</a>
								`;
						}
						
						if(res.data.isNext) {
							html += `
						
								<a class="my_atag_none my_ml_sm_1" id="main_next">
									<i class="fa-solid fa-angle-right"></i>
								</a>
							`;
						}
						
						html += `
							</div>	
							
						`;
					}
					
					document.getElementById('pagination').innerHTML = html;
					
						
				},
				error : function(res) {
					console.log(res);

				}
			});
			
		});
		
		/**
		 *   4-12. 메인 페이지 페이징(이전 페이지)
		 **/
		$(document).on('click', '#main_prev', function(e){
		
			var main_page = e.currentTarget.innerText - 1;
			
			var url = "/api/posts?page=" + main_page; 
			
			$.ajax({
				type : "GET",
				url : url,
				contentType : "application/json; charset=UTF-8",
				success : function(res) {
					console.log(res);	
					
					var html = ``;
					
					if(!res.data.posts.content.length) {
						html = '<p id="not_post_data_msg" colspan="53">등록된 포스팅이 없습니다.</p>';
					} else {
						for(var i = 0; i < res.data.posts.content.length; i++) {
							html += `
								<div id="my_main_item_${res.data.posts.content[i].id}" class="my_main_item">
									<a onclick="postInfo(${res.data.posts.content[i].user.id}, ${principalId} ,${res.data.posts.content[i].id})" class="my_atag_none">
							
							`;
							if(res.data.posts.content[i].thumnailImgFileName == null) {
								html += `
									<div class="my_main_item_thumnail">
										<img src="/tistory/images/dog.jpg" width="100%" height="100%">
									</div>
								`;
							} else {
								html += `
									<div class="my_main_item_thumnail">
										<img src="/thumnail/${res.data.posts.content[i].thumnailImgFileName}" width="100%" height="100%">
									</div>
								`;
							}
								html += `
										<div class="my_main_content my_p_sm_1">
											<div class="my_main_item_title">
												<h3>제목 : ${res.data.posts.content[i].title}</h3>
											</div>
											<div class="my_main_item_summary my_mb_sm_1 my_text_two_line">
												내용 : ${res.data.posts.content[i].content}
											</div>
											<div class="my_main_item_date my_mb_sm_1">
												날짜 : ${res.data.posts.content[i].createdAt}
											</div>
										</div>
									</a>
									<a href="#" class="my_atag_none">
										<div class="my_main_item_username">
											<span>by </span>
											<b>${res.data.posts.content[i].user.username}</b>
										</div>
									</a>
									
								</div>
							`;
								
						}
						
						html += `
							
						`;
					}
					
					document.getElementById('my_main_list').innerHTML = html;
					
					html = ``;
					
					if(res.data.isFirst) {
						html += `
							<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
								<a class="my_atag_none my_mr_sm_1" id="main_prev">
									<i class="fa-solid fa-angle-left"></i>
								</a>

								<a class="my_atag_none_1" onclick="">
									<div class="my_paging_number_box my_mr_sm_1_1">
										1
									</div>
								</a>

								<a class="my_atag_none my_ml_sm_1">
									<i class="fa-solid fa-angle-right"></i>
								</a>
							</div>	
						`;
					} else {
						html += `
							<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
						`;
						
						if(res.data.isPrev) {
							html += `
								<a class="my_atag_none my_mr_sm_1" id="main_prev">
									<i class="fa-solid fa-angle-left"></i>
								</a>
							`;
						}
						for(var i = 0; i < res.data.posts.totalPages; i++) {
							html += `
									<a class="my_atag_none_1">
										<div data-set="${i+1}" id="main_page" class="my_paging_number_box my_mr_sm_1_1">
											${i+1}
										</div>
									</a>
								`;
						}
						
						if(res.data.isNext) {
							html += `
						
								<a class="my_atag_none my_ml_sm_1" id="main_next">
									<i class="fa-solid fa-angle-right"></i>
								</a>
							`;
						}
						
						html += `
							</div>	
							
						`;
					}
					
					document.getElementById('pagination').innerHTML = html;
					
						
				},
				error : function(res) {
					console.log(res);

				}
			});
		});
		
		/**
		 * 	4-13. 메인 페이지 페이징(다음 페이지) : 2023-11-06 => 메인페이지 페이징 처리 완료
		 * 
		 **/
		$(document).on('click', '#main_next', function(e){
			
			var main_page = e.currentTarget.innerText + 1;
			
			var url = "/api/posts?page=" + main_page; 
			
			$.ajax({
				type : "GET",
				url : url,
				contentType : "application/json; charset=UTF-8",
				success : function(res) {
					console.log(res);	
					
					var html = ``;
					
					if(!res.data.posts.content.length) {
						html = '<p id="not_post_data_msg" colspan="53">등록된 포스팅이 없습니다.</p>';
					} else {
						for(var i = 0; i < res.data.posts.content.length; i++) {
							html += `
								<div id="my_main_item_${res.data.posts.content[i].id}" class="my_main_item">
									<a onclick="postInfo(${res.data.posts.content[i].user.id}, ${principalId} ,${res.data.posts.content[i].id})" class="my_atag_none">
							
							`;
							if(res.data.posts.content[i].thumnailImgFileName == null) {
								html += `
									<div class="my_main_item_thumnail">
										<img src="/tistory/images/dog.jpg" width="100%" height="100%">
									</div>
								`;
							} else {
								html += `
									<div class="my_main_item_thumnail">
										<img src="/thumnail/${res.data.posts.content[i].thumnailImgFileName}" width="100%" height="100%">
									</div>
								`;
							}
								html += `
										<div class="my_main_content my_p_sm_1">
											<div class="my_main_item_title">
												<h3>제목 : ${res.data.posts.content[i].title}</h3>
											</div>
											<div class="my_main_item_summary my_mb_sm_1 my_text_two_line">
												내용 : ${res.data.posts.content[i].content}
											</div>
											<div class="my_main_item_date my_mb_sm_1">
												날짜 : ${res.data.posts.content[i].createdAt}
											</div>
										</div>
									</a>
									<a href="#" class="my_atag_none">
										<div class="my_main_item_username">
											<span>by </span>
											<b>${res.data.posts.content[i].user.username}</b>
										</div>
									</a>
									
								</div>
							`;
								
						}
						
						html += `
							
						`;
					}
					
					document.getElementById('my_main_list').innerHTML = html;
					
					html = ``;
					
					if(res.data.isFirst) {
						html += `
							<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
								<a class="my_atag_none my_mr_sm_1" id="main_prev">
									<i class="fa-solid fa-angle-left"></i>
								</a>

								<a class="my_atag_none_1" onclick="">
									<div class="my_paging_number_box my_mr_sm_1_1">
										1
									</div>
								</a>

								<a class="my_atag_none my_ml_sm_1">
									<i class="fa-solid fa-angle-right"></i>
								</a>
							</div>	
						`;
					} else {
						html += `
							<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
						`;
						
						if(res.data.isPrev) {
							html += `
								<a class="my_atag_none my_mr_sm_1" id="main_prev">
									<i class="fa-solid fa-angle-left"></i>
								</a>
							`;
						}
						for(var i = 0; i < res.data.posts.totalPages; i++) {
							html += `
									<a class="my_atag_none_1">
										<div data-set="${i+1}" id="main_page" class="my_paging_number_box my_mr_sm_1_1">
											${i+1}
										</div>
									</a>
								`;
						}
						
						if(res.data.isNext) {
							html += `
						
								<a class="my_atag_none my_ml_sm_1" id="main_next">
									<i class="fa-solid fa-angle-right"></i>
								</a>
							`;
						}
						
						html += `
							</div>	
							
						`;
					}
					
					document.getElementById('pagination').innerHTML = html;
					
						
				},
				error : function(res) {
					console.log(res);

				}
			});
		});
	}
	
	/**
	 * 4-14. 메인 포스팅 보기(카테고리 API 호출) : ACCESS_TOKEN이 없어도 API를 호출 할수 있어야한다.(카테고리 리스트 불러오는 API로직에서 인증객체 제외시킴)
	 // 2023-11-07 : 인증로직 제거하고 ACCESS_TOKEN이 없어도 불러올 수 있게 밖으로 뺐음
	 */
	$.ajax({
		type : "GET",
		url : "/api/categories",
		contentType : "application/json; charset=UTF-8",
		async: false,  // 2023-10-27 : 상세 보기에서 카테고리 정보 불러오는것 보다 늦게 실행될 수 있기 때문에 비동기 false를 해주닌까 정상 동작.
		success : function(res) {
			console.log(res);	
			
			// 2023-10-13 : 여기까지
			for(var i = 0; i < res.data.categories.length; i++) {
				
				$(".drawer-menu").append(`<li><a class="drawer-menu-item" href="/index?categoryId=${res.data.categories[i].categoryId}">${res.data.categories[i].title}</a></li>`);
			}
			
			for(var i = 0; i < res.data.categories.length; i++) {
				if(res.data.categories[i].categoryId == 1) {
					$("#categoryList").append(`<option value=${res.data.categories[i].categoryId} selected='selected'>${res.data.categories[i].title}</option>`);
					
				} else {
					$("#categoryList").append(`<option value=${res.data.categories[i].categoryId}>${res.data.categories[i].title}</option>`);
					
				}
			}

		},
		error : function(res) {
			console.log(res);
	
		}
	});
	
	$("#categoryList").change(function(){
		categoryId = $(this).val();
	
		const categoryList = document.getElementById('categoryList');
		
		const length = categoryList.options.length;
		
		for(let i=0; i < length; i++) {
			if(categoryList.options[i].value == categoryId) {
				console.log(categoryList.options[i].value);
				// 1-1. selected 옵션 전체 삭제
				$(`#categoryList option`).attr("selected", false);
				
				// 1-2. 클릭한 곳에 selected 옵션 활성화
				$(`#categoryList option:eq(${i})`).attr("selected", true);
				
			}
		}
	
	});
	
	/**
	 * 4-15. 메인 포스팅 보기 : ACCESS_TOKEN이 없어도 API를 호출 할수 있어야한다.(새로 만듬)
	 */
	let postView = $("#postView").val();
	
	if(postView != null) {
		let pageOwnerId = $("#pageOwnerId").val();
		let principalId = $("#principalId").val();
		let postId = $("#postId").val();
		
		console.log("pageOwnerId : " + pageOwnerId + ", principalId : " + principalId + ", postId : " + postId);
		
		$.ajax({
			type : "GET",
			url : `/api/posts/${pageOwnerId}/${postId}/${principalId}/info`,
			contentType : "application/json; charset=UTF-8",
			success : function(res) {
				console.log(res);	
				
				categoryId = res.data.categoryId;
			
				const categoryList = document.getElementById('categoryList');
				
				const length = categoryList.options.length;
				
				for(let i=0; i < length; i++) {
					if(categoryList.options[i].value == categoryId) {
//						console.log(categoryList.options[i].value);
						// 1-1. selected 옵션 전체 삭제
						$(`#categoryList option`).attr("selected", false);
						
						// 1-2. 클릭한 곳에 selected 옵션 활성화
						$(`#categoryList option:eq(${i})`).attr("selected", true);
						
					}
				}
	
				$("#title").val(res.data.title);
				$(".ql-editor").html(res.data.content);	
				
				if(res.data.thumnailImgFileName) {
					
					var thumnailImgArea = document.querySelector("#thumnailImgArea")
					
					const img_tag = document.createElement("img");
					
					img_tag.id = "thumnailImg";
					img_tag.src = "/thumnail/" + res.data.thumnailImgFileName;
					img_tag.width = 20;
					img_tag.height = 20;
					
					thumnailImgArea.appendChild(img_tag);
				}
				
				if(res.data.love == false) {
					$("#unlove").hide();
					
				} else {
					$("#love").hide();
					
				}
				document.getElementById('totalLoveCnt').innerHTML = res.data.totalLoveCnt;
		
			},
			error : function(res) {
				console.log(res);
		
			}
		});
		
	}
	
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
						
		/**
		 *  4-2. 나의 포스팅 정보 불러오기
		 **/
		let my_post_list = $(".my_post_list").val();
		
		// 4-3. 토큰 속에 들어가있는 id값을 Number 형으로 바꿔서 가져온다.
		let principalId = Number(data.id);

		if(my_post_list != null) {

			$.ajax({
				type : "GET",
				url : `/api/posts/s/${principalId}`,
				contentType : "application/json; charset=UTF-8",
				headers: {
					"Authorization" : "Bearer " + ACCESS_TOKEN
				},
				success : function(res) {
					console.log(res);	
					
					// 2023-10-17 -> 여기까지(포스팅 데이터를 들고와서 뿌려봄)
					
					var html = ``;
					
					if(!res.data.posts.content.length) {
						html = '<p id="not_post_data_msg" colspan="53">등록된 포스팅이 없습니다.</p>';
					} else {
						for(var i = 0; i < res.data.posts.content.length; i++) {
							html += `
								<div class="my_post_list_item">
									<div class="my_post_list_item_left">
							`;
							
							if(res.data.posts.content[i].thumnailImgFileName == null) {
								html += `
									<img id="p_thumnail" src="/tistory/images/dog.jpg" width="150" height="150">
										<!--	<div class="my_fakeimg"></div>  -->
									</div>
								`;
							} else {
								html += `
									<img id="p_thumnail" src="/thumnail/${res.data.posts.content[i].thumnailImgFileName}" width="150" height="150">
										<!--	<div class="my_fakeimg"></div>  -->
										
									</div>
								`;
							}
							
							html += `
										
									<div class="my_post_list_item_right my_ellipsis">
										<div id="p_title" class="my_text_title my_ellipsis">${res.data.posts.content[i].title}</div>
										<div id="p_content" class="my_text_body_sm">${res.data.posts.content[i].content}</div>
	                	
										<div class="my_mt_md_1">
	     
	                    					<a class="my_success_btn" onclick="detailPost(${principalId}, ${res.data.posts.content[i].id})">Read More</a> 
										</div>
									</div>
								</div>
								
							`;			
						}
						
						html += `
							<div id="pagination"></div>
						`;

						document.getElementById('postList').innerHTML = html;
						
						html = ``;
						
						if(res.data.isFirst) {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
									<a class="my_atag_none my_mr_sm_1" id="prev" href="#">
										<i class="fa-solid fa-angle-left"></i>
									</a>

									<a class="my_atag_none_1"  onclick="">
										<div class="my_paging_number_box my_mr_sm_1_1">
											1
										</div>
									</a>

									<a class="my_atag_none my_ml_sm_1" href="#">
										<i class="fa-solid fa-angle-right"></i>
									</a>
								</div>	
							`;
						} else {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
							`;
							
							if(res.data.isPrev) {
								html += `
									<a class="my_atag_none my_mr_sm_1" href="#">
										<i class="fa-solid fa-angle-left"></i>
									</a>
								`;
							}
							for(var i = 0; i < res.data.posts.totalPages; i++) {
								html += `
										<a class="my_atag_none_1">
											<div data-set="${i+1}" id="page" class="my_paging_number_box my_mr_sm_1_1">
												${i+1}
											</div>
										</a>
									`;
							}
							
							if(res.data.isNext) {
								html += `
							
									<a class="my_atag_none my_ml_sm_1" id="next" href="#">
										<i class="fa-solid fa-angle-right"></i>
									</a>
								`;
							}
							
							html += `
								</div>	
								
							`;
						}
						
						document.getElementById('pagination').innerHTML = html;
						
					}
				
						
				},
				error : function(res) {
					console.log(res);

				}
			});
		}
		
		/**
		 *   4-3. 나의 포스팅 정보 불러오기 페이징(현재 페이지)
		 **/
		$(document).on('click', '#page', function(e){
			
			e.preventDefault();
			
			var categoryId = $("#categoryId").val();
			var page = e.currentTarget.innerText - 1;
			var principalId = data.id;
			
			var url = "/api/posts/s/" + principalId + "?page=" + page; 
			
			$.ajax({
				type : "GET",
				url : url,
				contentType : "application/json; charset=UTF-8",
				headers: {
					"Authorization" : "Bearer " + ACCESS_TOKEN
				},
				success : function(res) {
					console.log(res);	
					
					var html = ``;
					
					if(!res.data.posts.content.length) {
						html = '<p> colspan="53">등록된 포스팅이 없습니다.</p>';
					} else {
						for(var i = 0; i < res.data.posts.content.length; i++) {
							html += `
								<div class="my_post_list_item">
									<div class="my_post_list_item_left">
							`;
							
							if(res.data.posts.content[i].thumnailImgFileName == null) {
								html += `
									<img id="p_thumnail" src="/tistory/images/dog.jpg" width="150" height="150">
										<!--	<div class="my_fakeimg"></div>  -->
									</div>
								`;
							} else {
								html += `
									<img id="p_thumnail" src="/thumnail/${res.data.posts.content[i].thumnailImgFileName}" width="150" height="150">
										<!--	<div class="my_fakeimg"></div>  -->
										
									</div>
								`;
							}
							
							html += `
										
									<div class="my_post_list_item_right my_ellipsis">
										<div id="p_title" class="my_text_title my_ellipsis">${res.data.posts.content[i].title}</div>
										<div id="p_content" class="my_text_body_sm">${res.data.posts.content[i].content}</div>
	                	
										<div class="my_mt_md_1">
	                    					<a class="my_success_btn" onclick="detailPost(${principalId}, ${res.data.posts.content[i].id})">Read More</a> 
										</div>
									</div>
								</div>
								
							`;			
						}
						
						html += `
							<div id="pagination"></div>
						`;

						document.getElementById('postList').innerHTML = html;
						
						html = ``;
						
						if(res.data.isFirst) {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
									<a class="my_atag_none my_mr_sm_1" href="#">
										<i class="fa-solid fa-angle-left"></i>
									</a>

									<a class="my_atag_none_1"  onclick="">
										<div class="my_paging_number_box my_mr_sm_1_1">
											1
										</div>
									</a>

									<a class="my_atag_none my_ml_sm_1" href="#">
										<i class="fa-solid fa-angle-right"></i>
									</a>
								</div>	
							`;
						} else {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
							`;
							
							if(res.data.isPrev) {
								html += `
									<a class="my_atag_none my_mr_sm_1" id="prev" href="#">
										<i class="fa-solid fa-angle-left"></i>
									</a>
								`;
							}
							
							for(var i = 0; i < res.data.posts.totalPages; i++) {
								html += `
									<a class="my_atag_none_1">
										<div data-set="${i+1}" id="page" class="my_paging_number_box my_mr_sm_1_1">
											${i+1}
										</div>
									</a>
								`;
							}
							
							if(res.data.isNext) {
								html += `
							
									<a class="my_atag_none my_ml_sm_1" id="next" href="#">
										<i class="fa-solid fa-angle-right"></i>
									</a>
								`;
							}
							
							html += `
								</div>	
								
							`;
						}
						
						document.getElementById('pagination').innerHTML = html;
						
					}
				
						
				},
				error : function(res) {
					console.log(res);
				
					return;
				}
			});
			
		});
		
		/**
		 *   4-4. 나의 포스팅 정보 불러오기 페이징(이전 페이지)
		 **/
		$(document).on('click', '#prev', function(e){
			
			e.preventDefault();
			
			var categoryId = $("#categoryId").val();
			
			// 4-5. 현재 페이지 번호에서 한번 더 뒤로 가는거닌까 -1만 해주면 된다.
			var page = e.currentTarget.innerText - 1;
			var principalId = data.id;
			
			var url = "/api/posts/s/" + principalId + "?page=" + page; 
			
			$.ajax({
				type : "GET",
				url : url,
				contentType : "application/json; charset=UTF-8",
				headers: {
					"Authorization" : "Bearer " + ACCESS_TOKEN
				},
				success : function(res) {
					console.log(res);	
					
					var html = ``;
					
					if(!res.data.posts.content.length) {
						html = '<p> colspan="53">등록된 포스팅이 없습니다.</p>';
					} else {
						for(var i = 0; i < res.data.posts.content.length; i++) {
							html += `
								<div class="my_post_list_item">
									<div class="my_post_list_item_left">
										
							`;
							
							if(res.data.posts.content[i].thumnailImgFileName == null) {
								html += `
									<img id="p_thumnail" src="/tistory/images/dog.jpg" width="150" height="150">
										<!--	<div class="my_fakeimg"></div>  -->
									</div>
								`;
							} else {
								html += `
									<img id="p_thumnail" src="/thumnail/${res.data.posts.content[i].thumnailImgFileName}" width="150" height="150">
										<!--	<div class="my_fakeimg"></div>  -->
										
									</div>
								`;
							}
							
							html += `
										
									<div class="my_post_list_item_right my_ellipsis">
										<div id="p_title" class="my_text_title my_ellipsis">${res.data.posts.content[i].title}</div>
										<div id="p_content" class="my_text_body_sm">${res.data.posts.content[i].content}</div>
	                	
										<div class="my_mt_md_1">
	     
	                    					<a class="my_success_btn" onclick="detailPost(${principalId}, ${res.data.posts.content[i].id})">Read More</a> 
										</div>
									</div>
								</div>
								
							`;			
						}
						
						html += `
							<div id="pagination"></div>
						`;

						document.getElementById('postList').innerHTML = html;
						
						html = ``;
						
						if(res.data.isFirst) {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
									<a class="my_atag_none my_mr_sm_1" href="#">
										<i class="fa-solid fa-angle-left"></i>
									</a>

									<a class="my_atag_none_1"  onclick="">
										<div class="my_paging_number_box my_mr_sm_1_1">
											1
										</div>
									</a>

									<a class="my_atag_none my_ml_sm_1" href="#">
										<i class="fa-solid fa-angle-right"></i>
									</a>
								</div>	
							`;
						} else {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
							`;
							
							if(res.data.isPrev) {
								html += `
									<a class="my_atag_none my_mr_sm_1" id="prev" href="#">
										<i class="fa-solid fa-angle-left"></i>
									</a>
								`;
							}
							
							for(var i = 0; i < res.data.posts.totalPages; i++) {
								html += `
									<a class="my_atag_none_1">
										<div data-set="${i+1}" id="page" class="my_paging_number_box my_mr_sm_1_1">
											${i+1}
										</div>
									</a>
								`;
							}
							
							if(res.data.isNext) {
								html += `
							
									<a class="my_atag_none my_ml_sm_1" id="next" href="#">
										<i class="fa-solid fa-angle-right"></i>
									</a>
								`;
							}
							
							html += `
								</div>	
								
							`;
						}
						
						document.getElementById('pagination').innerHTML = html;
						
					}
				
						
				},
				error : function(res) {
					console.log(res);
				
					return;
				}
			});
		});
		
		/**
		 *   4-6. 나의 포스팅 정보 불러오기 페이징(다음 페이지)
		 **/
		$(document).on('click', '#next', function(e){
	
			e.preventDefault();
			
			var categoryId = $("#categoryId").val();
			
			// 4-7. 현재 페이지에서 1번만 앞으로 가면 되닌까 +1만 해준다.
			var page = e.currentTarget.innerText + 1;
			
			var principalId = data.id;
			
			var url = "/api/posts/s/" + principalId + "?page=" + page; 
			
			$.ajax({
				type : "GET",
				url : url,
				contentType : "application/json; charset=UTF-8",
				headers: {
					"Authorization" : "Bearer " + ACCESS_TOKEN
				},
				success : function(res) {
					console.log(res);	
					
					var html = ``;
					
					if(!res.data.posts.content.length) {
						html = '<p> colspan="53">등록된 포스팅이 없습니다.</p>';
					} else {
						for(var i = 0; i < res.data.posts.content.length; i++) {
							html += `
								<div class="my_post_list_item">
									<div class="my_post_list_item_left">
										<input type="hidden" id="postId" name="postId" value="${res.data.posts.content[i].id}">
							`;
							
							if(res.data.posts.content[i].thumnailImgFileName == null) {
								html += `
									<img id="p_thumnail" src="/tistory/images/dog.jpg" width="150" height="150">
										<!--	<div class="my_fakeimg"></div>  -->
									</div>
								`;
							} else {
								html += `
									
									<img id="p_thumnail" src="/thumnail/${res.data.posts.content[i].thumnailImgFileName}" width="150" height="150">
										<!--	<div class="my_fakeimg"></div>  -->
									</div>
								`;
							}
							
							html += `
										
									<div class="my_post_list_item_right my_ellipsis">
										<div id="p_title" class="my_text_title my_ellipsis">${res.data.posts.content[i].title}</div>
										<div id="p_content" class="my_text_body_sm">${res.data.posts.content[i].content}</div>
	                	
										<div class="my_mt_md_1">
	     
	                    					<a class="my_success_btn" onclick="detailPost(${principalId}, ${res.data.posts.content[i].id})">Read More</a> 
										</div>
									</div>
								</div>
								
							`;			
						}
						
						html += `
							<div id="pagination"></div>
						`;

						document.getElementById('postList').innerHTML = html;
						
						html = ``;
						
						if(res.data.isFirst) {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
									<a class="my_atag_none my_mr_sm_1" href="#">
										<i class="fa-solid fa-angle-left"></i>
									</a>

									<a class="my_atag_none_1"  onclick="">
										<div class="my_paging_number_box my_mr_sm_1_1">
											1
										</div>
									</a>

									<a class="my_atag_none my_ml_sm_1" href="#">
										<i class="fa-solid fa-angle-right"></i>
									</a>
								</div>	
							`;
						} else {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
							`;
							
							if(res.data.isPrev) {
								html += `
									<a class="my_atag_none my_mr_sm_1" id="prev" href="#">
										<i class="fa-solid fa-angle-left"></i>
									</a>
								`;
							}
							
							for(var i = 0; i < res.data.posts.totalPages; i++) {
								html += `
									<a class="my_atag_none_1">
										<div data-set="${i+1}" id="page" class="my_paging_number_box my_mr_sm_1_1">
											${i+1}
										</div>
									</a>
								`;
							}
							
							if(res.data.isNext) {
								html += `
							
									<a class="my_atag_none my_ml_sm_1" id="next" href="#">
										<i class="fa-solid fa-angle-right"></i>
									</a>
								`;
							}
							
							html += `
								</div>	
								
							`;
						}
						
						document.getElementById('pagination').innerHTML = html;
						
					}
				
						
				},
				error : function(res) {
					console.log(res);
				
					return;
				}
			});
		});
		
	}
	
	/**
	 *  4-1. 포스팅 쓰기
	 */
	$("#writeBtn").on("click", function() {
	
		let categoryId = $("#categoryList option:selected").val();
		let title = $("#title").val(); 
		let content = document.getElementsByClassName("ql-editor")[0];
		let thumnailFile = $("#thumnailFile")[0].files[0];
		
		var formData = new FormData();
		
		formData.append("categoryId", categoryId);
		
		if(title.length != 0){
			formData.append("title", title);
		} else {
			alert("제목을 입력해주세요.");
			$("#title").focus();
			return;
		}
		
		if(content.innerText.trim().length != 0) {
			formData.append("content", content.innerHTML);
		} else {
			alert("내용을 입력해주세요.");
			$(".ql-editor")[0].focus();
			return;
		}
		
		if(thumnailFile != null) {
			formData.append("thumnailFile", thumnailFile);
		}
		
		if(ACCESS_TOKEN != null) {
			$.ajax({
				type : "POST",
				url : `/api/posts/s/write`,
				data: formData,
				contentType: false,
				processData: false,
				enctype: 'multipart/form-data',  
				headers: {
					"Authorization" : "Bearer " + ACCESS_TOKEN
				},
				success : function(res) {
					console.log(res);	
					
					if(res.code == 1) {
						alert(res.data.id + "번 포스트 글쓰기 성공");
						location.href = "/post/write";
					}
					
				},
				error : function(res) {
					console.log(res);
					
					if(res.responseJSON.data == null) {
						alert(res.responseJSON.message);
					} else {
						/* 2023-10-03 : 일단 이렇게 해놓으면 예외처리는 작동하나 수정 요망 */
					
						if(res.responseJSON.data.title) {
							alert(res.responseJSON.data.title);
						}
						
						if(res.responseJSON.data.content) {
							alert(res.responseJSON.data.content);
						}
						
					}
				}
				
			});	
		}
	});
	
	
	/**
	 *  4-9. 포스팅 상세보기 : 2023-10-26 : 포스팅 불러올떄 카테고리 ID 값도 제대로 SELECTED 해주게 수정함
	 *                     2023-10-27 : postId가 없이 그냥 글쓰기 눌렀을떄도 4-9 API가 실행되어 에러가 떠서(그냥 글쓰기 할때는 postId 값이 없기 때문) postId가 존재할때면 실행하게끔 로직 변경
	 					   2023-10-27 : document.getElementById.value -> $("#id").val()로 변경(value는 값이 없으면 경고 로그가 뜸)
	 **/
	if(ACCESS_TOKEN != null) {
		let postForm = $("#postForm").val();
		let postId = $("#postId").val();
		let pageOwnerId = Number(data.id);
		let principalId = $("#principalId").val();
		
		if(postForm != null && postId != "") {
			
			$.ajax({
				type : "GET",
				url : `/api/posts/${pageOwnerId}/${postId}/info`,
				contentType : "application/json; charset=UTF-8",
				headers: {
					"Authorization" : "Bearer " + ACCESS_TOKEN
				},
				success : function(res) {
					console.log(res);	
					
					categoryId = res.data.categoryId;
					
					const categoryList = document.getElementById('categoryList');
					
					const length = categoryList.options.length;
					
					for(let i=0; i < length; i++) {
						if(categoryList.options[i].value == categoryId) {
//							console.log(categoryList.options[i].value);
							// 1-1. selected 옵션 전체 삭제
							$(`#categoryList option`).attr("selected", false);
							
							// 1-2. 클릭한 곳에 selected 옵션 활성화
							$(`#categoryList option:eq(${i})`).attr("selected", true);
							
						}
					}
		
					$("#title").val(res.data.title);
					$(".ql-editor").html(res.data.content);	
					
					if(res.data.thumnailImgFileName) {
						
						var thumnailImgArea = document.querySelector("#thumnailImgArea");
						
						const img_tag = document.createElement("img");
						
						img_tag.id = "thumnailImg";
						img_tag.src = "/thumnail/" + res.data.thumnailImgFileName;
						img_tag.width = 20;
						img_tag.height = 20;
						
						thumnailImgArea.appendChild(img_tag);
					}
			
				},
				error : function(res) {
					console.log(res);
			
				}
			});
			
		}
	}
	
	/**
	 *  4-10. 포스팅 수정 : 2023-10-26 : 수정 기능 어느정도 완료
	 **/
	$("#modifyBtn").on("click", function(e) {
		
		let principalId = $("#principalId").val();
		let postId = $("#postId").val();
		let pageOwnerId = Number(data.id);
		
		let categoryId = $("#categoryList option:selected").val();
		let title = $("#title").val();
		let content = document.getElementsByClassName("ql-editor")[0];
		let thumnailFile = $("#thumnailFile")[0].files[0];
		
		var formData = new FormData();
		
		formData.append("categoryId", categoryId);
		formData.append("postId", postId);
		formData.append("pagwOwnerId", pageOwnerId);
		formData.append("principalId", principalId);
		
		if(title.length != 0){
			formData.append("title", title);
		} else {
			alert("제목을 입력해주세요.");
			$("#title").focus();
			return;
		}
		
		if(content.innerText.trim().length != 0) {
			formData.append("content", content.innerHTML);
		} else {
			alert("내용을 입력해주세요.");
			$(".ql-editor")[0].focus();
			return;
		}
		
		if(thumnailFile != null) {
			formData.append("thumnailFile", thumnailFile);
		}
		
		if(ACCESS_TOKEN != null) {
			$.ajax({
				type : "PUT",
				url : "/api/posts/s/" + pageOwnerId + "/" + postId + "/update",  // 2023-10-26 : `` 안에 쓰면 string Long convert 오류가 떠서 이렇게 바꿈
				data: formData,
				contentType: false,
				processData: false,
				enctype: 'multipart/form-data',  
				headers: {
					"Authorization" : "Bearer " + ACCESS_TOKEN
				},
				success : function(res) {
					console.log(res);	
					
					if(res.code == 1) {
						alert(res.data.id + "번 포스팅 정보 업데이트 성공");
						
						location.reload();
					}
					
				},
				error : function(res) {
					console.log(res);
					
					if(res.responseJSON.data == null) {
						alert(res.responseJSON.message);
					} else {
						/* 2023-10-03 : 일단 이렇게 해놓으면 예외처리는 작동하나 수정 요망 */
					
						if(res.responseJSON.data.title) {
							alert(res.responseJSON.data.title);
						}
						
						if(res.responseJSON.data.content) {
							alert(res.responseJSON.data.content);
						}
						
					}
				}
				
			});	
		}
		
	});
	
});

/**
 * 4-16. 포스팅 좋아요 취소 : 2023-11-16 : 좋아요 상태 변화 비동기로 화면 깜빡임 없이 바뀌게 수정, 포스팅 글을 좋아한 전체 좋아요 수도 바뀌게 수정
 *  
 **/
$(document).on('click', '#unlove', function(e){
	
	let pageOwnerId = $("#pageOwnerId").val();
	let principalId = $("#principalId").val();
	let postId = $("#postId").val();

	if(principalId == -1) {
		alert("로그인을 해주세요.");
		// 2023-11-15 : location.href에서 location.replace로 변경 -> 이전 페이지 히스토리를 완전히 삭제해야되기 때문에 replace로 변경함.
		location.replace("/login");
		return;
	}
	
	if(ACCESS_TOKEN != null) {
		$.ajax({
			type : "DELETE",
			url : `/api/posts/s/${pageOwnerId}/${postId}/unlove`,
			contentType : "application/json; charset=UTF-8",
			headers: {
				"Authorization" : "Bearer " + ACCESS_TOKEN
			},
			success : function(res) {
				console.log(res);	
				
				$.ajax({
					type : "GET",
					url : `/api/posts/${pageOwnerId}/${postId}/${principalId}/info`,
					contentType : "application/json; charset=UTF-8",
					success : function(res) {
						console.log(res);
						
						if(res.data.love == false) {
							$("#unlove").hide();
							$("#love").show();
							
							document.getElementById('totalLoveCnt').innerHTML = res.data.totalLoveCnt;
						}
				
					},
					error : function(res) {
						console.log(res);
						
						if(res.responseJSON.data == null) {
							alert(res.responseJSON.message);
						}
				
					}
				});
				
			},
			error : function(res) {
				console.log(res);
				
				if(res.responseJSON.data == null) {
					alert(res.responseJSON.message);
				} 
			}
			
		});	
	}
});

/**
 * 4-17. 포스팅 좋아요 : 2023-11-14, 2023-11-16 : 좋아요 상태 변화 비동기로 화면 깜빡임 없이 바뀌게 수정, 포스팅 글을 좋아한 전체 좋아요 수도 바뀌게 수정
 *  
 **/
$(document).on('click', '#love', function(e){
	let pageOwnerId = $("#pageOwnerId").val();
	let principalId = $("#principalId").val();
	let postId = $("#postId").val();
	
	if(principalId == -1) {
		alert("로그인을 해주세요.");
		location.replace("/login");
		return;
	}

	if(ACCESS_TOKEN != null) {
		$.ajax({
			type : "POST",
			url : `/api/posts/s/${pageOwnerId}/${postId}/love`,
			contentType : "application/json; charset=UTF-8",
			headers: {
				"Authorization" : "Bearer " + ACCESS_TOKEN
			},
			success : function(res) {
				console.log(res);	
				
				$.ajax({
					type : "GET",
					url : `/api/posts/${pageOwnerId}/${postId}/${principalId}/info`,
					contentType : "application/json; charset=UTF-8",
					success : function(res) {
						console.log(res);
						
						if(res.data.love == true) {
							$("#love").hide();
							$("#unlove").show();
							
							document.getElementById('totalLoveCnt').innerHTML = res.data.totalLoveCnt;
						}
				
					},
					error : function(res) {
						console.log(res);
				
						if(res.responseJSON.data == null) {
							alert(res.responseJSON.message);
						}
					}
				});
				
			},
			error : function(res) {
				console.log(res);
				
				if(res.responseJSON.data == null) {
					alert(res.responseJSON.message);
				} 
			}
			
		});	
	}
	
});


/**
 * 4-8. 상세보기 화면으로 값들고 가기. 
 **/
function detailPost(principalId, postId) {
	
	var form = document.createElement("form");
	form.setAttribute("action", "/post/detail");
	form.setAttribute("charset", "utf-8");
	form.setAttribute("method", "post");
	
	var principalId_field = document.createElement("input");
	principalId_field.setAttribute("type", "hidden");
	principalId_field.setAttribute("name", "principalId")
	principalId_field.setAttribute("value", principalId);
	form.appendChild(principalId_field);
	
	var postId_field = document.createElement("input");
	postId_field.setAttribute("type", "hidden");
	postId_field.setAttribute("name", "postId")
	postId_field.setAttribute("value", postId);
	form.appendChild(postId_field);
	
	document.body.appendChild(form);
	form.submit();

}


/**
 * 4-11. 포스팅 정보 보기(남의꺼 포스팅도 보기 가능) : 주의 : ajax로 동적으로 생성된 태그에 함수를 적용하려면 $(document).ready 밖에서 선언해야된다. 
 * 2023-11-02 : 변수 연결까지 해놓음(filter에 처음 로그인시에 토큰 값에 id값을 안넣어줘서 문제가 생겼었음)
 */
function postInfo(pageOwnerId, principalId, postId) {
	
	if(principalId == -1) {
		console.log("로그인 안했네?");
	} else {
		console.log("로그인한 회원의 아이디는 " + principalId);
	}
	
	console.log("이 포스팅을 쓴 사람의 아이디는 " + pageOwnerId);
	console.log("클릭한 포스팅 글의 아이디는 " + postId);
	

	var form = document.createElement("form");
	form.setAttribute("action", "/post/view");
	form.setAttribute("charset", "utf-8");
	form.setAttribute("method", "post");
	
	var pageOwnerId_field = document.createElement("input");
	pageOwnerId_field.setAttribute("type", "hidden");
	pageOwnerId_field.setAttribute("name", "pageOwnerId")
	pageOwnerId_field.setAttribute("value", pageOwnerId);
	form.appendChild(pageOwnerId_field);

	var principalId_field = document.createElement("input");
	principalId_field.setAttribute("type", "hidden");
	principalId_field.setAttribute("name", "principalId")
	principalId_field.setAttribute("value", principalId);
	form.appendChild(principalId_field);
	
	var postId_field = document.createElement("input");
	postId_field.setAttribute("type", "hidden");
	postId_field.setAttribute("name", "postId")
	postId_field.setAttribute("value", postId);
	form.appendChild(postId_field);
	
	document.body.appendChild(form);
	form.submit();
	
}

//2023-10-10 : 엑세스 토큰 만료시간시 쿠키 삭제해주는 함수 -> 여기서 key 값은 'access_token'
function deleteCookie(key) {
	document.cookie = key + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;path=/;';
}

