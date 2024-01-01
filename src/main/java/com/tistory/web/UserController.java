package com.tistory.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/user")
public class UserController {

	@GetMapping("/myInfo")
	public String myInfo(HttpServletRequest request, Model model) {
		
		Cookie[] cookies = request.getCookies();
		
		if(cookies != null) {
			
			for(Cookie cookie : cookies) {
				
				if(cookie.getName().equals("access_token")) {
					model.addAttribute("access_token", cookie.getValue());
				}
			}
		} 
		
		return "user/myInfo";
	}
}
