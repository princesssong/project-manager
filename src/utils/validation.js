// src/utils/validation.js

export const validateInput = (userId, password) => {
    if (!userId || !password) {
      return { isValid: false, message: "모든 필드를 채워야 합니다." };
    }
  
    if (password.length < 6) {
      return { isValid: false, message: "비밀번호는 최소 6자 이상이어야 합니다." };
    }
  
    // 추가적인 검증을 여기서 할 수 있습니다 (예: userId에 특수문자 제한 등)
    if (!/^[a-zA-Z0-9]+$/.test(userId)) {
      return { isValid: false, message: "아이디는 영문자와 숫자만 포함해야 합니다." };
    }
  
    return { isValid: true };
  };
  