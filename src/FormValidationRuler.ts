import isFn from 'lodash/isFunction';
import isString from 'lodash/isString';
import isRegexp from 'lodash/isRegExp';
import isUndefined from 'lodash/isUndefined';

interface RuleHandleFunction {
  (value, param?): boolean;
}

type RuleHandler = RegExp | RuleHandleFunction | string;

interface Rule {
  name: string;
  handler: RuleHandler;
  param?: any;
}

export interface RuleKeywords {
  [name: string]: RuleHandler; // name是rule.name，值是rule.handler
}

interface FormValidationRuler {
  keywords: RuleKeywords,
  match(value: any, rule: Rule): boolean;
}

const FormValidationRuler: FormValidationRuler = {
  // 预设的关键词，用它代指rule，以便更容易复用
  keywords: {},
  match(value: any, rule: Rule) {
    if (isRegexp(rule.handler)) {
      return (rule.handler as RegExp).test(value);
    } else if (isFn(rule.handler)) {
      return (rule.handler as RuleHandleFunction)(value, rule.param);
    } else if (isString(rule.handler)) {
      // 没预设的keyword返回false
      if (isUndefined((this as FormValidationRuler).keywords[rule.handler as string])) {
        return false;
      }
      // 取出keyword代表的rule，再match
      return (this as FormValidationRuler).match(value, {
        name: rule.name,
        handler: (this as FormValidationRuler).keywords[(rule.handler as string)],
        param: rule.param
      });
    }
  }
};

export {
  FormValidationRuler as default,
  Rule,
  RuleHandleFunction,
  RuleHandler
};