import React from 'react';
import { PasswordRule } from '@/utils/passwordValidation';
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordRulesListProps {
  password: string;
  rules: PasswordRule[];
}

const PasswordRulesList: React.FC<PasswordRulesListProps> = ({ password, rules }) => {
  return (
    <div className="mt-2 space-y-1">
      {rules.map((rule) => {
        const isValid = rule.validate(password);
        return (
          <div 
            key={rule.id} 
            className={`flex items-center space-x-2 text-sm ${
              isValid ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {isValid ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <span>{rule.message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PasswordRulesList;