import { Plugin } from '../FormValidator';
import isEmpty from 'lodash/isEmpty';
import { RuleKeywords } from '../FormValidationRuler';
import isUndefined from 'lodash/isUndefined';
import merge from 'lodash/merge';

/**
 * 设置关键词规则
 */
const DefaultRulerKeywordPlugin: Plugin = {
  name: 'DefaultRulerKeywordPlugin',
  setup: function (context, opts: RuleKeywords) {
    const ruler = context.ruler;
    const validator = context.validator;
    const defaultKeywords = {
      email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      required: (value) => !isEmpty(value),
      maxlength: (value, param) => value.length <= param,
      minlength: (value, param) => value.length >= param,
      equalToField: (value, param) => {
        const refField = validator.controls.find(control => control.name === param);
        // 如果参考的field不存在，返回false
        if (!refField) return false;
        return refField.value === value;
      }
    };

    ruler.keywords = isUndefined(opts) ? defaultKeywords : merge({}, defaultKeywords, opts);
  }
};

export default DefaultRulerKeywordPlugin;