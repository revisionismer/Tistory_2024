/**
 * 	board.js
 */
 
/**
	2023-12-31 : 이벤트 처리 로직 변경
*/
if(document.getElementById('boardArea')) {
	window.onload = () => {
		
		addEnterSearchEvent();		
	}

}
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
		var header = ACCESS_TOKEN.split('.')[0];
		var payload = ACCESS_TOKEN.split('.')[1];
		var signature = ACCESS_TOKEN.split('.')[2];
		
		var data = JSON.parse(Base64.decode(payload));
		
		console.log(data.id);
		
		/**
		 *	5-1. 게시글 리스트 : 2023-12-01 -> 페이징 작업중.
		 **/
		let boardList = $("#list").val();
		
		var principalId = data.id;
		
		if(boardList != null) {
			var page = 1;
			var recordPerPage = 10;
			var pageSize = 10;
			
			var url = "/api/boards?page=" + page + "&recordPerPage=" + recordPerPage + "&pageSize=" + pageSize;
			
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
					
					document.getElementById('not_board_data_area').innerHTML = html;
					document.getElementById('pagination').innerHTML = html;
					
					if(!res.data.result.list.length) {
						html = `<p id="not_board_data_msg">등록된 게시글이 없습니다.</p>`;
						
						document.getElementById('not_board_data_area').innerHTML = html;
						
						return;
					} else {
						for(var i = 0; i < res.data.result.list.length; i++) {
							html += `
								<tr onclick="detailBoard(${principalId}, ${res.data.result.list[i].id});">
									<td>${res.data.result.list[i].id}</td>
									<td>${res.data.result.list[i].title}</td>
									<td>${res.data.result.list[i].writer}</td>
									<td>${res.data.result.list[i].createdAt}</td>
									<td>${res.data.result.list[i].hits}</td>
								</tr>
							`;
						}
						
					}
					
					document.getElementById('list').innerHTML = html;
					
					html = ``;
					
					if(res.data.result.list.length == 0) {
						html += `
							<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
								<a class="my_atag_none my_mr_sm_1" id="board_prev">
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
						
						if(res.data.result.params.pagination.existPrevPage) {
							html += `
								<a data-prev="${i}" class="my_atag_none my_mr_sm_1" id="board_prev">
									<i class="fa-solid fa-angle-left"></i>
								</a>
							`;
						}
						for(var i = 0; i < res.data.result.params.pagination.totalPageCount; i++) {
							html += `
									<a class="my_atag_none_1">
										<div data-set="${i+1}" id="main_page" class="my_paging_number_box my_mr_sm_1_1">
											${i+1}
										</div>
									</a>
								`;
						}
						
						if(res.data.result.params.pagination.existNextPage) {
							html += `
						
								<a data-next="${i+2}"  class="my_atag_none my_ml_sm_1" id="board_next">
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
			 * 	5-5. 게시글 리스트 페이징(현재 페이지)
			 * 
			 **/
			$(document).on('click', '#main_page', function(e){
				e.preventDefault();
				
				var main_page = e.currentTarget.innerText;
				
				console.log(main_page);
			
				var recordPerPage = 10;
				var pageSize = 10;
				
				var url = "/api/boards?page=" + main_page + "&recordPerPage=" + recordPerPage + "&pageSize=" + pageSize;
				
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
						
						document.getElementById('not_board_data_area').innerHTML = html;
						document.getElementById('pagination').innerHTML = html;
						
						if(!res.data.result.list.length) {
							html = `<p id="not_board_data_msg">등록된 게시글이 없습니다.</p>`;
							
							document.getElementById('not_board_data_area').innerHTML = html;
							
							return;
						} else {
							for(var i = 0; i < res.data.result.list.length; i++) {
								html += `
									<tr onclick="detailBoard(${principalId}, ${res.data.result.list[i].id});">
										<td>${res.data.result.list[i].id}</td>
										<td>${res.data.result.list[i].title}</td>
										<td>${res.data.result.list[i].writer}</td>
										<td>${res.data.result.list[i].createdAt}</td>
										<td>${res.data.result.list[i].hits}</td>
									</tr>
								`;
							}
							
						}
						
						document.getElementById('list').innerHTML = html;
						
						html = ``;
						
						if(res.data.result.list.length == 0) {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
									<a class="my_atag_none my_mr_sm_1" id="board_prev">
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
							
							if(res.data.result.params.pagination.existPrevPage) {
								html += `
									<a data-prev="${i}" class="my_atag_none my_mr_sm_1" id="board_prev">
										<i class="fa-solid fa-angle-left"></i>
									</a>
								`;
							}
							for(var i = 0; i < res.data.result.params.pagination.totalPageCount; i++) {
								html += `
										<a class="my_atag_none_1">
											<div data-set="${i+1}" id="main_page" class="my_paging_number_box my_mr_sm_1_1">
												${i+1}
											</div>
										</a>
									`;
							}
							
							if(res.data.result.params.pagination.existNextPage) {
								html += `
							
									<a data-next="${i+2}" class="my_atag_none my_ml_sm_1" id="board_next">
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
			 * 	5-6. 게시글 리스트 페이징(이전 페이지) : 2023-12-12 : 페이징 완료
			 * 
			 **/
			$(document).on('click', '#board_prev', function(e){
				e.preventDefault();
			
				const board_prev = document.querySelector("#board_prev");
				
				console.log(board_prev.dataset.prev);
				
				var prevPage = board_prev.dataset.prev;
				
				var recordPerPage = 10;
				var pageSize = 10;
				
				var url = "/api/boards?page=" + prevPage + "&recordPerPage=" + recordPerPage + "&pageSize=" + pageSize;
				
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
						
						document.getElementById('not_board_data_area').innerHTML = html;
						document.getElementById('pagination').innerHTML = html;
						
						if(!res.data.result.list.length) {
							html = `<p id="not_board_data_msg">등록된 게시글이 없습니다.</p>`;
							
							document.getElementById('not_board_data_area').innerHTML = html;
							
							return;
						} else {
							for(var i = 0; i < res.data.result.list.length; i++) {
								html += `
									<tr onclick="detailBoard(${principalId}, ${res.data.result.list[i].id});">
										<td>${res.data.result.list[i].id}</td>
										<td>${res.data.result.list[i].title}</td>
										<td>${res.data.result.list[i].writer}</td>
										<td>${res.data.result.list[i].createdAt}</td>
										<td>${res.data.result.list[i].hits}</td>
									</tr>
								`;
							}
							
						}
						
						document.getElementById('list').innerHTML = html;
						
						html = ``;
						
						if(res.data.result.list.length == 0) {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
									<a class="my_atag_none my_mr_sm_1" id="board_prev">
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
							
							if(res.data.result.params.pagination.existPrevPage) {
								html += `
									<a data-prev="${i}" class="my_atag_none my_mr_sm_1" id="board_prev">
										<i class="fa-solid fa-angle-left"></i>
									</a>
								`;
							}
							for(var i = 0; i < res.data.result.params.pagination.totalPageCount; i++) {
								html += `
										<a class="my_atag_none_1">
											<div data-set="${i+1}" id="main_page" class="my_paging_number_box my_mr_sm_1_1">
												${i+1}
											</div>
										</a>
									`;
							}
							
							if(res.data.result.params.pagination.existNextPage) {
								html += `
							
									<a data-next="${i+2}" class="my_atag_none my_ml_sm_1" id="board_next">
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
			 * 	5-7. 게시글 리스트 페이징(이전 페이지)
			 * 
			 **/
			$(document).on('click', '#board_next', function(e){
				e.preventDefault();
			
				const board_next = document.querySelector("#board_next");
				
				console.log(board_next.dataset.next);
				
				var nextPage = board_next.dataset.next;
				
				var recordPerPage = 10;
				var pageSize = 10;
				
				var url = "/api/boards?page=" + nextPage + "&recordPerPage=" + recordPerPage + "&pageSize=" + pageSize;
				
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
						
						document.getElementById('not_board_data_area').innerHTML = html;
						document.getElementById('pagination').innerHTML = html;
						
						if(!res.data.result.list.length) {
							html = `<p id="not_board_data_msg">등록된 게시글이 없습니다.</p>`;
							
							document.getElementById('not_board_data_area').innerHTML = html;
							
							return;
						} else {
							for(var i = 0; i < res.data.result.list.length; i++) {
								html += `
									<tr onclick="detailBoard(${principalId}, ${res.data.result.list[i].id});">
										<td>${res.data.result.list[i].id}</td>
										<td>${res.data.result.list[i].title}</td>
										<td>${res.data.result.list[i].writer}</td>
										<td>${res.data.result.list[i].createdAt}</td>
										<td>${res.data.result.list[i].hits}</td>
									</tr>
								`;
							}
							
						}
						
						document.getElementById('list').innerHTML = html;
						
						html = ``;
						
						if(res.data.result.list.length == 0) {
							html += `
								<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
									<a class="my_atag_none my_mr_sm_1" id="board_prev">
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
							
							if(res.data.result.params.pagination.existPrevPage) {
								html += `
									<a data-prev="${i}" class="my_atag_none my_mr_sm_1" id="board_prev">
										<i class="fa-solid fa-angle-left"></i>
									</a>
								`;
							}
							for(var i = 0; i < res.data.result.params.pagination.totalPageCount; i++) {
								html += `
										<a class="my_atag_none_1">
											<div data-set="${i+1}" id="main_page" class="my_paging_number_box my_mr_sm_1_1">
												${i+1}
											</div>
										</a>
									`;
							}
							
							if(res.data.result.params.pagination.existNextPage) {
								html += `
							
									<a data-next="${i+2}" class="my_atag_none my_ml_sm_1" id="board_next">
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
		 *	5-2. 게시글 작성 폼 : 2023-11-24
		 **/
		let boardWriteForm = $("#boardWriteForm").val();
		
		if(boardWriteForm != null) {
			$("#writer").val(data.username);
			
			let boardId = $("#boardId").val();
			
			if(boardId.length !== 0) {
				$("#boardWriteBtn").hide();
			} else {
			
				$("#boardUpdateBtn").hide();
			}
			
			$("#boardWriteBtn").on("click", function(){
					
				let title = $("#title").val();
				let writer = data.username;
				let content = document.getElementById('boardContent').value;
				
				if(title.length === 0){
					alert("제목을 입력해주세요.");
					$("#title").focus();
					return;
				} 
				
				if(content.length === 0) {
					alert("내용을 입력해주세요.")
					$("#boardContent").focus();
					return;
				}
				
				var boardObject = {
					title : $("#title").val(),
					writer : $("#writer").val(),
					content : document.getElementById('boardContent').value
				}
				
				var fileList = $("#file_items")[0].files;
						
				var formData = new FormData();
				formData.append("board", JSON.stringify(boardObject));
						
				for(var i = 0; i < fileList.length; i++) {
					formData.append("files", fileList[i]);
				}
						
				console.log(formData.get('board'));
				console.log(formData.get('files'));
					
				$.ajax({
					type : "POST",
					url : "/api/boards/s",
					data: formData,
					headers: {
						"Authorization" : "Bearer " + ACCESS_TOKEN
					},
					cache: false,
					processData: false,
					contentType: false,
					success : function(res) {
						console.log(res);
						
						if(res.code === 1) {
							alert("글쓰기 성공");
							location.href = "/user/board/list"
						}
						
					},
					error : function(res) {
						console.log(res);
						alert("파일 업로드 허용 용량을 초과했습니다. 500MB미만으로 올려주세요");
						$("#file_items").val("");
						return;
											
					}
				});
					
			});
			
			// 2023-11-29 : 파일업로드는 잘되는데 예외처리 해줘야함 : 파일 업로드하는쪽에서 캐치해야함.
		}
		
		/**
		 *	5-4. 게시글 상세 내용 보기
		 **/
		let boardUpdateForm = $("#boardUpdateForm").val();
		
		if(boardUpdateForm != null) {
	
			var boardId = $("#boardId").val();
		
			console.log(boardId);
			
			if(boardId.length !== 0) {
				$("#boardWriteBtn").hide();
			} else {
				$("#boardUpdateBtn").hide();
			}
			
			$.ajax({
				type : "GET",
				url : "/api/boards/" + boardId + "/s",
				headers: {
					"Authorization" : "Bearer " + ACCESS_TOKEN
				},
				success : function(res) {
					console.log(res);
					
					$("#writer").val(res.data[0].writer);
					$('#title').val(res.data[0].title);
					$('#boardContent').text(res.data[0].content);
					
					if(res.data[0].oriFileName != null) {
						$("#file_items").hide();
						
						var file_area = document.querySelector("#file_list");
						
						for(var i = 0; i < res.data.length; i++) {
							var div_area = document.createElement('div');
							div_area.setAttribute('id', 'boardFile_' + i);
							
							file_area.appendChild(div_area);
							div_area.innerHTML = `<a href="/api/boards/${boardId}/${res.data[i].boardFileId}/download">${res.data[i].oriFileName}</a>`;
						}
						
					}
					
				},
				error : function(res) {
					console.log(res);
					
					return;
										
				}
			});
		}
		
		/**
		 *  5-8. 검색 : 2023-12-27 : 검색 완료.
		 * */
		$(document).on('click', '#searchBoardBtn', function(e){
			
			const pageParam = Number(new URLSearchParams(location.search).get('page'));
			
			page = (page) ? page : ((pageParam) ? pageParam : 1);
									
			const form = document.getElementById('searchForm');
					
			// 3-2. url parameter 붙이기
			const params = {
				page: page,
				recordPerPage: 10,
				pageSize: 5,
				searchType: form.searchType.value,
				keyword: form.keyword.value		
			}
					
			const queryString = new URLSearchParams(params).toString();
			const replaceURI = location.pathname + '?' + queryString;
			history.replaceState({}, '', replaceURI);
		
			$.ajax({
				url: "/api/boards",
				type: "GET",
				data: params,
				dataType: "json",
				contentType: "application/json; charset=UTF-8",
				headers: {
					"Authorization" : "Bearer " + ACCESS_TOKEN
				},
				success: function(res) {
					console.log(res);
					
					var html = ``;
					
					document.getElementById('not_board_data_area').innerHTML = html;
					document.getElementById('pagination').innerHTML = html;
					
					if(!res.data.result.list.length) {
						html = ``;
						
						document.getElementById('list').innerHTML = html;
						
						html = `<p id="not_board_data_msg">등록된 게시글이 없습니다.</p>`;
						
						document.getElementById('not_board_data_area').innerHTML = html;
					
						html = ``;
						
						html += `
							<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
						`;
						
						if(res.data.result.params.pagination.existPrevPage) {
							html += `
								<a class="my_atag_none my_mr_sm_1" id="board_prev">
									<i class="fa-solid fa-angle-left"></i>
								</a>
							`;
						}
						
						html += `

								<a class="my_atag_none_1">
									<div id="main_page" class="my_paging_number_box my_mr_sm_1_1">
										1
									</div>
								</a>
						`;
						
						if(res.data.result.params.pagination.existNextPage) {
							html += `
								<a class="my_atag_none my_ml_sm_1">
									<i class="fa-solid fa-angle-right"></i>
								</a>
							`;
						}
						
						html += `
						
							</div>	
						`;
						
						document.getElementById('pagination').innerHTML = html;
						
						return;
					} else {
						for(var i = 0; i < res.data.result.list.length; i++) {
							html += `
								<tr onclick="detailBoard(${principalId}, ${res.data.result.list[i].id});">
									<td>${res.data.result.list[i].id}</td>
									<td>${res.data.result.list[i].title}</td>
									<td>${res.data.result.list[i].writer}</td>
									<td>${res.data.result.list[i].createdAt}</td>
									<td>${res.data.result.list[i].hits}</td>
								</tr>
							`;
						}
						
					}
					
					document.getElementById('list').innerHTML = html;
					
					html = ``;
					
					if(res.data.result.list.length == 0) {
						html += `
							<div class="my_paging d-flex justify-content-center align-items-center my_mb_lg_1">
								<a class="my_atag_none my_mr_sm_1" id="board_prev">
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
						
						if(res.data.result.params.pagination.existPrevPage) {
							html += `
								<a data-prev="${i}" class="my_atag_none my_mr_sm_1" id="board_prev">
									<i class="fa-solid fa-angle-left"></i>
								</a>
							`;
						}
						for(var i = 0; i < res.data.result.params.pagination.totalPageCount; i++) {
							html += `
									<a class="my_atag_none_1">
										<div data-set="${i+1}" id="main_page" class="my_paging_number_box my_mr_sm_1_1">
											${i+1}
										</div>
									</a>
								`;
						}
						
						if(res.data.result.params.pagination.existNextPage) {
							html += `
						
								<a data-next="${i+2}" class="my_atag_none my_ml_sm_1" id="board_next">
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
				error: function(res) {
					console.log(res);
					
					return;
				}
			});
			
			
			
		});
		
	}
	

	
});

/**
 *  5-3. 상세보기 화면으로 값들고 가기. 
 **/
function detailBoard(principalId, boardId) {
	var form = document.createElement("form");
	form.setAttribute("action", "/user/board/detail");
	form.setAttribute("charset", "utf-8");
	form.setAttribute("method", "post");
	
	var principalId_field = document.createElement("input");
	principalId_field.setAttribute("type", "hidden");
	principalId_field.setAttribute("name", "principalId")
	principalId_field.setAttribute("value", principalId);
	form.appendChild(principalId_field);
	
	var boardId_field = document.createElement("input");
	boardId_field.setAttribute("type", "hidden");
	boardId_field.setAttribute("name", "boardId")
	boardId_field.setAttribute("value", boardId);
	form.appendChild(boardId_field);
	
	document.body.appendChild(form);
	
	form.submit();
}

//2023-10-10 : 엑세스 토큰 만료시간시 쿠키 삭제해주는 함수 -> 여기서 key 값은 'access_token'
function deleteCookie(key) {
	document.cookie = key + '=; expires=Thu, 01 Jan 1999 00:00:10 GMT;path=/;';
}

/**
	 5-9. 키워드로 검색시 엔터 이벤트 바인딩 
*/
function addEnterSearchEvent() {
	document.getElementById('keyword').addEventListener('keyup', e => {
		if(e.keyCode == 13) {
			$('#searchBoardBtn').click(); 
		}
	});
}
	