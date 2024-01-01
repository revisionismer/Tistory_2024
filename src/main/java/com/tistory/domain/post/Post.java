package com.tistory.domain.post;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tistory.domain.category.Category;
import com.tistory.domain.user.User;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@Getter @Setter
@Table(name = "post_tb")
@Entity
public class Post {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;  // 1-1. PK

	@Column(length = 60, nullable = false)
    private String title;

    @Lob
    @Column(nullable = true)
    private String content;

    @Column(length = 200, nullable = true)
    private String thumnailImgFileName;
    
    @Column(length = 200, nullable = true)
    private String originalImgFileName;

    @JoinColumn(name = "userId")
    @ManyToOne
    private User user;
    
    @JoinColumn(name = "categoryId")
    @ManyToOne
    private Category category;
    
    @CreatedDate
 	@Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
 	private LocalDateTime createdAt;
 	 
 	@LastModifiedDate
 	@Column(nullable = true)
 	@JsonFormat(pattern = "yyyy-MM-dd HH:mm")
 	private LocalDateTime updatedAt; 
 	
 	@Builder
    public Post(Long id, String title, User user, Category category, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.user = user;
        this.category = category;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
 	
}
