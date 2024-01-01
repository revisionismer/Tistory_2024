package com.tistory.domain.board;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tistory.domain.user.User;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@Getter @Setter
@Table(name = "board_tb")
@Entity
public class Board {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id; // 5-1. PK
	
	private String title; // 5-2. 제목
	
	private String content; // 5-3. 내용
	
	private String writer; // 5-4. 작성자
	
	private int hits;  // 5-5. 조회수
	
	private char deleteYn; // 5-6. 삭제여부
	
	@JoinColumn(name = "userId")
	@ManyToOne
	private User user;
	
	@CreatedDate
 	@Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
 	private LocalDateTime createdAt;  // 5-7.
 	 
 	@LastModifiedDate
 	@Column(nullable = true)
 	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
 	private LocalDateTime updatedAt;  // 5-8.
	
	/**
	 *  5-9. 엔티티로 변환해주는 생성자 빌더.
	 */
	@Builder
	public Board(String title, String content, String writer, int hits, char deleteYn) {
		this.title = title;
		this.content = content;
		this.writer = writer;
		this.hits = hits;
		this.deleteYn = deleteYn;
	}
	
	/**
	 * 5-10. 게시글 수정 
	 */
	public void update(String title, String content) {
		this.title = title;
		this.content = content;
		this.updatedAt = LocalDateTime.now();		
	}
	
	/**
	 * 5-11. 조회수 증가 
	 */
	public void increaseHits() {
		this.hits++;
	}
	
	/**
	 * 5-12. 게시글 삭제
	 */
	public void delete() {
		this.deleteYn = 'Y';
	}
}
