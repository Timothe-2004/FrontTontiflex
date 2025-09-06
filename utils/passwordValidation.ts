export interface PasswordRule {
    id: string;
    message: string;
    validate: (password: string) => boolean;
  }
  
  export const passwordRules: PasswordRule[] = [
    {
      id: 'length',
      message: 'Au moins 8 caractères',
      validate: (password) => password.length >= 8
    },
    {
      id: 'uppercase',
      message: 'Une lettre majuscule',
      validate: (password) => /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      message: 'Une lettre minuscule',
      validate: (password) => /[a-z]/.test(password)
    },
    {
      id: 'number',
      message: 'Un chiffre',
      validate: (password) => /[0-9]/.test(password)
    },
    {
      id: 'special',
      message: 'Un caractère spécial',
      validate: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
  ];
  
  export const validatePassword = (password: string): { isValid: boolean; errors: PasswordRule[] } => {
    const errors = passwordRules.filter(rule => !rule.validate(password));
    return {
      isValid: errors.length === 0,
      errors
    };
  };