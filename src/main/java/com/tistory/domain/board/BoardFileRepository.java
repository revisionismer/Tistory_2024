package com.tistory.domain.board;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardFileRepository extends JpaRepository<BoardFile, Long>{
	
	List<BoardFile> findByBoardId(Long boardId);

}
