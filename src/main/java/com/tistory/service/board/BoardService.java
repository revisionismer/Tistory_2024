package com.tistory.service.board;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.apache.tomcat.util.http.fileupload.impl.SizeLimitExceededException;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tistory.constant.user.UserEnum;
import com.tistory.domain.board.Board;
import com.tistory.domain.board.BoardFile;
import com.tistory.domain.board.BoardFileRepository;
import com.tistory.domain.board.BoardRepository;
import com.tistory.domain.user.User;
import com.tistory.dto.board.BoardPagingRespDto;
import com.tistory.dto.board.BoardReqDto;
import com.tistory.dto.board.BoardRespDto;
import com.tistory.dto.board.paging.CommonParams;
import com.tistory.dto.board.paging.Pagination;
import com.tistory.handler.exception.CustomApiException;
import com.tistory.mapper.board.IBoardMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)  // 8-8. RuntimeException 말고도 모든 예외가 터졌을시 롤백시킨다.
@RequiredArgsConstructor
public class BoardService {

	private final BoardRepository boardRepository;
	private final IBoardMapper boardMapper;
	
	private final FileService fileService;
	private final BoardFileRepository boardFileRepository;
	
	/**
	 *  8-1. 게시글 생성
	 
	public BoardRespDto writeBoard(final BoardReqDto params, User loginUser) {
		
		if(loginUser.getRole() == UserEnum.ADMIN || loginUser.getRole() == UserEnum.USER) {
			Board board = params.toEntity();
			board.setWriter(loginUser.getUsername());
			board.setCreatedAt(LocalDateTime.now());
			
			Board newBoard = boardRepository.save(board);
			
			return new BoardRespDto(newBoard);
		} else {
			throw new CustomApiException("글을 작성할 수 있는 권한이 있는 유저가 아닙니다.");
		}
	}
	*/
	/**
	 *  8-1. 게시글 생성(다중 첨부 파일 기능 추가) : 2023-11-29 -> 여기까지함 다중 파일 업로드
	 */
	public BoardRespDto writeBoard(String boardString, MultipartFile[] files, User loginUser) throws Exception {
		
		if(loginUser.getRole() == UserEnum.ADMIN || loginUser.getRole() == UserEnum.USER) {
	
			log.info("boardString:" + boardString);
							
			Board board = new ObjectMapper().readValue(boardString, Board.class);
			board.setUser(loginUser);
			board.setDeleteYn('N');
			board.setCreatedAt(LocalDateTime.now());
			
			Board newBoard = boardRepository.save(board);
			
			BoardFile boardFile = null;
		
			if(files != null) {			
				
				for(MultipartFile file : files) {
					boardFile = new BoardFile();
					
					// 파일 저장
					try {
						String createdFilename = fileService.uploadFile(file.getOriginalFilename(), file.getBytes());
						
						// 파일 정보 저장
						boardFile.setFileName(file.getOriginalFilename());
						boardFile.setFileUrl(createdFilename);
						boardFile.setDownCnt(0);
						boardFile.setBoardId(newBoard.getId());
						boardFile.setUserId(loginUser.getId());
						boardFile.setCreatedAt(LocalDateTime.now());

						boardFileRepository.save(boardFile);
					
					} catch (MaxUploadSizeExceededException e) {
						throw new CustomApiException(e.getMessage());
					} catch (SizeLimitExceededException e) {
						throw new CustomApiException(e.getMessage());
					}
		
				}
			}
				
			if(boardFile == null) {
				return new BoardRespDto(newBoard);
			} else {
				return new BoardRespDto(newBoard, boardFile);
			}
			
			
		} else {
			throw new CustomApiException("글을 작성할 수 있는 권한이 있는 유저가 아닙니다.");
		}
	}
	
	
	/**
	 *  8-2. 게시글 조회
	 */
	@Transactional(readOnly = true)
	public List<BoardRespDto> findAll() {
		Sort sort = Sort.by(Direction.DESC, "id", "createdAt");
		List<Board> list = boardRepository.findAll(sort);
		
		// 2-2. Java 8 Stream API 사용 O
	//	return list.stream().map(BoardResponseDto::new).collect(Collectors.toList());
		
		// 2-3. Java 8 Stream API 사용 X
		List<BoardRespDto> boardList = new ArrayList<>();
		
		for(Board entity : list) {
			boardList.add(new BoardRespDto(entity));
		}
		
		return boardList;
	}
	
	/**
	 *  8-3. 게시글 수정
	 */
	@Transactional
	public Long update(final Long boardId, final BoardReqDto params, User loginUser) {
		
		Board boardEntity = null;
		
		// Java 8 Stream API 사용 O
	//	Board entity = boardRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.POSTS_NOT_FOUND));
    //	entity.update(params.getTitle(), params.getContent(), params.getWriter());
		
		// Java 8 Stream API 사용 X
		Optional<Board> boardOp = boardRepository.findById(boardId);
		
		if (boardOp.isPresent()) {
			boardEntity = boardOp.get();
	    } else {
	        throw new CustomApiException("해당 게시글이 존재하지 않습니다");
	    }
	
		boardEntity.update(params.getTitle(), params.getContent());
		
		return boardId;
	}
	
	/**
	 *  8-4. 게시글 상세정보 조회 
	 */
	@Transactional(readOnly = true)  // 5-2. 영속성 컨텍스트에서 관리되려면 트랜잭션으로 묶여있어야 변경감지가 동작한다.
	public BoardRespDto findById(final Long id) {
		
		Board boardEntity = null;
		
		Optional<Board> boardOp = boardRepository.findById(id);
		
		if (boardOp.isPresent()) {
			boardEntity = boardOp.get();
	    } else {
	        throw new CustomApiException("해당 게시글이 존재하지 않습니다");
	    }
		
		boardEntity.increaseHits();
		
		return new BoardRespDto(boardEntity);
		
	}
	
	// 2022-12-14 -> 조회수 한 번만 증가하게 수정, 게시글 수정 기능 추가 
	/**
	 * 8-5. 게시글 상세정보 조회(글 수정 폼에서 조회 - 조회수 증가 X)  
	 */
	@Transactional(readOnly = true)  // 5-4. 글 수정때 조회할땐 조회수 증가 X
	public BoardRespDto findById(final Long id, User principal) {
		
		Board boardEntity = null;
		
		Optional<Board> boardOp = boardRepository.findById(id);
		
		if (boardOp.isPresent()) {
			boardEntity = boardOp.get();
	    } else {
	        throw new CustomApiException("해당 게시글이 존재하지 않습니다");
	    }
	
		return new BoardRespDto(boardEntity);
		
	}
	
	/**
	 * 8-6. 게시글 리스트 조회 - (페이징 처리) : 호출 시 -> http://localhost:8080/api/boards?page=1&recordPerPage=10&pageSize=10 이런식으로 요청해야함
	 */
	@Transactional(readOnly = true)
	public BoardPagingRespDto findAllByPaging(final CommonParams params) {
		Map<String, Object> result = new HashMap<>();
		
		// 7-2. 게시글 갯수 조회
		int count = boardMapper.count(params);
		
		// 7-3. 페이지네이션 정보 계산 후 CommonParams에 셋팅
		Pagination pagination = new Pagination(count, params);
		params.setPagination(pagination);

		// 7-4. 등록된 게시글이 없는 경우, 페이징 데이터 1로 초기화해 세팅 후 비어있는 list를 보내준다.
		if(count < 1) {
			List<BoardRespDto> list = new ArrayList<>();
			
			pagination = new Pagination(1, params);
			params.setPagination(pagination);
			
			result.put("params", params);
			result.put("list", list);
			
			return new BoardPagingRespDto(result);
		} 
			// 7-5. 게시글 리스트 조회
		List<BoardRespDto> list = boardMapper.findAll(params);
			
		// 7-6. 데이터 반환
		result.put("params", params);
		result.put("list", list);
		
		return new BoardPagingRespDto(result);
	}
	
	/**
	 * 8-7. 게시글 상세정보 조회(파일 이름도 같이 조회) : 2023-12-06 : 조회수 처리 완료
	 */
	@Transactional  // 5-4. 글 수정때 조회할땐 조회수 증가 X
	public List<BoardRespDto> findByBoardId(final Long boardId, User loginUser) {
		
		Board boardEntity = null;
		
		List<BoardFile> file_list = null;
		
		Optional<Board> boardOp = boardRepository.findById(boardId);
		
		if (boardOp.isPresent()) {
			boardEntity = boardOp.get();
			file_list = boardFileRepository.findByBoardId(boardId);
			
			List<BoardRespDto> list = new ArrayList<>();
			
			// 2023-12-06 : 파일이 없을때와 있을때 분기 처리
			if(!file_list.isEmpty()) {
				for(int i = 0; i < file_list.size(); i++) {
					list.add(new BoardRespDto(boardEntity, file_list.get(i)));
				}
			} else {
				list.add(new BoardRespDto(boardEntity));
			}
			
			// 자기 자신은 조화수 증가 안하도록 처리해야됨
			if(!loginUser.getId().equals(boardEntity.getUser().getId())) {
				boardEntity.increaseHits();
			}
			
			return list;
			
	    } else {
	        throw new CustomApiException("해당 게시글이 존재하지 않습니다");
	    }

		
	}
}
