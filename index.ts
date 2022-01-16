import FormValidator from "./src/FormValidator";
import AutoControlsPlugin from "./src/plugins/auto_controls";

// const controls = document.querySelectorAll('input');
const validator = new FormValidator({
    username: (value) => /[a-zA-Z]/.test(value),
    password: [
        'required',
        ['minlength', 12],
        {
            handler: 'maxlength',
            param: 6
        },
        [(value, param) => param.test(value), /^[a-zA-Z]/]
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
        plugin: AutoControlsPlugin,
        opts: {
            form: document.querySelector('form'),
            selector: 'input'
        }
    }
]);
const button = document.getElementById('submit');
button.addEventListener('click', (e) => {
    e.preventDefault();
    validator.validate(console.log);
});

console.log(validator);