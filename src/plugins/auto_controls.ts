import { Plugin } from "../FormValidator";
import merge from 'lodash/merge';

interface AutoControlsPluginData {
  form: HTMLFormElement;
  selector: string;
}

const defaultOptions = Object.create({
  selector: '[data-control]'
});

/**
 * 单例模式
 * 由于是单例，所以其属性是所有表单实例共享的
 * 自动获取表单控件
 */
const DefaultAutoControlsPlugin: Plugin = {
  name: "DefaultAutoControlsPlugin",
  setup(context, opts) {
    opts = merge(Object.create(null), defaultOptions, opts);
    const validator = context.validator;
    // 表单实例内存储数据，各实例独立
    const data: AutoControlsPluginData = {
      form: opts.form,
      selector: opts.selector
    };
    validator.pluginData[this.name] = data;
    validator.controls = this.getControls(opts.form, opts.selector);
  },

  /**
   * 获取表单控件
   * @param form 表单元素
   * @param selector 控件的css选择器
   * @returns 控件
   */
  getControls(form: HTMLFormElement, selector: string) {
    return [].slice.call(form.querySelectorAll(selector));
  }
};

export default DefaultAutoControlsPlugin;
