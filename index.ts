import FormValidator from "./src/FormValidator";
import DefaultAutoControlsPlugin from "./src/plugins/auto_controls";
import DefaultRulerKeywordPlugin from "./src/plugins/ruler_keywords";

const validator = new FormValidator({
    username: [
        'required',
        ['minlength', 6],
        ['maxlength', 12],
    ],
    password: [
        'required',
        ['minlength', 6],
        ['maxlength', 12],
        'uppercaseinfirst'
    ],
    password2: [
        'required',
        {
            name: 'equalToPassword',
            handler: 'equalToField',
            param: 'password'
        }
    ],
    email: [
        {
            name: 'email',
            handler: 'email'
        }
    ]
}, [
    {
        plugin: DefaultAutoControlsPlugin,
        opts: {
            form: document.querySelector('form'),
            selector: 'input'
        }
    },
    {
        plugin: DefaultRulerKeywordPlugin,
        opts: {
            uppercaseinfirst: /^[A-Z]/
        }
    }
]);
const button = document.getElementById('submit');
const message = {
    username: {
        required: '用户名不能为空',
        minlength: '用户名长度不能小于6',
        maxlength: '用户名长度不能大于12',
    },
    password: {
        required: '密码不能为空',
        minlength: '密码长度不能小于6',
        maxlength: '密码长度不能大于12',
        uppercaseinfirst: '密码要以大写字母开头'
    },
    password2: {
        required: '密码不能为空',
        equalToPassword: '前后密码不一致'
    },
    email: {
        email: '邮箱不合法'
    }
};
button.addEventListener('click', (e) => {
    e.preventDefault();
    const result = validator.validate();
    result.forEach(r => {
        const inputWrapper = document.querySelector(`[name=${r.name}]`).parentElement;
        const small = inputWrapper.querySelector('small');
        if (r.allPassed) {
            if (!inputWrapper.classList.contains('success')) {
                inputWrapper.classList.add('success');
            }
            if (inputWrapper.classList.contains('fail')) {
                inputWrapper.classList.remove('fail');
            }
        } else {
            if (inputWrapper.classList.contains('success')) {
                inputWrapper.classList.remove('success');
            }
            if (!inputWrapper.classList.contains('fail')) {
                inputWrapper.classList.add('fail');
            }
            small.textContent = message[r.name][r.noPassedRules[0]];
        }
    });
});
