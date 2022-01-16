import isUndefined from 'lodash/isUndefined';
import isArray from 'lodash/isArray';
import isArrayLike from 'lodash/isArrayLike';
import isString from 'lodash/isString';
import isRegExp from 'lodash/isRegExp';
import isFunction from 'lodash/isFunction';
import FormValidationRuler, { Rule, RuleHandleFunction, RuleHandler } from "./FormValidationRuler";
import DefaultRulerKeywordPlugin from "./plugins/default_keywords";
import DefaultDisplayPlugin from './plugins/default_display';

interface RuleConfigureObject {
  name?: string;
  handler: RuleHandler;
  param?: any;
}

type RuleConfigureParam = RuleConfigureObject | RuleHandler | [RuleHandler, any];

interface RulesConfigureParam {
  [name: string]: RuleConfigureParam[] | RuleConfigureParam;
}

interface RulesConfigure {
  [name: string]: Rule[] | Rule;
}

interface PluginData {
  [key: string]: any;
}

interface PluginContext {
  validator: FormValidator;
  ruler: FormValidationRuler;
}

export interface Plugin {
  name: string;
  setup(context: PluginContext, opts: any);
  onValidated?(result: ValidationResult[]);
  [key: string]: any;
}

interface PluginConfigure {
  plugin: Plugin;
  opts?: any;
}

interface ValidationResult {
  name: string; // 控件name
  noPassedRules: string[]; // 未通过的rule的name
  allPassed: boolean; // 是否所有rule都通过
}

interface ValidatorCallback {
  (result: ValidationResult[], context);
}

type ValidationControl = HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement;

class FormValidator {
  /**
   * @property 表单控件元素
   */
  controls: ValidationControl[];
  /**
   * @property 控件约束规则配置
   */
  rulesConf: RulesConfigure;
  /**
   * @property 控件约束规则用户参数
   */
  rulesConfParam: RulesConfigureParam;
  /**
   * @property 载入插件
   */
  plugins: Plugin[];
  /**
   * @property 插件数据
   */
  pluginData: PluginData = {};

  constructor(controls: ValidationControl[], rulesConfParam?: RulesConfigureParam, pluginConfigures?: PluginConfigure[]);
  constructor(rulesConfParam?: RulesConfigureParam, pluginConfigures?: PluginConfigure[]);
  constructor(...args) {
    // 初始化
    let controls: ValidationControl[] = [];
    let rulesConfParam: RulesConfigureParam = {};
    let pluginConfigures: PluginConfigure[] = [];

    // 如果第一个参数是类数组，那么就是第一个函数签名
    if (isArrayLike(args[0])) {
      controls = [].slice.call(args[0]);
      rulesConfParam = args[1];
      pluginConfigures = args[2];
    } else {
      rulesConfParam = args[0];
      pluginConfigures = args[1];
    }

    // 解析rulesConf, mutation
    const rulesConf = this.parseRulesConf(rulesConfParam);

    this.controls = controls;
    this.rulesConfParam = rulesConfParam;
    this.rulesConf = rulesConf;

    // unshift default plugins
    pluginConfigures.unshift(
      { plugin: DefaultRulerKeywordPlugin },
      { plugin: DefaultDisplayPlugin }
    );

    // setup plugins
    pluginConfigures.forEach(configure => configure.plugin.setup({
      validator: this,
      ruler: FormValidationRuler
    }, configure.opts));
  }

  /**
   * 解析rulesConf，统一数据结构，以支持rulesConf多种简写
   * @param rulesConf
   */
  parseRulesConf(rulesConfParam: RulesConfigureParam) {
    const rulesConf: RulesConfigure = Object.create(null);

    for (const [name, ruleConfParam] of Object.entries(rulesConfParam)) {
      if (isArray(ruleConfParam)) {
        rulesConf[name] = (ruleConfParam as RuleConfigureParam[]).map((conf, i) => parseSingleConfParam(conf, 'rule' + ++i));
      } else {
        rulesConf[name] = parseSingleConfParam(ruleConfParam as RuleConfigureParam, 'rule1');
      }
    }

    function parseSingleConfParam(confParam: RuleConfigureParam, ruleName: string): Rule {
      if (isRegExp(confParam)) {
        return {
          name: ruleName,
          handler: confParam as RegExp
        };
      } else if (isString(confParam)) {
        return {
          name: confParam as string,
          handler: confParam as string
        };
      } else if (isFunction(confParam)) {
        return {
          name: ruleName,
          handler: confParam as RuleHandleFunction
        };
      } else if (isArray(confParam)) {
        return {
          name: ruleName,
          handler: confParam[0],
          param: confParam[1]
        };
      } else if (isUndefined((confParam as RuleConfigureObject).name)) {
        (confParam as RuleConfigureObject).name = ruleName;
        return confParam as Rule;
      } else {
        return confParam as Rule;
      }
    }

    return rulesConf;
  }

  /**
   * 验证
   */
  validate();
  validate(context: any);
  validate(cb: ValidatorCallback, context: any);
  validate(...args) {
    let cb, context = this;

    if (isUndefined(args[0]) && !isFunction(args[0])) {
      context = args[0];
    }

    if (this.controls) {
      const result: ValidationResult[] = this.controls.map(control => {
        let rules = this.rulesConf[control.name];
        // 跳过未配置rule的控件
        if (isUndefined(rules)) {
          return;
        }
        if (!isArray(rules)) {
          rules = [rules as Rule];
        }
        const noPassedRules = [];
        (rules as Rule[]).forEach(rule => {
          const passed = FormValidationRuler.match(control.value, rule);
          if (!passed) {
            noPassedRules.push(rule.name);
          }
        });

        return {
          name: control.name,
          noPassedRules,
          allPassed: noPassedRules.length === 0
        };
      }).filter(vr => !isUndefined(vr));

      if (cb) {
        cb.call(context, result);
      }

      this.plugins.forEach(plugin => {
        if (plugin.onValidated) {
          plugin.onValidated.call(context, result);
        }
      });
    }
  }
}

export default FormValidator;
