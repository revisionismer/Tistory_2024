package com.tistory.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class HomeController {

	@GetMapping({"/", "/index"})
	public String index(HttpServletRequest request, Model model) {
		
		Cookie[] cookies = request.getCookies();
		
		if(cookies != null) {
			
			for(Cookie cookie : cookies) {
				
				if(cookie.getName().equals("access_token")) {
					model.addAttribute("access_token", cookie.getValue());
				}
			}
		} 
		
		return "index";
	}
	
	@GetMapping("/join")
	public String joinForm(HttpServletRequest request, Model model) {
		
		Cookie[] cookies = request.getCookies();
		
		if(cookies != null) {
			
			for(Cookie cookie : cookies) {
				
				if(cookie.getName().equals("access_token")) {
					model.addAttribute("access_token", cookie.getValue());
				}
			}
		} 
		
		return "joinForm";
	}
	
	@GetMapping("/login")
	public String loginForm() {
		return "loginForm";
	}
	
	@GetMapping("/password-reset-form")
	public String passwordResetForm(HttpServletRequest request, Model model) {
		
		Cookie[] cookies = request.getCookies();
		
		if(cookies != null) {
			
			for(Cookie cookie : cookies) {
				
				if(cookie.getName().equals("access_token")) {
					model.addAttribute("access_token", cookie.getValue());
				}
			}
		} 
		
		return "passwordResetForm";
	}
}
