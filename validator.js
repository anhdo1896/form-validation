const Validator = function (options) {
    function getParent(element, selector) {
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    var selectorRules = {};

    function validate(inputElement, rule) {
        var errorElement =
            getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        var errorMessage

        var rules = selectorRules[rule.selector];

        for(var i = 0; i< rules.length; ++i){
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add("invalid");
        } else {
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
        }

        return !errorMessage
    }

    formElement = document.querySelector(options.form);
    if (formElement) {
        
        isFormValid = true;

        formElement.onsubmit = function(e) {
            e.preventDefault();
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule)

                if(!isValid){
                    isFormValid = false;
                }

            });

            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([diabaled])')

                    var formValue = Array.from(enableInputs).reduce(function(values, input) {
                        values[input.name] = input.value  
                        return values
                    }, {})

                    options.onSubmit(formValue)
                }else{
                    formElement.submit()
                }
            }
            

        }

        options.rules.forEach(function (rule) {
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };

                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement .innerText = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
                }
            }
        });
    }
};

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || "Please enter this field";
        },
    };
};

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            regex =
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return regex.test(value)
                ? undefined
                : message || "Please enter email address";
        },
    };
};

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min
                ? undefined
                : message || `Please enter minimum ${min} characters`;
        },
    };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue()
                ? undefined
                : message || "The value is not match";
        },
    };
};
