package com.tistory.dto.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import com.tistory.domain.board.Board;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter @Setter
public class BoardReqDto {
	
	@NotBlank
	private String title; // 1. 제목
	
	@NotNull
	private String content; // 2. 내용

	private char deleteYn; // 3. 삭제여부
	
	public Board toEntity() {
		return Board.builder()
				.title(title)
				.content(content)
				.hits(0)
				.deleteYn(deleteYn)
				.build();
	}
}
